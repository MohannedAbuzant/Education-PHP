<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CourseFullException extends ConflictHttpException
{
    public function __construct()
    {
        parent::__construct('This course is full.');
    }
}
