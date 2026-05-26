import express from 'express';
import { createProject, getAllProjects, getProject, updateProject, deleteProject } from '../../controllers/ngo/project.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
