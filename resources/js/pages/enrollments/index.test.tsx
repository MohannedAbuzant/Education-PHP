import { type Enrollment } from '@/types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../../tests/inertia-mock';
import MyEnrollments from './index';

vi.mock('@inertiajs/react', async () => (await import('../../tests/inertia-mock')).inertiaMock);
vi.mock('@/layouts/app-layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

const enrollment = (overrides: Partial<Enrollment> = {}): Enrollment => ({
    id: 3,
    status: 'active',
    course: { id: 1, title: 'Intro to Laravel', starts_at: '2027-01-10' },
    ...overrides,
});

describe('My registrations page', () => {
    beforeEach(() => vi.clearAllMocks());

    it('asks for confirmation before cancelling', async () => {
        render(<MyEnrollments enrollments={[enrollment()]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('Cancel this registration?')).toBeInTheDocument();
        expect(router.delete).not.toHaveBeenCalled();
    });

    it('cancels the registration once confirmed', async () => {
        render(<MyEnrollments enrollments={[enrollment({ id: 3 })]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel registration' }));

        expect(router.delete).toHaveBeenCalledWith('/enrollments.destroy/3', expect.anything());
    });

    it('keeps the seat when the dialog is dismissed', async () => {
        render(<MyEnrollments enrollments={[enrollment()]} />);

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Keep my seat' }));

        expect(router.delete).not.toHaveBeenCalled();
    });

    it('has no cancel button for an already cancelled registration', () => {
        render(<MyEnrollments enrollments={[enrollment({ status: 'cancelled' })]} />);

        expect(screen.getByText('cancelled')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('shows an empty state', () => {
        render(<MyEnrollments enrollments={[]} />);

        expect(screen.getByText(/You have no registrations yet/)).toBeInTheDocument();
    });
});
