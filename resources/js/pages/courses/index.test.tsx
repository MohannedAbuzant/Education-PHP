import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeCourse, paginated } from '../../tests/factories';
import { router } from '../../tests/inertia-mock';
import CourseIndex from './index';

vi.mock('@inertiajs/react', async () => (await import('../../tests/inertia-mock')).inertiaMock);
vi.mock('@/layouts/app-layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

describe('Admin course list', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows enrolled out of total seats', () => {
        render(<CourseIndex courses={paginated([makeCourse()])} />);

        expect(screen.getByText('Intro to Laravel')).toBeInTheDocument();
        expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('links to the edit page', () => {
        render(<CourseIndex courses={paginated([makeCourse({ id: 4 })])} />);

        expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/courses.edit/4');
    });

    it('asks for confirmation, then deletes', async () => {
        render(<CourseIndex courses={paginated([makeCourse({ id: 4 })])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('dialog');
        expect(router.delete).not.toHaveBeenCalled();

        await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
        expect(router.delete).toHaveBeenCalledWith('/courses.destroy/4', expect.anything());
    });

    it('names the course in the confirmation dialog', async () => {
        render(<CourseIndex courses={paginated([makeCourse({ title: 'Databases and SQL' })])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(await screen.findByText(/Databases and SQL will be removed/)).toBeInTheDocument();
    });

    it('does not delete when the dialog is dismissed', async () => {
        render(<CourseIndex courses={paginated([makeCourse()])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Keep course' }));

        expect(router.delete).not.toHaveBeenCalled();
    });

    it('shows pagination only when there is more than one page', () => {
        const { rerender } = render(<CourseIndex courses={paginated([makeCourse()], 1)} />);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

        rerender(<CourseIndex courses={paginated([makeCourse()], 2)} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows an empty state', () => {
        render(<CourseIndex courses={paginated([])} />);

        expect(screen.getByText(/No courses yet/)).toBeInTheDocument();
    });
});
