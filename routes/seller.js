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
const checkRole = require('../middleware/checkRole');

router.get('/add-product', checkRole('seller'), renderAddProductPage);
router.post('/add-product', checkRole('seller'), upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 }
]), handleAddProduct);

router.get('/edit-product/:id', checkRole('seller'), renderEditProductPage);
router.post('/edit-product/:id', checkRole('seller'), upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 }
]), handleEditProduct);

router.post('/delete-product/:id', checkRole('seller'), handleDeleteProduct);

router.get('/manage-products', checkRole('seller'), renderManageProductsPage);

router.get('/product/:id', checkRole('seller'), renderProductDetailPage);

router.get('/homepage', checkRole('seller'), renderSellerHomepage);

router.get('/profile', checkRole('seller'), renderProfilePage);

module.exports = router;
