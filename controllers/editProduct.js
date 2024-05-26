const { db, storage } = require('../config/firebaseConfig');
const { doc, getDoc, updateDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const { getAuth } = require('firebase/auth');

const renderEditProductPage = async (req, res) => {
  const user = getAuth().currentUser;
  const productId = req.params.id;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      res.render('seller/edit-product', { product: productDoc.data(), productId, currentPath: '/seller/edit-product' });
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    res.redirect('/seller/homepage');
  }
};

const handleEditProduct = async (req, res) => {
  const { productName, price, category, interiorStyle, description, quantity } = req.body;
  const user = getAuth().currentUser;
  const productId = req.params.id;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists() && productDoc.data().sellerId === user.uid) {
      let productImageUrl = productDoc.data().productImage;
      let additionalImageUrls = productDoc.data().additionalImages;

      const productImage = req.files['productImage'] ? req.files['productImage'][0] : null;
      const additionalImages = req.files['additionalImages'];

      // Xóa ảnh cũ nếu có ảnh mới
      if (productImage) {
        const oldImageRef = ref(storage, productImageUrl);
        await deleteObject(oldImageRef);
        
        const storageRef = ref(storage, `product-images/${user.uid}/${productImage.originalname}-${Date.now()}`);
        await uploadBytes(storageRef, productImage.buffer, {
          contentType: productImage.mimetype
        });
        productImageUrl = await getDownloadURL(storageRef);
      }

      const newAdditionalImageUrls = [];

      for (let i = 0; i < 3; i++) {
        const additionalImage = additionalImages && additionalImages[i];
        if (additionalImage) {
          const oldImageRef = ref(storage, additionalImageUrls[i]);
          await deleteObject(oldImageRef);
          
          const storageRef = ref(storage, `product-images/${user.uid}/${additionalImage.originalname}-${Date.now()}`);
          await uploadBytes(storageRef, additionalImage.buffer, {
            contentType: additionalImage.mimetype
          });
          newAdditionalImageUrls.push(await getDownloadURL(storageRef));
        } else {
          newAdditionalImageUrls.push(additionalImageUrls[i]);
        }
      }

      await updateDoc(doc(db, 'products', productId), {
        productName,
        price,
        category,
        interiorStyle,
        description,
        quantity,
        productImage: productImageUrl,
        additionalImages: newAdditionalImageUrls
      });

      res.redirect(`/seller/product/${productId}`);
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error updating document:', error);
    res.redirect('/seller/manage-products');
  }
};

module.exports = { renderEditProductPage, handleEditProduct };
