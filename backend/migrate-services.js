require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Service = require("./models/Service");

const staticCategories = [
  {
    id: 1,
    name: "Heren",
    icon: "✦",
    img: "/images/services/heren.jpeg",
    services: [
      { id: 101, name: "Heren halflang/lang haar", price: 45 },
      { id: 102, name: "Herensnit", price: 35 },
      { id: 103, name: "Tondeuse", price: 20 },
      { id: 104, name: "Tondeuse met fade", price: 30 },
      { id: 105, name: "Herensnit met hoofdmassage", price: 55 },
      { id: 106, name: "Haar baard", price: 50 },
      { id: 107, name: "Baard trimmen/aflijnen", price: 25 },
    ]
  },
  {
    id: 2,
    name: "Dames Styling",
    icon: "✄",
    img: "/images/services/dames.jpeg",
    services: [
      { id: 201, name: "Snit & Losdrogen", price: "K: 45 € | H: 50 € | L: 55 €" },
      { id: 202, name: "Dames Brushing", price: "K: 35 € | H: 40 € | L: 45 €" },
      { id: 203, name: "Extensions", price: 55 },
      { id: 204, name: "Snit & Brushing", price: "K: 65 € | H: 70 € | L: 80 €" },
    ]
  },
  {
    id: 3,
    name: "Kleuren",
    icon: "◈",
    img: "/images/services/kleuren.jpeg",
    services: [
      { id: 301, name: "Kleuren uitgroei (max 3cm) met Brushing", price: "K: 100 € | H: 115 € | L: 120 €" },
      { id: 302, name: "Kleuren uitgroei + snit & brushing", price: "K: 135 € | H: 142 € | L: 148 €" },
      { id: 303, name: "Kleuren Uitgroei & Lengtes met Snit & Brushing", price: "K: 143 € | H: 158 € | L: 173 €" },
      { id: 304, name: "Kleuren uitgroei (max 3cm) met Snit & Losdrogen", price: "K: 115 € | H: 125 € | L: 130 €" },
      { id: 305, name: "Kleuren Uitgroei & Lengtes met Brushing", price: "K: 118 € | H: 133 € | L: 148 €" },
      { id: 306, name: "Kleuren Uitgroei & Lengtes met Snit & Losdrogen", price: "K: 128 € | H: 143 € | L: 158 €" },
    ]
  },
  {
    id: 4,
    name: "Balayage & Highlights",
    icon: "❋",
    img: "/images/services/balayage-higlights.jpeg",
    services: [
      { id: 401, name: "Balayage & Foilyage met Brushing", price: "K: 170 € | H: 180 € | L: 190 €" },
      { id: 402, name: "Balayage & Foilyage met Snit & Brushing", price: "K: 195 € | H: 215 € | L: 230 €" },
      { id: 403, name: "Opfrissingstoner + Brushing", price: "K: 60 € | H: 75 € | L: 90 €" },
      { id: 404, name: "Opfrissingstoner met Snit & Brushing", price: "K: 100 € | H: 105 € | L: 115 €" },
    ]
  },
  {
    id: 5,
    name: "Kids",
    icon: "◇",
    img: "/images/services/kids.jpeg",
    services: [
      { id: 501, name: "Snit meisje tot 6 jaar", price: 20 },
      { id: 502, name: "Snit meisje tot 12 jaar", price: 30 },
      { id: 503, name: "Snit meisje tot 12 jaar (Met wassen)", price: 40 },
      { id: 504, name: "Snit meisje tot 12 jaar (Veel & lang haar)", price: 50 },
      { id: 505, name: "Snit jongen tot 6 jaar", price: 20 },
      { id: 506, name: "Snit jongen tot 12 jaar (Zonder wassen)", price: 25 },
      { id: 507, name: "Snit jongen tot 12 jaar (Met wassen)", price: 30 },
    ]
  },
  {
    id: 6,
    name: "Keratine Behandeling",
    icon: "⟡",
    img: "/images/services/keratine.jpeg",
    services: [
      { id: 601, name: "Brazilian keratine behandeling & brushing", price: "K: 200 € | H: 210 € | L: 220 €" },
      { id: 602, name: "Brazilian keratine behandeling Snit & brushing", price: "K: 230 € | H: 240 € | L: 260 €" },
    ]
  },
  {
    id: 7,
    name: "Opsteken",
    icon: "✿",
    img: "/images/services/opsteken.jpeg",
    services: [
      { id: 701, name: "Bruidskapsel (+ proef)", price: 165 },
      { id: 702, name: "Opsteken meisjes", price: 35 },
      { id: 703, name: "Opsteken dames (Normaal haar)", price: 55 },
      { id: 704, name: "Opsteken dames (Veel/lang haar)", price: 65 },
    ]
  },
  {
    id: 8,
    name: "Verzorging",
    icon: "◉",
    img: "/images/services/verzorging.jpeg",
    services: [
      { id: 801, name: "Verzorging", price: 5 },
      { id: 802, name: "Haarmasker", price: 10 },
    ]
  },
];

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.");

    await Category.deleteMany({});
    await Service.deleteMany({});
    console.log("Cleared old data.");

    for (let i = 0; i < staticCategories.length; i++) {
      const catData = staticCategories[i];
      const newCat = new Category({
        name: catData.name,
        icon: catData.icon,
        img: catData.img,
        order: i,
      });
      const savedCat = await newCat.save();
      console.log(`Created Category: ${savedCat.name}`);

      for (let j = 0; j < catData.services.length; j++) {
        const srvData = catData.services[j];
        
        // Define default blocks: 30 minutes of work.
        // For 'Kleuren' and 'Balayage', we can simulate a pause block for testing.
        let blocks = [{ duration: 30, type: "work" }];
        
        if (catData.name === "Kleuren" || catData.name === "Balayage & Highlights") {
          blocks = [
            { duration: 30, type: "work" },
            { duration: 30, type: "pause" },
            { duration: 30, type: "work" }
          ];
        }

        const newSrv = new Service({
          categoryId: savedCat._id,
          name: srvData.name,
          price: srvData.price,
          blocks: blocks,
          order: j,
        });
        await newSrv.save();
        console.log(`  - Created Service: ${newSrv.name}`);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
