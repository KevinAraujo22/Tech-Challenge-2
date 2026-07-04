import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app';
import Post from '../src/models/Post';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterEach(async () => {
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /posts', () => {
  it('cria um post com sucesso', async () => {
    const res = await request(app).post('/posts').send({
      title: 'Título teste',
      content: 'Conteúdo teste',
      author: 'Professor Silva',
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Título teste');
  });

  it('retorna 400 se faltar campo obrigatório', async () => {
    const res = await request(app).post('/posts').send({ title: 'Só título' });
    expect(res.status).toBe(400);
  });
});

describe('GET /posts', () => {
  it('retorna lista de posts', async () => {
    await Post.create({ title: 'Post A', content: 'Conteúdo A', author: 'Autor A' });
    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /posts/:id', () => {
  it('retorna um post pelo id', async () => {
    const post = await Post.create({ title: 'Post B', content: 'Conteúdo B', author: 'Autor B' });
    const res = await request(app).get(`/posts/${post._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Post B');
  });

  it('retorna 404 para id inexistente', async () => {
    const res = await request(app).get('/posts/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});

describe('PUT /posts/:id', () => {
  it('atualiza um post', async () => {
    const post = await Post.create({ title: 'Antigo', content: 'Conteúdo', author: 'Autor' });
    const res = await request(app).put(`/posts/${post._id}`).send({ title: 'Novo título' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Novo título');
  });
});

describe('DELETE /posts/:id', () => {
  it('deleta um post', async () => {
    const post = await Post.create({ title: 'Deletar', content: 'Conteúdo', author: 'Autor' });
    const res = await request(app).delete(`/posts/${post._id}`);
    expect(res.status).toBe(204);
  });
});

describe('GET /posts/search', () => {
  it('busca posts por palavra-chave no título', async () => {
    await Post.create({ title: 'Matemática avançada', content: 'Conteúdo', author: 'Autor' });
    await Post.create({ title: 'História do Brasil', content: 'Conteúdo', author: 'Autor' });
    const res = await request(app).get('/posts/search?q=matemática');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('retorna 400 sem parâmetro q', async () => {
    const res = await request(app).get('/posts/search');
    expect(res.status).toBe(400);
  });
});
