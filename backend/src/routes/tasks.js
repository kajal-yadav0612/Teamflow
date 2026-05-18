import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskValidation, updateTaskValidation } from '../validators/task.js';
import { requireProjectAccess, getMembership } from '../middleware/rbac.js';

const router = Router();

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
};

router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const accessibleProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    });
    const projectIds = accessibleProjects.map((p) => p.id);

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
    });

    const myTasks = tasks.filter(
      (t) => t.assigneeId === userId || t.createdById === userId
    );

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
      overdue: tasks.filter(
        (t) => t.dueDate && t.dueDate < now && t.status !== 'DONE'
      ).length,
      assignedToMe: tasks.filter((t) => t.assigneeId === userId && t.status !== 'DONE').length,
    };

    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'DONE'
    );

    const recentTasks = tasks.slice(0, 10);

    res.json({ stats, overdueTasks, recentTasks, myTasks: myTasks.slice(0, 20) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/project/:projectId', requireProjectAccess, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: taskInclude,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', createTaskValidation, validate, async (req, res) => {
  try {
    const { projectId, title, description, status, priority, dueDate, assigneeId } = req.body;

    const access = await getMembership(req.user.id, projectId);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: assigneeId },
      });
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!assigneeMember && project?.ownerId !== assigneeId) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        createdById: req.user.id,
      },
      include: taskInclude,
    });

    res.status(201).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', updateTaskValidation, validate, async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const access = await getMembership(req.user.id, existing.projectId);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    const isAssignee = existing.assigneeId === req.user.id;
    const isAdmin = access.isAdmin;

    if (!isAdmin && !isAssignee && existing.createdById !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit tasks you created or are assigned to' });
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    if (assigneeId !== undefined && assigneeId !== null && !isAdmin) {
      return res.status(403).json({ message: 'Only admins can reassign tasks' });
    }

    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findFirst({
        where: { projectId: existing.projectId, userId: assigneeId },
      });
      if (!assigneeMember && existing.project.ownerId !== assigneeId) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: taskInclude,
    });

    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const access = await getMembership(req.user.id, existing.projectId);
    if (!access.isAdmin && existing.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Only admins or task creators can delete tasks' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
