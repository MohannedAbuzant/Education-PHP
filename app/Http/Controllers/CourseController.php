<?php

namespace App\Http\Controllers;

use App\Http\Requests\CourseRequest;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::query()
            ->withEnrolled()
            ->orderBy('starts_at')
            ->paginate(10);

        return Inertia::render('courses/index', ['courses' => $courses]);
    }

    public function create(): Response
    {
        return Inertia::render('courses/create');
    }

    public function store(CourseRequest $request): RedirectResponse
    {
        Course::create($request->validated());

        return to_route('courses.index')->with('status', 'Course created.');
    }

    public function edit(Course $course): Response
    {
        return Inertia::render('courses/edit', ['course' => $course]);
    }

    public function update(CourseRequest $request, Course $course): RedirectResponse
    {
        $course->update($request->validated());

        return to_route('courses.index')->with('status', 'Course updated.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        if ($course->hasEnrollments()) {
            return back()->withErrors(['course' => Course::HAS_ENROLLMENTS_MESSAGE]);
        }

        $course->delete();

        return to_route('courses.index')->with('status', 'Course deleted.');
    }
}
