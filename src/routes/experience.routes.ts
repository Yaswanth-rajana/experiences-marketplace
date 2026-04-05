import { Router } from 'express';
import { requireAuth, requireRole, requireOwnerOrAdmin } from '../middlewares/auth.middleware';
import {
  createExperienceController,
  publishExperienceController,
  blockExperienceController,
  listPublishedExperiencesController
} from '../controllers/experience.controller';
import { getExperienceById } from '../services/experience.service';

const router = Router();

// PUBLIC: List published experiences
router.get('/experiences', listPublishedExperiencesController);

// Protected routes
router.post('/experiences', requireAuth, requireRole(['host', 'admin']), createExperienceController);
router.patch('/experiences/:id/publish', 
  requireAuth, 
  requireOwnerOrAdmin(async (req) => {
    const experience = await getExperienceById(parseInt(req.params.id as string));
    return experience?.created_by;
  }),
  publishExperienceController
);
router.patch('/experiences/:id/block', requireAuth, requireRole(['admin']), blockExperienceController);

export default router;