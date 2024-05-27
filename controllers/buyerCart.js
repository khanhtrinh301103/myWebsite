const { db } = require('../config/firebaseConfig');
const { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const renderBuyerCart = async (req, res) => {
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  const cartItems = [];
  try {
    const q = query(collection(db, 'cart'), where('buyerId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const sellerDoc = await getDoc(doc(db, 'users', data.sellerId));
      const seller = sellerDoc.data();
      cartItems.push({ ...data, id: doc.id, sellerName: seller.fullName });
    }
    res.render('buyer/buyer-cart', { cartItems, currentPath: '/buyer/cart', user });
  } catch (error) {
    console.error('Error getting documents: ', error);
    res.render('buyer/buyer-cart', { cartItems: [], currentPath: '/buyer/cart', user });
  }
};

const addToCart = async (req, res) => {
  const { productId, productName, price, category, interiorStyle, productImage, sellerId } = req.body;
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartItem = {
      productId,
      productName,
      price,
      category,
      interiorStyle,
      productImage,
      sellerId,
      buyerId: user.uid,
      quantity: 1
    };

    await addDoc(collection(db, 'cart'), cartItem);
    res.status(200).json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart: ', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

const updateCartQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartItemDoc = doc(db, 'cart', id);
    await updateDoc(cartItemDoc, { quantity });
    res.status(200).json({ message: 'Cart item quantity updated successfully' });
  } catch (error) {
    console.error('Error updating cart item quantity: ', error);
    res.status(500).json({ message: 'Error updating cart item quantity' });
  }
};

const deleteCartItem = async (req, res) => {
  const { id } = req.params;
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartItemDoc = doc(db, 'cart', id);
    await deleteDoc(cartItemDoc);
    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item: ', error);
    res.status(500).json({ message: 'Error deleting cart item' });
  }
};

const getCartItems = async (req, res) => {
  const user = getAuth().currentUser;

  if (!user) {
      return res.redirect('/auth/login');
  }

  const cartItems = [];
  try {
      const q = query(collection(db, 'cart'), where('buyerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
          cartItems.push({ ...doc.data(), id: doc.id });
      });
      res.status(200).json({ cartItems });
  } catch (error) {
      console.error('Error getting cart items: ', error);
      res.status(500).json({ message: 'Error getting cart items' });
  }
};

module.exports = { renderBuyerCart, addToCart, updateCartQuantity, deleteCartItem, getCartItems };

