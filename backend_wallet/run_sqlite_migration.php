<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔄 RUNNING SCHEDULED TRANSFERS MIGRATION (SQLite)\n";
echo "==========================================\n\n";

try {
    // Check database connection
    echo "Checking database connection...\n";
    $pdo = DB::connection()->getPdo();
    echo "Database connected: " . get_class($pdo) . "\n\n";
    
    // Run migration manually for SQLite
    echo "Creating scheduled_transfers table...\n";
    
    $sql = "
    CREATE TABLE IF NOT EXISTS scheduled_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        from_wallet_id INTEGER NOT NULL,
        to_wallet_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'once')),
        scheduled_at TEXT NOT NULL,
        next_execution_at TEXT NOT NULL,
        is_active INTEGER DEFAULT 1 NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
        FOREIGN KEY (to_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    )";
    
    DB::statement($sql);
    echo "Table created successfully!\n\n";
    
    // Verify table exists
    $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name='scheduled_transfers'");
    if (count($tables) > 0) {
        echo "✅ Table verified: scheduled_transfers exists\n";
        
        // Show structure
        $columns = DB::select("PRAGMA table_info(scheduled_transfers)");
        echo "\nTable structure:\n";
        foreach ($columns as $column) {
            echo "- {$column->name} ({$column->type})\n";
        }
    } else {
        echo "❌ Table not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

?>
