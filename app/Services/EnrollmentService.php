<?php

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Exceptions\AlreadyEnrolledException;
use App\Exceptions\CourseFullException;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EnrollmentService
{
    /**
     * Register a student for a course.
     *
     * The course row is locked for the length of the transaction, so two
     * students racing for the last seat are handled one after the other:
     * the second one sees the seat taken and gets a CourseFullException.
     *
     * @throws AlreadyEnrolledException
     * @throws CourseFullException
     */
    public function register(User $user, Course $course): Enrollment
    {
        return DB::transaction(function () use ($user, $course) {
            $locked = Course::whereKey($course->getKey())->lockForUpdate()->firstOrFail();

            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $locked->id)
                ->first();

            if ($enrollment?->status === EnrollmentStatus::Active) {
                throw new AlreadyEnrolledException;
            }

            if ($locked->seatsLeft() === 0) {
                throw new CourseFullException;
            }

            // A cancelled row is reused because each user and course pair is unique.
            if ($enrollment) {
                $enrollment->update(['status' => EnrollmentStatus::Active]);

                return $enrollment;
            }

            return Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $locked->id,
                'status' => EnrollmentStatus::Active,
            ]);
        });
    }

    public function cancel(Enrollment $enrollment): Enrollment
    {
        if ($enrollment->status !== EnrollmentStatus::Cancelled) {
            $enrollment->update(['status' => EnrollmentStatus::Cancelled]);
        }

        return $enrollment;
    }
}
