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
        // User::factory(10)->create();

        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);

        $student = User::factory()->create([
            'name' => 'Student',
            'email' => 'student@example.com',
        ]);

        $courses = Course::factory(6)->create();

        Enrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $courses->first()->id,
        ]);
    }
}
