import prisma from '../lib/prisma.js';

export const getMembership = async (userId, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId } },
    },
  });

  if (!project) return { project: null, membership: null };

  const membership = project.members[0] || null;
  const isOwner = project.ownerId === userId;

  return {
    project,
    membership,
    isOwner,
    role: isOwner ? 'ADMIN' : membership?.role || null,
    hasAccess: isOwner || !!membership,
    isAdmin: isOwner || membership?.role === 'ADMIN',
  };
};

export const requireProjectAccess = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID required' });
  }

  const access = await getMembership(req.user.id, projectId);
  if (!access.hasAccess) {
    return res.status(403).json({ message: 'You do not have access to this project' });
  }

  req.projectAccess = access;
  next();
};

export const requireProjectAdmin = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID required' });
  }

  const access = await getMembership(req.user.id, projectId);
  if (!access.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  req.projectAccess = access;
  next();
};
