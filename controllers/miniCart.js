const { db } = require('../config/firebaseConfig');
const { collection, getDocs, query, where } = require('firebase/firestore');

// Lấy dữ liệu mini-cart
const getMiniCartData = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const cartCollectionRef = collection(db, 'cart');
    const q = query(cartCollectionRef, where('buyerId', '==', user.uid));
    const cartSnapshot = await getDocs(q);

    const cartItems = [];
    let subtotal = 0;

    cartSnapshot.forEach(doc => {
      const cartData = doc.data();
      subtotal += parseFloat(cartData.price) * cartData.quantity;
      cartItems.push({
        id: doc.id,
        productName: cartData.productName,
        price: parseFloat(cartData.price),
        quantity: cartData.quantity,
        productImage: cartData.productImage
      });
    });

    res.json({ cartItems, subtotal });
  } catch (error) {
    console.error('Error fetching mini cart items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getMiniCartData };
