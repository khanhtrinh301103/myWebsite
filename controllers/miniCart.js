const { db } = require('../config/firebaseConfig');
const { collection, getDocs, query, where } = require('firebase/firestore');

const renderMiniCart = async (req, res) => {
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

    res.render('partials/buyer/miniCart', { cartItems, subtotal });
  } catch (error) {
    console.error('Error fetching mini cart items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

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
    console.error('Error updating quantity:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = { renderMiniCart };
