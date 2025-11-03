"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("./users"));
const clinics_1 = __importDefault(require("./clinics"));
const appointments_1 = __importDefault(require("./appointments"));
const reviews_1 = __importDefault(require("./reviews"));
const places_1 = __importDefault(require("./places"));
<<<<<<< HEAD
const directions_1 = __importDefault(require("./directions"));
=======
>>>>>>> vector_search
const health_routes_1 = __importDefault(require("../health/health.routes"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to MediMap Care API' });
});
router.use('/', health_routes_1.default);
router.use('/users', users_1.default);
router.use('/clinics', clinics_1.default);
router.use('/appointments', appointments_1.default);
router.use('/reviews', reviews_1.default);
router.use('/places', places_1.default);
<<<<<<< HEAD
router.use('/directions', directions_1.default);
=======
>>>>>>> vector_search
exports.default = router;
//# sourceMappingURL=index.js.map