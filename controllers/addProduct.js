const { db, storage } = require('../config/firebaseConfig');
const { collection, addDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth } = require('firebase/auth');

const renderAddProductPage = (req, res) => {
  res.render('seller/add-product', { currentPath: '/seller/add-product' });
};

const handleAddProduct = async (req, res) => {
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
};

module.exports = { renderAddProductPage, handleAddProduct };
