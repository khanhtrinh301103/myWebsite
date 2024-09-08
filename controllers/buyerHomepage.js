const { getAuth } = require('firebase/auth');
const { db } = require('../config/firebaseConfig');
const { getDocs, collection, getDoc, doc, setDoc, updateDoc } = require('firebase/firestore');

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

      // Thêm currentPath vào render
      res.render('buyer-homepage', { 
        user: userData, 
        products: products, 
        currentPath: req.currentPath // Truyền currentPath vào view
      });
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
    const productDocRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productDocRef);

    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }

    const productData = productDoc.data();
    const cartDocRef = doc(db, 'cart', `${user.uid}_${productId}`);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng lên 1
      const newQuantity = cartDoc.data().quantity + 1;
      await updateDoc(cartDocRef, { quantity: newQuantity });
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới với số lượng 1
      const cartItem = {
        productId: productId,
        productImage: productData.productImage,
        productName: productData.productName,
        category: productData.category,
        interiorStyle: productData.interiorStyle,
        quantity: 1, // Default quantity
        price: productData.price,
        sellerId: productData.sellerId,
        buyerId: user.uid
      };

      await setDoc(cartDocRef, cartItem);
    }

    res.status(200).send('Product added to cart');
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { renderBuyerHomepage, addToCart };
