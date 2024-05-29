const { db } = require('../config/firebaseConfig');
const { doc, getDoc } = require('firebase/firestore');

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

module.exports = { renderBuyerProfilePage };
