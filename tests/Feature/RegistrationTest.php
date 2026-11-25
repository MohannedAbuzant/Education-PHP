<?php

namespace Tests\Feature;

use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_for_a_course(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 2]);

        $this->actingAs($student)->post("/courses/{$course->id}/enrollments")
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'course_id' => $course->id,
            'status' => 'active',
        ]);
    }

    public function test_full_course_rejects_registration(): void
    {
        $course = Course::factory()->create(['seats' => 1]);
        Enrollment::factory()->for($course)->create();
        $student = User::factory()->create();

        $this->actingAs($student)->post("/courses/{$course->id}/enrollments")
            ->assertSessionHasErrors('enrollment');

        $this->assertDatabaseMissing('enrollments', ['user_id' => $student->id]);
    }

    public function test_second_active_registration_is_rejected(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 5]);
        Enrollment::factory()->for($course)->for($student)->create();

        $this->actingAs($student)->post("/courses/{$course->id}/enrollments")
            ->assertSessionHasErrors('enrollment');

        $this->assertSame(1, Enrollment::count());
    }

    public function test_cancelled_registration_is_reused(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 5]);
        $enrollment = Enrollment::factory()->for($course)->for($student)->cancelled()->create();

        $this->actingAs($student)->post("/courses/{$course->id}/enrollments")
            ->assertSessionHasNoErrors();

        $this->assertSame(1, Enrollment::count());
        $this->assertSame(EnrollmentStatus::Active, $enrollment->fresh()->status);
    }

    public function test_cancelling_frees_the_seat(): void
    {
        $course = Course::factory()->create(['seats' => 1]);
        $first = User::factory()->create();
        $second = User::factory()->create();
        $enrollment = Enrollment::factory()->for($course)->for($first)->create();

        $this->actingAs($first)->delete("/enrollments/{$enrollment->id}")->assertRedirect();
        $this->assertSame(EnrollmentStatus::Cancelled, $enrollment->fresh()->status);

        $this->actingAs($second)->post("/courses/{$course->id}/enrollments")
            ->assertSessionHasNoErrors();
        $this->assertSame(1, $course->activeEnrollments()->count());
    }

    public function test_student_cannot_cancel_another_students_registration(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $enrollment = Enrollment::factory()->for($owner)->create();

        $this->actingAs($other)->delete("/enrollments/{$enrollment->id}")->assertForbidden();

        $this->assertSame(EnrollmentStatus::Active, $enrollment->fresh()->status);
    }

    public function test_admin_cannot_register_for_courses(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->actingAs($admin)->post("/courses/{$course->id}/enrollments")->assertForbidden();
        $this->actingAs($admin)->get('/catalog')->assertForbidden();
        $this->assertSame(0, Enrollment::count());
    }

    public function test_guests_are_sent_to_login(): void
    {
        $course = Course::factory()->create();

        $this->post("/courses/{$course->id}/enrollments")->assertRedirect('/login');
        $this->get('/catalog')->assertRedirect('/login');
    }

    public function test_catalog_shows_seats_left_and_own_status(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create(['seats' => 3]);
        Enrollment::factory()->for($course)->for($student)->create();
        Enrollment::factory()->for($course)->create();

        $this->actingAs($student)->get('/catalog')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('catalog/index')
                ->where('courses.data.0.seats_left', 1)
                ->where('courses.data.0.my_status', 'active'));
    }

    public function test_my_enrollments_lists_only_own_rows(): void
    {
        $student = User::factory()->create();
        Enrollment::factory()->for($student)->create();
        Enrollment::factory()->create();

        $this->actingAs($student)->get('/my-enrollments')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('enrollments/index')->has('enrollments', 1));
    }
}
