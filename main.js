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

function colorFromString(str){
	let h = 0;
	for(let i=0;i<str.length;i++) h = (h<<5) - h + str.charCodeAt(i);
	h = Math.abs(h);
	// Paleta más navideña: mapear a rojo/verde/dorado
	const pick = h % 3;
	if(pick === 0) return `hsl(${10 + (h%20)} 78% 45%)`; // rojo
	if(pick === 1) return `hsl(${120 + (h%20)} 60% 38%)`; // verde
	return `hsl(${45 + (h%20)} 85% 50%)`; // dorado
}

function initialsOf(name){
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if(parts.length===0) return '';
	if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
	return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

// control de nieve (densidad y encendido)
let snowEnabled = true;
let snowDensity = 60; // 0..100
let _snowInterval = null;

function spawnSnow(count){
	const body = document.body;
	for(let i=0;i<count;i++){
		const s = document.createElement('div');
		s.className = 'snowflake';
		s.textContent = '❄';
		const left = Math.random()*100;
		s.style.left = left + 'vw';
		const duration = 5 + Math.random()*7;
		const size = 8 + Math.random()*18;
		s.style.fontSize = size + 'px';
		s.style.animationDuration = `${duration}s, ${2 + Math.random()*3}s`;
		s.style.animationDelay = `0s, 0s`;
		body.appendChild(s);
		setTimeout(()=>{ s.remove(); }, (duration + 1)*1000);
	}
}

function startSnow(){
	stopSnow();
	if(!snowEnabled) return;
	const perTick = Math.max(1, Math.round(snowDensity/12));
	_snowInterval = setInterval(()=>{
		spawnSnow(perTick);
	}, 900);
}

function stopSnow(){ if(_snowInterval){ clearInterval(_snowInterval); _snowInterval = null; } }

// --- Confetti simple al sortear ---
function launchConfetti(count = 40){
	const colors = ['#b91c1c','#065f46','#f59e0b','#ffffff','#c026d3'];
	for(let i=0;i<count;i++){
		const c = document.createElement('div');
		c.className = 'confetti';
		c.style.background = colors[Math.floor(Math.random()*colors.length)];
		const tx = (Math.random()-0.5) * 120 + (Math.random()>0.5?100:-100);
		c.style.setProperty('--tx', tx + 'px');
		c.style.left = (50 + (Math.random()-0.5)*40) + '%';
		c.style.transform = `rotate(${Math.random()*360}deg)`;
		c.style.width = (6 + Math.random()*10) + 'px';
		c.style.height = (8 + Math.random()*12) + 'px';
		document.body.appendChild(c);
		setTimeout(()=>c.remove(), 1400 + Math.random()*400);
	}
}

// --- Guirnalda y luces ---
function setupGarland(){
	const g = document.getElementById('garland');
	if(!g) return;
	// limpiar
	g.innerHTML = '';
	const string = document.createElement('div');
	string.className = 'string';
	g.appendChild(string);
	const lights = 14;
	const colors = ['#f43f5e','#065f46','#f59e0b','#10b981','#ec4899'];
	for(let i=0;i<lights;i++){
		const l = document.createElement('span');
		l.className = 'light';
		l.style.left = (5 + i*(90/(lights-1))) + '%';
		l.style.position = 'absolute';
		l.style.background = colors[i % colors.length];
		// stagger animation
		const delay = (i%5) * 120;
		l.style.animationDelay = `${delay}ms`;
		if(i%2===0) l.classList.add('blink');
		g.appendChild(l);
	}
	// encender las luces por defecto
	g.classList.add('active');
}


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
		const avatar = document.createElement('span');
		avatar.className = 'avatar';
		avatar.textContent = initialsOf(p.name);
		avatar.style.backgroundColor = colorFromString(p.name + p.id);

		const nameWrap = document.createElement('div');
		nameWrap.className = 'name-wrap';
		const name = document.createElement('div');
		name.textContent = p.name;
		const small = document.createElement('div');
		small.className = 'small';
		small.textContent = `ID: ${p.id.slice(-6)}`;
		nameWrap.appendChild(name);
		nameWrap.appendChild(small);
		left.appendChild(avatar);
		left.appendChild(nameWrap);

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
				// lanzar confetti al revelar la asignación
				launchConfetti(20);
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
	showToast('Asignaciones generadas 🎁');

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
// carga inicial de efectos
setupGarland();
startSnow();
