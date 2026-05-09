const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Service = require('./models/Service');

async function checkServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const services = await Service.find();
    console.log(`Found ${services.length} services\n`);

    services.forEach(s => {
      console.log(`Service: "${s.name}"`);
      if (s.blocks && s.blocks.length > 0) {
        console.log(`  Blocks: ${JSON.stringify(s.blocks)}`);
      } else {
        console.log('  Blocks: EMPTY');
      }
      
      if (s.variants && s.variants.length > 0) {
        s.variants.forEach(v => {
          console.log(`    Variant: "${v.name}"`);
          console.log(`      Blocks: ${JSON.stringify(v.blocks)}`);
        });
      }
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkServices();
