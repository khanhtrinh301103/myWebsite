const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebaseConfig');
const { signInWithEmailAndPassword } = require('firebase/auth');
const { getDoc, doc } = require('firebase/firestore');
const { logout } = require('../controllers/authController');

// Route để hiển thị trang đăng nhập
router.get('/login', (req, res) => {
  res.render('login');
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

// Route để xử lý logout
router.get('/logout', logout);

module.exports = router;
