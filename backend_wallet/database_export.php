<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "🗄️ WALLET SYSTEM DATABASE EXPORT 🗄️\n";
echo "=====================================\n\n";

// Get database name
$databaseName = DB::connection()->getDatabaseName();
echo "📊 Database Name: $databaseName\n\n";

// Get all tables
$tables = DB::select('SHOW TABLES');
$tableNames = [];
foreach ($tables as $table) {
    $tableName = array_values((array)$table)[0];
    $tableNames[] = $tableName;
}

echo "📋 Tables Found: " . count($tableNames) . "\n";
echo "========================\n\n";

foreach ($tableNames as $tableName) {
    if (in_array($tableName, ['cache', 'jobs', 'failed_jobs', 'personal_access_tokens'])) {
        continue; // Skip system tables
    }
    
    echo "🏷️ TABLE: $tableName\n";
    echo str_repeat("-", 50) . "\n";
    
    // Get table structure
    $columns = DB::select("DESCRIBE $tableName");
    echo "📐 Structure:\n";
    foreach ($columns as $column) {
        echo "  - {$column->Field}: {$column->Type} " . ($column->Null === 'NO' ? 'NOT NULL' : 'NULL') . ($column->Key ? " KEY: {$column->Key}" : '') . "\n";
    }
    
    // Get table data
    $data = DB::table($tableName)->get();
    if ($data->count() > 0) {
        echo "\n📝 Data ({$data->count()} records):\n";
        $dataArray = $data->toArray();
        foreach ($dataArray as $index => $record) {
            echo "  Record " . ($index + 1) . ":\n";
            foreach ($record as $key => $value) {
                if (is_null($value)) {
                    echo "    $key: NULL\n";
                } elseif (is_string($value)) {
                    echo "    $key: \"$value\"\n";
                } elseif (is_bool($value)) {
                    echo "    $key: " . ($value ? 'true' : 'false') . "\n";
                } elseif (is_numeric($value)) {
                    echo "    $key: $value\n";
                } else {
                    echo "    $key: " . json_encode($value) . "\n";
                }
            }
            echo "\n";
        }
    } else {
        echo "\n📝 Data: No records found\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n\n";
}

echo "🎉 DATABASE EXPORT COMPLETE! 🎉\n";
echo "=================================\n";
echo "Total Tables: " . count($tableNames) . "\n";
echo "Database: $databaseName\n";
echo "Export Date: " . date('Y-m-d H:i:s') . "\n";
