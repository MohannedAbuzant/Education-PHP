<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_default_to_student(): void
    {
        $user = User::factory()->create();

        $this->assertSame(Role::Student, $user->role);
        $this->assertFalse($user->isAdmin());
    }

    public function test_admin_state_creates_admin(): void
    {
        $this->assertTrue(User::factory()->admin()->create()->isAdmin());
    }

    public function test_registration_cannot_set_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'New',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'admin',
        ]);

        $response->assertRedirect();
        $this->assertAuthenticated();
        $this->assertSame(Role::Student, User::firstWhere('email', 'new@example.com')->role);
    }
}
