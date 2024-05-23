const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebaseConfig');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc } = require('firebase/firestore');

// Route để hiển thị trang đăng ký
router.get('/', (req, res) => {
  res.render('register');
});

// Route để xử lý đăng ký người dùng
router.post('/', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Lưu vai trò của người dùng vào Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: role
    });

    // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
    res.redirect('/auth/login');
  } catch (error) {
    res.status(400).send('Registration Failed: ' + error.message);
  }
});

module.exports = router;
