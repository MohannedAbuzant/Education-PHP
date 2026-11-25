import CourseForm from '@/components/course-form';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courses', href: '/courses' },
    { title: 'New course', href: '/courses/create' },
];

export default function CreateCourse() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New course" />

            <div className="p-4 md:p-6">
                <Heading title="New course" description="Add a course students can register for" />
                <CourseForm />
            </div>
        </AppLayout>
    );
}
