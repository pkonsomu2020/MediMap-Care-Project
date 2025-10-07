import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUserDb, findUserByEmail } from '../lib/data';

const router = Router();

// Register new user (Supabase-compatible fields)
router.post('/register', async (req: Request, res: Response): Promise<Response> => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUserDb({ name, email, phone: phone || null, password: hashedPassword, role: role || 'user' });
    const token = jwt.sign({ id: user.user_id, role: role || 'user' }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, (user as any).password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: (user as any).user_id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
    return res.json({ token, user: { user_id: (user as any).user_id, name: (user as any).name, email: user.email, phone: (user as any).phone, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
