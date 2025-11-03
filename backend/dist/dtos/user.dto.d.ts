<<<<<<< HEAD
import { User } from '../models/models';
export declare function toUserDTO(u: User): {
    user_id: string;
    name: any;
    email: string;
    phone: any;
    role: string;
=======
import User from '../models/user';
export declare function toUserDTO(u: User): {
    user_id: number;
    name: any;
    email: string;
    phone: any;
    role: "user" | "clinic" | "admin";
>>>>>>> vector_search
};
//# sourceMappingURL=user.dto.d.ts.map