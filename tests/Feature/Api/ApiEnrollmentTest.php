<?php

namespace Tests\Feature\Api;

use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 2]);
        Sanctum::actingAs($student);

        $this->postJson("/api/courses/{$course->id}/enrollments")
            ->assertCreated()
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.course.id', $course->id);
    }

    public function test_full_course_returns_409(): void
    {
        $course = Course::factory()->create(['seats' => 1]);
        Enrollment::factory()->for($course)->create();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/courses/{$course->id}/enrollments")
            ->assertStatus(409)
            ->assertJsonPath('message', 'This course is full.');
    }

    public function test_second_active_registration_returns_409(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 5]);
        Enrollment::factory()->for($course)->for($student)->create();
        Sanctum::actingAs($student);

        $this->postJson("/api/courses/{$course->id}/enrollments")->assertStatus(409);
        $this->assertSame(1, Enrollment::count());
    }

    public function test_admin_cannot_register_and_gets_403(): void
    {
        $course = Course::factory()->create();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/courses/{$course->id}/enrollments")->assertForbidden();
        $this->getJson('/api/me/enrollments')->assertForbidden();
    }

    public function test_registering_for_a_missing_course_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/courses/9999/enrollments')->assertNotFound();
    }

    public function test_me_enrollments_lists_only_own_registrations(): void
    {
        $student = User::factory()->create();
        Enrollment::factory()->for($student)->create();
        Enrollment::factory()->create();
        Sanctum::actingAs($student);

        $this->getJson('/api/me/enrollments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.course.title', $student->enrollments->first()->course->title);
    }

    public function test_owner_can_cancel_and_the_seat_is_freed(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 1]);
        $enrollment = Enrollment::factory()->for($course)->for($student)->create();
        Sanctum::actingAs($student);

        $this->deleteJson("/api/enrollments/{$enrollment->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(EnrollmentStatus::Cancelled, $enrollment->fresh()->status);
        $this->assertSame(0, $course->activeEnrollments()->count());
    }

    public function test_another_students_record_returns_403(): void
    {
        $enrollment = Enrollment::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/enrollments/{$enrollment->id}")->assertForbidden();
        $this->assertSame(EnrollmentStatus::Active, $enrollment->fresh()->status);
    }

    public function test_registering_again_reuses_the_cancelled_row(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 2]);
        $enrollment = Enrollment::factory()->for($course)->for($student)->cancelled()->create();
        Sanctum::actingAs($student);

        $this->postJson("/api/courses/{$course->id}/enrollments")
            ->assertCreated()
            ->assertJsonPath('data.id', $enrollment->id);

        $this->assertSame(1, Enrollment::count());
    }
}
