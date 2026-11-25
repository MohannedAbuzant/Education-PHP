import { LucideIcon } from 'lucide-react';

export type Role = 'admin' | 'student';

export interface Course {
    id: number;
    title: string;
    description: string | null;
    seats: number;
    starts_at: string;
    enrolled?: number;
}

export const ENROLLMENT_ACTIVE = 'active';
export const ENROLLMENT_CANCELLED = 'cancelled';

export type EnrollmentStatus = typeof ENROLLMENT_ACTIVE | typeof ENROLLMENT_CANCELLED;

export interface CatalogCourse {
    id: number;
    title: string;
    description: string | null;
    seats: number;
    seats_left: number;
    starts_at: string;
    my_status: EnrollmentStatus | null;
}

export interface Enrollment {
    id: number;
    status: EnrollmentStatus;
    course: { id: number; title: string; starts_at: string };
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: { status: string | null };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: Role;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
