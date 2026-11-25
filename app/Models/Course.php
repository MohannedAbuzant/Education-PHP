<?php

namespace App\Models;

use App\Enums\EnrollmentStatus;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory;

    public const HAS_ENROLLMENTS_MESSAGE = 'This course has enrollments and cannot be deleted.';

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

    /**
     * Adds an `enrolled` count to each course. Only ACTIVE registrations are
     * counted: cancelled ones have given their seat back.
     *
     * @param  Builder<Course>  $query
     */
    public function scopeWithActiveEnrolled(Builder $query): void
    {
        $query->withCount('activeEnrollments as enrolled');
    }

    /** Any registration counts, cancelled ones too: they are history we keep. */
    public function hasEnrollments(): bool
    {
        return $this->enrollments()->exists();
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
