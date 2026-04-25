/**
 * @file meals.js
 * @description Centralized data source for the Trust Fund menu.
 * Enriched with nutritional facts and ingredients for the detail view.
 */

export const INITIAL_MEALS = [
  { 
    id: '1', 
    name: 'Chicken & Rice', 
    price: 2000, 
    status: 'avail', 
    isVegetarian: false, 
    imageUrl: '',
    prepTime: '15-20 min',
    description: 'A classic, high-protein meal featuring succulent grilled chicken breast served over a bed of fluffy jasmine rice with a side of steamed seasonal vegetables.',
    nutrition: {
      calories: 450,
      protein: '35g',
      carbs: '55g',
      fat: '12g'
    },
    ingredients: [
      'Grilled Chicken Breast',
      'Jasmine Rice',
      'Broccoli',
      'Carrots',
      'Trust Fund Special Seasoning',
      'Olive Oil'
    ]
  },
  { 
    id: '2', 
    name: 'Veg Stew', 
    price: 1200, 
    status: 'warning', 
    isVegetarian: true, 
    imageUrl: '',
    prepTime: '10-15 min',
    description: 'Hearty and warming, our vegetable stew is a vibrant blend of locally sourced root vegetables and legumes in a rich, herb-infused tomato broth.',
    nutrition: {
      calories: 320,
      protein: '12g',
      carbs: '48g',
      fat: '8g'
    },
    ingredients: [
      'Sweet Potatoes',
      'Lentils',
      'Tomatoes',
      'Garden Herbs',
      'Onions',
      'Bell Peppers'
    ]
  },
  { 
    id: '3', 
    name: 'Beef Stew', 
    price: 2500, 
    status: 'avail', 
    isVegetarian: false, 
    imageUrl: '',
    prepTime: '20-25 min',
    description: 'Slow-cooked until tender, this robust stew features prime beef cuts braised with earthy vegetables and aromatic spices.',
    nutrition: {
      calories: 580,
      protein: '42g',
      carbs: '35g',
      fat: '22g'
    },
    ingredients: [
      'Prime Beef Cuts',
      'Potatoes',
      'Red Wine Reduction',
      'Balsamic Herbs',
      'Carrots'
    ]
  },
  { 
    id: '4', 
    name: 'Fish & Chips', 
    price: 2200, 
    status: 'danger', 
    isVegetarian: false, 
    imageUrl: '',
    prepTime: '15 min',
    description: 'Crispy beer-battered white fish fillets served with hand-cut rustic chips and a side of minted mushy peas.',
    nutrition: {
      calories: 620,
      protein: '28g',
      carbs: '75g',
      fat: '28g'
    },
    ingredients: [
      'White Fish Fillet',
      'Pub-style Batter',
      'Russet Potatoes',
      'Sea Salt',
      'Malt Vinegar'
    ]
  },
  { 
    id: '5', 
    name: 'Rice & Beans', 
    price: 1000, 
    status: 'avail', 
    isVegetarian: true, 
    imageUrl: '',
    prepTime: '10 min',
    description: 'A nutritious staple, combining perfectly seasoned kidney beans with long-grain rice for a complete plant-based protein meal.',
    nutrition: {
      calories: 380,
      protein: '15g',
      carbs: '65g',
      fat: '5g'
    },
    ingredients: [
      'Kidney Beans',
      'Long-grain Rice',
      'Garlic',
      'Thyme',
      'Coconut Milk'
    ]
  },
  { 
    id: '6', 
    name: 'Pasta Bake', 
    price: 1800, 
    status: 'avail', 
    isVegetarian: false, 
    imageUrl: '',
    prepTime: '15-20 min',
    description: 'Oven-baked penne pasta tossed in a zesty marinara sauce, topped with a bubbling golden crust of melted mozzarella and parmesan.',
    nutrition: {
      calories: 520,
      protein: '22g',
      carbs: '68g',
      fat: '18g'
    },
    ingredients: [
      'Penne Pasta',
      'Marinara Sauce',
      'Mozzarella Cheese',
      'Parmesan',
      'Fresh Basil'
    ]
  }
];
