/**
 * @file bookings.js
 * @description Centralized mock booking data for the Trust Fund app.
 * Demonstrates all possible booking status variants.
 * Statuses: Requested | ChangesMade | Confirmed | Preparing | Ready | Collected | Cancelled
 */

export const SEED_BOOKINGS = [
  {
    id: 'B2841',
    status: 'Ready',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    data: {
      eventName: 'Board Lunch',
      date: '10 Apr 2026',
      time: '12:30 PM',
      headcount: 10,
      contactNumber: '+265 999 123 456',
      dietaryPreference: 'No Pork',
      selectedMealIds: ['1', '3'],
      note: 'Please ensure everything is hot on arrival.'
    }
  },
  {
    id: 'B1190',
    status: 'ChangesMade',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    data: {
      eventName: 'Team Standup Breakfast',
      date: '10 Apr 2026',
      time: '08:00 AM',
      headcount: 6,
      contactNumber: '+265 888 654 321',
      dietaryPreference: 'Vegetarian',
      selectedMealIds: ['2', '5'],
      note: ''
    }
  },
  {
    id: 'B3377',
    status: 'Confirmed',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    data: {
      eventName: 'Strategy Session Dinner',
      date: '11 Apr 2026',
      time: '07:00 PM',
      headcount: 15,
      contactNumber: '+265 777 111 222',
      dietaryPreference: 'No Preference',
      selectedMealIds: ['1', '3', '6'],
      note: 'VIP table setup required.'
    }
  },
  {
    id: 'B0921',
    status: 'Requesting',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    data: {
      eventName: 'Friday Wrap Party',
      date: '11 Apr 2026',
      time: '05:00 PM',
      headcount: 20,
      contactNumber: '+265 991 000 333',
      dietaryPreference: 'No Preference',
      selectedMealIds: ['4', '6'],
      note: ''
    }
  },
  {
    id: 'B7744',
    status: 'Collected',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    data: {
      eventName: 'Monthly All-Hands',
      date: '7 Apr 2026',
      time: '01:00 PM',
      headcount: 30,
      contactNumber: '+265 888 000 111',
      dietaryPreference: 'No Preference',
      selectedMealIds: ['1', '2', '3'],
      note: ''
    }
  },
  {
    id: 'B5512',
    status: 'Cancelled',
    timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
    data: {
      eventName: 'Product Demo Lunch',
      date: '6 Apr 2026',
      time: '12:00 PM',
      headcount: 8,
      contactNumber: '+265 777 999 000',
      dietaryPreference: 'Vegetarian',
      selectedMealIds: ['2', '5'],
      note: 'Cancelled due to venue change.'
    }
  }
];
