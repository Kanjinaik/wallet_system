-- =====================================================
-- CHECK ALL DATABASE DATA IN MYSQL
-- ====================================================
-- Use this script to view all data in your MySQL database

USE `wallet_system`;

-- ====================================================
-- 1. CHECK ALL USERS
-- ====================================================
SELECT '=================== ALL USERS ===================' as section;
SELECT 
    id as 'User ID',
    name as 'Full Name',
    email as 'Email Address',
    phone as 'Phone Number',
    role as 'Role',
    is_active as 'Active Status',
    created_at as 'Created Date',
    updated_at as 'Last Updated'
FROM `users`
ORDER BY id;

-- ====================================================
-- 2. CHECK ALL WALLETS WITH USER INFO
-- ====================================================
SELECT '=================== ALL WALLETS ===================' as section;
SELECT 
    u.name as 'User Name',
    u.email as 'User Email',
    w.id as 'Wallet ID',
    w.name as 'Wallet Name',
    w.type as 'Wallet Type',
    w.balance as 'Balance (₹)',
    CASE 
        WHEN w.is_frozen = TRUE THEN 'FROZEN'
        ELSE 'ACTIVE'
    END as 'Status',
    w.freeze_reason as 'Freeze Reason',
    w.created_at as 'Created Date'
FROM `wallets` w
JOIN `users` u ON w.user_id = u.id
ORDER BY u.id, w.id;

-- ====================================================
-- 3. CHECK ALL TRANSACTIONS WITH DETAILS
-- ====================================================
SELECT '=================== ALL TRANSACTIONS ===================' as section;
SELECT 
    u.name as 'User Name',
    u.email as 'User Email',
    t.id as 'Transaction ID',
    t.type as 'Transaction Type',
    t.amount as 'Amount (₹)',
    t.reference as 'Reference Number',
    t.description as 'Description',
    t.status as 'Status',
    CASE 
        WHEN t.from_wallet_id IS NOT NULL THEN w_from.name
        ELSE NULL
    END as 'From Wallet',
    CASE 
        WHEN t.to_wallet_id IS NOT NULL THEN w_to.name
        WHEN t.type = 'withdraw' THEN 'Bank Account'
        ELSE NULL
    END as 'To Wallet/Destination',
    t.created_at as 'Transaction Date',
    t.updated_at as 'Last Updated'
FROM `transactions` t
JOIN `users` u ON t.user_id = u.id
LEFT JOIN `wallets` w_from ON t.from_wallet_id = w_from.id
LEFT JOIN `wallets` w_to ON t.to_wallet_id = w_to.id
ORDER BY t.created_at DESC;

-- ====================================================
-- 4. CHECK WALLET LIMITS FOR ALL USERS
-- ====================================================
SELECT '=================== ALL WALLET LIMITS ===================' as section;
SELECT 
    u.name as 'User Name',
    u.email as 'User Email',
    wl.limit_type as 'Limit Type',
    wl.max_amount as 'Max Amount (₹)',
    wl.transaction_count as 'Transaction Count',
    wl.total_amount as 'Total Used (₹)',
    ROUND((wl.total_amount / wl.max_amount) * 100, 2) as 'Usage Percentage (%)',
    wl.reset_date as 'Reset Date',
    wl.created_at as 'Created Date'
FROM `wallet_limits` wl
JOIN `users` u ON wl.user_id = u.id
ORDER BY u.id, wl.limit_type;

-- ====================================================
-- 5. CHECK USER WALLET SUMMARY
-- ====================================================
SELECT '=================== USER WALLET SUMMARY ===================' as section;
SELECT 
    u.name as 'User Name',
    u.email as 'User Email',
    COUNT(w.id) as 'Total Wallets',
    SUM(CASE WHEN w.type = 'main' THEN 1 ELSE 0 END) as 'Main Wallets',
    SUM(CASE WHEN w.type = 'sub' THEN 1 ELSE 0 END) as 'Sub Wallets',
    SUM(w.balance) as 'Total Balance (₹)',
    SUM(CASE WHEN w.is_frozen = TRUE THEN 1 ELSE 0 END) as 'Frozen Wallets',
    SUM(CASE WHEN w.is_frozen = FALSE THEN 1 ELSE 0 END) as 'Active Wallets'
FROM `users` u
LEFT JOIN `wallets` w ON u.id = w.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email
ORDER BY u.id;

-- ====================================================
-- 6. CHECK TRANSACTION SUMMARY BY TYPE
-- ====================================================
SELECT '=================== TRANSACTION SUMMARY BY TYPE ===================' as section;
SELECT 
    t.type as 'Transaction Type',
    COUNT(t.id) as 'Total Count',
    SUM(t.amount) as 'Total Amount (₹)',
    AVG(t.amount) as 'Average Amount (₹)',
    MIN(t.amount) as 'Minimum Amount (₹)',
    MAX(t.amount) as 'Maximum Amount (₹)'
FROM `transactions` t
GROUP BY t.type
ORDER BY t.type;

-- ====================================================
-- 7. CHECK RECENT TRANSACTIONS (LAST 10)
-- ====================================================
SELECT '=================== RECENT 10 TRANSACTIONS ===================' as section;
SELECT 
    u.name as 'User Name',
    t.type as 'Type',
    t.amount as 'Amount (₹)',
    t.reference as 'Reference',
    t.status as 'Status',
    t.created_at as 'Date'
FROM `transactions` t
JOIN `users` u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;

-- ====================================================
-- 8. CHECK DATABASE STATISTICS
-- ====================================================
SELECT '=================== DATABASE STATISTICS ===================' as section;
SELECT 
    'Total Users' as 'Metric',
    COUNT(*) as 'Count'
FROM `users`
WHERE is_active = TRUE

UNION ALL

SELECT 
    'Total Wallets' as 'Metric',
    COUNT(*) as 'Count'
FROM `wallets`

UNION ALL

SELECT 
    'Total Transactions' as 'Metric',
    COUNT(*) as 'Count'
FROM `transactions`

UNION ALL

SELECT 
    'Completed Transactions' as 'Metric',
    COUNT(*) as 'Count'
FROM `transactions`
WHERE status = 'completed'

UNION ALL

SELECT 
    'Total Balance in System' as 'Metric',
    CONCAT('₹', FORMAT(SUM(balance), 2)) as 'Count'
FROM `wallets`

UNION ALL

SELECT 
    'Frozen Wallets' as 'Metric',
    COUNT(*) as 'Count'
FROM `wallets`
WHERE is_frozen = TRUE;

-- ====================================================
-- 9. CHECK SPECIFIC USER DATA (Test User)
-- ====================================================
SELECT '=================== TEST USER DATA ===================' as section;
SELECT 
    'User Details' as 'Category',
    CONCAT('Name: ', u.name, ', Email: ', u.email, ', Role: ', u.role, ', Active: ', IF(u.is_active, 'Yes', 'No')) as 'Details'
FROM `users` u
WHERE u.email = 'test@example.com'

UNION ALL

SELECT 
    'Wallet Details' as 'Category',
    CONCAT('Wallet: ', w.name, ', Type: ', w.type, ', Balance: ₹', FORMAT(w.balance, 2), ', Status: ', IF(w.is_frozen, 'Frozen', 'Active')) as 'Details'
FROM `wallets` w
WHERE w.user_id = (SELECT id FROM `users` WHERE email = 'test@example.com')

UNION ALL

SELECT 
    'Transaction Count' as 'Category',
    CONCAT('Total: ', COUNT(*), ', Total Amount: ₹', FORMAT(SUM(amount), 2)) as 'Details'
FROM `transactions`
WHERE user_id = (SELECT id FROM `users` WHERE email = 'test@example.com');

-- ====================================================
-- INSTRUCTIONS FOR MANUAL CHECKING
-- ====================================================
SELECT '=================== INSTRUCTIONS ===================' as section;
SELECT '1. To check all users: SELECT * FROM users;' as 'Command_1';
SELECT '2. To check all wallets: SELECT * FROM wallets;' as 'Command_2';
SELECT '3. To check all transactions: SELECT * FROM transactions;' as 'Command_3';
SELECT '4. To check user wallets: SELECT u.name, w.name, w.balance FROM users u JOIN wallets w ON u.id = w.user_id;' as 'Command_4';
SELECT '5. To check specific user: SELECT * FROM users WHERE email = "test@example.com";' as 'Command_5';
SELECT '6. To check wallet limits: SELECT * FROM wallet_limits;' as 'Command_6';
SELECT '7. For live monitoring: SELECT * FROM user_wallet_summary;' as 'Command_7';

SELECT '=================== END OF DATA CHECK ===================' as section;
