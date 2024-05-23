const express = require('express');
const router = express.Router();

// Route để hiển thị trang chủ của buyer
router.get('/homepage', (req, res) => {
  res.render('buyer-homepage');
});

module.exports = router;
