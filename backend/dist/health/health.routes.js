"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.get('/ready', (_req, res) => res.json({ status: 'ready' }));
router.get('/live', (_req, res) => res.json({ status: 'live' }));
exports.default = router;
//# sourceMappingURL=health.routes.js.map