-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: com-linweb1038.srv.combell-ops.net:3306
-- Generation Time: Oct 09, 2025 at 09:31 AM
-- Server version: 8.0.36-28
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ID476856_RESTfulAPI`
--

-- --------------------------------------------------------

--
-- Table structure for table `bezoekers`
--

CREATE TABLE `bezoekers` (
  `id` int UNSIGNED NOT NULL,
  `voornaam` varchar(100) NOT NULL,
  `familienaam` varchar(100) NOT NULL,
  `geboortedatum` date NOT NULL,
  `emailadres` varchar(255) NOT NULL,
  `aangemaakt_op` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `gewijzigd_op` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bezoekers`
--

INSERT INTO `bezoekers` (`id`, `voornaam`, `familienaam`, `geboortedatum`, `emailadres`, `aangemaakt_op`, `gewijzigd_op`) VALUES
(1, 'Emma', 'De Smet', '1995-03-12', 'emma.desmet@example.com', '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(2, 'Luca', 'Peeters', '1989-11-01', 'luca.peeters@example.com', '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(3, 'Sofie', 'Van den Berg', '2002-07-22', 'sofie.vdberg@example.com', '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(4, 'Mohamed', 'El Idrissi', '1990-01-30', 'mohamed.elidrissi@example.com', '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(5, 'Anna', 'Martens', '1985-09-15', 'anna.martens@example.com', '2025-10-09 06:54:16', '2025-10-09 06:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `concerten`
--

CREATE TABLE `concerten` (
  `id` int UNSIGNED NOT NULL,
  `artiest` varchar(200) NOT NULL,
  `datum` date NOT NULL,
  `uur` time NOT NULL,
  `locatie` varchar(255) NOT NULL,
  `kostprijs` decimal(8,2) NOT NULL,
  `capaciteit` int UNSIGNED DEFAULT '0',
  `aangemaakt_op` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `gewijzigd_op` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `concerten`
--

INSERT INTO `concerten` (`id`, `artiest`, `datum`, `uur`, `locatie`, `kostprijs`, `capaciteit`, `aangemaakt_op`, `gewijzigd_op`) VALUES
(1, 'Arctic Monkeys', '2025-11-15', '20:00:00', 'Forest National, Brussels', 65.00, 8000, '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(2, 'Dua Lipa', '2025-12-05', '19:30:00', 'Koninklijk Circus, Brussels', 78.50, 2500, '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(3, 'Local Indie Night', '2025-10-20', '21:00:00', 'Ancienne Belgique, Brussels', 18.00, 1000, '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(4, 'Jazz Evenings', '2025-10-28', '20:30:00', 'Flagey, Brussels', 30.00, 600, '2025-10-09 06:54:16', '2025-10-09 06:54:16'),
(5, 'Electronic Sunrise', '2026-01-10', '22:00:00', 'Tour & Taxis, Brussels', 42.00, 3000, '2025-10-09 06:54:16', '2025-10-09 06:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int UNSIGNED NOT NULL,
  `bezoeker_id` int UNSIGNED NOT NULL,
  `concert_id` int UNSIGNED NOT NULL,
  `aantal` int UNSIGNED NOT NULL DEFAULT '1',
  `aankoop_prijs` decimal(8,2) NOT NULL,
  `aankoop_datum` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('confirmed','cancelled','reserved') NOT NULL DEFAULT 'confirmed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `bezoeker_id`, `concert_id`, `aantal`, `aankoop_prijs`, `aankoop_datum`, `status`) VALUES
(1, 1, 1, 2, 65.00, '2025-10-09 06:54:16', 'confirmed'),
(2, 2, 1, 1, 65.00, '2025-10-09 06:54:16', 'confirmed'),
(3, 3, 3, 3, 18.00, '2025-10-09 06:54:16', 'confirmed'),
(4, 4, 4, 1, 30.00, '2025-10-09 06:54:16', 'reserved'),
(5, 5, 2, 2, 78.50, '2025-10-09 06:54:16', 'confirmed');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bezoekers`
--
ALTER TABLE `bezoekers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `emailadres` (`emailadres`);

--
-- Indexes for table `concerten`
--
ALTER TABLE `concerten`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_bezoeker` (`bezoeker_id`),
  ADD KEY `fk_ticket_concert` (`concert_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bezoekers`
--
ALTER TABLE `bezoekers`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `concerten`
--
ALTER TABLE `concerten`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_ticket_bezoeker` FOREIGN KEY (`bezoeker_id`) REFERENCES `bezoekers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ticket_concert` FOREIGN KEY (`concert_id`) REFERENCES `concerten` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
