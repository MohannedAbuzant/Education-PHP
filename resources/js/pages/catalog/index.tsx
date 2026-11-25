import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CatalogCourse, type Paginated, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Catalog', href: '/catalog' }];

export default function Catalog({ courses }: { courses: Paginated<CatalogCourse> }) {
    const { flash, errors } = usePage<SharedData & { errors: Record<string, string> }>().props;

    const register = (course: CatalogCourse) => {
        router.post(route('enrollments.store', course.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catalog" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading title="Course catalog" description="Pick a course and register for a seat" />

                {flash.status && <p className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm">{flash.status}</p>}
                <InputError message={errors.enrollment} />

                {courses.data.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No courses are open yet. Check back soon.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {courses.data.map((course) => {
                            const full = course.seats_left === 0;
                            const registered = course.my_status === 'active';
                            return (
                                <Card key={course.id}>
                                    <CardHeader>
                                        <CardTitle>{course.title}</CardTitle>
                                        <CardDescription>Starts {course.starts_at}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-muted-foreground line-clamp-3 text-sm">{course.description}</p>
                                        <Badge variant={full ? 'destructive' : 'secondary'}>
                                            {full ? 'Full' : `${course.seats_left} of ${course.seats} seats left`}
                                        </Badge>
                                    </CardContent>
                                    <CardFooter>
                                        {registered ? (
                                            <Badge>Registered</Badge>
                                        ) : (
                                            <Button onClick={() => register(course)} disabled={full}>
                                                {course.my_status === 'cancelled' ? 'Register again' : 'Register'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
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
        </AppLayout>
    );
}
