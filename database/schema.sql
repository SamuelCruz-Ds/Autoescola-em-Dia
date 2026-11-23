CREATE TABLE IF NOT EXISTS app_lock (
  id TINYINT UNSIGNED PRIMARY KEY
) ENGINE=InnoDB;
INSERT IGNORE INTO app_lock (id) VALUES (1);

CREATE TABLE IF NOT EXISTS students (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(16),
  smsConsent BOOLEAN NOT NULL DEFAULT FALSE,
  theoryGoal SMALLINT UNSIGNED NOT NULL,
  practiceGoal SMALLINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS instructors (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(16),
  registration VARCHAR(60)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicles (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  plate CHAR(7) CHARACTER SET ascii NOT NULL UNIQUE,
  model VARCHAR(90) NOT NULL,
  odometerKm INT UNSIGNED NOT NULL,
  reviewKm INT UNSIGNED,
  reviewDate DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS maintenance (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  vehicleId CHAR(36) CHARACTER SET ascii NOT NULL,
  serviceDate DATE NOT NULL,
  serviceKm INT UNSIGNED NOT NULL,
  description VARCHAR(250) NOT NULL,
  nextKm INT UNSIGNED,
  nextDate DATE,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  INDEX (vehicleId, serviceDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lessons (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  studentId CHAR(36) CHARACTER SET ascii NOT NULL,
  instructorId CHAR(36) CHARACTER SET ascii NOT NULL,
  vehicleId CHAR(36) CHARACTER SET ascii,
  kind ENUM('teorica', 'pratica') NOT NULL,
  startsAt CHAR(24) CHARACTER SET ascii NOT NULL,
  endsAt CHAR(24) CHARACTER SET ascii NOT NULL,
  status ENUM('marcada', 'realizada', 'falta', 'cancelada') NOT NULL DEFAULT 'marcada',
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (instructorId) REFERENCES instructors(id),
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  CHECK (endsAt > startsAt),
  CHECK ((kind = 'teorica' AND vehicleId IS NULL) OR (kind = 'pratica' AND vehicleId IS NOT NULL)),
  INDEX (status, startsAt),
  INDEX (studentId, kind, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS exams (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  studentId CHAR(36) CHARACTER SET ascii NOT NULL,
  kind ENUM('teorica', 'pratica') NOT NULL,
  startsAt CHAR(24) CHARACTER SET ascii NOT NULL,
  result ENUM('pendente', 'aprovado', 'reprovado', 'ausente') NOT NULL DEFAULT 'pendente',
  FOREIGN KEY (studentId) REFERENCES students(id),
  INDEX (studentId, startsAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reminders (
  id CHAR(61) CHARACTER SET ascii PRIMARY KEY,
  lessonId CHAR(36) CHARACTER SET ascii NOT NULL,
  startsAt CHAR(24) CHARACTER SET ascii NOT NULL,
  status ENUM('enviando', 'enviado', 'falhou') NOT NULL,
  updatedAt CHAR(24) CHARACTER SET ascii NOT NULL,
  providerRef VARCHAR(80),
  FOREIGN KEY (lessonId) REFERENCES lessons(id),
  UNIQUE (lessonId, startsAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
