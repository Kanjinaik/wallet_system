-- Wallet System Database Export for MySQL
-- Generated on: 2026-02-18 17:13:29

-- Table: sqlite_sequence
CREATE TABLE `sqlite_sequence` (
  `name` VARCHAR(255)  ,
  `seq` VARCHAR(255)  
);

INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('migrations', 8);
INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('users', 4);
INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('wallets', 7);
INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('wallet_limits', 12);
INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('personal_access_tokens', 15);
INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('transactions', 7);
INSERT INTO `sqlite_sequence` (`name`, `seq`) VALUES ('jobs', 8);

-- Table: users
CREATE TABLE `users` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL ,
  `email` VARCHAR(255) NOT NULL ,
  `email_verified_at` VARCHAR(255)  ,
  `password` VARCHAR(255) NOT NULL ,
  `phone` VARCHAR(255)  ,
  `role` VARCHAR(255) NOT NULL ,
  `is_active` VARCHAR(255) NOT NULL ,
  `remember_token` VARCHAR(255)  ,
  `created_at` VARCHAR(255)  ,
  `updated_at` VARCHAR(255)  
);

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES (1, 'Test User', 'test@example.com', '2026-02-18 11:58:17', '$2y$12$MzgQYKyQjWNjLnG0yc/wH.leqXjnd88BTAfBKCShBROIQi2l0/kBa', NULL, 'user', 1, 'tyjCGzFyz0', '2026-02-18 11:58:17', '2026-02-18 16:40:34');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES (2, 'Admin User', 'admin@wallet.com', NULL, '$2y$12$fVHAvdEyIPk/d4wO.Prwv.fadV1X0/QDc0QhXosQlb0pyfNtY2P12', '9876543210', 'admin', 1, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES (3, 'Test User', 'user@wallet.com', NULL, '$2y$12$UmVpyf3JeztfucVs/z5Cs.FqRu8WHRCrIFovSXoOvt..6jEZ0oj.i', '9876543211', 'user', 1, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES (4, 'Anji Korra', 'kanjinaik1234@gmail.com', NULL, '$2y$12$D13iNHqxCuKrrlZoJqYf2e9UJw5h5Epn7hk/LbXwJJPmYQG1aAqO2', '8096004053', 'user', 1, NULL, '2026-02-18 12:01:07', '2026-02-18 12:01:07');

-- Table: password_reset_tokens
CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL ,
  `created_at` VARCHAR(255)  
);

-- Table: sessions
CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT  ,
  `ip_address` VARCHAR(255)  ,
  `user_agent` TEXT  ,
  `payload` TEXT NOT NULL ,
  `last_activity` INT NOT NULL 
);

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('UbSn2HAzuLo7ecGcR1VQCV2SyUEDosVS4Sp9Krm2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNlRVSk55R2VvTm9QUGp2MkZLSGtnb2tIaVlTS1RFRGpvN1Z3SEcyUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1771415990);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('JlXCpOA22h7pVByo2G8L8Kq7m2dttp95epsYeMh3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieTlyWkxXUEVtWVdYY1Y4QzEySG5wT1JWTWptWU9qRXU1QTM1b2ZtQyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvd2FsbGV0cyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1771433007);

-- Table: cache_locks
CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `owner` VARCHAR(255) NOT NULL ,
  `expiration` INT NOT NULL 
);

-- Table: job_batches
CREATE TABLE `job_batches` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL ,
  `total_jobs` INT NOT NULL ,
  `pending_jobs` INT NOT NULL ,
  `failed_jobs` INT NOT NULL ,
  `failed_job_ids` TEXT NOT NULL ,
  `options` TEXT  ,
  `cancelled_at` INT  ,
  `created_at` INT NOT NULL ,
  `finished_at` INT  
);

-- Table: wallets
CREATE TABLE `wallets` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL ,
  `name` VARCHAR(255) NOT NULL ,
  `type` VARCHAR(255) NOT NULL ,
  `balance` VARCHAR(255) NOT NULL ,
  `is_frozen` VARCHAR(255) NOT NULL ,
  `freeze_reason` TEXT  ,
  `created_at` VARCHAR(255)  ,
  `updated_at` VARCHAR(255)  
);

INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (1, 2, 'Admin Main Wallet', 'main', 100000, 0, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (2, 3, 'Main Wallet', 'main', 5000, 0, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (3, 3, 'Savings Wallet', 'sub', 2000, 0, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (4, 4, 'Main Wallet', 'main', 100, 1, 'Manual freeze by user', '2026-02-18 12:01:07', '2026-02-18 12:18:13');
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (5, 4, 'saving', 'sub', 200, 1, 'Manual freeze by user', '2026-02-18 12:25:24', '2026-02-18 15:46:53');
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (6, 1, 'Main Wallet', 'sub', 2000, 0, NULL, '2026-02-18 16:41:07', '2026-02-18 17:03:45');
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES (7, 1, 'Main Wallet', 'main', 4900, 0, NULL, '2026-02-18 16:46:12', '2026-02-18 16:52:27');

-- Table: transactions
CREATE TABLE `transactions` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL ,
  `from_wallet_id` INT  ,
  `to_wallet_id` INT  ,
  `type` VARCHAR(255) NOT NULL ,
  `amount` VARCHAR(255) NOT NULL ,
  `reference` VARCHAR(255) NOT NULL ,
  `description` TEXT  ,
  `status` VARCHAR(255) NOT NULL ,
  `metadata` TEXT  ,
  `created_at` VARCHAR(255)  ,
  `updated_at` VARCHAR(255)  
);

INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (1, 4, NULL, 4, 'deposit', 100, 'TXN6995AB73478621771416435', 'Deposit via Razorpay', 'completed', '{\"test_mode\":true,\"razorpay_order_id\":\"order_1771416434\"}', '2026-02-18 12:07:15', '2026-02-18 12:07:15');
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (2, 4, NULL, 5, 'deposit', 100, 'TXN6995B5E2A64B71771419106', 'Deposit via Razorpay', 'completed', '{\"test_mode\":true,\"razorpay_order_id\":\"order_1771419092\"}', '2026-02-18 12:51:46', '2026-02-18 12:51:46');
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (3, 4, 5, NULL, 'withdraw', 100, 'TXN6995B8600F1111771419744', 'Bank withdrawal', 'completed', '{\"bank_account\":\"37919055603\",\"ifsc_code\":\"SBIN0012678\",\"account_holder_name\":\"Anji\",\"processing_time\":\"24-48 hours\"}', '2026-02-18 13:02:24', '2026-02-18 13:02:24');
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (4, 4, NULL, 5, 'deposit', 100, 'TXN6995B9A5537EC1771420069', 'Deposit via Razorpay', 'completed', '{\"test_mode\":true,\"razorpay_order_id\":\"order_1771420064\"}', '2026-02-18 13:07:49', '2026-02-18 13:07:49');
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (5, 4, NULL, 5, 'deposit', 100, 'TXN6995DCC1CD0311771429057', 'Deposit via Razorpay', 'completed', '{\"test_mode\":true,\"razorpay_order_id\":\"order_1771429042\"}', '2026-02-18 15:37:37', '2026-02-18 15:37:37');
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (6, 1, 7, NULL, 'withdraw', 100, 'TXN6995EE4B067821771433547', 'Bank withdrawal', 'completed', '{\"bank_account\":\"1234567890123456\",\"ifsc_code\":\"SBIN0000123\",\"account_holder_name\":\"Test User\",\"processing_time\":\"24-48 hours\"}', '2026-02-18 16:52:27', '2026-02-18 16:52:27');
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES (7, 1, 6, NULL, 'withdraw', 500, 'TXN6995F0F1747871771434225', 'Bank withdrawal', 'completed', '{\"bank_account\":\"1234567890123456\",\"ifsc_code\":\"SBIN0000123\",\"account_holder_name\":\"Test User\",\"processing_time\":\"24-48 hours\"}', '2026-02-18 17:03:45', '2026-02-18 17:03:45');

-- Table: scheduled_transfers
CREATE TABLE `scheduled_transfers` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL ,
  `from_wallet_id` INT NOT NULL ,
  `to_wallet_id` INT NOT NULL ,
  `amount` VARCHAR(255) NOT NULL ,
  `description` TEXT  ,
  `frequency` VARCHAR(255) NOT NULL ,
  `scheduled_at` VARCHAR(255) NOT NULL ,
  `next_execution_at` VARCHAR(255) NOT NULL ,
  `is_active` VARCHAR(255) NOT NULL ,
  `created_at` VARCHAR(255)  ,
  `updated_at` VARCHAR(255)  
);

-- Table: wallet_limits
CREATE TABLE `wallet_limits` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL ,
  `limit_type` VARCHAR(255) NOT NULL ,
  `max_amount` VARCHAR(255) NOT NULL ,
  `transaction_count` INT NOT NULL ,
  `total_amount` VARCHAR(255) NOT NULL ,
  `reset_date` VARCHAR(255)  ,
  `created_at` VARCHAR(255)  ,
  `updated_at` VARCHAR(255)  
);

INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (1, 2, 'daily', 1000000, 0, 0, '2026-02-18 00:00:00', '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (2, 2, 'monthly', 10000000, 0, 0, '2026-02-01 00:00:00', '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (3, 2, 'per_transaction', 500000, 0, 0, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (4, 3, 'daily', 10000, 0, 0, '2026-02-18 00:00:00', '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (5, 3, 'monthly', 100000, 0, 0, '2026-02-01 00:00:00', '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (6, 3, 'per_transaction', 50000, 0, 0, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (7, 4, 'daily', 10000, 1, 100, '2026-02-18 00:00:00', '2026-02-18 12:01:07', '2026-02-18 13:02:24');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (8, 4, 'monthly', 100000, 1, 100, '2026-02-01 00:00:00', '2026-02-18 12:01:07', '2026-02-18 13:02:24');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (9, 4, 'per_transaction', 50000, 0, 0, NULL, '2026-02-18 12:01:07', '2026-02-18 12:01:07');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (10, 1, 'daily', 10000, 1, 500, '2026-02-18 00:00:00', '2026-02-18 16:46:12', '2026-02-18 17:03:45');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (11, 1, 'monthly', 100000, 1, 500, '2026-02-01 00:00:00', '2026-02-18 16:46:12', '2026-02-18 17:03:45');
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES (12, 1, 'per_transaction', 50000, 0, 0, NULL, '2026-02-18 16:46:12', '2026-02-18 16:46:12');

