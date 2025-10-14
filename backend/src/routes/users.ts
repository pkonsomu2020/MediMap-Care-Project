import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { createUserDb, findUserByEmail, findUserById, updateUserById } from '../lib/data';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

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
    if ((user as any).password === 'google_oauth') {
      return res.status(401).json({ error: 'Please use Google login for this account' });
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

// Google OAuth login
router.post('/google-login', async (req: Request, res: Response): Promise<Response> => {
  const { id_token } = req.body;
  if (!id_token) {
    return res.status(400).json({ error: 'ID token is required' });
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google Client ID not configured' });
  }
  try {
    const client = new OAuth2Client(); // This should now work
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const { email, name } = payload;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required from Google' });
    }
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUserDb({ name, email, phone: null, password: 'google_oauth', role: 'user' });
    }
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
    return res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.auth!.userId;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.patch('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.auth!.userId;
    const updates = req.body;

    console.log('\n=== PATCH /me Debug Info ===');
    console.log('User ID:', userId);
    console.log('Incoming updates:', updates);

    const updatedUser = await updateUserById(userId, updates);

    console.log('Updated user record:', updatedUser);

    if (!updatedUser) {
      console.warn('No user found or updated');
      return res.status(404).json({ error: 'User not found or no changes applied' });
    }

    return res.json({ message: 'Profile updated successfully', user: updatedUser });

  } catch (error: any) {
    console.error('\n❌ Error updating user:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    if (error.code) console.error('Supabase Error Code:', error.code);
    if (error.details) console.error('Supabase Error Details:', error.details);
    if (error.hint) console.error('Supabase Error Hint:', error.hint);

    if (error.message === 'No valid fields to update') {
      return res.status(400).json({ error: error.message });
    }

    // Return detailed info during debugging — remove in production
    return res.status(500).json({
      error: 'Internal server error',
      debug: {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    });
  }
});



export default router;
