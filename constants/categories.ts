import { Category } from '@/types';

export const BUILT_IN_CATEGORIES: Category[] = [
  { id: 'cat_food',     name: 'Food',             icon: 'fork.knife',                    color: '#4CAF50', isBuiltIn: true },
  { id: 'cat_medicine', name: 'Medicine',          icon: 'cross.case',                    color: '#F44336', isBuiltIn: true },
  { id: 'cat_skincare', name: 'Skincare',          icon: 'sparkles',                      color: '#E91E63', isBuiltIn: true },
  { id: 'cat_baby',     name: 'Baby',              icon: 'figure.and.child.holdinghands', color: '#FF9800', isBuiltIn: true },
  { id: 'cat_pet',      name: 'Pet',               icon: 'pawprint',                      color: '#795548', isBuiltIn: true },
  { id: 'cat_snacks',   name: 'Snacks & Instant',  icon: 'bag',                           color: '#FFC107', isBuiltIn: true },
  { id: 'cat_other',    name: 'Other',             icon: 'archivebox',                    color: '#9E9E9E', isBuiltIn: true },
];
