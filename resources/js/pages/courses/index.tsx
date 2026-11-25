import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Course, type Paginated, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Courses', href: '/courses' }];

export default function CourseIndex({ courses }: { courses: Paginated<Course> }) {
    const { flash, errors } = usePage<SharedData & { errors: Record<string, string> }>().props;
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

                {flash.status && <p className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm">{flash.status}</p>}
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

                {courses.last_page > 1 && (
                    <nav className="flex flex-wrap gap-1">
                        {courses.links.map((link, i) =>
                            link.url ? (
                                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                                    <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            ) : (
                                <Button key={i} variant="outline" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                            ),
                        )}
                    </nav>
                )}
            </div>

            <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this course?</DialogTitle>
                        <DialogDescription>{toDelete?.title} will be removed. A course that has registrations cannot be deleted.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setToDelete(null)}>
                            Keep course
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
