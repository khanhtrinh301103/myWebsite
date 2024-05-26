const { db, storage } = require('../config/firebaseConfig');
const { doc, getDoc, deleteDoc } = require('firebase/firestore');
const { ref, deleteObject } = require('firebase/storage');
const { getAuth } = require('firebase/auth');

const handleDeleteProduct = async (req, res) => {
  const user = getAuth().currentUser;
  const productId = req.params.id;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      await deleteDoc(doc(db, 'products', productId));
      const imageUrls = [productDoc.data().productImage, ...productDoc.data().additionalImages];
      for (const url of imageUrls) {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      }
      res.redirect('/seller/manage-products');
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.redirect('/seller/manage-products');
  }
};

module.exports = { handleDeleteProduct };
