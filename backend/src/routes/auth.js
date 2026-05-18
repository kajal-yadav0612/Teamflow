import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { signupValidation, loginValidation } from '../validators/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/signup', signupValidation, validate, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = signToken(user.id);
    res.status(201).json({ message: 'Account created', user, token });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2031') {
      return res.status(503).json({
        message:
          'MongoDB must run as a replica set. In the backend folder run: npm run db:replica-init',
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', loginValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2031') {
      return res.status(503).json({
        message:
          'MongoDB must run as a replica set. In the backend folder run: npm run db:replica-init',
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/users/search', authenticate, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) {
    return res.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: { NOT: { id: req.user.id } },
    select: { id: true, name: true, email: true },
    take: 100,
  });

  const filtered = users
    .filter((u) => u.email.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10);

  res.json({ users: filtered });
});

export default router;
