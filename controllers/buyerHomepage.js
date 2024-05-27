const { getAuth } = require('firebase/auth');
const { db } = require('../config/firebaseConfig');
const { getDocs, collection, getDoc, doc, setDoc } = require('firebase/firestore');

// Render buyer homepage
const renderBuyerHomepage = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Lấy tất cả sản phẩm từ Firestore
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = [];
      productsSnapshot.forEach((doc) => {
        products.push({ ...doc.data(), id: doc.id });
      });

      res.render('buyer-homepage', { user: userData, products });
    } else {
      res.redirect('/auth/login');
    }
  } catch (error) {
    console.error('Error getting user profile or products:', error);
    res.redirect('/auth/login');
  }
};

// Add to cart function
const addToCart = async (req, res) => {
  const user = req.session.user;
  const { productId } = req.body;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists()) {
      const productData = productDoc.data();
      const cartItem = {
        productImage: productData.productImage,
        productName: productData.productName,
        category: productData.category,
        interiorStyle: productData.interiorStyle,
        quantity: 1, // Default quantity
        price: productData.price,
        sellerId: productData.sellerId,
        buyerId: user.uid
      };

      // Lưu thông tin sản phẩm vào collection 'cart'
      await setDoc(doc(db, 'cart', `${user.uid}_${productId}`), cartItem);

      res.status(200).send('Product added to cart');
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { renderBuyerHomepage, addToCart };
