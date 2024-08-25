const { db, storage } = require('../config/firebaseConfig');
const { doc, getDoc, updateDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

// Render buyer profile page
const renderBuyerProfilePage = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userProfile = userDoc.data();
      res.render('buyer/buyer-profile', { user: userProfile, currentPath: '/buyer/profile' });
    } else {
      res.redirect('/buyer/homepage');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.redirect('/buyer/homepage');
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const fileName = `${user.uid}-${Date.now()}${path.extname(req.file.originalname)}`;
  const fileRef = ref(storage, `profile-photos/${fileName}`);

  try {
    // Upload ảnh lên Firebase Storage
    const snapshot = await uploadBytes(fileRef, req.file.buffer);

    // Lấy URL của ảnh đã upload
    const photoUrl = await getDownloadURL(snapshot.ref);

    // Cập nhật URL ảnh đại diện vào Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { profilePhotoUrl: photoUrl });

    res.status(200).json({ photoUrl });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).send('Error uploading photo');
  }
};

module.exports = { renderBuyerProfilePage, uploadProfilePhoto };
