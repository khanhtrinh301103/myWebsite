const express = require('express');
const router = express.Router();
const { renderBuyerHomepage } = require('../controllers/buyerHomepage');
const { renderBuyerCart, updateCartQuantity, deleteCartItem } = require('../controllers/buyerCart');

// Route để hiển thị trang chủ của buyer
router.get('/homepage', (req, res, next) => {
  req.currentPath = '/buyer/homepage';
  renderBuyerHomepage(req, res, next);
});

// Route để hiển thị trang giỏ hàng của buyer
router.get('/cart', (req, res, next) => {
  req.currentPath = '/buyer/cart';
  renderBuyerCart(req, res, next);
});

// Route để cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/cart/update-quantity/:id', updateCartQuantity);

// Route để xóa sản phẩm khỏi giỏ hàng
router.post('/cart/delete/:id', deleteCartItem);

module.exports = router;
