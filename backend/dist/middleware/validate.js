"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (req, res, next) => {
        try {
            if (schema.body)
                req.body = schema.body.parse(req.body);
            if (schema.query)
                req.query = schema.query.parse(req.query);
            if (schema.params)
                req.params = schema.params.parse(req.params);
            return next();
        }
        catch (err) {
            return res.status(400).json({ error: 'ValidationError', details: err?.issues || err?.message });
        }
    };
}
//# sourceMappingURL=validate.js.map