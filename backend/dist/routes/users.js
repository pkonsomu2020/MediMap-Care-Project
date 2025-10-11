"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_1 = require("../lib/data");
const auth_1 = require("../middleware/auth");
const users_repo_1 = require("../repositories/users.repo");
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
router.get('/profile', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const profile = await (0, users_repo_1.getUserProfile)(userId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        return res.json(profile);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/profile', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const updatedProfile = await (0, users_repo_1.updateUserProfile)(userId, req.body);
        return res.json(updatedProfile);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map