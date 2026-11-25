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
            ['title' => 'Laravel Fundamentals', 'description' => 'Routing, controllers, Eloquent and migrations: build a real app from scratch.', 'seats' => 20, 'weeks_from_now' => 2],
            ['title' => 'React with Inertia', 'description' => 'Build single-page screens on a Laravel backend, without writing a separate API.', 'seats' => 16, 'weeks_from_now' => 3],
            ['title' => 'Databases and SQL', 'description' => 'Design tables, write joins and understand transactions and row locking.', 'seats' => 12, 'weeks_from_now' => 4],
            ['title' => 'REST APIs with Sanctum', 'description' => 'Token authentication, JSON resources, validation and clear status codes.', 'seats' => 18, 'weeks_from_now' => 5],
            ['title' => 'Testing PHP Applications', 'description' => 'Feature tests, factories and a CI pipeline that runs on every push.', 'seats' => 14, 'weeks_from_now' => 6],
            ['title' => 'Docker for Developers', 'description' => 'Containers, Compose and shipping a Laravel app to production.', 'seats' => 10, 'weeks_from_now' => 8],
        ])->map(fn (array $course) => Course::factory()->create([
            'title' => $course['title'],
            'description' => $course['description'],
            'seats' => $course['seats'],
            'starts_at' => now()->addWeeks($course['weeks_from_now']),
        ]));

        Enrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $courses->first()->id,
        ]);
    }
}
