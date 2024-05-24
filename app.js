const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const registerRoutes = require('./routes/register');
const sellerRoutes = require('./routes/seller');
const buyerRoutes = require('./routes/buyer');

// Middleware để lưu trữ phiên đăng nhập
app.use(session({
  secret: 'h5dT9z3L4mA1eN6bX7qP8sR2jG3kI9vW0oU7vZ3rQ5tY1pB6nV', // Chuỗi mạnh được sử dụng làm secret key
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));

// Phục vụ các tệp tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Định nghĩa router cho các route khác nhau
app.use('/auth', authRoutes);
app.use('/auth/register', registerRoutes);
app.use('/seller', sellerRoutes);
app.use('/buyer', buyerRoutes);

app.get('/', (req, res) => {
  res.redirect('/auth/login'); // Chuyển hướng đến trang đăng nhập mặc định
});

const PORT = process.env.PORT || 3000; // Đảm bảo cổng 3000 được sử dụng
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
