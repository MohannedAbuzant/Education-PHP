import { ENROLLMENT_ACTIVE, type CatalogCourse, type Course, type Enrollment, type Paginated } from '@/types';

/** An admin-list course (seats taken in `enrolled`). */
export const makeCourse = (overrides: Partial<Course> = {}): Course => ({
    id: 4,
    title: 'Intro to Laravel',
    description: 'Basics',
    seats: 10,
    starts_at: '2027-01-10',
    enrolled: 3,
    ...overrides,
});

/** A catalog course as a student sees it. */
export const makeCatalogCourse = (overrides: Partial<CatalogCourse> = {}): CatalogCourse => ({
    id: 1,
    title: 'Intro to Laravel',
    description: 'Basics',
    seats: 10,
    seats_left: 4,
    starts_at: '2027-01-10',
    my_status: null,
    ...overrides,
});

export const makeEnrollment = (overrides: Partial<Enrollment> = {}): Enrollment => ({
    id: 3,
    status: ENROLLMENT_ACTIVE,
    course: { id: 1, title: 'Intro to Laravel', starts_at: '2027-01-10' },
    ...overrides,
});

/** A Laravel paginator payload. Page links appear when `lastPage` is above 1. */
export const paginated = <T>(data: T[], lastPage = 1): Paginated<T> => ({
    data,
    links: [
        { url: null, label: '&laquo; Previous', active: false },
        { url: '/?page=1', label: '1', active: true },
        { url: '/?page=2', label: '2', active: false },
    ],
    current_page: 1,
    last_page: lastPage,
    total: data.length,
});
