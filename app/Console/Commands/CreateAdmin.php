<?php

namespace App\Console\Commands;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create
        {email : The admin\'s email address}
        {--name=Admin : Display name}
        {--password= : Password (prompted when omitted, so it stays out of shell history)}';

    protected $description = 'Create an admin account, or promote an existing user to admin';

    public function handle(): int
    {
        $password = $this->option('password') ?: $this->secret('Password (min 8 characters)');

        $validator = Validator::make(
            ['email' => $this->argument('email'), 'password' => $password],
            ['email' => ['required', 'email'], 'password' => ['required', 'string', 'min:8']],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $this->argument('email')],
            ['name' => $this->option('name'), 'password' => $password, 'role' => Role::Admin, 'email_verified_at' => now()],
        );

        $this->info("{$user->email} is now an admin.");

        return self::SUCCESS;
    }
}
