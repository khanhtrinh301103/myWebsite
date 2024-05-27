const { getAuth } = require('firebase/auth');
const { db } = require('../config/firebaseConfig');
const { getDocs, collection, getDoc, doc } = require('firebase/firestore');

const renderBuyerHomepage = async (req, res) => {
  const user = req.session.user;
  const currentPath = req.currentPath;

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

      res.render('buyer-homepage', { user: userData, products, currentPath });
    } else {
      res.redirect('/auth/login');
    }
  } catch (error) {
    console.error('Error getting user profile or products:', error);
    res.redirect('/auth/login');
  }
};

module.exports = { renderBuyerHomepage };
