const { getAuth, signOut } = require('firebase/auth');

const logout = (req, res) => {
  const auth = getAuth();
  signOut(auth).then(() => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/seller/profile');
      }
      res.clearCookie('connect.sid');
      res.redirect('/auth/login');
    });
  }).catch((error) => {
    console.error('Error logging out: ', error);
    res.redirect('/seller/profile');
  });
};

module.exports = { logout };
