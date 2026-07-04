import { Router } from 'express';
import {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
} from '../controllers/postController';

const router = Router();

router.get('/search', searchPosts);
router.get('/', listPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
