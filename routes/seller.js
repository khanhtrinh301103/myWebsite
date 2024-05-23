const express = require('express');
const router = express.Router();

// Route để hiển thị trang chủ của seller
router.get('/homepage', (req, res) => {
  res.render('seller-homepage');
});

module.exports = router;
