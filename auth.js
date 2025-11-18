// auth.js (compat)
document.addEventListener('DOMContentLoaded', () => {
  const authLink = document.getElementById('auth-link');
  function updateAuthUI(user){
    if(!authLink) return;
    if(user){
      authLink.textContent = 'Logout';
      authLink.onclick = async (e) => { e.preventDefault(); await auth.signOut(); location.reload(); };
    } else {
      authLink.textContent = 'Login';
      authLink.onclick = (e) => { e.preventDefault(); showAuthModal(); };
    }
  }

  auth.onAuthStateChanged(async (user) => {
    updateAuthUI(user);
  });
});

async function showAuthModal(){
  const action = prompt('Type "login" or "signup"');
  if(action === 'signup'){
    const email = prompt('Email:');
    const password = prompt('Password (min 6 chars):');
    if(!email || !password) return alert('Missing');
    try {
      const cred = await auth.createUserWithEmailAndPassword(email,password);
      await db.collection('users').doc(cred.user.uid).set({
        email: email,
        role: 'user',
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Signed up. Reloading...');
      location.reload();
    } catch (err) {
      console.error(err);
      alert('Signup error: ' + err.message);
    }
  } else if(action === 'login'){
    const email = prompt('Email:');
    const password = prompt('Password:');
    if(!email || !password) return alert('Missing');
    try {
      await auth.signInWithEmailAndPassword(email,password);
      alert('Signed in. Reloading...');
      location.reload();
    } catch(err) {
      console.error(err);
      alert('Login error: ' + err.message);
    }
  }
}
