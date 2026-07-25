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
let globosLista = []; // Nueva lista de globos integrada
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
// PARTE 2: MOTORES DE FÍSICA PARA PARTÍCULAS Y CONFETI
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
    this.velocidadRotacion = Math.random() * 8 - 4;
    this.alpha = 1;
  }
  dibujar() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotacion * Math.PI / 180);
    
    // 1. Base del sombrero (Cilindro oscuro)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8, 0, 16, 4);
    
    // 2. Rombo superior (Tapa del birrete)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -6);   // Arriba
    ctx.lineTo(16, 0);   // Derecha
    ctx.lineTo(0, 6);    // Abajo
    ctx.lineTo(-16, 0);  // Izquierda
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 3. Borla Dorada (Hilo y gota colgante)
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, 4);
    ctx.stroke();
    
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(-10, 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
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
// PARTE 3: NUEVA CLASE PARA GLOBOS FLOTANTES
// ==========================================

class GloboFlotante {
  constructor() {
    this.ancho = Math.random() * 20 + 25;
    this.alto = this.ancho * 1.25;
    this.x = Math.random() * (canvas.width - this.ancho);
    this.y = canvas.height + Math.random() * 100;
    this.velocidadY = Math.random() * 1.5 + 1.2;
    this.balanceo = Math.random() * 100;
    this.velocidadBalanceo = Math.random() * 0.02 + 0.01;
    
    const coloresGlobos = ['#ff4081', '#00e676', '#00b0ff', '#ffea00', '#d500f9', '#ff9100'];
    this.color = coloresGlobos[Math.floor(Math.random() * coloresGlobos.length)];
  }
  dibujar() {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Hilo del globo
    ctx.beginPath();
    ctx.moveTo(0, this.alto / 2);
    ctx.quadraticCurveTo(Math.sin(this.balanceo) * 5, this.alto / 2 + 15, 0, this.alto / 2 + 30);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cuerpo redondo
    ctx.beginPath();
    ctx.scale(1, 1.25);
    ctx.arc(0, 0, this.ancho / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Nudo inferior
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + this.alto / 2);
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  actualizar() {
    this.y -= this.velocidadY;
    this.balanceo += this.velocidadBalanceo;
    this.x += Math.sin(this.balanceo) * 0.4;
  }
}

// ==========================================
// PARTE 4: BUCLE PRINCIPAL DE ANIMACIÓN Y EVENTOS
// ==========================================

function animarFuegos() {
  ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (Math.random() < 0.04) crearFuegoArtificial();
  if (confetiLista.length < 60) { confetiLista.push(new ConfetiDorada()); }
  
  // Generador de globos en pantalla
  if (globosLista.length < 15 && Math.random() < 0.02) { globosLista.push(new GloboFlotante()); }
  
  particulas.forEach((p, index) => {
    if (p.alpha <= 0) { particulas.splice(index, 1); } else { p.actualizar(); p.dibujar(); }
  });
  
  confetiLista.forEach((c, index) => {
    if (c.y > canvas.height) { confetiLista[index] = new ConfetiDorada(); } else { c.actualizar(); c.dibujar(); }
  });

  sombrerosLista.forEach((s, index) => {
    if (s.alpha <= 0) { sombrerosLista.splice(index, 1); } else { s.actualizar(); s.dibujar(); }
  });

  // Renderizado e hilos de globos
  globosLista.forEach((g, index) => {
    if (g.y < -g.alto) { 
      globosLista.splice(index, 1); 
    } else { 
      g.actualizar(); 
      g.dibujar(); 
    }
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
  globosLista = []; // Limpieza de globos al reiniciar
  inputNombre.value = "";
  tarjeta.classList.remove('activo');
  modal.classList.remove('oculto');
});

document.addEventListener('DOMContentLoaded', () => { guardarYMostrarHistorial(); });
