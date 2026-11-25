<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::middleware('role:admin')->group(function () {
        Route::resource('courses', CourseController::class)->except('show');
    });

    Route::middleware('role:student')->group(function () {
        Route::get('catalog', [CatalogController::class, 'index'])->name('catalog.index');
        Route::get('my-enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
        Route::post('courses/{course}/enrollments', [EnrollmentController::class, 'store'])->name('enrollments.store');
        Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])->name('enrollments.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
