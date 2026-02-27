<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔄 RUNNING SCHEDULED TRANSFERS MIGRATION\n";
echo "========================================\n\n";

try {
    // Check database connection
    echo "Checking database connection...\n";
    $pdo = DB::connection()->getPdo();
    echo "Database connected: " . get_class($pdo) . "\n\n";
    
    // Run migration manually
    echo "Creating scheduled_transfers table...\n";
    
    $sql = "
    CREATE TABLE IF NOT EXISTS scheduled_transfers (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        from_wallet_id BIGINT UNSIGNED NOT NULL,
        to_wallet_id BIGINT UNSIGNED NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT NULL,
        frequency ENUM('daily', 'weekly', 'monthly', 'yearly', 'once') NOT NULL,
        scheduled_at DATETIME NOT NULL,
        next_execution_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
        FOREIGN KEY (to_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    DB::statement($sql);
    echo "Table created successfully!\n\n";
    
    // Verify table exists
    $tables = DB::select('SHOW TABLES LIKE "scheduled_transfers"');
    if (count($tables) > 0) {
        echo "✅ Table verified: scheduled_transfers exists\n";
        
        // Show structure
        $columns = DB::select('DESCRIBE scheduled_transfers');
        echo "\nTable structure:\n";
        foreach ($columns as $column) {
            echo "- {$column->Field} ({$column->Type})\n";
        }
    } else {
        echo "❌ Table not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

?>
