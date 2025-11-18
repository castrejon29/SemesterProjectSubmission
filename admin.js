// admin.js (compat)
const db_admin = firebase.firestore();
const auth_admin = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
  const usersTable = document.getElementById('users-table');
  const chartCanvas = document.getElementById('chart-signups');

  async function loadUsers(){
    if(!usersTable) return;
    usersTable.innerHTML = 'Loading...';
    try {
      const snap = await db_admin.collection('users').orderBy('createdAt','desc').limit(100).get();
      let html = '<table class="table"><thead><tr><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
      snap.forEach(doc=>{
        const d = doc.data();
        html += `<tr><td>${d.email || ''}</td><td>${d.role || ''}</td><td>${d.active ? 'Yes' : 'No'}</td><td><button data-id="${doc.id}" class="btn btn-sm btn-secondary toggle-active">Toggle</button></td></tr>`;
      });
      html += '</tbody></table>';
      usersTable.innerHTML = html;
      document.querySelectorAll('.toggle-active').forEach(btn=>{
        btn.onclick = async (e)=>{
          const id = e.target.dataset.id;
          const docRef = db_admin.collection('users').doc(id);
          const docSnap = await docRef.get();
          const d = docSnap.data() || {};
          await docRef.update({active: !d.active});
          loadUsers();
        };
      });
    } catch(err){
      console.error('Load users error', err);
      usersTable.innerHTML = 'Error loading users';
    }
  }

  async function loadSignupsChart(){
    if(!chartCanvas) return;
    try {
      const snap = await db_admin.collection('users').orderBy('createdAt').get();
      const counts = {};
      snap.forEach(doc=>{
        const d = doc.data();
        if(d.createdAt && d.createdAt.seconds){
          const date = new Date(d.createdAt.seconds*1000).toISOString().slice(0,10);
          counts[date] = (counts[date]||0)+1;
        }
      });
      const labels = Object.keys(counts);
      const data = Object.values(counts);
      new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: { labels, datasets: [{ label: 'Signups', data }] },
        options: {}
      });
    } catch(err){
      console.error('Signups chart error', err);
    }
  }

  auth_admin.onAuthStateChanged(async (user)=>{
    if(!user) { usersTable && (usersTable.innerHTML = 'Sign in as admin to view'); return; }
    const ud = await getUserDoc(user.uid);
    if(!ud || ud.role !== 'admin') { usersTable && (usersTable.innerHTML = 'Admin only area'); return; }
    loadUsers();
    loadSignupsChart();
  });
});
