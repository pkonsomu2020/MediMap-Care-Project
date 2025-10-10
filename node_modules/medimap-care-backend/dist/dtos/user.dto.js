"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDTO = toUserDTO;
function toUserDTO(u) {
    return {
        user_id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
    };
}
//# sourceMappingURL=user.dto.js.map