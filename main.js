const LS_KEYS = {PARTICIPANTS: 'amigo_participantes', ASSIGNMENTS: 'amigo_asignaciones'};

const el = {
	form: document.getElementById('add-form'),
	input: document.getElementById('name-input'),
	list: document.getElementById('participants'),
	shuffleBtn: document.getElementById('shuffle-btn'),
	clearBtn: document.getElementById('clear-btn'),
	toast: document.getElementById('toast')
};

let participants = [];
let assignments = {}; // map id -> recipientId

function saveParticipants(){
	localStorage.setItem(LS_KEYS.PARTICIPANTS, JSON.stringify(participants));
}

function loadParticipants(){
	const raw = localStorage.getItem(LS_KEYS.PARTICIPANTS);
	participants = raw ? JSON.parse(raw) : [];
}

function saveAssignments(){
	localStorage.setItem(LS_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
}

function loadAssignments(){
	const raw = localStorage.getItem(LS_KEYS.ASSIGNMENTS);
	assignments = raw ? JSON.parse(raw) : {};
}

function uid(){return Date.now().toString(36) + Math.random().toString(36).slice(2,8)}

function render(){
	el.list.innerHTML = '';
	participants.forEach((p, i) => {
		const li = document.createElement('li');

		const left = document.createElement('div');
		left.className = 'participant-left';
		const name = document.createElement('div');
		name.textContent = p.name;
		const small = document.createElement('div');
		small.className = 'small';
		small.textContent = `ID: ${p.id.slice(-6)}`;
		left.appendChild(name);
		left.appendChild(small);

		const right = document.createElement('div');
		right.style.display = 'flex';
		right.style.gap = '8px';

		const revealBtn = document.createElement('button');
		revealBtn.className = 'reveal';
		revealBtn.textContent = 'Ver';
		revealBtn.addEventListener('click', ()=>{
			const assignedId = assignments[p.id];
			if(!assignedId){
				showToast('Aún no hay asignaciones. Presiona Sortear.');
				return;
			}
			const r = participants.find(x=>x.id===assignedId);
			const span = li.querySelector('.hidden-assigned');
			if(span){
				span.remove();
			} else {
				const s = document.createElement('span');
				s.className = 'hidden-assigned';
				s.textContent = r ? r.name : '—';
				li.appendChild(s);
			}
		});

		const removeBtn = document.createElement('button');
		removeBtn.textContent = 'Eliminar';
		removeBtn.addEventListener('click', ()=>{
			participants.splice(i,1);
			// remove related assignment entries
			delete assignments[p.id];
			saveParticipants(); saveAssignments(); render();
		});

		right.appendChild(revealBtn);
		right.appendChild(removeBtn);

		li.appendChild(left);
		li.appendChild(right);

		el.list.appendChild(li);
	});
}

function addParticipant(name){
	const trimmed = name.trim();
	if(!trimmed) return showToast('Ingrese un nombre válido');
	participants.push({id: uid(), name: trimmed});
	saveParticipants();
	render();
}

function showToast(msg, time=2200){
	el.toast.textContent = msg;
	el.toast.style.display = 'block';
	setTimeout(()=>el.toast.style.display='none', time);
}

function shuffleArray(a){
	for(let i=a.length-1;i>0;i--){
		const j = Math.floor(Math.random()*(i+1));
		[a[i],a[j]] = [a[j],a[i]];
	}
}

function generateAssignments(){
	if(participants.length < 2) return showToast('Se necesitan al menos 2 participantes');

	const ids = participants.map(p=>p.id);
	let shuffled = ids.slice();

	// Intentar derangement aleatorio
	const maxAttempts = 1000;
	let attempt = 0;
	let ok = false;
	while(attempt < maxAttempts){
		shuffleArray(shuffled);
		let good = true;
		for(let i=0;i<ids.length;i++){
			if(ids[i] === shuffled[i]){ good = false; break; }
		}
		if(good){ ok = true; break; }
		attempt++;
	}

	if(!ok){
		// fallback: rotación simple (si n>1 siempre funciona)
		shuffled = ids.slice();
		const first = shuffled.shift();
		shuffled.push(first);
	}

	assignments = {};
	for(let i=0;i<ids.length;i++) assignments[ids[i]] = shuffled[i];
	saveAssignments();
	showToast('Asignaciones generadas');
}

// Events
el.form.addEventListener('submit', (e)=>{
	e.preventDefault();
	addParticipant(el.input.value);
	el.input.value = '';
	el.input.focus();
});

el.shuffleBtn.addEventListener('click', ()=>{ generateAssignments(); });

el.clearBtn.addEventListener('click', ()=>{
	if(!confirm('Borrar todos los participantes y asignaciones?')) return;
	participants = []; assignments = {};
	localStorage.removeItem(LS_KEYS.PARTICIPANTS);
	localStorage.removeItem(LS_KEYS.ASSIGNMENTS);
	render();
});

// carga inicial
loadParticipants(); loadAssignments(); render();
