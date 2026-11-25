import ConfirmDialog from '@/components/confirm-dialog';
import FlashStatus from '@/components/flash-status';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Course, type Paginated, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Courses', href: '/courses' }];

export default function CourseIndex({ courses }: { courses: Paginated<Course> }) {
    const { errors } = usePage<SharedData & { errors: Record<string, string> }>().props;
    const [toDelete, setToDelete] = useState<Course | null>(null);

    const confirmDelete = () => {
        if (!toDelete) return;
        router.delete(route('courses.destroy', toDelete.id), {
            preserveScroll: true,
            onFinish: () => setToDelete(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Courses" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Courses" description="Create and manage the courses students can register for" />
                    <Button asChild>
                        <Link href={route('courses.create')}>New course</Link>
                    </Button>
                </div>

                <FlashStatus />
                <InputError message={errors.course} />

                {courses.data.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No courses yet. Create the first one.</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Starts</th>
                                    <th className="px-4 py-3 font-medium">Seats</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {courses.data.map((course) => {
                                    const enrolled = course.enrolled ?? 0;
                                    const full = enrolled >= course.seats;
                                    return (
                                        <tr key={course.id} className="border-t">
                                            <td className="px-4 py-3 font-medium">{course.title}</td>
                                            <td className="px-4 py-3">{course.starts_at}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={full ? 'destructive' : 'secondary'}>
                                                    {enrolled} / {course.seats}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('courses.edit', course.id)}>Edit</Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setToDelete(course)}>
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination page={courses} />
            </div>

            <ConfirmDialog
                open={toDelete !== null}
                title="Delete this course?"
                description={`${toDelete?.title ?? ''} will be removed. A course that has registrations cannot be deleted.`}
                confirmLabel="Delete"
                dismissLabel="Keep course"
                onConfirm={confirmDelete}
                onDismiss={() => setToDelete(null)}
            />
        </AppLayout>
    );
}
