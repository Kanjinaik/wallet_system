<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        if (!Schema::hasTable('user_notifications')) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ]);
        }

        $notifications = $request->user()->notifications()
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        $unread = $notifications->where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unread,
        ]);
    }

    public function markRead(Request $request, int $id)
    {
        if (!Schema::hasTable('user_notifications')) {
            return response()->json(['message' => 'Notification marked read']);
        }

        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->is_read = true;
        $notification->save();

        return response()->json(['message' => 'Notification marked read']);
    }

    public function markAll(Request $request)
    {
        if (!Schema::hasTable('user_notifications')) {
            return response()->json(['message' => 'All notifications marked read']);
        }

        $request->user()->notifications()->where('is_read', false)->update(['is_read' => true]);
        return response()->json(['message' => 'All notifications marked read']);
    }
}
