<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $courses = Course::query()
            ->withCount('activeEnrollments as enrolled')
            ->with(['enrollments' => fn ($query) => $query->where('user_id', $userId)])
            ->orderBy('starts_at')
            ->paginate(9)
            ->through(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'seats' => $course->seats,
                'seats_left' => $course->seatsLeft(),
                'starts_at' => $course->starts_at->toDateString(),
                'my_status' => $course->enrollments->first()?->status->value,
            ]);

        return Inertia::render('catalog/index', ['courses' => $courses]);
    }
}
