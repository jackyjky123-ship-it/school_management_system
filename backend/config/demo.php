<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Demo Login
    |--------------------------------------------------------------------------
    |
    | The public demo login endpoint issues a real session token for a seeded
    | account. It is convenient for portfolio reviews, but must never be
    | enabled on a production deployment that contains real student data.
    |
    */

    'enabled' => filter_var(
        env('DEMO_MODE', env('APP_ENV', 'production') !== 'production'),
        FILTER_VALIDATE_BOOLEAN
    ),

];
