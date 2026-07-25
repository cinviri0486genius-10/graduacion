const canvas = document.getElementById('canvas-pirotecnia');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal-graduado');
const inputNombre = document.getElementById('nombre-graduado');
const btnCelebrar = document.getElementById('btn-celebrar');
const btnOtro = document.getElementById('btn-otro');
const tarjeta = document.querySelector('.tarjeta-diploma');
const textoNombre = document.getElementById('texto-nombre');

let particulas = [];
let cohetes = [];
let loopFuegos = null;

// Ajustar tamaño del canvas
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', ajustarCanvas);
ajustarCanvas();

// AUDIO SINTETIZADO RETRO PARA LAS EXPLOSIONES
function sonidoExplosion() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

// LOGICA FISICA DE LA PIROTECNIA
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
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  actualizar() {
    this.x += this.vx;
    this.vy += this.gravedad;
    this.y += this.vy;
    this.alpha -= 0.015;
  }
}

function crearFuegoArtificial() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
  const colores = ['#ff4081', '#00e676', '#00b0ff', '#ffea00', '#d500f9', '#ff6d00', '#ffffff'];
  const color = colores[Math.floor(Math.random() * colores.length)];
  
  sonidoExplosion();
  for (let i = 0; i < 45; i++) {
    particulas.push(new Particula(x, y, color));
  }
}

function animarFuegos() {
  ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Rastro de desvanecimiento
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (Math.random() < 0.05) crearFuegoArtificial(); // Frecuencia de explosiones
  
  particulas.forEach((p, index) => {
    if (p.alpha <= 0) {
      particulas.splice(index, 1);
    } else {
      p.actualizar();
      p.dibujar();
    }
  });
  loopFuegos = requestAnimationFrame(animarFuegos);
}

// BOTONES E INTERACCIÓN
btnCelebrar.addEventListener('click', () => {
  const nombre = inputNombre.value.trim();
  if (nombre !== "") {
    textoNombre.textContent = nombre;
    modal.classList.add('oculto');
    tarjeta.classList.add('activo');
    animarFuegos();
  } else {
    inputNombre.style.borderColor = "#ff4081";
  }
});

btnOtro.addEventListener('click', () => {
  cancelAnimationFrame(loopFuegos);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particulas = [];
  inputNombre.value = "";
  tarjeta.classList.remove('activo');
  modal.classList.remove('oculto');
});
