const express = require('express');
const router = express.Router();
const { renderBuyerHomepage } = require('../controllers/buyerHomepage');

// Route để hiển thị trang chủ của buyer
router.get('/homepage', renderBuyerHomepage);

module.exports = router;
