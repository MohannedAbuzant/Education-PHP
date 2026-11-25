import FlashStatus from '@/components/flash-status';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { ENROLLMENT_ACTIVE, ENROLLMENT_CANCELLED, type BreadcrumbItem, type CatalogCourse, type Paginated, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { RotateCcw, UserPlus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Catalog', href: '/catalog' }];

export default function Catalog({ courses }: { courses: Paginated<CatalogCourse> }) {
    const { errors } = usePage<SharedData & { errors: Record<string, string> }>().props;

    const register = (course: CatalogCourse) => {
        router.post(route('enrollments.store', course.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catalog" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading title="Course catalog" description="Pick a course and register for a seat" />

                <FlashStatus />
                <InputError message={errors.enrollment} />

                {courses.data.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No courses are open yet. Check back soon.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {courses.data.map((course) => {
                            const full = course.seats_left === 0;
                            const registered = course.my_status === ENROLLMENT_ACTIVE;
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
                                                {course.my_status === ENROLLMENT_CANCELLED ? (
                                                    <>
                                                        <RotateCcw aria-hidden />
                                                        Register again
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus aria-hidden />
                                                        Register
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <Pagination page={courses} />
            </div>
        </AppLayout>
    );
}
