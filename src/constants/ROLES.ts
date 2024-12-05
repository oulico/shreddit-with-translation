import {z} from 'zod';

export const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const


export type UserRole = (typeof ROLES)[keyof typeof ROLES]


export const roleSchema = z.enum(Object.values(ROLES) as [UserRole, ...UserRole[]]);
