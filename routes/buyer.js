const express = require('express');
const router = express.Router();
const { renderBuyerHomepage, addToCart } = require('../controllers/buyerHomepage');
const { renderBuyerCart, updateCartQuantity, deleteCartItem, clearCart } = require('../controllers/buyerCart');
const { renderBuyerProfilePage } = require('../controllers/buyerProfile');
const { getMiniCartData, updateMiniCartQuantity, deleteMiniCartItem, clearMiniCart } = require('../controllers/miniCart');
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

// Route để hiển thị giỏ hàng của buyer
router.get('/cart', (req, res, next) => {
  req.currentPath = '/buyer/cart';
  renderBuyerCart(req, res, next);
});

// Route để lấy dữ liệu mini-cart
router.get('/mini-cart', (req, res, next) => {
  getMiniCartData(req, res);
});


// Route để cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/cart/update/:id', (req, res, next) => {
  updateCartQuantity(req, res, next);
});

// Route để xóa sản phẩm khỏi giỏ hàng
router.post('/cart/delete/:id', (req, res, next) => {
  deleteCartItem(req, res, next);
});

// Route để xóa toàn bộ giỏ hàng
router.post('/cart/clear', (req, res, next) => {
  clearCart(req, res, next);
});

// Route để hiển thị trang hồ sơ của buyer
router.get('/profile', (req, res, next) => {
  req.currentPath = '/buyer/profile';
  renderBuyerProfilePage(req, res, next);
});

module.exports = router;
