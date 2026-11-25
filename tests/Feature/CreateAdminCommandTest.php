<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_admin_who_can_log_in(): void
    {
        $this->artisan('admin:create', ['email' => 'boss@example.com', '--name' => 'Boss', '--password' => 'secret-pass'])
            ->expectsOutput('boss@example.com is now an admin.')
            ->assertSuccessful();

        $user = User::firstWhere('email', 'boss@example.com');
        $this->assertSame(Role::Admin, $user->role);
        $this->assertTrue(Hash::check('secret-pass', $user->password));

        $this->post('/login', ['email' => 'boss@example.com', 'password' => 'secret-pass'])
            ->assertRedirect('/dashboard');
    }

    public function test_it_prompts_for_the_password_when_omitted(): void
    {
        $this->artisan('admin:create', ['email' => 'boss@example.com'])
            ->expectsQuestion('Password (min 8 characters)', 'prompted-pass')
            ->assertSuccessful();

        $this->assertTrue(Hash::check('prompted-pass', User::firstWhere('email', 'boss@example.com')->password));
    }

    public function test_it_promotes_an_existing_student(): void
    {
        $student = User::factory()->create(['email' => 'sara@example.com']);

        $this->artisan('admin:create', ['email' => 'sara@example.com', '--password' => 'secret-pass'])->assertSuccessful();

        $this->assertSame(1, User::count());
        $this->assertTrue($student->fresh()->isAdmin());
    }

    public function test_it_rejects_a_short_password_and_a_bad_email(): void
    {
        $this->artisan('admin:create', ['email' => 'boss@example.com', '--password' => 'short'])->assertFailed();
        $this->artisan('admin:create', ['email' => 'not-an-email', '--password' => 'secret-pass'])->assertFailed();

        $this->assertSame(0, User::count());
    }
}
