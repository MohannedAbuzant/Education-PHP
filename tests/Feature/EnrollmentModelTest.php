<?php

namespace Tests\Feature;

use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_relationships_connect_users_courses_and_enrollments(): void
    {
        $enrollment = Enrollment::factory()->create();

        $this->assertTrue($enrollment->user->is(User::first()));
        $this->assertTrue($enrollment->course->enrollments->first()->is($enrollment));
        $this->assertTrue($enrollment->user->enrollments->first()->is($enrollment));
    }

    public function test_status_defaults_to_active(): void
    {
        $course = Course::factory()->create();
        $user = User::factory()->create();

        $enrollment = Enrollment::create(['user_id' => $user->id, 'course_id' => $course->id]);

        $this->assertSame(EnrollmentStatus::Active, $enrollment->fresh()->status);
    }

    public function test_a_student_cannot_have_two_rows_for_the_same_course(): void
    {
        $enrollment = Enrollment::factory()->create();

        $this->expectException(UniqueConstraintViolationException::class);

        Enrollment::create([
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
        ]);
    }

    public function test_only_active_enrollments_count_as_active(): void
    {
        $course = Course::factory()->create();
        Enrollment::factory()->for($course)->create();
        Enrollment::factory()->for($course)->cancelled()->create();

        $this->assertSame(1, $course->activeEnrollments()->count());
        $this->assertSame(2, $course->enrollments()->count());
    }
}
