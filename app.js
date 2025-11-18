// app.js (compat) - plans & library
const dbc = firebase.firestore();
const authc = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
  const selectExercise = document.getElementById('exerciseSelect');
  const scheduleGrid = document.getElementById('schedule-grid');
  const addBtn = document.getElementById('addToDayBtn');
  const savePlanBtn = document.getElementById('save-plan');
  const plansList = document.getElementById('plans-list');
  const createForm = document.getElementById('create-plan-form');
  const userInfo = document.getElementById('user-info');
  let schedule = {monday:[],tuesday:[],wednesday:[],thursday:[],friday:[],saturday:[],sunday:[]};

  async function loadExercises(){
    if(!selectExercise) return;
    selectExercise.innerHTML = '<option value="">Loading...</option>';
    try {
      const snap = await dbc.collection('exercises').get();
      selectExercise.innerHTML = '<option value="">-- Select exercise --</option>';
      snap.forEach(doc => {
        const e = doc.data();
        const opt = document.createElement('option');
        opt.value = doc.id;
        opt.textContent = e.name + ' ('+ (e.muscle || e.muscleGroup || '') +')';
        selectExercise.appendChild(opt);
      });
    } catch(err){
      console.error('Load exercises error', err);
      selectExercise.innerHTML = '<option disabled>Error loading</option>';
    }
  }

  function renderSchedule(){
    if(!scheduleGrid) return;
    scheduleGrid.innerHTML = '';
    Object.keys(schedule).forEach(day=>{
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-2';
      const card = document.createElement('div');
      card.className = 'p-2 day-card';
      const title = document.createElement('strong');
      title.textContent = day.charAt(0).toUpperCase() + day.slice(1);
      card.appendChild(title);
      schedule[day].forEach((item,idx)=>{
        const p = document.createElement('div');
        p.textContent = (idx+1)+'. ' + (item.name || item.exerciseId) + ' — ' + item.sets + 'x' + item.reps;
        card.appendChild(p);
      });
      col.appendChild(card);
      scheduleGrid.appendChild(col);
    });
  }

  addBtn && addBtn.addEventListener('click', async ()=>{
    const exId = selectExercise.value;
    const day = document.getElementById('daySelect').value;
    const sets = document.getElementById('sets').value || 3;
    const reps = document.getElementById('reps').value || '8-12';
    if(!exId) return alert('Pick an exercise');
    try {
      const doc = await dbc.collection('exercises').doc(exId).get();
      const data = doc.exists ? doc.data() : {name: 'Unknown'};
      schedule[day].push({exerciseId: exId, name: data.name || '', sets, reps});
      renderSchedule();
    } catch(err){
      console.error('Add to schedule error', err);
      alert('Error adding to schedule');
    }
  });

  createForm && createForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const title = document.getElementById('plan-title').value;
    if(!title) return alert('Add a title');
    const user = authc.currentUser;
    if(!user) return alert('Sign in first');
    const plan = {
      userId: user.uid,
      title,
      schedule,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      private: true
    };
    try {
      const res = await dbc.collection('plans').add(plan);
      alert('Saved plan: ' + res.id);
      schedule = {monday:[],tuesday:[],wednesday:[],thursday:[],friday:[],saturday:[],sunday:[]};
      renderSchedule();
      loadPlans();
    } catch(err){
      console.error('Save plan error', err);
      alert('Error saving plan');
    }
  });

  async function loadPlans(){
    if(!plansList) return;
    const user = authc.currentUser;
    if(!user) { plansList.innerHTML = 'Sign in to see your plans.'; return; }
    try {
      const snap = await dbc.collection('plans').where('userId','==',user.uid).orderBy('createdAt','desc').get();
      plansList.innerHTML = '';
      snap.forEach(doc=>{
        const p = doc.data();
        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.innerHTML = '<div class="card-body"><h5>'+ (p.title || '') +'</h5><small>Created: '+ (p.createdAt ? new Date(p.createdAt.seconds*1000).toLocaleString() : '') +'</small></div>';
        plansList.appendChild(card);
      });
    } catch(err){
      console.error('Load plans error', err);
      plansList.innerHTML = 'Error loading plans';
    }
  }

  async function renderLibrary(){
    const list = document.getElementById('library-list');
    if(!list) return;
    list.innerHTML = 'Loading...';
    try {
      const snap = await dbc.collection('exercises').orderBy('name').limit(50).get();
      list.innerHTML = '';
      snap.forEach(doc=>{
        const d = doc.data();
        const col = document.createElement('div'); col.className='col-md-4';
        col.innerHTML = '<div class="card"><div class="card-body"><h5>'+d.name+'</h5><p>'+ (d.muscle || d.muscleGroup || '') +'</p></div></div>';
        list.appendChild(col);
      });
    } catch(err){
      console.error('Render library error', err);
      list.innerHTML = 'Error loading library';
    }
  }

  authc.onAuthStateChanged(async (user)=>{
    if(user){
      const ud = await getUserDoc(user.uid);
      userInfo && (userInfo.textContent = 'Signed in as: ' + (ud && ud.email ? ud.email : user.email));
      loadExercises();
      loadPlans();
      renderLibrary();
    } else {
      userInfo && (userInfo.textContent = 'Not signed in.');
      loadExercises();
    }
  });

  // init
  loadExercises();
  renderSchedule();
});
