const { db } = require('../config/firebaseConfig');
const { collection, getDocs, query, where } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const renderManageProductsPage = async (req, res) => {
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  const products = [];
  try {
    const q = query(collection(db, 'products'), where('sellerId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      products.push({ ...doc.data(), id: doc.id });
    });
    res.render('seller/manage-products', { products, currentPath: '/seller/manage-products' });
  } catch (error) {
    console.error('Error getting documents: ', error);
    res.render('seller/manage-products', { products: [], currentPath: '/seller/manage-products' });
  }
};

module.exports = { renderManageProductsPage };
