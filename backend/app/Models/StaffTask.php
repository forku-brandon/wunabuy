<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StaffTask extends Model
{
    use HasUuids;

    protected $fillable = [
        'assigned_to_id',
        'assigned_to_name',
        'assigned_to_role',
        'assigned_by_name',
        'task_title',
        'task_description',
        'recurrence',
        'due_date',
        'status',
        'priority',
        'accepted_at',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}