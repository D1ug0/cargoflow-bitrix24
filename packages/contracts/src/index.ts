import { z } from 'zod';

export const vehicleTypes = ['TENT', 'REFRIGERATOR', 'ISOTHERM', 'VAN'] as const;
export const vehicleStatuses = ['AVAILABLE', 'IN_TRIP', 'SERVICE', 'UNAVAILABLE'] as const;
export const driverStatuses = ['AVAILABLE', 'IN_TRIP', 'UNAVAILABLE'] as const;
export const tripStatuses = [
  'CREATED',
  'ASSIGNED',
  'LOADING',
  'IN_TRANSIT',
  'DELIVERED',
  'CLOSED',
  'CANCELLED',
] as const;

export const vehicleTypeSchema = z.enum(vehicleTypes);
export const vehicleStatusSchema = z.enum(vehicleStatuses);
export const driverStatusSchema = z.enum(driverStatuses);
export const tripStatusSchema = z.enum(tripStatuses);

export const createTripSchema = z
  .object({
    bitrixDealId: z.coerce.number().int().positive(),
    vehicleId: z.string().uuid().optional(),
    driverId: z.string().uuid().optional(),
    from: z.string().trim().min(2).max(200),
    to: z.string().trim().min(2).max(200),
    loadingDate: z.coerce.date(),
    deliveryDate: z.coerce.date(),
  })
  .refine((value) => value.deliveryDate >= value.loadingDate, {
    message: 'deliveryDate must not be before loadingDate',
    path: ['deliveryDate'],
  });

export const updateTripStatusSchema = z.object({
  status: tripStatusSchema,
});

export const bitrixEventSchema = z.object({
  event: z.enum(['ONCRMDEALADD', 'ONCRMDEALUPDATE']),
  data: z.object({
    FIELDS: z.object({
      ID: z.coerce.number().int().positive(),
    }),
  }),
  ts: z.coerce.number().int().optional(),
  auth: z.object({
    domain: z.string().min(1),
    member_id: z.string().min(1),
    application_token: z.string().min(1),
  }),
});

export type VehicleType = (typeof vehicleTypes)[number];
export type VehicleStatus = (typeof vehicleStatuses)[number];
export type DriverStatus = (typeof driverStatuses)[number];
export type TripStatus = (typeof tripStatuses)[number];
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripStatusInput = z.infer<typeof updateTripStatusSchema>;
export type BitrixEvent = z.infer<typeof bitrixEventSchema>;

export interface IntegrationEnvelope<T = unknown> {
  id: string;
  type: 'trip.create' | 'trip.update' | 'trip.status.changed' | 'bitrix.deal.update';
  occurredAt: string;
  correlationId: string;
  payload: T;
}
