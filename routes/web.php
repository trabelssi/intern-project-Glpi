<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InterventionController;
use App\Http\Controllers\NotificationController;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\UserRoleController;
use App\Models\User;
use App\Http\Controllers\HistoriqueController;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard')
        ->middleware(CheckRole::class.':'.User::ROLE_ADMIN);

    // User Dashboard
    Route::get('/user-dashboard', [DashboardController::class, 'userDashboard'])
        ->name('user.dashboard')
        ->middleware(CheckRole::class.':'.User::ROLE_USER);

    // Admin only routes
    Route::middleware(CheckRole::class.':'.User::ROLE_ADMIN)->group(function () {
        Route::resource('project', ProjectController::class)->names([
            'index' => 'projects.index',
            'create' => 'projects.create',
            'store' => 'projects.store',
            'show' => 'projects.show',
            'edit' => 'projects.edit',
            'update' => 'projects.update',
            'destroy' => 'projects.destroy'
        ]);
        Route::resource('user', UserController::class)->names([
            'index' => 'users.index',
        ]);
        Route::put('/user/{user}/toggle-role', [UserController::class, 'toggleRole'])->name('user.toggle-role');
        Route::delete('/user/{user}/force', [UserController::class, 'forceDelete'])->name('user.force-delete');
        Route::post('/user/{user}/restore', [UserController::class, 'restore'])->name('user.restore');
        Route::get('/dashboard/stats/{period}', [DashboardController::class, 'getStats']);
        Route::get('/dashboard/filtered-data', [DashboardController::class, 'getFilteredData'])->name('dashboard.filtered-data');
    });

    // Task routes (accessible by both admin and user)
    Route::middleware(CheckRole::class.':'.User::ROLE_ADMIN.'|'.User::ROLE_USER)->group(function () {
        Route::get('/task/my-tasks', [TaskController::class, 'mytasks'])
            ->name('task.myTasks');
        Route::get('/task/observed-tasks', [TaskController::class, 'observedTasks'])
            ->name('task.observedTasks');
        // Common task routes
        Route::resource('task', TaskController::class)->names([
            'index' => 'tasks.index',
            'create' => 'task.create',
            'store' => 'task.store',
            'show' => 'task.show',
            'edit' => 'task.edit',
            'update' => 'task.update',
            'destroy' => 'task.destroy'
        ]);
    });
    
    // Intervention routes
    Route::get('/interventions', [InterventionController::class, 'index'])->name('interventions.index');
    Route::get('/interventions/create', [InterventionController::class, 'create'])->name('interventions.create');
    Route::post('/interventions', [InterventionController::class, 'store'])->name('interventions.store');
    Route::get('/interventions/{intervention}', [InterventionController::class, 'show'])->name('interventions.show');
    Route::patch('/interventions/{intervention}', [InterventionController::class, 'update'])->name('interventions.update');
    Route::delete('/interventions/{intervention}', [InterventionController::class, 'destroy'])->name('interventions.destroy');

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll'])->name('notifications.clearAll');

    // History route (accessible by both admin and user)
    Route::get('/historique', [HistoriqueController::class, 'index'])
        ->name('historique.index')
        ->middleware(CheckRole::class.':'.User::ROLE_ADMIN.'|'.User::ROLE_USER);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', 'role:'.User::ROLE_ADMIN])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [UserRoleController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-role', [UserRoleController::class, 'toggleRole'])->name('users.toggle-role');
});




require __DIR__.'/auth.php';
