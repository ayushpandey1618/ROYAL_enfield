const express = require('express');
const cors = require('cors');
const path = require('path');
const { readDb, writeDb } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple auth middleware for admin endpoints
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const token = authHeader.split(' ')[1];
  // Simple token format: base64(username:password) or static session token
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [user, pass] = decoded.split(':');
    const db = readDb();
    if (user === db.admin.username && pass === db.admin.password) {
      return next();
    }
  } catch (e) {
    // invalid token
  }
  return res.status(403).json({ success: false, message: 'Invalid credentials or session expired' });
}

// ---------------- PUBLIC API ENDPOINTS ----------------

// Get Showroom Info
app.get('/api/info', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    showroom: db.showroom,
    announcement: db.announcement
  });
});

// Get Bikes Catalog
app.get('/api/bikes', (req, res) => {
  const db = readDb();
  res.json({ success: true, bikes: db.bikes });
});

// Get Reviews
app.get('/api/reviews', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    rating: db.showroom.rating,
    reviewCount: db.showroom.reviewCount,
    reviews: db.reviews
  });
});

// Submit a Customer Review
app.post('/api/reviews', (req, res) => {
  const { author, rating, text } = req.body;
  if (!author || !rating || !text) {
    return res.status(400).json({ success: false, message: 'Name, rating, and review text are required.' });
  }
  const db = readDb();
  const newReview = {
    id: `REV-${Date.now()}`,
    author: String(author).trim(),
    rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
    date: 'Just now',
    text: String(text).trim(),
    verified: true
  };
  db.reviews.unshift(newReview);
  writeDb(db);
  res.status(201).json({ success: true, message: 'Thank you! Your review has been published.', review: newReview });
});

// Book Test Ride
app.post('/api/bookings/test-ride', (req, res) => {
  const { customerName, phone, email, bikeModel, bikeColor, date, timeSlot, city, notes } = req.body;
  if (!customerName || !phone || !bikeModel || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'Please provide Name, Phone, Bike Model, Date, and Time Slot.' });
  }

  const db = readDb();
  const bookingId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking = {
    id: bookingId,
    customerName: String(customerName).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : '',
    bikeModel,
    bikeColor: bikeColor || 'Standard',
    date,
    timeSlot,
    licenseConfirmed: true,
    city: city || 'Robertsganj',
    status: 'Pending',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.testRides.unshift(newBooking);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Test ride booked successfully at Vishwanath Enterprises, Robertsganj!',
    bookingId: bookingId,
    booking: newBooking
  });
});

// Book Service Appointment
app.post('/api/bookings/service', (req, res) => {
  const { customerName, phone, bikeModel, regNumber, serviceType, preferredDate, preferredTime, notes } = req.body;
  if (!customerName || !phone || !bikeModel || !preferredDate) {
    return res.status(400).json({ success: false, message: 'Name, Phone, Bike Model and Preferred Date are required.' });
  }

  const db = readDb();
  const serviceId = `SRV-${Math.floor(2000 + Math.random() * 9000)}`;
  const newService = {
    id: serviceId,
    customerName: String(customerName).trim(),
    phone: String(phone).trim(),
    bikeModel,
    regNumber: regNumber || 'New / Unregistered',
    serviceType: serviceType || 'Periodic Maintenance',
    preferredDate,
    preferredTime: preferredTime || '10:00 AM',
    status: 'Pending',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.serviceBookings.unshift(newService);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Service appointment slot requested successfully!',
    serviceId: serviceId,
    booking: newService
  });
});

// Submit General Inquiry or Motoverse Booking
app.post('/api/inquiries', (req, res) => {
  const { name, phone, email, type, details } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required.' });
  }

  const db = readDb();
  const inqId = `INQ-${Math.floor(3000 + Math.random() * 9000)}`;
  const newInq = {
    id: inqId,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : '',
    type: type || 'General Enquiry',
    details: details || '',
    status: 'New',
    createdAt: new Date().toISOString()
  };

  db.inquiries.unshift(newInq);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted. Our team at Vishwanath Enterprises will contact you shortly.',
    id: inqId
  });
});

// ---------------- ADMIN API ENDPOINTS ----------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  if (username === db.admin.username && password === db.admin.password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: { username: db.admin.username }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Admin Dashboard Data
app.get('/api/admin/dashboard', adminAuth, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    stats: {
      totalTestRides: db.testRides.length,
      pendingTestRides: db.testRides.filter(t => t.status === 'Pending').length,
      totalServices: db.serviceBookings.length,
      pendingServices: db.serviceBookings.filter(s => s.status === 'Pending').length,
      totalInquiries: db.inquiries.length,
      totalReviews: db.reviews.length,
      rating: db.showroom.rating
    },
    testRides: db.testRides,
    services: db.serviceBookings,
    inquiries: db.inquiries,
    reviews: db.reviews,
    bikes: db.bikes,
    announcement: db.announcement,
    showroom: db.showroom
  });
});

// Update Test Ride Status
app.patch('/api/admin/test-rides/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const db = readDb();
  const item = db.testRides.find(t => t.id === id);
  if (!item) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (status) item.status = status;
  if (notes !== undefined) item.notes = notes;
  writeDb(db);
  res.json({ success: true, message: 'Test ride updated', item });
});

// Update Service Booking Status
app.patch('/api/admin/services/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const db = readDb();
  const item = db.serviceBookings.find(s => s.id === id);
  if (!item) return res.status(404).json({ success: false, message: 'Service booking not found' });

  if (status) item.status = status;
  if (notes !== undefined) item.notes = notes;
  writeDb(db);
  res.json({ success: true, message: 'Service booking updated', item });
});

// Update Inquiry Status
app.patch('/api/admin/inquiries/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();
  const item = db.inquiries.find(i => i.id === id);
  if (!item) return res.status(404).json({ success: false, message: 'Inquiry not found' });

  if (status) item.status = status;
  writeDb(db);
  res.json({ success: true, message: 'Inquiry updated', item });
});

// Delete a Review
app.delete('/api/admin/reviews/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initLen = db.reviews.length;
  db.reviews = db.reviews.filter(r => r.id !== id);
  if (db.reviews.length === initLen) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }
  writeDb(db);
  res.json({ success: true, message: 'Review removed' });
});

// Update Announcement / Motoverse banner
app.put('/api/admin/announcement', adminAuth, (req, res) => {
  const { title, subtitle, active, festiveOffer } = req.body;
  const db = readDb();
  db.announcement = {
    title: title || db.announcement.title,
    subtitle: subtitle || db.announcement.subtitle,
    active: active !== undefined ? active : db.announcement.active,
    festiveOffer: festiveOffer !== undefined ? festiveOffer : db.announcement.festiveOffer
  };
  writeDb(db);
  res.json({ success: true, message: 'Announcement updated', announcement: db.announcement });
});

// Update Bike Price / Details
app.put('/api/admin/bikes/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { priceExShowroom, priceOnRoad, tagline, description } = req.body;
  const db = readDb();
  const bike = db.bikes.find(b => b.id === id);
  if (!bike) return res.status(404).json({ success: false, message: 'Bike not found' });

  if (priceExShowroom) bike.priceExShowroom = Number(priceExShowroom);
  if (priceOnRoad) bike.priceOnRoad = Number(priceOnRoad);
  if (tagline) bike.tagline = tagline;
  if (description) bike.description = description;

  writeDb(db);
  res.json({ success: true, message: 'Bike details updated', bike });
});

// Change Admin Password
app.post('/api/admin/change-password', adminAuth, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  const db = readDb();
  db.admin.password = newPassword;
  writeDb(db);
  res.json({ success: true, message: 'Password updated successfully' });
});

// Route fallbacks for Single Page Navigation
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏍️  Royal Enfield Showroom - Vishwanath Enterprises`);
  console.log(`📍  Plot No 312K, 309 Varanasi Shakti Nagar Highway, Robertsganj`);
  console.log(`🌐  Live on: http://localhost:${PORT}`);
  console.log(`🔐  Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`=======================================================`);
});
