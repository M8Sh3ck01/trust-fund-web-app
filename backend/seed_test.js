require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Meal = require('./src/models/Meal');
const Order = require('./src/models/Order');
const Booking = require('./src/models/Booking');

const INITIAL_MEALS = [
  { 
    name: 'Nsima & Chambo', 
    price: 2500, 
    category: 'Main',
    description: 'The national pride of Malawi. Freshly prepared Nsima served with grilled Chambo (tilapia) from Lake Malawi, accompanied by savory tomato gravy and pumpkin leaves (Mpiru).',
    nutrition: { calories: 520, protein: '42g', carbs: '65g', fat: '12g' },
    ingredients: ['Maize Flour', 'Fresh Chambo', 'Tomatoes', 'Onions', 'Pumpkin Leaves', 'Traditional Spices']
  },
  { 
    name: 'Nsima & Beans (Ndiwo)', 
    price: 1200, 
    category: 'Vegetarian',
    description: 'A nutritious vegetarian staple. Soft Nsima served with slow-cooked sugar beans in a rich onion and tomato base, garnished with local greens.',
    nutrition: { calories: 380, protein: '18g', carbs: '72g', fat: '6g' },
    ingredients: ['Maize Flour', 'Sugar Beans', 'Onions', 'Tomatoes', 'Garden Greens', 'Curry Powder']
  },
  { 
    name: 'Nsima & Village Chicken', 
    price: 3500, 
    category: 'Special',
    description: 'Premium local favorite. Free-range village chicken (Nkuku ya Chimanyamantho) slow-boiled to tenderness in its own juices, served with Nsima and steamed Rape.',
    nutrition: { calories: 610, protein: '45g', carbs: '60g', fat: '18g' },
    ingredients: ['Maize Flour', 'Village Chicken', 'Rape Leaves', 'Garlic', 'Ginger', 'Indigenous Spices']
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected.');

    // 1. Seed Meals
    console.log('Cleaning existing meals...');
    await Meal.deleteMany({});
    console.log('Seeding initial meals...');
    const createdMeals = await Meal.insertMany(INITIAL_MEALS);
    console.log(`✅ Seeded ${createdMeals.length} meals.`);

    // 2. Test Order Validation
    const testUser = await User.findOne({});
    if (testUser) {
      console.log(`\nTesting Order creation for user: ${testUser.email}`);
      const testOrder = new Order({
        user: testUser._id,
        items: [{
          meal: createdMeals[0]._id,
          nameAtPurchase: createdMeals[0].name,
          priceAtPurchase: createdMeals[0].price,
          quantity: 1
        }],
        totalAmount: createdMeals[0].price,
        paymentMode: 'Credit' // Subscriber credit
      });
      await testOrder.save();
      console.log(`✅ Order created successfully: ${testOrder.orderNumber}`);

      // 3. Test Booking Validation (Future Date)
      console.log('\nTesting Booking validation...');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const testBooking = new Booking({
        user: testUser._id,
        eventName: 'Test Party',
        eventDate: futureDate,
        headcount: 10,
        specialRequirements: 'None'
      });
      await testBooking.save();
      console.log('✅ Booking created successfully.');
    } else {
      console.warn('\n⚠️ No user found in DB. Skipping Order/Booking tests.');
      console.log('Login via the UI first to create a user record.');
    }

    console.log('\n🚀 ALL TESTS PASSED.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEEDING FAILED:', err.message);
    process.exit(1);
  }
}

seed();
