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
$databasePath = DB::connection()->getDatabaseName();
echo "📊 Database File: $databasePath\n\n";

// Get all tables using SQLite
$tables = DB::select("SELECT name FROM sqlite_master WHERE type='table'");
$tableNames = [];
foreach ($tables as $table) {
    $tableNames[] = $table->name;
}

echo "📋 Tables Found: " . count($tableNames) . "\n";
echo "========================\n\n";

foreach ($tableNames as $tableName) {
    if (in_array($tableName, ['cache', 'jobs', 'failed_jobs', 'personal_access_tokens', 'migrations'])) {
        continue; // Skip system tables
    }
    
    echo "🏷️ TABLE: $tableName\n";
    echo str_repeat("-", 50) . "\n";
    
    // Get table structure
    $columns = DB::select("PRAGMA table_info($tableName)");
    echo "📐 Structure:\n";
    foreach ($columns as $column) {
        $nullable = $column->notnull ? 'NOT NULL' : 'NULL';
        $key = $column->pk ? 'PRIMARY KEY' : '';
        echo "  - {$column->name}: {$column->type} $nullable $key\n";
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
echo "Database File: $databasePath\n";
echo "Export Date: " . date('Y-m-d H:i:s') . "\n";

// Create MySQL export
echo "\n🔄 CREATING MYSQL EXPORT SCRIPT...\n";
echo "==================================\n\n";

$mysqlScript = "-- Wallet System Database Export for MySQL\n";
$mysqlScript .= "-- Generated on: " . date('Y-m-d H:i:s') . "\n\n";

foreach ($tableNames as $tableName) {
    if (in_array($tableName, ['cache', 'jobs', 'failed_jobs', 'personal_access_tokens', 'migrations'])) {
        continue;
    }
    
    $columns = DB::select("PRAGMA table_info($tableName)");
    
    // Create table SQL
    $mysqlScript .= "-- Table: $tableName\n";
    $mysqlScript .= "CREATE TABLE `$tableName` (\n";
    
    $columnDefs = [];
    foreach ($columns as $column) {
        $type = $column->type;
        $mysqlType = match($type) {
            'INTEGER' => 'INT',
            'TEXT' => 'TEXT',
            'VARCHAR(255)' => 'VARCHAR(255)',
            'BOOLEAN' => 'BOOLEAN',
            'REAL' => 'DECIMAL(10,2)',
            default => 'VARCHAR(255)'
        };
        
        $nullable = $column->notnull ? 'NOT NULL' : '';
        $key = $column->pk ? 'PRIMARY KEY AUTO_INCREMENT' : '';
        
        $columnDefs[] = "  `{$column->name}` $mysqlType $nullable $key";
    }
    
    $mysqlScript .= implode(",\n", $columnDefs);
    $mysqlScript .= "\n);\n\n";
    
    // Insert data
    $data = DB::table($tableName)->get();
    if ($data->count() > 0) {
        foreach ($data as $record) {
            $columns = array_keys((array)$record);
            $values = array_map(function($value) {
                if (is_null($value)) return 'NULL';
                if (is_string($value)) return "'" . addslashes($value) . "'";
                if (is_bool($value)) return $value ? '1' : '0';
                return $value;
            }, array_values((array)$record));
            
            $mysqlScript .= "INSERT INTO `$tableName` (`" . implode("`, `", $columns) . "`) VALUES (" . implode(", ", $values) . ");\n";
        }
        $mysqlScript .= "\n";
    }
}

file_put_contents(__DIR__ . '/wallet_system_mysql.sql', $mysqlScript);
echo "✅ MySQL export saved to: wallet_system_mysql.sql\n\n";

echo "🎉 COMPLETE! Database exported for MySQL import.\n";
