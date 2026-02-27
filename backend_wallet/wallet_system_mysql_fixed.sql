-- Wallet System Database Export for MySQL
-- Generated on: 2026-02-18 22:49:00
-- Fixed for proper MySQL data types

-- Create database
CREATE DATABASE IF NOT EXISTS `wallet_system`;
USE `wallet_system`;

-- Table: users
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `email_verified_at` TIMESTAMP NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `users_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert users data
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES 
(1, 'Test User', 'test@example.com', '2026-02-18 11:58:17', '$2y$12$MzgQYKyQjWNjLnG0yc/wH.leqXjnd88BTAfBKCShBROIQi2l0/kBa', NULL, 'user', 1, 'tyjCGzFyz0', '2026-02-18 11:58:17', '2026-02-18 16:40:34'),
(2, 'Admin User', 'admin@wallet.com', NULL, '$2y$12$fVHAvdEyIPk/d4wO.Prwv.fadV1X0/QDc0QhXosQlb0pyfNtY2P12', '9876543210', 'admin', 1, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(3, 'Test User', 'user@wallet.com', NULL, '$2y$12$UmVpyf3JeztfucVs/z5Cs.FqRu8WHRCrIFovSXoOvt..6jEZ0oj.i', '9876543211', 'user', 1, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(4, 'Anji Korra', 'kanjinaik1234@gmail.com', NULL, '$2y$12$D13iNHqxCuKrrlZoJqYf2e9UJw5h5Epn7hk/LbXwJJPmYQG1aAqO2', '8096004053', 'user', 1, NULL, '2026-02-18 12:01:07', '2026-02-18 12:01:07');

-- Table: wallets
CREATE TABLE `wallets` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('main', 'sub') NOT NULL DEFAULT 'main',
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `is_frozen` BOOLEAN NOT NULL DEFAULT FALSE,
  `freeze_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `wallets_user_id_index` (`user_id`),
  INDEX `wallets_type_index` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert wallets data
INSERT INTO `wallets` (`id`, `user_id`, `name`, `type`, `balance`, `is_frozen`, `freeze_reason`, `created_at`, `updated_at`) VALUES 
(1, 2, 'Admin Main Wallet', 'main', 100000.00, FALSE, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(2, 3, 'Main Wallet', 'main', 5000.00, FALSE, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(3, 3, 'Savings Wallet', 'sub', 2000.00, FALSE, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(4, 4, 'Main Wallet', 'main', 100.00, TRUE, 'Manual freeze by user', '2026-02-18 12:01:07', '2026-02-18 12:18:13'),
(5, 4, 'saving', 'sub', 200.00, TRUE, 'Manual freeze by user', '2026-02-18 12:25:24', '2026-02-18 15:46:53'),
(6, 1, 'Main Wallet', 'sub', 2000.00, FALSE, NULL, '2026-02-18 16:41:07', '2026-02-18 17:03:45'),
(7, 1, 'Main Wallet', 'main', 4900.00, FALSE, NULL, '2026-02-18 16:46:12', '2026-02-18 16:52:27');

-- Table: transactions
CREATE TABLE `transactions` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `from_wallet_id` INT NULL,
  `to_wallet_id` INT NULL,
  `type` ENUM('deposit', 'withdraw', 'transfer') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `reference` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `status` ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `metadata` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`to_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE SET NULL,
  INDEX `transactions_user_id_index` (`user_id`),
  INDEX `transactions_type_index` (`type`),
  INDEX `transactions_status_index` (`status`),
  INDEX `transactions_reference_index` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert transactions data
INSERT INTO `transactions` (`id`, `user_id`, `from_wallet_id`, `to_wallet_id`, `type`, `amount`, `reference`, `description`, `status`, `metadata`, `created_at`, `updated_at`) VALUES 
(1, 4, NULL, 4, 'deposit', 100.00, 'TXN6995AB73478621771416435', 'Deposit via Razorpay', 'completed', '{"test_mode":true,"razorpay_order_id":"order_1771416434"}', '2026-02-18 12:07:15', '2026-02-18 12:07:15'),
(2, 4, NULL, 5, 'deposit', 100.00, 'TXN6995B5E2A64B71771419106', 'Deposit via Razorpay', 'completed', '{"test_mode":true,"razorpay_order_id":"order_1771419092"}', '2026-02-18 12:51:46', '2026-02-18 12:51:46'),
(3, 4, 5, NULL, 'withdraw', 100.00, 'TXN6995B8600F1111771419744', 'Bank withdrawal', 'completed', '{"bank_account":"37919055603","ifsc_code":"SBIN0012678","account_holder_name":"Anji","processing_time":"24-48 hours"}', '2026-02-18 13:02:24', '2026-02-18 13:02:24'),
(4, 4, NULL, 5, 'deposit', 100.00, 'TXN6995B9A5537EC1771420069', 'Deposit via Razorpay', 'completed', '{"test_mode":true,"razorpay_order_id":"order_1771420064"}', '2026-02-18 13:07:49', '2026-02-18 13:07:49'),
(5, 4, NULL, 5, 'deposit', 100.00, 'TXN6995DCC1CD0311771429057', 'Deposit via Razorpay', 'completed', '{"test_mode":true,"razorpay_order_id":"order_1771429042"}', '2026-02-18 15:37:37', '2026-02-18 15:37:37'),
(6, 1, 7, NULL, 'withdraw', 100.00, 'TXN6995EE4B067821771433547', 'Bank withdrawal', 'completed', '{"bank_account":"1234567890123456","ifsc_code":"SBIN0000123","account_holder_name":"Test User","processing_time":"24-48 hours"}', '2026-02-18 16:52:27', '2026-02-18 16:52:27'),
(7, 1, 6, NULL, 'withdraw', 500.00, 'TXN6995F0F1747871771434225', 'Bank withdrawal', 'completed', '{"bank_account":"1234567890123456","ifsc_code":"SBIN0000123","account_holder_name":"Test User","processing_time":"24-48 hours"}', '2026-02-18 17:03:45', '2026-02-18 17:03:45');

-- Table: wallet_limits
CREATE TABLE `wallet_limits` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `limit_type` ENUM('daily', 'monthly', 'per_transaction') NOT NULL,
  `max_amount` DECIMAL(15,2) NOT NULL,
  `transaction_count` INT NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `reset_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `wallet_limits_user_type_unique` (`user_id`, `limit_type`),
  INDEX `wallet_limits_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert wallet limits data
INSERT INTO `wallet_limits` (`id`, `user_id`, `limit_type`, `max_amount`, `transaction_count`, `total_amount`, `reset_date`, `created_at`, `updated_at`) VALUES 
(1, 2, 'daily', 1000000.00, 0, 0.00, '2026-02-18', '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(2, 2, 'monthly', 10000000.00, 0, 0.00, '2026-02-01', '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(3, 2, 'per_transaction', 500000.00, 0, 0.00, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(4, 3, 'daily', 10000.00, 0, 0.00, '2026-02-18', '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(5, 3, 'monthly', 100000.00, 0, 0.00, '2026-02-01', '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(6, 3, 'per_transaction', 50000.00, 0, 0.00, NULL, '2026-02-18 11:58:25', '2026-02-18 11:58:25'),
(7, 4, 'daily', 10000.00, 1, 100.00, '2026-02-18', '2026-02-18 12:01:07', '2026-02-18 13:02:24'),
(8, 4, 'monthly', 100000.00, 1, 100.00, '2026-02-01', '2026-02-18 12:01:07', '2026-02-18 13:02:24'),
(9, 4, 'per_transaction', 50000.00, 0, 0.00, NULL, '2026-02-18 12:01:07', '2026-02-18 12:01:07'),
(10, 1, 'daily', 10000.00, 1, 500.00, '2026-02-18', '2026-02-18 16:46:12', '2026-02-18 17:03:45'),
(11, 1, 'monthly', 100000.00, 1, 500.00, '2026-02-01', '2026-02-18 16:46:12', '2026-02-18 17:03:45'),
(12, 1, 'per_transaction', 50000.00, 0, 0.00, NULL, '2026-02-18 16:46:12', '2026-02-18 16:46:12');

-- Table: scheduled_transfers
CREATE TABLE `scheduled_transfers` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `from_wallet_id` INT NOT NULL,
  `to_wallet_id` INT NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `description` TEXT NULL,
  `frequency` ENUM('daily', 'weekly', 'monthly') NOT NULL,
  `scheduled_at` DATETIME NOT NULL,
  `next_execution_at` DATETIME NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE,
  INDEX `scheduled_transfers_user_id_index` (`user_id`),
  INDEX `scheduled_transfers_next_execution_index` (`next_execution_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: password_reset_tokens
CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL PRIMARY KEY,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `password_reset_tokens_token_index` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: sessions
CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `user_id` INT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  INDEX `sessions_user_id_index` (`user_id`),
  INDEX `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Final summary
SELECT 'Database setup complete!' as message;
