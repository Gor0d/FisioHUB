/*
  Warnings:

  - You are about to drop the column `ambulationRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `artificialAirwayPatients` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `aspirationRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `deaths` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `discharges` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `extubationEffectivenessRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `fallsAndIncidents` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `intubations` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `invasiveMechanicalVentRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `motorTherapyRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `multidisciplinaryVisits` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `nonAmbulatingPatients` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `nonInvasiveVentilationRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `orthostatismExpected` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `orthostatismRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `oxygenTherapyPatients` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `patientsCaptured` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `patientsHospitalized` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `patientsPrescribed` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `pcr` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `pronation` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `respiratoryTherapyCount` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `respiratoryTherapyRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `sedestationExpected` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `sedestationRate` on the `indicators` table. All the data in the column will be lost.
  - You are about to drop the column `tracheostomy` on the `indicators` table. All the data in the column will be lost.
  - Added the required column `hospitalId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `barthel_scales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `barthel_scales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `evolutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `indicators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `indicators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `indicators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `mrc_scales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `mrc_scales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'enterprise',
    "maxHospitals" INTEGER NOT NULL DEFAULT 5,
    "maxUsers" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#3B82F6',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "hospitals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#10B981',
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    CONSTRAINT "services_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "indicator_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "serviceId" TEXT NOT NULL,
    CONSTRAINT "indicator_templates_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "price" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "appointments_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_appointments" ("createdAt", "date", "duration", "id", "notes", "patientId", "price", "status", "updatedAt", "userId") SELECT "createdAt", "date", "duration", "id", "notes", "patientId", "price", "status", "updatedAt", "userId" FROM "appointments";
DROP TABLE "appointments";
ALTER TABLE "new_appointments" RENAME TO "appointments";
CREATE TABLE "new_barthel_scales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feeding" INTEGER NOT NULL,
    "bathing" INTEGER NOT NULL,
    "grooming" INTEGER NOT NULL,
    "dressing" INTEGER NOT NULL,
    "bowelControl" INTEGER NOT NULL,
    "bladderControl" INTEGER NOT NULL,
    "toileting" INTEGER NOT NULL,
    "transfer" INTEGER NOT NULL,
    "mobility" INTEGER NOT NULL,
    "stairs" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "evaluationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "evolutionId" TEXT,
    CONSTRAINT "barthel_scales_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "barthel_scales_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "barthel_scales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "barthel_scales_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "barthel_scales_evolutionId_fkey" FOREIGN KEY ("evolutionId") REFERENCES "evolutions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_barthel_scales" ("bathing", "bladderControl", "bowelControl", "classification", "createdAt", "dressing", "evaluationDate", "evolutionId", "feeding", "grooming", "id", "mobility", "patientId", "stairs", "toileting", "totalScore", "transfer", "type", "updatedAt", "userId") SELECT "bathing", "bladderControl", "bowelControl", "classification", "createdAt", "dressing", "evaluationDate", "evolutionId", "feeding", "grooming", "id", "mobility", "patientId", "stairs", "toileting", "totalScore", "transfer", "type", "updatedAt", "userId" FROM "barthel_scales";
DROP TABLE "barthel_scales";
ALTER TABLE "new_barthel_scales" RENAME TO "barthel_scales";
CREATE TABLE "new_evolutions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symptoms" TEXT,
    "treatment" TEXT,
    "observations" TEXT,
    "exercises" TEXT,
    "nextSteps" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    CONSTRAINT "evolutions_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evolutions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evolutions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evolutions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_evolutions" ("appointmentId", "createdAt", "exercises", "id", "nextSteps", "observations", "patientId", "symptoms", "treatment", "updatedAt", "userId") SELECT "appointmentId", "createdAt", "exercises", "id", "nextSteps", "observations", "patientId", "symptoms", "treatment", "updatedAt", "userId" FROM "evolutions";
DROP TABLE "evolutions";
ALTER TABLE "new_evolutions" RENAME TO "evolutions";
CREATE UNIQUE INDEX "evolutions_appointmentId_key" ON "evolutions"("appointmentId");
CREATE TABLE "new_indicators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collaborator" TEXT,
    "sector" TEXT,
    "shift" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    CONSTRAINT "indicators_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "indicators_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "indicators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "indicators_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_indicators" ("collaborator", "createdAt", "date", "id", "patientId", "sector", "shift", "updatedAt", "userId") SELECT "collaborator", "createdAt", "date", "id", "patientId", "sector", "shift", "updatedAt", "userId" FROM "indicators";
DROP TABLE "indicators";
ALTER TABLE "new_indicators" RENAME TO "indicators";
CREATE TABLE "new_mrc_scales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shoulderAbduction" INTEGER NOT NULL,
    "elbowFlexion" INTEGER NOT NULL,
    "wristExtension" INTEGER NOT NULL,
    "hipFlexion" INTEGER NOT NULL,
    "kneeExtension" INTEGER NOT NULL,
    "ankleFlexion" INTEGER NOT NULL,
    "neckFlexion" INTEGER NOT NULL,
    "trunkFlexion" INTEGER NOT NULL,
    "shoulderAdduction" INTEGER NOT NULL,
    "elbowExtension" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "averageScore" REAL NOT NULL,
    "classification" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "evaluationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "evolutionId" TEXT,
    CONSTRAINT "mrc_scales_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mrc_scales_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mrc_scales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mrc_scales_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mrc_scales_evolutionId_fkey" FOREIGN KEY ("evolutionId") REFERENCES "evolutions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_mrc_scales" ("ankleFlexion", "averageScore", "classification", "createdAt", "elbowExtension", "elbowFlexion", "evaluationDate", "evolutionId", "hipFlexion", "id", "kneeExtension", "neckFlexion", "patientId", "shoulderAbduction", "shoulderAdduction", "totalScore", "trunkFlexion", "type", "updatedAt", "userId", "wristExtension") SELECT "ankleFlexion", "averageScore", "classification", "createdAt", "elbowExtension", "elbowFlexion", "evaluationDate", "evolutionId", "hipFlexion", "id", "kneeExtension", "neckFlexion", "patientId", "shoulderAbduction", "shoulderAdduction", "totalScore", "trunkFlexion", "type", "updatedAt", "userId", "wristExtension" FROM "mrc_scales";
DROP TABLE "mrc_scales";
ALTER TABLE "new_mrc_scales" RENAME TO "mrc_scales";
CREATE TABLE "new_patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "attendanceNumber" TEXT,
    "bedNumber" TEXT,
    "room" TEXT,
    "sector" TEXT,
    "birthDate" DATETIME,
    "address" TEXT,
    "cid" TEXT,
    "diagnosis" TEXT,
    "observations" TEXT,
    "admissionDate" DATETIME,
    "dischargeDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "patients_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patients_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_patients" ("address", "attendanceNumber", "bedNumber", "birthDate", "cid", "createdAt", "diagnosis", "email", "id", "isActive", "name", "observations", "phone", "updatedAt", "userId") SELECT "address", "attendanceNumber", "bedNumber", "birthDate", "cid", "createdAt", "diagnosis", "email", "id", "isActive", "name", "observations", "phone", "updatedAt", "userId" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE UNIQUE INDEX "patients_attendanceNumber_hospitalId_key" ON "patients"("attendanceNumber", "hospitalId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "crf" TEXT,
    "phone" TEXT,
    "specialty" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "serviceId" TEXT,
    CONSTRAINT "users_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "users_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "crf", "email", "id", "name", "password", "phone", "role", "specialty", "updatedAt") SELECT "createdAt", "crf", "email", "id", "name", "password", "phone", "role", "specialty", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_hospitalId_key" ON "users"("email", "hospitalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_code_clientId_key" ON "hospitals"("code", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_hospitalId_key" ON "services"("code", "hospitalId");
