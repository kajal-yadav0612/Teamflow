import { body, param } from 'express-validator';

export const createTaskValidation = [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('assigneeId').optional().isString(),
];

export const updateTaskValidation = [
  param('id').notEmpty(),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  body('assigneeId').optional({ nullable: true }).isString(),
];
