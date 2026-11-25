<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EnrollmentResource;
use App\Models\Course;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class EnrollmentController extends Controller
{
    public function __construct(private EnrollmentService $enrollments) {}

    public function mine(Request $request): AnonymousResourceCollection
    {
        $enrollments = $request->user()
            ->enrollments()
            ->with('course')
            ->latest('updated_at')
            ->get();

        return EnrollmentResource::collection($enrollments);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        // A full course or a second active registration throws a 409 exception.
        $enrollment = $this->enrollments->register($request->user(), $course);

        return (new EnrollmentResource($enrollment->load('course')))->response()->setStatusCode(201);
    }

    public function destroy(Enrollment $enrollment): EnrollmentResource
    {
        Gate::authorize('cancel', $enrollment);

        return new EnrollmentResource($this->enrollments->cancel($enrollment)->load('course'));
    }
}
