import express from 'express';
import postRoutes from './routes/postRoutes';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/posts', postRoutes);

export default app;
