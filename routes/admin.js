const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');

// Sử dụng middleware để kiểm tra vai trò người dùng
router.get('/', checkRole('admin'), (req, res) => {
  res.render('admin');
});

module.exports = router;
