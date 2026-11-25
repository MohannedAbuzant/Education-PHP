<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy
{
    /**
     * Only the student who owns a registration may cancel it.
     */
    public function cancel(User $user, Enrollment $enrollment): bool
    {
        return $enrollment->user_id === $user->id;
    }
}
