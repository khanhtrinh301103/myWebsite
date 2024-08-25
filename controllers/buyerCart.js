const { db } = require('../config/firebaseConfig');
const { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, writeBatch } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Render buyer cart page
const renderBuyerCart = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    let userData = { username: user.username }; // Default to session username

    if (userDoc.exists()) {
      userData = userDoc.data();
    }

    const cartCollectionRef = collection(db, 'cart');
    const cartSnapshot = await getDocs(cartCollectionRef);
    const cartItems = [];

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();
      if (cartData.buyerId === user.uid) {
        const sellerDoc = await getDoc(doc(db, 'users', cartData.sellerId));
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          cartData.fullName = sellerData.fullName;
        } else {
          cartData.fullName = 'Unknown Seller';
        }
        cartItems.push({ id: cartDoc.id, ...cartData });
      }
    }

    res.render('buyer/buyer-cart', { user: userData, cartItems, currentPath: '/buyer/cart' });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.redirect('/buyer/homepage');
  }
};

// Update cart quantity
const updateCartQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  // Kiểm tra nếu quantity là một số hợp lệ
  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return res.status(400).send('Invalid quantity');
  }

  try {
    const cartDocRef = doc(db, 'cart', id);
    const cartDoc = await getDoc(cartDocRef);

    if (!cartDoc.exists()) {
      return res.status(404).send('Cart item not found');
    }

    // Cập nhật số lượng sản phẩm trong Firestore
    await updateDoc(cartDocRef, { quantity });
    res.status(200).send('Quantity updated');
  } catch (error) {
    console.error('Error updating quantity:', error.message);
    res.status(500).send('Internal Server Error');
  }
};


const deleteCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    const cartDocRef = doc(db, 'cart', id);
    await deleteDoc(cartDocRef);

    res.status(200).send('Item deleted');
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Clear cart
const clearCart = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const cartCollectionRef = collection(db, 'cart');
    const q = query(cartCollectionRef, where('buyerId', '==', user.uid));
    const cartSnapshot = await getDocs(q);

    if (cartSnapshot.empty) {
      return res.status(404).send('No cart items found for this user');
    }

    const batch = writeBatch(db);

    cartSnapshot.forEach(cartDoc => {
      batch.delete(cartDoc.ref);
    });

    await batch.commit();

    res.status(200).send('Cart cleared');
  } catch (error) {
    console.error('Error clearing cart:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { renderBuyerCart, updateCartQuantity, deleteCartItem, clearCart };

