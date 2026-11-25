<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // This seeder creates demo data, and its factories use Faker, a dev-only package.
        // In production, create the first admin with `php artisan admin:create`.
        if (app()->isProduction()) {
            $this->command?->warn('Demo seeding is disabled in production. Use admin:create instead.');

            return;
        }

        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);

        $student = User::factory()->create([
            'name' => 'Student',
            'email' => 'student@example.com',
        ]);

        $courses = collect([
            ['Laravel Fundamentals', 'Routing, controllers, Eloquent and migrations: build a real app from scratch.', 20, 2],
            ['React with Inertia', 'Build single-page screens on a Laravel backend, without writing a separate API.', 16, 3],
            ['Databases and SQL', 'Design tables, write joins and understand transactions and row locking.', 12, 4],
            ['REST APIs with Sanctum', 'Token authentication, JSON resources, validation and clear status codes.', 18, 5],
            ['Testing PHP Applications', 'Feature tests, factories and a CI pipeline that runs on every push.', 14, 6],
            ['Docker for Developers', 'Containers, Compose and shipping a Laravel app to production.', 10, 8],
        ])->map(fn (array $course) => Course::create([
            'title' => $course[0],
            'description' => $course[1],
            'seats' => $course[2],
            'starts_at' => now()->addWeeks($course[3]),
        ]));

        Enrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $courses->first()->id,
        ]);
    }
}
