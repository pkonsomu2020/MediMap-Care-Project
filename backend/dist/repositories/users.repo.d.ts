export declare function findByEmail(email: string): Promise<{
    user_id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
    password: any;
} | null>;
export declare function createUser(payload: {
    name: string;
    email: string;
    phone?: string | null;
    password: string;
    role?: string;
}): Promise<{
    user_id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
}>;
export declare function getById(userId: number): Promise<{
    user_id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
} | null>;
export declare function getUserProfile(userId: number): Promise<any>;
export declare function updateUserProfile(userId: number, profileData: any): Promise<any>;
//# sourceMappingURL=users.repo.d.ts.map