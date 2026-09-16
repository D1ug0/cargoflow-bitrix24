export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: string | number;
  status: string;
  city: string;
  driver?: Driver | null;
}

export interface Trip {
  id: string;
  bitrixDealId: number;
  from: string;
  to: string;
  loadingDate: string;
  deliveryDate: string;
  status: string;
  vehicle?: Vehicle | null;
  driver?: Driver | null;
}

export type TripStatus =
  'CREATED' | 'ASSIGNED' | 'LOADING' | 'IN_TRANSIT' | 'DELIVERED' | 'CLOSED' | 'CANCELLED';

export interface IntegrationLog {
  id: string;
  correlationId: string;
  source: string;
  eventType: string;
  status: string;
  attempts: number;
  error?: string | null;
  createdAt: string;
}
