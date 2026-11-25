import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Course } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Props = {
    course?: Course;
};

export default function CourseForm({ course }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        title: course?.title ?? '',
        description: course?.description ?? '',
        seats: String(course?.seats ?? 20),
        starts_at: course?.starts_at ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (course) {
            put(route('courses.update', course.id));
        } else {
            post(route('courses.store'));
        }
    };

    return (
        <form onSubmit={submit} className="max-w-xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    rows={4}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="seats">Seats</Label>
                    <Input id="seats" type="number" min={1} value={data.seats} onChange={(e) => setData('seats', e.target.value)} required />
                    <InputError message={errors.seats} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="starts_at">Start date</Label>
                    <Input id="starts_at" type="date" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} required />
                    <InputError message={errors.starts_at} />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {course ? 'Save changes' : 'Create course'}
                </Button>
                <Button variant="ghost" asChild>
                    <Link href={route('courses.index')}>Cancel</Link>
                </Button>
            </div>
        </form>
    );
}
