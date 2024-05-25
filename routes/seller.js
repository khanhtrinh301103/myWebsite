const express = require('express');
const router = express.Router();
const { db, storage, auth } = require('../config/firebaseConfig');
const { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const multer = require('multer');
const { getAuth } = require('firebase/auth');

// Configure multer for file uploads
const storageConfig = multer.memoryStorage();
const upload = multer({ storage: storageConfig });

router.get('/add-product', (req, res) => {
  res.render('seller/add-product', { currentPath: '/seller/add-product' });
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
    res.render('seller-homepage', { products, currentPath: '/seller/homepage' });
  } catch (error) {
    console.error('Error getting documents: ', error);
    res.render('seller-homepage', { products: [], currentPath: '/seller/homepage' });
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
      res.render('seller/seller-product-detail', { product: productDoc.data(), productId, currentPath: '/seller/product' });
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    res.redirect('/seller/homepage');
  }
});

router.post('/delete-product/:id', async (req, res) => {
  const user = getAuth().currentUser;
  const productId = req.params.id;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      await deleteDoc(doc(db, 'products', productId));
      const imageUrls = [productDoc.data().productImage, ...productDoc.data().additionalImages];
      for (const url of imageUrls) {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      }
      res.redirect('/seller/manage-products');
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.redirect('/seller/manage-products');
  }
});

router.get('/edit-product/:id', async (req, res) => {
  const user = getAuth().currentUser;
  const productId = req.params.id;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      res.render('seller/edit-product', { product: productDoc.data(), productId, currentPath: '/seller/edit-product' });
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    res.redirect('/seller/homepage');
  }
});

router.post('/edit-product/:id', upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 }
]), async (req, res) => {
  const { productName, price, category, interiorStyle, description, quantity } = req.body;
  const user = getAuth().currentUser;
  const productId = req.params.id;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      let productImageUrl = productDoc.data().productImage;
      let additionalImageUrls = productDoc.data().additionalImages;

      const productImage = req.files['productImage'] ? req.files['productImage'][0] : null;
      const additionalImages = req.files['additionalImages'];

      // Xóa ảnh cũ nếu có ảnh mới
      if (productImage) {
        const oldImageRef = ref(storage, productImageUrl);
        await deleteObject(oldImageRef);
        
        const storageRef = ref(storage, `product-images/${user.uid}/${productImage.originalname}-${Date.now()}`);
        await uploadBytes(storageRef, productImage.buffer, {
          contentType: productImage.mimetype
        });
        productImageUrl = await getDownloadURL(storageRef);
      }

      const newAdditionalImageUrls = [];

      for (let i = 0; i < 3; i++) {
        const additionalImage = additionalImages && additionalImages[i];
        if (additionalImage) {
          const oldImageRef = ref(storage, additionalImageUrls[i]);
          await deleteObject(oldImageRef);
          
          const storageRef = ref(storage, `product-images/${user.uid}/${additionalImage.originalname}-${Date.now()}`);
          await uploadBytes(storageRef, additionalImage.buffer, {
            contentType: additionalImage.mimetype
          });
          newAdditionalImageUrls.push(await getDownloadURL(storageRef));
        } else {
          newAdditionalImageUrls.push(additionalImageUrls[i]);
        }
      }

      await updateDoc(doc(db, 'products', productId), {
        productName,
        price,
        category,
        interiorStyle,
        description,
        quantity,
        productImage: productImageUrl,
        additionalImages: newAdditionalImageUrls
      });

      res.redirect(`/seller/product/${productId}`);
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error updating document:', error);
    res.redirect('/seller/manage-products');
  }
});

router.get('/manage-products', async (req, res) => {
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
    res.render('seller/manage-products', { products, currentPath: '/seller/manage-products' });
  } catch (error) {
    console.error('Error getting documents: ', error);
    res.render('seller/manage-products', { products: [], currentPath: '/seller/manage-products' });
  }
});

router.get('/profile', async (req, res) => {
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userProfile = userDoc.data();
      res.render('seller/profile', { user: userProfile, currentPath: '/seller/profile' });
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.redirect('/seller/homepage');
  }
});

module.exports = router;
