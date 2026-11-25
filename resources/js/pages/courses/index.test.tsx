import { type Course, type Paginated } from '@/types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../../tests/inertia-mock';
import CourseIndex from './index';

vi.mock('@inertiajs/react', async () => (await import('../../tests/inertia-mock')).inertiaMock);
vi.mock('@/layouts/app-layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

const course = (overrides: Partial<Course> = {}): Course => ({
    id: 4,
    title: 'Intro to Laravel',
    description: 'Basics',
    seats: 10,
    starts_at: '2027-01-10',
    enrolled: 3,
    ...overrides,
});

const page = (data: Course[], lastPage = 1): Paginated<Course> => ({
    data,
    links: [
        { url: null, label: '&laquo; Previous', active: false },
        { url: '/courses?page=1', label: '1', active: true },
        { url: '/courses?page=2', label: '2', active: false },
    ],
    current_page: 1,
    last_page: lastPage,
    total: data.length,
});

describe('Admin course list', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows enrolled out of total seats', () => {
        render(<CourseIndex courses={page([course()])} />);

        expect(screen.getByText('Intro to Laravel')).toBeInTheDocument();
        expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('links to the edit page', () => {
        render(<CourseIndex courses={page([course({ id: 4 })])} />);

        expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/courses.edit/4');
    });

    it('asks for confirmation, then deletes', async () => {
        render(<CourseIndex courses={page([course({ id: 4 })])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('dialog');
        expect(router.delete).not.toHaveBeenCalled();

        await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
        expect(router.delete).toHaveBeenCalledWith('/courses.destroy/4', expect.anything());
    });

    it('does not delete when the dialog is dismissed', async () => {
        render(<CourseIndex courses={page([course()])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Keep course' }));

        expect(router.delete).not.toHaveBeenCalled();
    });

    it('shows pagination only when there is more than one page', () => {
        const { rerender } = render(<CourseIndex courses={page([course()], 1)} />);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

        rerender(<CourseIndex courses={page([course()], 2)} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows an empty state', () => {
        render(<CourseIndex courses={page([])} />);

        expect(screen.getByText(/No courses yet/)).toBeInTheDocument();
    });
});
