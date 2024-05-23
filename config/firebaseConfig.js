const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyCccI_3Eov8wGh84_QschMtOsb-8KenzNY",
  authDomain: "furniturewebsite-23b0c.firebaseapp.com",
  projectId: "furniturewebsite-23b0c",
  storageBucket: "furniturewebsite-23b0c.appspot.com",
  messagingSenderId: "897415121900",
  appId: "1:897415121900:web:fe3fef5caadfff5f2f8ec9",
  measurementId: "G-SKWBP0Z7K8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { auth, db, storage };
