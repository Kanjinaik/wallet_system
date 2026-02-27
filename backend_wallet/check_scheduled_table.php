<?php

echo "🔍 CHECKING SCHEDULED TRANSFERS TABLE\n";
echo "====================================\n\n";

try {
    // Check if table exists
    $tables = DB::select('SHOW TABLES');
    $tableExists = false;
    
    foreach ($tables as $table) {
        if ($table->Tables_in_wallet_system === 'scheduled_transfers') {
            $tableExists = true;
            break;
        }
    }
    
    echo "Table exists: " . ($tableExists ? "YES" : "NO") . "\n\n";
    
    if ($tableExists) {
        // Check table structure
        $columns = DB::select('DESCRIBE scheduled_transfers');
        echo "Table structure:\n";
        foreach ($columns as $column) {
            echo "- {$column->Field} ({$column->Type})\n";
        }
        
        // Check if there's data
        $count = DB::table('scheduled_transfers')->count();
        echo "\nTotal records: $count\n\n";
        
        // Show sample data
        $records = DB::table('scheduled_transfers')->limit(3)->get();
        if ($count > 0) {
            echo "Sample records:\n";
            foreach ($records as $record) {
                echo "ID: {$record->id}, From: {$record->from_wallet_id}, To: {$record->to_wallet_id}, Amount: {$record->amount}\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

?>
