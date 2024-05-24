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
  const { username, email, password, confirmPassword, fullName, phoneNumber, role } = req.body;

  // Kiểm tra xem password và confirm password có giống nhau không
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Lưu thông tin người dùng vào Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      fullName: fullName,
      phoneNumber: phoneNumber,
      role: role
    });

    // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
    res.redirect('/auth/login');
  } catch (error) {
    res.status(400).send('Registration Failed: ' + error.message);
  }
});

module.exports = router;
