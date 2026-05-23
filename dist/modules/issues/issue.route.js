import { Router } from 'express';
import { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue, } from './issue.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
const router = Router();
// Public
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
// Authenticated (contributor or maintainer)
router.post('/', protect, createIssue);
// Authenticated — permissions enforced inside controller
router.patch('/:id', protect, updateIssue);
// Maintainer only
router.delete('/:id', protect, restrictTo('maintainer'), deleteIssue);
export const IssueRoutes = router;
//# sourceMappingURL=issue.route.js.map