<?php

namespace App\Models;

use App\Enums\EnrollmentStatus;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'seats',
        'starts_at',
    ];

    protected function casts(): array
    {
        return [
            'seats' => 'integer',
            'starts_at' => 'date:Y-m-d',
        ];
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function activeEnrollments(): HasMany
    {
        return $this->enrollments()->where('status', EnrollmentStatus::Active);
    }

    /**
     * Seats still free. Uses the `enrolled` count when the query loaded it
     * (withCount) to avoid an extra query per course.
     */
    public function seatsLeft(): int
    {
        $taken = $this->enrolled ?? $this->activeEnrollments()->count();

        return max(0, $this->seats - $taken);
    }
}
