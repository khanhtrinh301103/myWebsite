const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebaseConfig');
const { signInWithEmailAndPassword } = require('firebase/auth');
const { getDoc, doc } = require('firebase/firestore');

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

//Đảm bảo thông tin người dùng được lưu trữ trong Firestore khi đăng ký
router.post('/register', async (req, res) => {
  const { email, password, username, fullName, phoneNumber, role } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
    const user = userCredential.user;

    // Lưu thông tin người dùng vào Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      username,
      fullName,
      phoneNumber,
      role
    });

    res.redirect('/auth/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.redirect('/auth/register');
  }
});

module.exports = router;
