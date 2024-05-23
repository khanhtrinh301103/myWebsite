const { db } = require('../config/firebaseConfig');
const { getDoc, doc } = require('firebase/firestore');

const checkRole = (role) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.redirect('/auth/login');
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== role) {
      return res.status(403).send('Access denied');
    }

    next();
  };
};

module.exports = checkRole;
