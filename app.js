const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const sellerRoutes = require('./routes/seller');
const buyerRoutes = require('./routes/buyer');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'h5dT9z3L4mA1eN6bX7qP8sR2jG3kI9vW0oU7vZ3rQ5tY1pB6nV',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);
app.use('/seller', sellerRoutes);
app.use('/buyer', buyerRoutes);

// Home route
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
