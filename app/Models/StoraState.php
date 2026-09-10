<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoraState extends Model
{
    protected $table = 'stora_state';
    protected $fillable = ['payload'];
    protected $casts = ['payload' => 'array'];
}
