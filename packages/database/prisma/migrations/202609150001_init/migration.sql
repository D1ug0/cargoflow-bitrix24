CREATE TYPE "VehicleType" AS ENUM ('TENT', 'REFRIGERATOR', 'ISOTHERM', 'VAN');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_TRIP', 'SERVICE', 'UNAVAILABLE');
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'IN_TRIP', 'UNAVAILABLE');
CREATE TYPE "TripStatus" AS ENUM ('CREATED', 'ASSIGNED', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'CLOSED', 'CANCELLED');
CREATE TYPE "IntegrationEventStatus" AS ENUM ('PENDING', 'PUBLISHED', 'PROCESSED', 'FAILED', 'DEAD_LETTERED');
CREATE TYPE "IntegrationLogStatus" AS ENUM ('RECEIVED', 'SUCCESS', 'ERROR', 'IGNORED');

CREATE TABLE "drivers" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "license_categories" TEXT[] NOT NULL,
  "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicles" (
  "id" UUID NOT NULL,
  "plate_number" TEXT NOT NULL,
  "type" "VehicleType" NOT NULL,
  "capacity" DECIMAL(8,2) NOT NULL,
  "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "city" TEXT NOT NULL,
  "driver_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trips" (
  "id" UUID NOT NULL,
  "bitrix_deal_id" INTEGER NOT NULL,
  "vehicle_id" UUID,
  "driver_id" UUID,
  "from_location" TEXT NOT NULL,
  "to_location" TEXT NOT NULL,
  "loading_date" TIMESTAMPTZ(3) NOT NULL,
  "delivery_date" TIMESTAMPTZ(3) NOT NULL,
  "status" "TripStatus" NOT NULL DEFAULT 'CREATED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_events" (
  "id" UUID NOT NULL,
  "external_event_id" TEXT,
  "correlation_id" UUID NOT NULL,
  "source" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "IntegrationEventStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_logs" (
  "id" UUID NOT NULL,
  "correlation_id" UUID NOT NULL,
  "source" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "request" JSONB,
  "response" JSONB,
  "status" "IntegrationLogStatus" NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "drivers_phone_key" ON "drivers"("phone");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");
CREATE UNIQUE INDEX "vehicles_driver_id_key" ON "vehicles"("driver_id");
CREATE INDEX "vehicles_status_city_idx" ON "vehicles"("status", "city");
CREATE UNIQUE INDEX "trips_bitrix_deal_id_key" ON "trips"("bitrix_deal_id");
CREATE INDEX "trips_status_idx" ON "trips"("status");
CREATE INDEX "trips_loading_date_idx" ON "trips"("loading_date");
CREATE UNIQUE INDEX "integration_events_external_event_id_key" ON "integration_events"("external_event_id");
CREATE INDEX "integration_events_status_created_at_idx" ON "integration_events"("status", "created_at");
CREATE INDEX "integration_events_correlation_id_idx" ON "integration_events"("correlation_id");
CREATE INDEX "integration_logs_created_at_idx" ON "integration_logs"("created_at");
CREATE INDEX "integration_logs_correlation_id_idx" ON "integration_logs"("correlation_id");
CREATE INDEX "integration_logs_status_idx" ON "integration_logs"("status");

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

