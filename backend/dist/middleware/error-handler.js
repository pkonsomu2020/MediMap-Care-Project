"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function notFound(req, res) {
    return res.status(404).json({ error: 'Not Found' });
}
function errorHandler(err, req, res, _next) {
    console.error(err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    const message = err?.message || 'Internal Server Error';
    return res.status(status).json({ error: message });
}
//# sourceMappingURL=error-handler.js.map