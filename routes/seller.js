const express = require('express');
const router = express.Router();
const { db, storage, auth } = require('../config/firebaseConfig');
const { collection, addDoc, getDocs, query, where } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const multer = require('multer');
const { getAuth } = require('firebase/auth');

// Configure multer for file uploads
const storageConfig = multer.memoryStorage();
const upload = multer({ storage: storageConfig });

router.get('/add-product', (req, res) => {
  res.render('seller/add-product');
});

router.post('/add-product', upload.single('productImage'), async (req, res) => {
  const { productName, price, category, interiorStyle } = req.body;
  const user = getAuth().currentUser;
  
  if (!user) {
    return res.redirect('/auth/login');
  }

  const productImage = req.file;
  let productImageUrl = '';

  if (productImage) {
    const storageRef = ref(storage, `product-images/${user.uid}/${productImage.originalname}-${Date.now()}`);
    await uploadBytes(storageRef, productImage.buffer, {
      contentType: productImage.mimetype
    });
    productImageUrl = await getDownloadURL(storageRef);
  }

  try {
    await addDoc(collection(db, 'products'), {
      productName,
      price,
      category,
      interiorStyle,
      productImage: productImageUrl,
      sellerId: user.uid
    });
    res.redirect('/seller/homepage');
  } catch (error) {
    console.error('Error adding document: ', error);
    res.redirect('/seller/add-product');
  }
});

router.get('/homepage', async (req, res) => {
  const user = getAuth().currentUser;
  
  if (!user) {
    return res.redirect('/auth/login');
  }

  const products = [];
  try {
    const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      products.push({ ...doc.data(), id: doc.id });
    });
    res.render('seller-homepage', { products });
  } catch (error) {
    console.error('Error getting documents: ', error);
    res.render('seller-homepage', { products: [] });
  }
});

module.exports = router;
