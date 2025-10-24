"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const data_1 = require("../lib/data");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }
    try {
        const existingUser = await (0, data_1.findUserByEmail)(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await (0, data_1.createUserDb)({ name, email, phone: phone || null, password: hashedPassword, role: role || 'user' });
        const token = jsonwebtoken_1.default.sign({ id: user.user_id, role: role || 'user' }, process.env.JWT_SECRET || 'secret', {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
        return res.status(201).json({ token, user });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await (0, data_1.findUserByEmail)(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.password === 'google_oauth') {
            return res.status(401).json({ error: 'Please use Google login for this account' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
        return res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/google-login', async (req, res) => {
    const { id_token } = req.body;
    if (!id_token) {
        return res.status(400).json({ error: 'ID token is required' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google Client ID not configured' });
    }
    try {
        const client = new google_auth_library_1.OAuth2Client();
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
        let user = await (0, data_1.findUserByEmail)(email);
        if (!user) {
            user = await (0, data_1.createUserDb)({ name, email, phone: null, password: 'google_oauth', role: 'user' });
        }
        if (!user) {
            return res.status(500).json({ error: 'Failed to create user' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
        return res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await (0, data_1.findUserById)(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.userId;
        const updates = req.body;
        console.log('\n=== PATCH /me Debug Info ===');
        console.log('User ID:', userId);
        console.log('Incoming updates:', updates);
        const updatedUser = await (0, data_1.updateUserById)(userId, updates);
        console.log('Updated user record:', updatedUser);
        if (!updatedUser) {
            console.warn('No user found or updated');
            return res.status(404).json({ error: 'User not found or no changes applied' });
        }
        return res.json({ message: 'Profile updated successfully', user: updatedUser });
    }
    catch (error) {
        console.error('\n❌ Error updating user:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.code)
            console.error('Supabase Error Code:', error.code);
        if (error.details)
            console.error('Supabase Error Details:', error.details);
        if (error.hint)
            console.error('Supabase Error Hint:', error.hint);
        if (error.message === 'No valid fields to update') {
            return res.status(400).json({ error: error.message });
        }
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
exports.default = router;
//# sourceMappingURL=users.js.map