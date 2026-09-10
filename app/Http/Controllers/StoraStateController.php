<?php

namespace App\Http\Controllers;

use App\Models\StoraState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoraStateController extends Controller
{
    public function show(): JsonResponse
    {
        $state = StoraState::query()->find(1);

        if (!$state) {
            return response()->json(['success' => false, 'message' => 'STORA state has not been seeded.'], 404);
        }

        return response()->json(['success' => true, 'data' => $state->payload, 'updated_at' => $state->updated_at?->toISOString()]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'users' => ['required', 'array'],
            'categories' => ['required', 'array'],
            'items' => ['required', 'array'],
            'storeRequests' => ['required', 'array'],
            'stockMovements' => ['required', 'array'],
            'notifications' => ['required', 'array'],
            'auditLogs' => ['required', 'array'],
        ]);

        $state = StoraState::query()->updateOrCreate(['id' => 1], ['payload' => $validated]);

        return response()->json(['success' => true, 'data' => $state->payload, 'updated_at' => $state->updated_at?->toISOString()]);
    }
}
