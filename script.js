// ==========================================
// PARTE 1: CAPTURA DE COMPONENTES Y AUDIO SEGURO
// ==========================================

const canvas = document.getElementById('canvas-pirotecnia');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal-graduado');
const inputNombre = document.getElementById('nombre-graduado');
const btnCelebrar = document.getElementById('btn-celebrar');
const btnOtro = document.getElementById('btn-otro');
const tarjeta = document.querySelector('.tarjeta-diploma');
const textoNombre = document.getElementById('texto-nombre');
const sombreroElement = document.querySelector('.sombrero-3d');
const listaGraduadosDiv = document.getElementById('lista-graduados');

let particulas = [];
let confetiLista = [];
let sombrerosLista = [];
let loopFuegos = null;

let audioCtx = null;

function iniciarAudioSeguro() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', ajustarCanvas);
ajustarCanvas();

function sonidoExplosion() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function reproducirAplausos() {
  if (!audioCtx) return;
  const duracion = 3.5; 
  const palmadasTotal = 120;

  for (let i = 0; i < palmadasTotal; i++) {
    const tiempoRetraso = Math.random() * duracion;
    
    setTimeout(() => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(Math.random() * 120 + 90, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    }, tiempoRetraso * 1000);
  }
}

// ==========================================
// PARTE 2: MOTORES DE FÍSICA PARA PARTÍCULAS
// ==========================================

class Particula {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    this.color = color;
    this.radio = Math.random() * 2 + 1;
    const angulo = Math.random() * Math.PI * 2;
    const velocidad = Math.random() * 4 + 2;
    this.vx = Math.cos(angulo) * velocidad;
    this.vy = Math.sin(angulo) * velocidad;
    this.alpha = 1;
    this.gravedad = 0.06;
  }
  dibujar() {
    ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
    ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
  }
  actualizar() {
    this.x += this.vx; this.vy += this.gravedad; this.y += this.vy;
    this.alpha -= 0.015;
  }
}

class ConfetiDorada {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -50 - 10;
    this.ancho = Math.random() * 6 + 6;
    this.alto = Math.random() * 4 + 8;
    this.velocidadY = Math.random() * 1 + 0.8;
    this.balanceo = Math.random() * 2;
    this.velocidadBalanceo = Math.random() * 0.03 + 0.01;
    const tonosOro = ['#ffd700', '#ffca28', '#ffb300', '#ffe082', '#d4af37'];
    this.color = tonosOro[Math.floor(Math.random() * tonosOro.length)];
    this.rotacion = Math.random() * 360;
    this.velocidadRotacion = Math.random() * 4 - 2;
  }
  dibujar() {
    ctx.save(); ctx.translate(this.x + this.ancho / 2, this.y + this.alto / 2);
    ctx.rotate(this.rotacion * Math.PI / 180); ctx.fillStyle = this.color;
    ctx.fillRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto); ctx.restore();
  }
  actualizar() {
    this.y += this.velocidadY; this.balanceo += this.velocidadBalanceo;
    this.x += Math.sin(this.balanceo) * 0.5; this.rotacion += this.velocidadRotacion;
  }
}

class SombreritoVolador {
  constructor(x, y) {
    this.x = x; this.y = y;
    const angulo = Math.random() * Math.PI + Math.PI; 
    const velocidad = Math.random() * 6 + 5;
    this.vx = Math.cos(angulo) * velocidad;
    this.vy = Math.sin(angulo) * velocidad;
    this.gravedad = 0.2; 
    this.rotacion = Math.random() * 360;
    this.velocidadRotacion = Math.random() * 10 - 5;
    this.alpha = 1;
  }
  dibujar() {
    ctx.save(); ctx.globalAlpha = this.alpha; ctx.translate(this.x, this.y);
    ctx.rotate(this.rotacion * Math.PI / 180);
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(15, 0); ctx.lineTo(0, 8); ctx.lineTo(-15, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-8, 2, 2, 8); ctx.restore();
  }
  actualizar() {
    this.x += this.vx; this.vy += this.gravedad; this.y += this.vy;
    if (this.vy > 0) this.alpha -= 0.02;
  }
}

function crearFuegoArtificial() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
  const colores = ['#ff4081', '#00e676', '#00b0ff', '#ffea00', '#d500f9', '#ffffff'];
  const color = colores[Math.floor(Math.random() * colores.length)];
  sonidoExplosion();
  for (let i = 0; i < 40; i++) { particulas.push(new Particula(x, y, color)); }
}

// ==========================================
// PARTE 3: BUCLE GRÁFICO E INTERACCIÓN
// ==========================================

function animarFuegos() {
  ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (Math.random() < 0.04) crearFuegoArtificial();
  if (confetiLista.length < 60) { confetiLista.push(new ConfetiDorada()); }
  
  particulas.forEach((p, index) => {
    if (p.alpha <= 0) { particulas.splice(index, 1); } else { p.actualizar(); p.dibujar(); }
  });
  
  confetiLista.forEach((c, index) => {
    if (c.y > canvas.height) { 
      confetiLista[index] = new ConfetiDorada(); 
    } else { 
      c.actualizar(); 
      c.dibujar(); 
    }
  });

  sombrerosLista.forEach((s, index) => {
    if (s.alpha <= 0) { sombrerosLista.splice(index, 1); } else { s.actualizar(); s.dibujar(); }
  });
  
  loopFuegos = requestAnimationFrame(animarFuegos);
}

function guardarYMostrarHistorial(nombreEstudiante = null) {
  let historial = JSON.parse(localStorage.getItem('cuadroHonorGraduados')) || [];

  if (nombreEstudiante) {
    const ahora = new Date();
    const fechaText = ahora.toLocaleDateString([], {day: '2-digit', month: '2-digit'}) + ' ' + ahora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    historial.unshift({ nombre: nombreEstudiante, fecha: fechaText });
    localStorage.setItem('cuadroHonorGraduados', JSON.stringify(historial));
  }

  // VALIDACIÓN SEGURA: Solo dibuja si el contenedor existe en tu HTML
  if (listaGraduadosDiv) {
    listaGraduadosDiv.innerHTML = "";
    historial.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('item-graduado');
      div.innerHTML = `<span>🎓 <b>${item.nombre}</b></span> <span class="fecha">${item.fecha}</span>`;
      listaGraduadosDiv.appendChild(div);
    });
  }
}

if (sombreroElement) {
  sombreroElement.addEventListener('click', () => {
    iniciarAudioSeguro();
    const rect = sombreroElement.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;
    
    sonidoExplosion();
    for (let i = 0; i < 8; i++) {
      sombrerosLista.push(new SombreritoVolador(centroX, centroY));
    }
  });
}

btnCelebrar.addEventListener('click', () => {
  const nombre = inputNombre.value.trim();
  if (nombre !== "") {
    iniciarAudioSeguro();
    textoNombre.textContent = nombre;
    modal.classList.add('oculto');
    tarjeta.classList.add('activo');
    
    guardarYMostrarHistorial(nombre);
    reproducirAplausos();
    animarFuegos();
  } else {
    inputNombre.style.borderColor = "#ff4081";
  }
});

btnOtro.addEventListener('click', () => {
  cancelAnimationFrame(loopFuegos);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particulas = [];
  confetiLista = [];
  sombrerosLista = [];
  inputNombre.value = "";
  tarjeta.classList.remove('activo');
  modal.classList.remove('oculto');
});

document.addEventListener('DOMContentLoaded', () => { guardarYMostrarHistorial(); });
