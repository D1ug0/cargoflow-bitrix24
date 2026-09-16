export const tripStatusOrder = [
  'CREATED',
  'ASSIGNED',
  'LOADING',
  'IN_TRANSIT',
  'DELIVERED',
  'CLOSED',
] as const;

export const integrationEventNames = [
  'trip.create',
  'trip.update',
  'trip.status.changed',
  'bitrix.deal.update',
] as const;
