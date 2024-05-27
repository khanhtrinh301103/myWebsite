const express = require('express');
const router = express.Router();
const { renderBuyerHomepage } = require('../controllers/buyerHomepage');
const { renderBuyerCart, addToCart, updateCartQuantity, deleteCartItem } = require('../controllers/buyerCart');
const { getAuth } = require('firebase/auth');
const { collection, query, where, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebaseConfig');

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

// Route để thêm sản phẩm vào giỏ hàng
router.post('/cart/add', addToCart);

// Route để cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/cart/update/:id', updateCartQuantity);

// Route để xóa sản phẩm khỏi giỏ hàng
router.post('/cart/delete/:id', deleteCartItem);

// Route để lấy tất cả các mục trong giỏ hàng (sử dụng cho popsup)
router.get('/cart/items', async (req, res) => {
    const user = getAuth().currentUser;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const cartItems = [];
    try {
        const q = query(collection(db, 'cart'), where('buyerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            cartItems.push({ ...doc.data(), id: doc.id });
        });
        res.status(200).json(cartItems);
    } catch (error) {
        console.error('Error getting cart items: ', error);
        res.status(500).json({ message: 'Error getting cart items' });
    }
});

module.exports = router;
