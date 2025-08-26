-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "crf" TEXT,
    "phone" TEXT,
    "specialty" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PHYSIOTHERAPIST',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "attendanceNumber" TEXT,
    "bedNumber" TEXT,
    "birthDate" DATETIME,
    "address" TEXT,
    "cid" TEXT,
    "diagnosis" TEXT,
    "observations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "price" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evolutions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symptoms" TEXT,
    "treatment" TEXT,
    "observations" TEXT,
    "exercises" TEXT,
    "nextSteps" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    CONSTRAINT "evolutions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evolutions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evolutions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collaborator" TEXT,
    "sector" TEXT,
    "shift" TEXT,
    "patientsHospitalized" INTEGER DEFAULT 0,
    "patientsPrescribed" INTEGER DEFAULT 0,
    "patientsCaptured" INTEGER DEFAULT 0,
    "discharges" INTEGER DEFAULT 0,
    "intubations" INTEGER DEFAULT 0,
    "respiratoryTherapyCount" INTEGER DEFAULT 0,
    "extubationEffectivenessRate" REAL DEFAULT 0,
    "deaths" INTEGER DEFAULT 0,
    "pcr" INTEGER DEFAULT 0,
    "respiratoryTherapyRate" REAL DEFAULT 0,
    "motorTherapyRate" REAL DEFAULT 0,
    "artificialAirwayPatients" INTEGER DEFAULT 0,
    "aspirationRate" REAL DEFAULT 0,
    "sedestationExpected" INTEGER DEFAULT 0,
    "sedestationRate" REAL DEFAULT 0,
    "orthostatismExpected" INTEGER DEFAULT 0,
    "orthostatismRate" REAL DEFAULT 0,
    "ambulationRate" REAL DEFAULT 0,
    "pronation" INTEGER DEFAULT 0,
    "oxygenTherapyPatients" INTEGER DEFAULT 0,
    "multidisciplinaryVisits" INTEGER DEFAULT 0,
    "nonInvasiveVentilationRate" REAL DEFAULT 0,
    "invasiveMechanicalVentRate" REAL DEFAULT 0,
    "tracheostomy" INTEGER DEFAULT 0,
    "nonAmbulatingPatients" INTEGER DEFAULT 0,
    "fallsAndIncidents" INTEGER DEFAULT 0,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "indicators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "indicators_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "barthel_scales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feeding" INTEGER NOT NULL DEFAULT 0,
    "bathing" INTEGER NOT NULL DEFAULT 0,
    "grooming" INTEGER NOT NULL DEFAULT 0,
    "dressing" INTEGER NOT NULL DEFAULT 0,
    "bowelControl" INTEGER NOT NULL DEFAULT 0,
    "bladderControl" INTEGER NOT NULL DEFAULT 0,
    "toileting" INTEGER NOT NULL DEFAULT 0,
    "transfer" INTEGER NOT NULL DEFAULT 0,
    "mobility" INTEGER NOT NULL DEFAULT 0,
    "stairs" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "classification" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'ENTRADA',
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "evolutionId" TEXT,
    "evaluationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "barthel_scales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "barthel_scales_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "barthel_scales_evolutionId_fkey" FOREIGN KEY ("evolutionId") REFERENCES "evolutions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mrc_scales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shoulderAbduction" INTEGER NOT NULL DEFAULT 0,
    "elbowFlexion" INTEGER NOT NULL DEFAULT 0,
    "wristExtension" INTEGER NOT NULL DEFAULT 0,
    "hipFlexion" INTEGER NOT NULL DEFAULT 0,
    "kneeExtension" INTEGER NOT NULL DEFAULT 0,
    "ankleFlexion" INTEGER NOT NULL DEFAULT 0,
    "neckFlexion" INTEGER NOT NULL DEFAULT 0,
    "trunkFlexion" INTEGER NOT NULL DEFAULT 0,
    "shoulderAdduction" INTEGER NOT NULL DEFAULT 0,
    "elbowExtension" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL DEFAULT 0,
    "classification" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'ENTRADA',
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "evolutionId" TEXT,
    "evaluationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mrc_scales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mrc_scales_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mrc_scales_evolutionId_fkey" FOREIGN KEY ("evolutionId") REFERENCES "evolutions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_crf_key" ON "users"("crf");

-- CreateIndex
CREATE UNIQUE INDEX "patients_attendanceNumber_key" ON "patients"("attendanceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "evolutions_appointmentId_key" ON "evolutions"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "barthel_scales_evolutionId_key" ON "barthel_scales"("evolutionId");

-- CreateIndex
CREATE UNIQUE INDEX "mrc_scales_evolutionId_key" ON "mrc_scales"("evolutionId");
