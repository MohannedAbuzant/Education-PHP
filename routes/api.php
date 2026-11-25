<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/{course}', [CourseController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('courses', [CourseController::class, 'store']);
        Route::put('courses/{course}', [CourseController::class, 'update']);
        Route::delete('courses/{course}', [CourseController::class, 'destroy']);
    });

    Route::middleware('role:student')->group(function () {
        Route::post('courses/{course}/enrollments', [EnrollmentController::class, 'store']);
        Route::get('me/enrollments', [EnrollmentController::class, 'mine']);
        Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy']);
    });
});
