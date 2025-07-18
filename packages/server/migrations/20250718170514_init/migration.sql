-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15),
    "emergencyContact" VARCHAR(15) NOT NULL,
    "dietaryRestrictions" TEXT,
    "notes" TEXT,
    "medic" BOOLEAN NOT NULL DEFAULT false,
    "peacekeeper" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);
