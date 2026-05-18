import { body, param } from 'express-validator';

export const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 1000 }),
];

export const updateProjectValidation = [
  param('id').notEmpty().withMessage('Project ID is required'),
  body('name').optional().trim().notEmpty().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 1000 }),
];

export const addMemberValidation = [
  param('projectId').notEmpty(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
];

export const updateMemberValidation = [
  param('projectId').notEmpty(),
  param('memberId').notEmpty(),
  body('role').isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
];
