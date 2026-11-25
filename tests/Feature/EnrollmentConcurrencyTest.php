<?php

namespace Tests\Feature;

use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Real parallel PHP processes race for the last seat. This needs a database
 * with row locks (MySQL or MariaDB); SQLite ignores `for update`, so the test
 * is skipped there. CI runs it in the MySQL job.
 */
class EnrollmentConcurrencyTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        if (! in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('Row locking needs MySQL or MariaDB.');
        }
    }

    public function test_only_one_of_many_simultaneous_students_gets_the_last_seat(): void
    {
        $course = Course::factory()->create(['seats' => 1]);
        $students = User::factory()->count(8)->create();

        // Every process waits for the same instant, so they hit the database together.
        $startAt = microtime(true) + 3.0;

        $processes = $students->map(fn (User $student) => $this->startRegistration($student, $course, $startAt))->all();

        $results = array_map(fn (array $process) => $this->finish($process), $processes);

        $this->assertSame(1, count(array_filter($results, fn ($r) => str_contains($r, 'RESULT:OK'))), implode("\n", $results));
        $this->assertSame(7, count(array_filter($results, fn ($r) => str_contains($r, 'RESULT:CourseFullException'))), implode("\n", $results));
        $this->assertSame(1, Enrollment::where('course_id', $course->id)->where('status', EnrollmentStatus::Active)->count());
    }

    /**
     * @return array{0: resource, 1: array<int, resource>}
     */
    private function startRegistration(User $student, Course $course, float $startAt): array
    {
        $code = sprintf(
            'while (microtime(true) < %F) { usleep(50); } try { app(App\Services\EnrollmentService::class)->register(App\Models\User::find(%d), App\Models\Course::find(%d)); echo "RESULT:OK"; } catch (Throwable $e) { echo "RESULT:".class_basename($e); }',
            $startAt,
            $student->id,
            $course->id,
        );

        $process = proc_open(
            [PHP_BINARY, 'artisan', 'tinker', '--execute='.$code],
            [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
            $pipes,
            base_path(),
        );

        return [$process, $pipes];
    }

    /**
     * @param  array{0: resource, 1: array<int, resource>}  $process
     */
    private function finish(array $process): string
    {
        [$handle, $pipes] = $process;
        $output = stream_get_contents($pipes[1]).stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($handle);

        return trim($output);
    }
}
