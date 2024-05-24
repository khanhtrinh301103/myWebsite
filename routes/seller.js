const express = require('express');
const router = express.Router();
const { db, storage, auth } = require('../config/firebaseConfig');
const { collection, addDoc, getDocs, query, where, doc, getDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const multer = require('multer');
const { getAuth } = require('firebase/auth');

// Configure multer for file uploads
const storageConfig = multer.memoryStorage();
const upload = multer({ storage: storageConfig });

router.get('/add-product', (req, res) => {
  res.render('seller/add-product');
});

router.post('/add-product', upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 }
]), async (req, res) => {
  const { productName, price, category, interiorStyle, description, quantity } = req.body;
  const user = getAuth().currentUser;
  
  if (!user) {
    return res.redirect('/auth/login');
  }

  const productImage = req.files['productImage'][0];
  const additionalImages = req.files['additionalImages'];
  let productImageUrl = '';
  let additionalImageUrls = [];

  if (productImage) {
    const storageRef = ref(storage, `product-images/${user.uid}/${productImage.originalname}-${Date.now()}`);
    await uploadBytes(storageRef, productImage.buffer, {
      contentType: productImage.mimetype
    });
    productImageUrl = await getDownloadURL(storageRef);
  }

  if (additionalImages) {
    for (const image of additionalImages) {
      const storageRef = ref(storage, `product-images/${user.uid}/${image.originalname}-${Date.now()}`);
      await uploadBytes(storageRef, image.buffer, {
        contentType: image.mimetype
      });
      const imageUrl = await getDownloadURL(storageRef);
      additionalImageUrls.push(imageUrl);
    }
  }

  try {
    await addDoc(collection(db, 'products'), {
      productName,
      price,
      category,
      interiorStyle,
      description,
      quantity,
      productImage: productImageUrl,
      additionalImages: additionalImageUrls,
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

router.get('/product/:id', async (req, res) => {
  const user = getAuth().currentUser;
  
  if (!user) {
    return res.redirect('/auth/login');
  }

  const productId = req.params.id;
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      res.render('seller/seller-product-detail', { product: productDoc.data(), productId });
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    res.redirect('/seller/homepage');
  }
});

module.exports = router;
