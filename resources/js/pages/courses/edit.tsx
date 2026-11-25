import CourseForm from '@/components/course-form';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Course } from '@/types';
import { Head } from '@inertiajs/react';

export default function EditCourse({ course }: { course: Course }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.title, href: `/courses/${course.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${course.title}`} />

            <div className="p-4 md:p-6">
                <Heading title="Edit course" description="Change the details or seat limit" />
                <CourseForm course={course} />
            </div>
        </AppLayout>
    );
}
