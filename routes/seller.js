const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { renderAddProductPage, handleAddProduct } = require('../controllers/addProduct');
const { renderEditProductPage, handleEditProduct } = require('../controllers/editProduct');
const { handleDeleteProduct } = require('../controllers/deleteProduct');
const { renderManageProductsPage } = require('../controllers/manageProducts');
const { renderProductDetailPage } = require('../controllers/productDetail');
const { renderSellerHomepage } = require('../controllers/sellerHomepage');
const { renderProfilePage } = require('../controllers/profile');

router.get('/add-product', renderAddProductPage);
router.post('/add-product', upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 }
]), handleAddProduct);

router.get('/edit-product/:id', renderEditProductPage);
router.post('/edit-product/:id', upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 }
]), handleEditProduct);

router.post('/delete-product/:id', handleDeleteProduct);

router.get('/manage-products', renderManageProductsPage);

router.get('/product/:id', renderProductDetailPage);

router.get('/homepage', renderSellerHomepage);

router.get('/profile', renderProfilePage);

module.exports = router;
