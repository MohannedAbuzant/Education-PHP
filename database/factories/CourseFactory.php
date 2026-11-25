<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(3),
            'description' => fake()->paragraph(),
            'seats' => fake()->numberBetween(5, 30),
            'starts_at' => fake()->dateTimeBetween('+1 week', '+6 months'),
        ];
    }
}
