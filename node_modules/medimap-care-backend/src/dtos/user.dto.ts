import User from '../models/user';

export function toUserDTO(u: User) {
  return {
    user_id: u.id,
    name: (u as any).name,
    email: u.email,
    phone: (u as any).phone,
    role: u.role,
  };
}


