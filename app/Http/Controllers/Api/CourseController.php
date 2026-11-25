<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CourseController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $courses = Course::query()
            ->withCount('activeEnrollments as enrolled')
            ->orderBy('starts_at')
            ->paginate(15);

        return CourseResource::collection($courses);
    }

    public function show(Course $course): CourseResource
    {
        return new CourseResource($course->loadCount('activeEnrollments as enrolled'));
    }

    public function store(CourseRequest $request): JsonResponse
    {
        $course = Course::create($request->validated());

        return (new CourseResource($course))->response()->setStatusCode(201);
    }

    public function update(CourseRequest $request, Course $course): CourseResource
    {
        $course->update($request->validated());

        return new CourseResource($course->loadCount('activeEnrollments as enrolled'));
    }

    public function destroy(Course $course): JsonResponse
    {
        if ($course->enrollments()->exists()) {
            return response()->json(['message' => 'This course has enrollments and cannot be deleted.'], 409);
        }

        $course->delete();

        return response()->json(null, 204);
    }
}
