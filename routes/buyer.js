const express = require('express');
const router = express.Router();
const { renderBuyerHomepage, addToCart } = require('../controllers/buyerHomepage');
const { renderBuyerCart, updateCartQuantity, deleteCartItem } = require('../controllers/buyerCart');
const { getAuth } = require('firebase/auth');
const { collection, query, where, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebaseConfig');

// Route để hiển thị trang chủ của buyer
router.get('/homepage', (req, res, next) => {
  req.currentPath = '/buyer/homepage';
  renderBuyerHomepage(req, res, next);
});

// Route để thêm sản phẩm vào giỏ hàng
router.post('/add-to-cart', (req, res, next) => {
  addToCart(req, res, next);
});

module.exports = router;
