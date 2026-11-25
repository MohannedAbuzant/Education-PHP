import { ENROLLMENT_ACTIVE, ENROLLMENT_CANCELLED } from '@/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeCatalogCourse, paginated } from '../../tests/factories';
import { router } from '../../tests/inertia-mock';
import Catalog from './index';

vi.mock('@inertiajs/react', async () => (await import('../../tests/inertia-mock')).inertiaMock);
vi.mock('@/layouts/app-layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

describe('Catalog page', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows seats left for each course', () => {
        render(<Catalog courses={paginated([makeCatalogCourse()])} />);

        expect(screen.getByText('Intro to Laravel')).toBeInTheDocument();
        expect(screen.getByText('4 of 10 seats left')).toBeInTheDocument();
    });

    it('registers when the Register button is clicked', async () => {
        render(<Catalog courses={paginated([makeCatalogCourse({ id: 7 })])} />);

        await userEvent.click(screen.getByRole('button', { name: 'Register' }));

        expect(router.post).toHaveBeenCalledWith('/enrollments.store/7', {}, expect.anything());
    });

    it('disables Register when the course is full', () => {
        render(<Catalog courses={paginated([makeCatalogCourse({ seats_left: 0 })])} />);

        expect(screen.getByText('Full')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
    });

    it('shows Registered instead of a button when already registered', () => {
        render(<Catalog courses={paginated([makeCatalogCourse({ my_status: ENROLLMENT_ACTIVE })])} />);

        expect(screen.getByText('Registered')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Register' })).not.toBeInTheDocument();
    });

    it('offers Register again after a cancellation', () => {
        render(<Catalog courses={paginated([makeCatalogCourse({ my_status: ENROLLMENT_CANCELLED })])} />);

        expect(screen.getByRole('button', { name: 'Register again' })).toBeEnabled();
    });

    it('shows an empty state with no courses', () => {
        render(<Catalog courses={paginated([])} />);

        expect(screen.getByText(/No courses are open yet/)).toBeInTheDocument();
    });
});
