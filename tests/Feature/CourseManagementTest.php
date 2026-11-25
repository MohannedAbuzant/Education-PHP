<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseManagementTest extends TestCase
{
    use RefreshDatabase;

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Intro to Laravel',
            'description' => 'Basics',
            'seats' => 20,
            'starts_at' => '2027-01-10',
        ], $overrides);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/courses')->assertRedirect('/login');
    }

    public function test_students_get_403_on_every_course_route(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->create();

        $this->actingAs($student)->get('/courses')->assertForbidden();
        $this->actingAs($student)->get('/courses/create')->assertForbidden();
        $this->actingAs($student)->post('/courses', $this->validData())->assertForbidden();
        $this->actingAs($student)->get("/courses/{$course->id}/edit")->assertForbidden();
        $this->actingAs($student)->put("/courses/{$course->id}", $this->validData())->assertForbidden();
        $this->actingAs($student)->delete("/courses/{$course->id}")->assertForbidden();

        $this->assertDatabaseCount('courses', 1);
    }

    public function test_admin_sees_course_list_with_enrolled_counts(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();
        Enrollment::factory()->for($course)->create();
        Enrollment::factory()->for($course)->cancelled()->create();

        $this->actingAs($admin)->get('/courses')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('courses/index')
                ->where('courses.data.0.enrolled', 1));
    }

    public function test_admin_can_create_a_course(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/courses', $this->validData())
            ->assertRedirect('/courses');

        $this->assertDatabaseHas('courses', ['title' => 'Intro to Laravel', 'seats' => 20]);
    }

    public function test_invalid_input_returns_422(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->postJson('/courses', $this->validData(['seats' => 0, 'title' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['seats', 'title']);

        $this->assertDatabaseCount('courses', 0);
    }

    public function test_admin_can_update_a_course(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->actingAs($admin)->put("/courses/{$course->id}", $this->validData(['title' => 'Renamed']))
            ->assertRedirect('/courses');

        $this->assertSame('Renamed', $course->fresh()->title);
    }

    public function test_admin_can_delete_a_course_without_enrollments(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->actingAs($admin)->delete("/courses/{$course->id}")->assertRedirect('/courses');

        $this->assertModelMissing($course);
    }

    public function test_course_with_enrollments_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();
        Enrollment::factory()->for($course)->cancelled()->create();

        $this->actingAs($admin)->from('/courses')->delete("/courses/{$course->id}")
            ->assertRedirect('/courses')
            ->assertSessionHasErrors('course');

        $this->assertModelExists($course);
    }
}
