import { Item, ItemStatus } from '@/types';

export function computeStatus(expiryDate: string): { daysLeft: number; status: ItemStatus } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86_400_000);
  const status: ItemStatus = daysLeft <= 0 ? 'expired' : daysLeft <= 7 ? 'expiring' : 'fresh';
  return { daysLeft, status };
}

export function enrichItem(raw: Omit<Item, 'daysLeft' | 'status'>): Item {
  return { ...raw, ...computeStatus(raw.expiryDate) };
}
