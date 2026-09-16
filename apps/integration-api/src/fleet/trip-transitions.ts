import type { TripStatus } from '@cargoflow/database';

const allowedTransitions: Record<TripStatus, readonly TripStatus[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['LOADING', 'CANCELLED'],
  LOADING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

export function canTransition(from: TripStatus, to: TripStatus) {
  return from === to || allowedTransitions[from].includes(to);
}
