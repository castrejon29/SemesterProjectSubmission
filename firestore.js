// Firebase COMPAT configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM6p2ttavUjrfcb4Mxffn7X0n9yizj27Y",
  authDomain: "gymplanner-17281.firebaseapp.com",
  projectId: "gymplanner-17281",
  storageBucket: "gymplanner-17281.firebasestorage.app",
  messagingSenderId: "742706190536",
  appId: "1:742706190536:web:1b90c9daf07ac9801f6dfd",
  measurementId: "G-F84MXNYHGM"
};

// Initialize Firebase (compat)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// helper to get current user doc
async function getUserDoc(uid){
  if(!uid) return null;
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}
