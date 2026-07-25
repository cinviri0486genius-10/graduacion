// ==========================================
// PARTE 1: CAPTURA DE COMPONENTES Y AUDIO NATIVO
// ==========================================

const canvas = document.getElementById('canvas-pirotecnia');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal-graduado');
const inputNombre = document.getElementById('nombre-graduado');
const btnCelebrar = document.getElementById('btn-celebrar');
const btnOtro = document.getElementById('btn-otro');
const tarjeta = document.querySelector('.tarjeta-diploma');
const textoNombre = document.getElementById('texto-nombre');

let particulas = [];
let confetiLista = [];
let loopFuegos = null;

// Escucha reactiva para el tamaño del área de explosión
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', ajustarCanvas);
ajustarCanvas();

// AUDIO DE IMPACTO BASE DE LOS COHETES
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

// AUDIO SINTETIZADO DE APLAUSOS (SIMULACIÓN ANALÓGICA RAPIDA)
function reproducirAplausos() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const duracion = 3.5; // Segundos de aplauso
  const palmadasPorSegundo = 45; 

  for (let i = 0; i < palmadasPorSegundo * duracion; i++) {
    const tiempoRetraso = Math.random() * duracion;
    
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(Math.random() * 150 + 100, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
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
    this.x = x; 
    this.y = y;
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

class ConfetiDorada {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -50 - 10; // Nacen arriba fuera de la vista
    this.ancho = Math.random() * 6 + 6;
    this.alto = Math.random() * 4 + 8;
    this.velocidadY = Math.random() * 1 + 0.8; // Caída lenta y ligera
    this.balanceo = Math.random() * 2;
    this.velocidadBalanceo = Math.random() * 0.03 + 0.01;
    
    // Gradación cromática metálica dorada
    const tonosOro = ['#ffd700', '#ffca28', '#ffb300', '#ffe082', '#d4af37'];
    this.color = tonosOro[Math.floor(Math.random() * tonosOro.length)];
    this.rotacion = Math.random() * 360;
    this.velocidadRotacion = Math.random() * 4 - 2;
  }
  dibujar() {
    ctx.save();
    ctx.translate(this.x + this.ancho / 2, this.y + this.alto / 2);
    ctx.rotate(this.rotacion * Math.PI / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto);
    ctx.restore();
  }
  actualizar() {
    this.y += this.velocidadY;
    this.balanceo += this.velocidadBalanceo;
    this.x += Math.sin(this.balanceo) * 0.5; // Crea el vaivén por fricción del aire
    this.rotacion += this.velocidadRotacion;
  }
}

function crearFuegoArtificial() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
  const colores = ['#ff4081', '#00e676', '#00b0ff', '#ffea00', '#d500f9', '#ffffff'];
  const color = colores[Math.floor(Math.random() * colores.length)];
  
  sonidoExplosion();
  for (let i = 0; i < 45; i++) {
    particulas.push(new Particula(x, y, color));
  }
}

// ==========================================
// PARTE 3: BUCLE GRÁFICO E INTERACCIÓN
// ==========================================

function animarFuegos() {
  ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Deja un rastro luminoso retro
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Lanzamiento intermitente de nuevos proyectiles de pirotecnia
  if (Math.random() < 0.04) crearFuegoArtificial();
  
  // Relleno constante del flujo de confeti flotante
  if (confetiLista.length < 70) {
    confetiLista.push(new ConfetiDorada());
  }
  
  // Render de chispas explosivas
  particulas.forEach((p, index) => {
    if (p.alpha <= 0) { 
      particulas.splice(index, 1); 
    } else { 
      p.actualizar(); 
      p.dibujar(); 
    }
  });
  
  // Render de láminas de oro
  confetiLista.forEach((c, index) => {
    if (c.y > canvas.height) {
      confetiLista[index] = new ConfetiDorada(); // Lo reinicia al tope al tocar el suelo
    } else {
      c.actualizar();
      c.dibujar();
    }
  });
  
  loopFuegos = requestAnimationFrame(animarFuegos);
}

// CONFIGURACIÓN DE DISPARADORES EN BOTONES
btnCelebrar.addEventListener('click', () => {
  const nombre = inputNombre.value.trim();
  if (nombre !== "") {
    textoNombre.textContent = nombre;
    modal.classList.add('oculto');
    tarjeta.classList.add('activo');
    
    reproducirAplausos(); // Lanza el sonido de aplausos unificados
    animarFuegos(); // Enciende el canvas gráfico
  } else {
    inputNombre.style.borderColor = "#ff4081";
  }
});

btnOtro.addEventListener('click', () => {
  // Apaga por completo el devorador de ciclos gráficos
  cancelAnimationFrame(loopFuegos);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Limpieza absoluta de vectores en memoria
  particulas = [];
  confetiLista = [];
  inputNombre.value = "";
  
  // Animación de regreso al formulario
  tarjeta.classList.remove('activo');
  modal.classList.remove('oculto');
});
