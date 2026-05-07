export type ItemStatus = 'fresh' | 'expiring' | 'expired';

export interface Item {
  id: string;
  name: string;
  tagIds: string[];
  photoUri?: string;
  productionDate?: string;
  expiryDate: string;
  daysLeft: number;
  status: ItemStatus;
  notes?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  itemId: string;
  primaryDaysBefore: number;
  secondaryDaysBefore?: number;
  enabled: boolean;
}

export type CreateItemInput = Omit<Item, 'id' | 'daysLeft' | 'status' | 'createdAt' | 'updatedAt'>;
export type UpdateItemInput = Partial<CreateItemInput>;
