<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:seed-mock-data', function () {
    $this->info('Generating rich mockup dataset for Academia Portal testing...');
    $this->call('db:seed', ['--class' => 'Database\\Seeders\\MockDataSeeder']);
    $this->info('Mockup data generated successfully! Ready for full-stack review.');
})->purpose('Generate rich mockup data (classrooms, faculty, students, attendance, grades) for testing');
