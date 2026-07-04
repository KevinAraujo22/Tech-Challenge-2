import { Request, Response } from 'express';
import Post from '../models/Post';

export const listPosts = async (_req: Request, res: Response) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
};

export const getPostById = async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post não encontrado' });
  res.json(post);
};

export const createPost = async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  if (!title || !content || !author)
    return res.status(400).json({ message: 'title, content e author são obrigatórios' });

  const post = await Post.create({ title, content, author });
  res.status(201).json(post);
};

export const updatePost = async (req: Request, res: Response) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ message: 'Post não encontrado' });
  res.json(post);
};

export const deletePost = async (req: Request, res: Response) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post não encontrado' });
  res.status(204).send();
};

export const searchPosts = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Parâmetro de busca "q" é obrigatório' });

  const posts = await Post.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
    ],
  }).sort({ createdAt: -1 });

  res.json(posts);
};
