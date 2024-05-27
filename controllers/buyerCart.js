const { getAuth } = require('firebase/auth');
const { db } = require('../config/firebaseConfig');
const { getDoc, doc, updateDoc, deleteDoc } = require('firebase/firestore');

const renderBuyerCart = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartDoc = await getDoc(doc(db, 'cart', user.uid));
    let cartItems = [];

    if (cartDoc.exists()) {
      const data = cartDoc.data();
      cartItems = await Promise.all(data.items.map(async ([productId, cartItem]) => {
        const productDoc = await getDoc(doc(db, 'products', productId));
        const productData = productDoc.data();
        const sellerDoc = await getDoc(doc(db, 'users', productData.sellerId));
        const sellerName = sellerDoc.exists() ? sellerDoc.data().fullName : 'Unknown Seller';
        
        return {
          id: productId,
          productImage: productData.productImage,
          productName: productData.productName,
          category: productData.category,
          interiorStyle: productData.interiorStyle,
          quantity: cartItem.quantity,
          price: productData.price,
          sellerName: sellerName
        };
      }));
    }

    res.render('buyer/buyer-cart', { user, cartItems, currentPath: '/buyer/cart' });
  } catch (error) {
    console.error('Error getting cart items:', error);
    res.redirect('/buyer/homepage');
  }
};

const updateCartQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartDocRef = doc(db, 'cart', user.uid);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const updatedItems = cartData.items.map(([productId, item]) => {
        if (productId === id) {
          item.quantity = parseInt(quantity);
        }
        return [productId, item];
      });

      await updateDoc(cartDocRef, { items: updatedItems });
      res.redirect('/buyer/cart');
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.redirect('/buyer/cart');
  }
};

const deleteCartItem = async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartDocRef = doc(db, 'cart', user.uid);
    const cartDoc = await getDoc(cartDocRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      const updatedItems = cartData.items.filter(([productId]) => productId !== id);

      await updateDoc(cartDocRef, { items: updatedItems });
      res.redirect('/buyer/cart');
    }
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.redirect('/buyer/cart');
  }
};

module.exports = { renderBuyerCart, updateCartQuantity, deleteCartItem };
