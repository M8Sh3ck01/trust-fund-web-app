/**
 * @file orders.js
 * @description Centralized mock order data for the Trust Fund app.
 * These are the default seed orders shown when no real orders exist.
 * Status variants: 'Preparing' | 'Processing' | 'Ready' | 'Delayed'
 */

export const SEED_ACTIVE_ORDERS = [
  {
    id: '2491',
    items: [{ meal: { name: 'Chambo with Nsima' }, quantity: 1 }],
    total: 0,
    status: 'Ready',
    timestamp: new Date().toISOString(),
    paymentMode: 'Credit'
  },
  {
    id: '9122',
    items: [{ meal: { name: 'Red Malindi Beans' }, quantity: 2 }],
    total: 3500,
    status: 'Processing',
    timestamp: new Date().toISOString(),
    paymentMode: 'Cash'
  },
  {
    id: '3045',
    items: [{ meal: { name: 'Chicken & Rice' }, quantity: 1 }, { meal: { name: 'Pasta Bake' }, quantity: 1 }],
    total: 3800,
    status: 'Preparing',
    timestamp: new Date().toISOString(),
    paymentMode: 'Cash'
  },
  {
    id: '1187',
    items: [{ meal: { name: 'Fish & Chips' }, quantity: 1 }],
    total: 2200,
    status: 'Delayed',
    timestamp: new Date().toISOString(),
    paymentMode: 'Cash'
  }
];

export const SEED_PAST_ORDERS = [
  {
    id: '8219',
    items: [{ meal: { name: 'Beef Stew & Nsima' }, quantity: 1 }],
    total: 4500,
    status: 'Completed',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    paymentMode: 'Cash'
  },
  {
    id: '7210',
    items: [{ meal: { name: 'Grilled Tilapia' }, quantity: 2 }],
    total: 0,
    status: 'Completed',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    paymentMode: 'Credit'
  }
];
