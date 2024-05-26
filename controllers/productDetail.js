const { db } = require('../config/firebaseConfig');
const { doc, getDoc } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const renderProductDetailPage = async (req, res) => {
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
};

module.exports = { renderProductDetailPage };
