import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectValidation,
  updateProjectValidation,
  addMemberValidation,
  updateMemberValidation,
} from '../validators/project.js';
import { requireProjectAccess, requireProjectAdmin, getMembership } from '../middleware/rbac.js';

const router = Router();

const projectInclude = {
  owner: { select: { id: true, name: true, email: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  _count: { select: { tasks: true } },
};

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: projectInclude,
      orderBy: { updatedAt: 'desc' },
    });

    const enriched = projects.map((p) => ({
      ...p,
      myRole: p.ownerId === req.user.id ? 'ADMIN' : p.members.find((m) => m.userId === req.user.id)?.role,
    }));

    res.json({ projects: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', createProjectValidation, validate, async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' },
        },
      },
      include: projectInclude,
    });

    res.status(201).json({ project: { ...project, myRole: 'ADMIN' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', requireProjectAccess, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        ...projectInclude,
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    res.json({
      project: {
        ...project,
        myRole: req.projectAccess.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', updateProjectValidation, validate, requireProjectAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: projectInclude,
    });

    res.json({ project: { ...project, myRole: req.projectAccess.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireProjectAdmin, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:projectId/members', addMemberValidation, validate, requireProjectAdmin, async (req, res) => {
  try {
    const { email, role = 'MEMBER' } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You are already in this project' });
    }

    const access = await getMembership(user.id, req.params.projectId);
    if (access.hasAccess) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.projectId,
        userId: user.id,
        role,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:projectId/members/:memberId', updateMemberValidation, validate, requireProjectAdmin, async (req, res) => {
  try {
    const member = await prisma.projectMember.findFirst({
      where: { id: req.params.memberId, projectId: req.params.projectId },
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.userId === req.projectAccess.project.ownerId) {
      return res.status(400).json({ message: 'Cannot change project owner role' });
    }

    const updated = await prisma.projectMember.update({
      where: { id: req.params.memberId },
      data: { role: req.body.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ member: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:projectId/members/:memberId', requireProjectAdmin, async (req, res) => {
  try {
    const member = await prisma.projectMember.findFirst({
      where: { id: req.params.memberId, projectId: req.params.projectId },
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.userId === req.projectAccess.project.ownerId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    await prisma.projectMember.delete({ where: { id: req.params.memberId } });
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
