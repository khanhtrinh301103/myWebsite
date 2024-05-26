const { db } = require('../config/firebaseConfig');
const { doc, getDoc } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const renderProfilePage = async (req, res) => {
  const user = getAuth().currentUser;

  if (!user) {
    return res.redirect('/auth/login');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userProfile = userDoc.data();
      res.render('seller/profile', { user: userProfile, currentPath: '/seller/profile' });
    } else {
      res.redirect('/seller/homepage');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.redirect('/seller/homepage');
  }
};

module.exports = { renderProfilePage };
