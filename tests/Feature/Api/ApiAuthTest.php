<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_a_token_that_works(): void
    {
        $user = User::factory()->create(['email' => 'sara@example.com']);

        $token = $this->postJson('/api/login', ['email' => 'sara@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('role', 'student')
            ->json('token');

        $this->withToken($token)->getJson('/api/courses')->assertOk();
        $this->assertSame(1, $user->tokens()->count());
    }

    public function test_wrong_password_returns_401(): void
    {
        User::factory()->create(['email' => 'sara@example.com']);

        $this->postJson('/api/login', ['email' => 'sara@example.com', 'password' => 'nope'])
            ->assertUnauthorized();
    }

    public function test_missing_fields_return_422(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_protected_routes_require_a_token(): void
    {
        $this->getJson('/api/courses')->assertUnauthorized();
        $this->getJson('/api/me/enrollments')->assertUnauthorized();
    }

    public function test_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'x@example.com', 'password' => 'wrong'])
                ->assertUnauthorized();
        }

        $this->postJson('/api/login', ['email' => 'x@example.com', 'password' => 'wrong'])
            ->assertStatus(429);
    }

    public function test_errors_do_not_leak_stack_traces_when_debug_is_off(): void
    {
        config(['app.debug' => false]);

        $this->postJson('/api/login', ['email' => 'x@example.com', 'password' => 'wrong'])
            ->assertUnauthorized()
            ->assertJsonMissing(['exception'])
            ->assertJsonMissingPath('trace');

        $this->getJson('/api/nope')->assertNotFound()->assertJsonMissingPath('trace');
    }
}
