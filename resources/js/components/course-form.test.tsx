import { type Course } from '@/types';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formActions } from '../tests/inertia-mock';
import CourseForm from './course-form';

vi.mock('@inertiajs/react', async () => (await import('../tests/inertia-mock')).inertiaMock);

const existing: Course = { id: 9, title: 'React Basics', description: 'Hooks', seats: 12, starts_at: '2027-02-01' };

describe('CourseForm', () => {
    beforeEach(() => vi.clearAllMocks());

    it('creates a course with the typed values', async () => {
        render(<CourseForm />);

        await userEvent.type(screen.getByLabelText('Title'), 'New course');
        fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2027-03-01' } });
        await userEvent.click(screen.getByRole('button', { name: 'Create course' }));

        expect(formActions.post).toHaveBeenCalledWith('/courses.store');
        expect(formActions.put).not.toHaveBeenCalled();
    });

    it('starts with 20 seats for a new course', () => {
        render(<CourseForm />);

        expect(screen.getByLabelText('Seats')).toHaveValue(20);
    });

    it('is prefilled and updates when editing', async () => {
        render(<CourseForm course={existing} />);

        expect(screen.getByLabelText('Title')).toHaveValue('React Basics');
        expect(screen.getByLabelText('Seats')).toHaveValue(12);
        expect(screen.getByLabelText('Start date')).toHaveValue('2027-02-01');

        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(formActions.put).toHaveBeenCalledWith('/courses.update/9');
        expect(formActions.post).not.toHaveBeenCalled();
    });
});
