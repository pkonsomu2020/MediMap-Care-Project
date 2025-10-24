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
export declare function updateUserDb(userId: string | number, updates: Record<string, any>): Promise<{
    user_id: any;
    first_name: any;
    last_name: any;
    email: any;
    phone: any;
    gender: any;
    date_of_birth: any;
    address: any;
    latitude: any;
    longitude: any;
    place_id: any;
    blood_type: any;
    allergies: any;
    medications: any;
    medical_conditions: any;
    emergency_contact_name: any;
    emergency_contact_phone: any;
    emergency_contact_relationship: any;
    profile_picture_url: any;
    is_completed: any;
    role: any;
}>;
//# sourceMappingURL=users.repo.d.ts.map