require('dotenv').config();
const mongoose = require('mongoose');
const Meal = require('../models/Meal');

const INITIAL_MEALS = [
  { 
    name: 'Nsima & Grilled Chambo', 
    price: 4500, 
    availability: 'Available', 
    category: 'Main', 
    imageUrl: '',
    prepTime: '25-30 min',
    description: 'The national pride of Malawi. Thick maize porridge served with fresh Chambo (Mozambique Tilapia) from the lake, grilled to perfection and served with kachumbari.',
    nutrition: { calories: 650, protein: '45g', carbs: '85g', fat: '15g' },
    ingredients: ['Maize Flour', 'Lake Malawi Chambo', 'Tomatoes', 'Onions', 'Birdseye Chili', 'Lemons']
  },
  { 
    name: 'Mkhwani (Peanut Stew)', 
    price: 1800, 
    availability: 'Available', 
    category: 'Vegetarian', 
    imageUrl: '',
    prepTime: '15-20 min',
    description: 'Traditional pumpkin leaves (mkhwani) simmered in a rich, creamy groundnut (peanut) flour sauce. A vegetarian staple that is both hearty and nutritious.',
    nutrition: { calories: 380, protein: '18g', carbs: '32g', fat: '22g' },
    ingredients: ['Pumpkin Leaves', 'Groundnut Flour', 'Tomatoes', 'Onions', 'Salt', 'Soda Bicarbonate']
  },
  { 
    name: 'Kondowole & Matemba', 
    price: 2200, 
    availability: 'Available', 
    category: 'Main', 
    imageUrl: '',
    prepTime: '20-25 min',
    description: 'Sticky, smooth Kondowole (cassava-based nsima) served with crispy fried Matemba (small dried fish) and a side of traditional greens.',
    nutrition: { calories: 520, protein: '38g', carbs: '95g', fat: '12g' },
    ingredients: ['Cassava Flour', 'Matemba', 'Shallots', 'Garlic', 'Green Peppers']
  },
  { 
    name: 'Zitumbuwa (Banana Fritters)', 
    price: 1200, 
    availability: 'Available', 
    category: 'Sides', 
    imageUrl: '',
    prepTime: '10 min',
    description: 'Crispy on the outside, fluffy on the inside. Three pieces of deep-fried banana fritters made with ripe bananas and maize flour. A perfect golden snack.',
    nutrition: { calories: 280, protein: '4g', carbs: '52g', fat: '10g' },
    ingredients: ['Ripe Bananas', 'Maize Flour', 'Sugar', 'Cinnamon', 'Vegetable Oil']
  },
  { 
    name: 'Braised Beef & Ifisashi', 
    price: 3500, 
    availability: 'Available', 
    category: 'Main', 
    imageUrl: '',
    prepTime: '35-40 min',
    description: 'Tender beef chunks slow-braised in a savory gravy, served alongside Ifisashi (greens in peanut sauce) and a generous portion of white nsima.',
    nutrition: { calories: 720, protein: '42g', carbs: '60g', fat: '35g' },
    ingredients: ['Beef Chuck', 'Spinach', 'Groundnut Flour', 'Garlic', 'Ginger', 'Soya Sauce']
  },
  { 
    name: 'Chilled Thobwa', 
    price: 800, 
    availability: 'Available', 
    category: 'Special', 
    imageUrl: '',
    prepTime: '5 min',
    description: 'Traditional Malawian "energy drink" made from fermented white maize and mchimera (malt). Served ice cold for maximum refreshment.',
    nutrition: { calories: 150, protein: '6g', carbs: '28g', fat: '1g' },
    ingredients: ['White Maize', 'Malt', 'Water', 'A pinch of sugar']
  }
];

async function seedDB() {
  try {
    console.log('🌱 Connecting to DB for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing meals to avoid duplicates during this transition
    await Meal.deleteMany({});
    console.log('🗑️  Existing meals cleared.');

    const createdMeals = await Meal.insertMany(INITIAL_MEALS);
    console.log(`✅ Successfully seeded ${createdMeals.length} meals.`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();
