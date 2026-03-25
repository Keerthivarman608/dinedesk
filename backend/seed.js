const db = require('./database');

async function seed() {
  try {
    // Initialize Postgres tables on the cloud
    await db.initSchema();

    // Clear existing data (order matters for foreign keys)
    await db.query('DELETE FROM bookings');
    await db.query('DELETE FROM restaurants');
    await db.query('DELETE FROM users');

    console.log('Seeding Users...');
    const users = [
      ['CUST1', 'Alice Johnson', 'alice@test.com', 'password123', 'CUSTOMER'],
      ['OWNER1', 'Chef Tanaka', 'tanaka@sakura.com', 'password123', 'RESTAURANT'],
      ['OWNER2', 'Mike Borough', 'mike@borough.com', 'password123', 'RESTAURANT'],
      ['OWNER3', 'Nonna Maria', 'maria@nonna.com', 'password123', 'RESTAURANT'],
    ];
    for (const u of users) {
      await db.query('INSERT INTO users (id, name, email, password, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', u);
    }

    console.log('Seeding Restaurants...');
    const rests = [
      ['OWNER1', 'Sakura Omakase', 'Japanese', 4.9, 512, '0.5 km', 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000&auto=format&fit=crop', 'A 12-course omakase journey featuring seasonal fish flown in daily from Tsukiji Market.', '$$$', 'Omakase,Seasonal'],
      ['OWNER2', 'Borough & Barrel', 'American', 4.7, 890, '1.2 km', 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop', 'Dry-aged steaks, house-smoked brisket, and 47 craft beers on tap.', '$$', 'Steakhouse,Craft Beer'],
      ['OWNER3', "Nonna's Secret", 'Italian', 4.8, 320, '2.8 km', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1000&auto=format&fit=crop', 'Third-generation recipes from the Amalfi Coast. Pasta hand-rolled each morning.', '$$$', 'Handmade Pasta,Wine Bar'],
      ['OWNER1', 'The Grand Mughal', 'North Indian', 4.9, 432, '4.2 km', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1000&auto=format&fit=crop', 'Authentic Mughlai cuisine featuring slow-cooked Dum Biryani and Galouti Kebabs.', '$$$', 'Mughlai,Biryani'],
      ['OWNER2', 'Dakshin Delight', 'South Indian', 4.8, 312, '1.8 km', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop', 'Vibrant South Indian flavors with crispy dosas and fluffy idlis.', '$', 'Dosa,Healthy'],
      ['OWNER3', 'Punjab Grill', 'Punjabi', 4.7, 215, '2.3 km', 'https://images.unsplash.com/photo-1601050633622-3d1483b495ec?q=80&w=1000&auto=format&fit=crop', 'Legendary Butter Chicken and Dal Makhani from the heart of Punjab.', '$$', 'Tandoori,Butter Chicken'],
    ];
    for (const r of rests) {
      await db.query('INSERT INTO restaurants (ownerId,name,cuisine,rating,reviews,distance,image,about,priceRange,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', r);
    }

    console.log('Seeding Bookings...');
    const rest = await db.query("SELECT id FROM restaurants WHERE name='Sakura Omakase'");
    if (rest.rows.length > 0) {
      await db.query(
        'INSERT INTO bookings (id,restaurantId,userId,date,time,guests,status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        ['TESTBK1', rest.rows[0].id, 'CUST1', '2024-11-01', '19:00', 2, 'Confirmed']
      );
    }

    console.log('✅ PostgreSQL Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error.message);
    process.exit(1);
  }
}

seed();
