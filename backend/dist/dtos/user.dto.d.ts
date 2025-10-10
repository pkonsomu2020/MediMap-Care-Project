import User from '../models/user';
export declare function toUserDTO(u: User): {
    user_id: number;
    name: any;
    email: string;
    phone: any;
    role: "user" | "clinic" | "admin";
};
//# sourceMappingURL=user.dto.d.ts.map