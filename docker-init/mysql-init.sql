-- Create additional database settings for equip_platform
-- This script runs on MySQL initialization

-- Create invites table
CREATE TABLE IF NOT EXISTS `equip_platform`.`invites` (
  `id` VARCHAR(36) PRIMARY KEY,
  `inviteToken` VARCHAR(255) UNIQUE NOT NULL,
  `email` VARCHAR(100),
  `status` ENUM('PENDING', 'USED', 'EXPIRED') DEFAULT 'PENDING',
  `expiresAt` TIMESTAMP NOT NULL,
  `recruiterId` VARCHAR(255),
  `metadata` LONGTEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_inviteToken` (`inviteToken`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create candidates table
CREATE TABLE IF NOT EXISTS `equip_platform`.`candidates` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `firstName` VARCHAR(255),
  `lastName` VARCHAR(255),
  `passwordHash` VARCHAR(255) NOT NULL,
  `inviteTokenUsed` VARCHAR(255),
  `status` ENUM('ONBOARDED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'ONBOARDED',
  `emailVerified` BOOLEAN DEFAULT FALSE,
  `lastLogin` TIMESTAMP NULL,
  `metadata` LONGTEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_email` (`email`),
  KEY `idx_inviteTokenUsed` (`inviteTokenUsed`),
  KEY `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`inviteTokenUsed`) REFERENCES `invites`(`inviteToken`) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX `idx_candidates_emailVerified` ON `equip_platform`.`candidates`(`emailVerified`);
CREATE INDEX `idx_candidates_status` ON `equip_platform`.`candidates`(`status`);

-- Grant permissions to equip_user
GRANT ALL PRIVILEGES ON `equip_platform`.* TO 'equip_user'@'%';
FLUSH PRIVILEGES;
