import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.get('/ready', (_req, res) => res.json({ status: 'ready' }));
router.get('/live', (_req, res) => res.json({ status: 'live' }));

export default router;


