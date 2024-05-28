const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebaseConfig');
const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getDoc, doc, setDoc } = require('firebase/firestore');
const { logout } = require('../controllers/authController');

// Route để hiển thị trang đăng nhập
router.get('/login', (req, res) => {
  res.render('login'); // Đảm bảo rằng tên tệp trùng khớp với tên tệp trong thư mục views
});

// Route để xử lý đăng nhập người dùng
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Lấy thông tin vai trò của người dùng từ Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Lưu thông tin người dùng vào session
    req.session.user = {
      uid: user.uid,
      email: user.email,
      role: userData.role
    };

    // Kiểm tra vai trò của người dùng và chuyển hướng đến trang tương ứng
    if (userData.role === 'seller') {
      res.redirect('/seller/homepage');
    } else if (userData.role === 'buyer') {
      res.redirect('/buyer/homepage');
    } else {
      res.status(400).send('Invalid role');
    }
  } catch (error) {
    res.status(400).send('Login Failed: ' + error.message);
  }
});

// Route để hiển thị trang đăng ký
router.get('/register', (req, res) => {
  res.render('register'); // Đảm bảo rằng tên tệp trùng khớp với tên tệp trong thư mục views
});

// Route để xử lý đăng ký người dùng
router.post('/register', async (req, res) => {
  const { email, password, username, role, fullName, phoneNumber } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Lưu thông tin người dùng vào Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      username,
      role, // Vai trò của người dùng (buyer hoặc seller)
      fullName,
      phoneNumber
    });

    res.redirect('/auth/login');
  } catch (error) {
    res.status(400).send('Registration Failed: ' + error.message);
  }
});

// Route để xử lý logout
router.get('/logout', logout);

module.exports = router;
