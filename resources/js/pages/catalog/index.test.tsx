import { type CatalogCourse, type Paginated } from '@/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../../tests/inertia-mock';
import Catalog from './index';

vi.mock('@inertiajs/react', async () => (await import('../../tests/inertia-mock')).inertiaMock);
vi.mock('@/layouts/app-layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

const course = (overrides: Partial<CatalogCourse>): CatalogCourse => ({
    id: 1,
    title: 'Intro to Laravel',
    description: 'Basics',
    seats: 10,
    seats_left: 4,
    starts_at: '2027-01-10',
    my_status: null,
    ...overrides,
});

const page = (data: CatalogCourse[]): Paginated<CatalogCourse> => ({ data, links: [], current_page: 1, last_page: 1, total: data.length });

describe('Catalog page', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows seats left for each course', () => {
        render(<Catalog courses={page([course({})])} />);

        expect(screen.getByText('Intro to Laravel')).toBeInTheDocument();
        expect(screen.getByText('4 of 10 seats left')).toBeInTheDocument();
    });

    it('registers when the Register button is clicked', async () => {
        render(<Catalog courses={page([course({ id: 7 })])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Register' }));

        expect(router.post).toHaveBeenCalledWith('/enrollments.store/7', {}, expect.anything());
    });

    it('disables Register when the course is full', () => {
        render(<Catalog courses={page([course({ seats_left: 0 })])} />);

        expect(screen.getByText('Full')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
    });

    it('shows Registered instead of a button when already registered', () => {
        render(<Catalog courses={page([course({ my_status: 'active' })])} />);

        expect(screen.getByText('Registered')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Register' })).not.toBeInTheDocument();
    });

    it('offers Register again after a cancellation', () => {
        render(<Catalog courses={page([course({ my_status: 'cancelled' })])} />);

        expect(screen.getByRole('button', { name: 'Register again' })).toBeEnabled();
    });

    it('shows an empty state with no courses', () => {
        render(<Catalog courses={page([])} />);

        expect(screen.getByText(/No courses are open yet/)).toBeInTheDocument();
    });
});
