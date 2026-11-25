import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Enrollment, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'My registrations', href: '/my-enrollments' }];

export default function MyEnrollments({ enrollments }: { enrollments: Enrollment[] }) {
    const { flash } = usePage<SharedData>().props;
    const [toCancel, setToCancel] = useState<Enrollment | null>(null);

    const confirmCancel = () => {
        if (!toCancel) return;
        router.delete(route('enrollments.destroy', toCancel.id), {
            preserveScroll: true,
            onFinish: () => setToCancel(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My registrations" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading title="My registrations" description="Courses you have registered for" />

                {flash.status && <p className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm">{flash.status}</p>}

                {enrollments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        You have no registrations yet.{' '}
                        <Link href={route('catalog.index')} className="underline">
                            Browse the catalog
                        </Link>
                        .
                    </p>
                ) : (
                    <ul className="divide-y rounded-md border">
                        {enrollments.map((enrollment) => (
                            <li key={enrollment.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                <div>
                                    <p className="font-medium">{enrollment.course.title}</p>
                                    <p className="text-muted-foreground text-sm">Starts {enrollment.course.starts_at}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>{enrollment.status}</Badge>
                                    {enrollment.status === 'active' && (
                                        <Button variant="outline" size="sm" onClick={() => setToCancel(enrollment)}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Dialog open={toCancel !== null} onOpenChange={(open) => !open && setToCancel(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel this registration?</DialogTitle>
                        <DialogDescription>
                            You will give up your seat in {toCancel?.course.title}. You can register again later if a seat is free.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setToCancel(null)}>
                            Keep my seat
                        </Button>
                        <Button variant="destructive" onClick={confirmCancel}>
                            Cancel registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
