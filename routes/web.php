<?php

use App\Http\Controllers\StoraStateController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::view('/login', 'app')->name('login');

// STORA persistent state API: the existing UI remains unchanged while its data
// is persisted to MySQL through Laravel migrations/seeders and synchronized.
Route::get('/api/stora/state', [StoraStateController::class, 'show'])->name('stora.state.show');
Route::put('/api/stora/state', [StoraStateController::class, 'update'])->name('stora.state.update');

Route::view('/{any}', 'app')->where('any', '^(?!up$).*')->name('spa.fallback');
