<?php

namespace Tests\Feature\Api;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiCourseTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'API Course',
            'description' => 'About',
            'seats' => 10,
            'starts_at' => '2027-02-01',
        ], $overrides);
    }

    public function test_any_logged_in_user_can_list_courses_with_seats_left(): void
    {
        $course = Course::factory()->create(['seats' => 3]);
        Enrollment::factory()->for($course)->create();
        Enrollment::factory()->for($course)->cancelled()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/courses')
            ->assertOk()
            ->assertJsonPath('data.0.seats_left', 2)
            ->assertJsonStructure(['data' => [['id', 'title', 'description', 'seats', 'seats_left', 'starts_at']], 'links', 'meta']);
    }

    public function test_show_returns_one_course_and_404_for_missing(): void
    {
        $course = Course::factory()->create(['seats' => 4]);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/courses/{$course->id}")
            ->assertOk()
            ->assertJsonPath('data.seats_left', 4);

        $this->getJson('/api/courses/9999')->assertNotFound();
    }

    public function test_admin_can_create_update_and_delete(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $id = $this->postJson('/api/courses', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.title', 'API Course')
            ->json('data.id');

        $this->putJson("/api/courses/{$id}", $this->payload(['title' => 'Renamed']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Renamed');

        $this->deleteJson("/api/courses/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('courses', ['id' => $id]);
    }

    public function test_students_get_403_on_admin_endpoints(): void
    {
        $course = Course::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/courses', $this->payload())->assertForbidden();
        $this->putJson("/api/courses/{$course->id}", $this->payload())->assertForbidden();
        $this->deleteJson("/api/courses/{$course->id}")->assertForbidden();
    }

    public function test_invalid_input_returns_422(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/courses', $this->payload(['seats' => -1, 'title' => '', 'starts_at' => 'tomorrow-ish']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['seats', 'title', 'starts_at']);
    }

    public function test_course_with_enrollments_cannot_be_deleted(): void
    {
        $course = Course::factory()->create();
        Enrollment::factory()->for($course)->cancelled()->create();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson("/api/courses/{$course->id}")->assertStatus(409);
        $this->assertModelExists($course);
    }
}
