import ConfirmDialog from '@/components/confirm-dialog';
import FlashStatus from '@/components/flash-status';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { ENROLLMENT_ACTIVE, type BreadcrumbItem, type Enrollment } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CircleX } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'My registrations', href: '/my-enrollments' }];

export default function MyEnrollments({ enrollments }: { enrollments: Enrollment[] }) {
    // `target` stays set while the dialog animates closed, so its text never goes blank.
    const [target, setTarget] = useState<Enrollment | null>(null);
    const [open, setOpen] = useState(false);

    const askToCancel = (enrollment: Enrollment) => {
        setTarget(enrollment);
        setOpen(true);
    };

    const confirmCancel = () => {
        if (!target) return;
        router.delete(route('enrollments.destroy', target.id), {
            preserveScroll: true,
            onFinish: () => setOpen(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My registrations" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading title="My registrations" description="Courses you have registered for" />

                <FlashStatus />

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
                                    <Badge variant={enrollment.status === ENROLLMENT_ACTIVE ? 'default' : 'secondary'}>{enrollment.status}</Badge>
                                    {enrollment.status === ENROLLMENT_ACTIVE && (
                                        <Button variant="outline" size="sm" onClick={() => askToCancel(enrollment)}>
                                            <CircleX aria-hidden />
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ConfirmDialog
                open={open}
                title="Cancel this registration?"
                description={`You will give up your seat in ${target?.course.title ?? ''}. You can register again later if a seat is free.`}
                confirmLabel="Cancel registration"
                dismissLabel="Keep my seat"
                onConfirm={confirmCancel}
                onDismiss={() => setOpen(false)}
            />
        </AppLayout>
    );
}
