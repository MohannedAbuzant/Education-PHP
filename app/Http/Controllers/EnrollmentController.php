<?php

namespace App\Http\Controllers;

use App\Exceptions\AlreadyEnrolledException;
use App\Exceptions\CourseFullException;
use App\Models\Course;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function __construct(private EnrollmentService $enrollments) {}

    public function index(Request $request): Response
    {
        $enrollments = $request->user()
            ->enrollments()
            ->with('course:id,title,starts_at')
            ->latest('updated_at')
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'status' => $enrollment->status->value,
                'course' => [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'starts_at' => $enrollment->course->starts_at->toDateString(),
                ],
            ]);

        return Inertia::render('enrollments/index', ['enrollments' => $enrollments]);
    }

    public function store(Request $request, Course $course): RedirectResponse
    {
        try {
            $this->enrollments->register($request->user(), $course);
        } catch (AlreadyEnrolledException|CourseFullException $e) {
            return back()->withErrors(['enrollment' => $e->getMessage()]);
        }

        return back()->with('status', "You are registered for {$course->title}.");
    }

    public function destroy(Enrollment $enrollment): RedirectResponse
    {
        Gate::authorize('cancel', $enrollment);

        $this->enrollments->cancel($enrollment);

        return back()->with('status', 'Registration cancelled.');
    }
}
