<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class AlreadyEnrolledException extends ConflictHttpException
{
    public function __construct()
    {
        parent::__construct('You are already registered for this course.');
    }
}
