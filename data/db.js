const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialData = {
  showroom: {
    name: "Royal Enfield Showroom - Vishwanath Enterprises",
    nameHindi: "रॉयल एनफील्ड शोरूम - विश्वनाथ एंटरप्राइजेज",
    address: "Plot No 312K, 309 Varanasi Shakti Nagar Highway, Chhapka, Robertsganj, Uttar Pradesh 231216",
    phone: "082918 22580",
    phoneFormatted: "+91 82918 22580",
    rating: 4.9,
    reviewCount: 1235,
    plusCode: "M355+7V Robertsganj, Uttar Pradesh",
    hours: "9:30 AM - 8:00 PM (Mon-Sun)",
    googleListingUrl: "https://dealers.royalenfield.com/uttar-pradesh/robertsganj/chhapka-vishwanath-enterprises-9110074290",
    motoversePassUrl: "https://skillboxes.com/events/royal-enfield-motoverse-2026-viswanath-enterprises-sbykkckj"
  },
  admin: {
    username: "admin",
    password: "royalenfield1901"
  },
  bikes: [
    {
      id: "classic-350",
      name: "Classic 350",
      tagline: "Timeless Tradition, Reborn",
      priceExShowroom: 193080,
      priceOnRoad: 221500,
      displacement: "349 cc J-Series",
      power: "20.2 bhp @ 6100 rpm",
      torque: "27 Nm @ 4000 rpm",
      mileage: "36.2 kmpl",
      tankCapacity: "13 L",
      category: "Classic",
      colors: [
        { name: "Stealth Black", hex: "#181818" },
        { name: "Halcyon Green", hex: "#264e36" },
        { name: "Chrome Bronze", hex: "#8d6438" },
        { name: "Signals Desert Sand", hex: "#9b8054" },
        { name: "Marsh Grey", hex: "#5a5a54" }
      ],
      description: "The Classic 350 embodies the spirit of the past, harmonized with the precision and reliability of modern J-series engineering.",
      image: "/assets/bikes/classic-350.png"
    },
    {
      id: "bullet-350",
      name: "Bullet 350",
      tagline: "The Stalwart Thumper",
      priceExShowroom: 173562,
      priceOnRoad: 201200,
      displacement: "349 cc J-Series",
      power: "20.2 bhp @ 6100 rpm",
      torque: "27 Nm @ 4000 rpm",
      mileage: "37 kmpl",
      tankCapacity: "13 L",
      category: "Heritage",
      colors: [
        { name: "Black Gold", hex: "#1f1d1d" },
        { name: "Standard Maroon", hex: "#5b1414" },
        { name: "Military SilverBlack", hex: "#2b2b2b" }
      ],
      description: "The longest-running production motorcycle in history. Handcrafted pinstripes and raw, visceral road presence.",
      image: "/assets/bikes/bullet-350.png"
    },
    {
      id: "hunter-350",
      name: "Hunter 350",
      tagline: "A Shot of Pure Motorcycling",
      priceExShowroom: 149900,
      priceOnRoad: 176400,
      displacement: "349 cc Roadster",
      power: "20.2 bhp @ 6100 rpm",
      torque: "27 Nm @ 4000 rpm",
      mileage: "36.2 kmpl",
      tankCapacity: "13 L",
      category: "Roadster",
      colors: [
        { name: "Dapper Ash", hex: "#54595f" },
        { name: "Rebel Blue", hex: "#1c5d99" },
        { name: "Rebel Red", hex: "#9b1b1b" }
      ],
      description: "Nimble, youthful, and built for urban conquest. Sharp steering geometry and responsive acceleration.",
      image: "/assets/bikes/hunter-350.png"
    },
    {
      id: "himalayan-450",
      name: "Himalayan 450",
      tagline: "Built for All Roads, Built for No Roads",
      priceExShowroom: 285000,
      priceOnRoad: 326000,
      displacement: "452 cc Sherpa Liquid-Cooled",
      power: "40.02 PS @ 8000 rpm",
      torque: "40 Nm @ 5500 rpm",
      mileage: "30 kmpl",
      tankCapacity: "17 L",
      category: "Adventure",
      colors: [
        { name: "Hanle Black", hex: "#1a1a1a" },
        { name: "Kamet White", hex: "#eaeaea" },
        { name: "Kaza Brown", hex: "#7a6249" }
      ],
      description: "Liquid-cooled Sherpa 450 engine, Ride-by-Wire, 6-speed gearbox with assist-and-slipper clutch, and Tripper navigation map display.",
      image: "/assets/bikes/himalayan-450.png"
    },
    {
      id: "continental-gt-650",
      name: "Continental GT 650",
      tagline: "Authentic Cafe Racer Culture",
      priceExShowroom: 319000,
      priceOnRoad: 367000,
      displacement: "648 cc Parallel Twin",
      power: "47 bhp @ 7250 rpm",
      torque: "52.3 Nm @ 5650 rpm",
      mileage: "25 kmpl",
      tankCapacity: "12.5 L",
      category: "Twins",
      colors: [
        { name: "Apex Grey", hex: "#444648" },
        { name: "Slipstream Blue", hex: "#163f68" },
        { name: "Mr Clean Chrome", hex: "#d1d5db" }
      ],
      description: "Twin-cylinder 270-degree firing order with aggressive clip-on handlebars and rear-set footpegs for high-speed carving.",
      image: "/assets/bikes/continental-gt-650.png"
    }
  ],
  testRides: [
    {
      id: "TR-1001",
      customerName: "Sanjay Mishra",
      phone: "9450123847",
      email: "sanjay.mishra@gmail.com",
      bikeModel: "Classic 350",
      bikeColor: "Stealth Black",
      date: "2026-09-20",
      timeSlot: "11:00 AM - 12:00 PM",
      licenseConfirmed: true,
      city: "Robertsganj",
      status: "Confirmed",
      notes: "Interested in stealth black with alloys and UP RTO finance options.",
      createdAt: "2026-09-18T10:15:00Z"
    },
    {
      id: "TR-1002",
      customerName: "Rajeshwar Singh",
      phone: "9838445129",
      email: "rajeshwar.s@yahoo.com",
      bikeModel: "Himalayan 450",
      bikeColor: "Hanle Black",
      date: "2026-09-21",
      timeSlot: "02:00 PM - 03:00 PM",
      licenseConfirmed: true,
      city: "Chhapka",
      status: "Pending",
      notes: "Planning Leh-Ladakh ride next summer. Wants off-road trail test.",
      createdAt: "2026-09-18T14:30:00Z"
    },
    {
      id: "TR-1003",
      customerName: "Mohit Verma",
      phone: "8765991042",
      email: "mohitv@outlook.com",
      bikeModel: "Hunter 350",
      bikeColor: "Rebel Blue",
      date: "2026-09-22",
      timeSlot: "04:30 PM - 05:30 PM",
      licenseConfirmed: true,
      city: "Obra",
      status: "Pending",
      notes: "First time Royal Enfield buyer. College commute requirement.",
      createdAt: "2026-09-18T17:05:00Z"
    }
  ],
  serviceBookings: [
    {
      id: "SRV-2001",
      customerName: "Abhay Maurya",
      phone: "9125301824",
      bikeModel: "Bullet 350",
      regNumber: "UP 64 AB 4421",
      serviceType: "Periodic Maintenance (2nd Service)",
      preferredDate: "2026-09-21",
      preferredTime: "10:00 AM",
      status: "Scheduled",
      notes: "Engine oil change, chain lubrication and clutch cable check required.",
      createdAt: "2026-09-18T11:20:00Z"
    },
    {
      id: "SRV-2002",
      customerName: "Deepak Chauhan",
      phone: "9839812401",
      bikeModel: "Continental GT 650",
      regNumber: "UP 64 Z 1901",
      serviceType: "General Checkup & Brake Bleeding",
      preferredDate: "2026-09-22",
      preferredTime: "01:00 PM",
      status: "Pending",
      notes: "Front disc brake inspection.",
      createdAt: "2026-09-18T16:45:00Z"
    }
  ],
  inquiries: [
    {
      id: "INQ-3001",
      name: "Gaurav Pandey",
      phone: "9415789210",
      email: "gaurav.p@gmail.com",
      type: "Motoverse 2026 Passes",
      details: "Need Group of 5 passes for Motoverse Goa ride from Sonbhadra crew.",
      status: "Followed Up",
      createdAt: "2026-09-18T09:40:00Z"
    },
    {
      id: "INQ-3002",
      name: "Sunil Kumar",
      phone: "8808123490",
      email: "sunil.k@rediffmail.com",
      type: "Finance & Exchange Offer",
      details: "Wants to exchange old 2017 Pulsar 150 for Hunter 350 Dapper Ash.",
      status: "New",
      createdAt: "2026-09-18T15:10:00Z"
    }
  ],
  reviews: [
    {
      id: "REV-1",
      author: "Rahul Singh",
      rating: 5,
      date: "3 weeks ago",
      text: "This Royal Enfield showroom in Robertsganj offers a wide selection of bikes and provides a remarkable overall experience. Very supportive, polite, and helpful staff.",
      verified: true
    },
    {
      id: "REV-2",
      author: "Amit Patel",
      rating: 5,
      date: "1 month ago",
      text: "Purchased Classic 350 Stealth Black from Vishwanath Enterprises. Smooth finance handling, quick delivery, and crystal clear process. Best showroom on Varanasi Shakti Nagar Highway!",
      verified: true
    },
    {
      id: "REV-3",
      author: "Vikram Tiwari",
      rating: 5,
      date: "2 months ago",
      text: "Service center staff is well trained and polite. First service of my Himalayan 450 went without any trouble. Honest, punctual, and highly skilled mechanics.",
      verified: true
    },
    {
      id: "REV-4",
      author: "Priya Pandey",
      rating: 5,
      date: "3 months ago",
      text: "The showroom environment is very positive and authentic. The test ride process was seamless. They explained all EMI schemes patiently.",
      verified: true
    }
  ],
  announcement: {
    title: "MOTOVERSE IS BACK! Goa 2026",
    subtitle: "The Greatest Celebration of Motorcycling Culture returns to Goa. Early Bird Passes are live at ₹2,599. Special prices on Group of 5 & Group of 10 passes.",
    active: true,
    festiveOffer: "Festive Season Zero Down-Payment & Low Interest Rate available for Robertsganj & Sonbhadra residents!"
  }
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB, falling back to memory/initial data:', err);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

module.exports = {
  readDb,
  writeDb
};
