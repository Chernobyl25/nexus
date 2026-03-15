// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 60 ? 'rgba(8,10,15,0.98)' : 'rgba(8,10,15,0.85)';
});

// ===== CARRITO =====
let cart = [];
const cartDrawer   = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartToggle   = document.getElementById('cartToggle');
const cartClose    = document.getElementById('cartClose');
const cartItemsEl  = document.getElementById('cartItems');
const cartCountEl  = document.getElementById('cartCount');
const cartTotalEl  = document.getElementById('cartTotal');
const cartFooterEl = document.getElementById('cartFooter');

function openCart()  { cartDrawer.classList.add('open'); cartBackdrop.classList.add('visible'); document.body.style.overflow = 'hidden'; }
function closeCart() { cartDrawer.classList.remove('open'); cartBackdrop.classList.remove('visible'); document.body.style.overflow = ''; }

if (cartToggle)   cartToggle.addEventListener('click', openCart);
if (cartClose)    cartClose.addEventListener('click', closeCart);
if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

function showToast(msg) {
  let t = document.getElementById('globalToast');
  if (!t) { t = document.createElement('div'); t.id = 'globalToast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 2200);
}

function renderCart() {
  if (!cartItemsEl) return;
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    if (cartFooterEl) cartFooterEl.style.display = 'none';
    if (cartCountEl)  cartCountEl.textContent = '0';
    return;
  }
  if (cartFooterEl) cartFooterEl.style.display = 'flex';
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (cartCountEl) cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
  cartItemsEl.innerHTML = '';
  cart.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.display='none'"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
        <button class="remove-btn" data-idx="${idx}">✕</button>
      </div>`;
    cartItemsEl.appendChild(row);
  });
  cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.idx);
      btn.dataset.action === 'inc' ? cart[i].qty++ : cart[i].qty--;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      renderCart();
    });
  });
  cartItemsEl.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => { cart.splice(parseInt(btn.dataset.idx), 1); renderCart(); });
  });
}

function addToCart(name, price, img) {
  const ex = cart.find(i => i.name === name);
  ex ? ex.qty++ : cart.push({ name, price: parseFloat(price), img, qty: 1 });
  renderCart();
  showToast(`✔ ${name} agregado`);
  openCart();
}

document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(btn.dataset.name, btn.dataset.price, btn.dataset.img);
    btn.classList.add('added');
    const orig = btn.textContent;
    btn.textContent = '✔ Agregado';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = orig; }, 1800);
  });
});

const checkoutBtn = document.querySelector('.cart-checkout');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (!cart.length) return;
    cart = []; renderCart(); closeCart(); showToast('🎮 ¡Compra realizada con éxito!');
  });
}
renderCart();

// ===== FILTROS =====
// Abrir/cerrar dropdowns
document.querySelectorAll('.filter-toggle').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const targetId = btn.dataset.target;
    const drop = document.getElementById(targetId);
    const isOpen = drop.classList.contains('open');
    // Cerrar todos
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.filter-toggle').forEach(b => b.classList.remove('active'));
    // Abrir el clickeado si estaba cerrado
    if (!isOpen) {
      drop.classList.add('open');
      btn.classList.add('active');
    }
  });
});
// Cerrar al hacer clic fuera
document.addEventListener('click', () => {
  document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.filter-toggle').forEach(b => b.classList.remove('active'));
});

// Lógica de filtrado
const cards     = Array.from(document.querySelectorAll('.game-card'));
const countEl   = document.getElementById('filterCount');
const noResults = document.getElementById('noResults');
const grid      = document.getElementById('gamesGrid');

function getChecked(dropId) {
  return Array.from(document.querySelectorAll(`#${dropId} input:checked`)).map(i => i.value);
}
function getPrecio() {
  const r = document.querySelector('input[name="precio"]:checked');
  return r ? r.value : '';
}

function applyFilters() {
  const generos    = getChecked('dropGenero');
  const plataforma = getChecked('dropPlataforma');
  const badges     = getChecked('dropBadge');
  const precio     = getPrecio();

  let visible = cards.filter(card => {
    const cGenero = card.dataset.genero || '';
    const cPlat   = card.dataset.plataforma || '';
    const cBadge  = card.dataset.badge || '';
    const cPrecio = parseFloat(card.dataset.precio) || 0;

    // Género: al menos uno debe coincidir
    if (generos.length && !generos.some(g => cGenero.includes(g))) return false;
    // Plataforma: al menos una debe coincidir
    if (plataforma.length && !plataforma.some(p => cPlat.includes(p))) return false;
    // Badge: al menos uno debe coincidir
    if (badges.length && !badges.some(b => cBadge.includes(b))) return false;
    // Precio
    if (precio === 'free'    && cPrecio > 0)   return false;
    if (precio === 'under20' && cPrecio >= 20)  return false;
    if (precio === 'under50' && cPrecio >= 50)  return false;

    return true;
  });

  // Ordenar por precio
  if (precio === 'asc')  visible.sort((a, b) => parseFloat(a.dataset.precio) - parseFloat(b.dataset.precio));
  if (precio === 'desc') visible.sort((a, b) => parseFloat(b.dataset.precio) - parseFloat(a.dataset.precio));

  // Mostrar/ocultar cards
  cards.forEach(c => {
    c.style.display = 'none';
    c.style.opacity = '0';
    c.style.transform = 'translateY(16px)';
  });

  visible.forEach((c, i) => {
    c.style.display = '';
    // Reordenar en el DOM
    grid.appendChild(c);
    // Animación escalonada
    requestAnimationFrame(() => {
      setTimeout(() => {
        c.style.transition = `opacity 0.35s ease ${i * 0.04}s, transform 0.35s ease ${i * 0.04}s`;
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, 10);
    });
  });

  // Contador y estado vacío
  const total = visible.length;
  if (countEl) countEl.textContent = total + (total === 1 ? ' juego' : ' juegos');
  if (noResults) noResults.style.display = total === 0 ? 'flex' : 'none';

  // Marcar botones activos si hay filtros
  updateFilterBtns();
}

function updateFilterBtns() {
  ['dropGenero','dropPlataforma','dropBadge'].forEach(id => {
    const btn = document.querySelector(`[data-target="${id}"]`);
    const hasActive = document.querySelectorAll(`#${id} input:checked`).length > 0;
    if (btn) btn.classList.toggle('has-filter', hasActive);
  });
  const precioBtn = document.querySelector('[data-target="dropPrecio"]');
  if (precioBtn) precioBtn.classList.toggle('has-filter', getPrecio() !== '');
}

// Escuchar cambios en cualquier input de filtro
document.querySelectorAll('.filter-dropdown input').forEach(input => {
  input.addEventListener('change', applyFilters);
});

// Botón limpiar
document.getElementById('filterReset')?.addEventListener('click', () => {
  document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach(i => i.checked = false);
  const allRadio = document.querySelector('input[name="precio"][value=""]');
  if (allRadio) allRadio.checked = true;
  applyFilters();
});

// Arranque
applyFilters();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.section-header').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
  revealObserver.observe(el);
});

// ===== GAMES DATA (detalles.html) =====
const gamesData = {
  budokai: { title:'BUDOKAI TENKAICHI 3', genre:'Peleas / Anime', year:'2007', platform:'PS2 · Wii', rating:'9.0 / 10', dev:'Spike', img:'media/juegos/budokaitenkaichi3.jpg', desc:`El juego de peleas de Dragon Ball más completo jamás creado. Con más de 170 personajes jugables y combates aéreos llenos de energía, Budokai Tenkaichi 3 sigue siendo el rey de los juegos de anime. Modos historia, torneo, duelo y multijugador en un solo título legendario.`, features:['🐉 +170 personajes jugables','💥 Combate aéreo en 3D','📖 Modo historia completo','🏆 Torneos locales y misiones','🎮 Compatible con mando clásico'] },
  cod:     { title:'CALL OF DUTY', genre:'Acción / FPS', year:'2023', platform:'PC · PS5 · Xbox', rating:'9.2 / 10', dev:'Activision', img:'media/juegos/cod.jpg', desc:`Call of Duty es la saga de shooters en primera persona más vendida de la historia. Con gráficos de última generación y mapas diseñados para el combate táctico, cada entrega supera a la anterior. Enfréntate a jugadores de todo el mundo en modos que van desde el battle royale hasta zombies cooperativo.`, features:['🔫 Multijugador para 100+ jugadores','🧟 Modo Zombies cooperativo','🗺️ +20 mapas al lanzamiento','⚙️ Personalización de armas profunda','🏆 Temporadas de contenido gratuito'] },
  cyberpunk:{ title:'CYBERPUNK 2077', genre:'RPG / Sci-Fi', year:'2020', platform:'PC · PS5 · Xbox', rating:'8.8 / 10', dev:'CD Projekt RED', img:'media/juegos/cyberpunk.jpg', desc:`Sumérgete en Night City, una megalópolis obsesionada con el poder y las modificaciones corporales. Encarnas a V, un mercenario con un implante que contiene la esencia de una leyenda del rock. Tus elecciones moldean la historia en este RPG de mundo abierto sin límites.`, features:['🌆 Night City completamente explorable','🧬 Sistema de ciberimplantes','🎭 Historia con múltiples finales','🎵 Banda sonora dinámica','🤖 Actuaciones de captura de movimiento'] },
  dbd:     { title:'DEAD BY DAYLIGHT', genre:'Survival Horror / Online', year:'2016', platform:'PC · PS5 · Xbox · Móvil', rating:'8.0 / 10', dev:'Behaviour Interactive', img:'media/juegos/deadbydaylight.jpg', desc:`4 supervivientes contra 1 asesino en partidas de terror asimétrico en línea. Con licencias de Freddy Krueger, Michael Myers, Pennywise y más, Dead by Daylight es el multijugador de terror más grande del mundo con millones de jugadores activos.`, features:['🔪 Terror asimétrico 4vs1','👁️ Docenas de asesinos licenciados','🏃 Mecánicas de sigilo y escape','🔧 Generadores, ganchos y portales','🌍 Crossplay entre plataformas'] },
  dmc:     { title:'DEVIL MAY CRY', genre:'Acción / Hack & Slash', year:'2001', platform:'PC · PS4 · Xbox', rating:'8.5 / 10', dev:'Capcom', img:'media/juegos/devilmaycry.jpg', desc:`El origen de la saga más estilizada del hack & slash. Dante combate demonios con pistolas, espada y actitud inigualable. El juego que definió un género entero y convirtió a Dante en uno de los personajes más icónicos de los videojuegos.`, features:['⚔️ Sistema de combate estilizado','🔫 Mezcla de armas y magia','💀 Jefes épicos','🏰 Ambientación gótica','🎯 Sistema de puntuación por estilo'] },
  dmc5:    { title:'DEVIL MAY CRY 5', genre:'Acción / Hack & Slash', year:'2019', platform:'PC · PS5 · Xbox', rating:'9.1 / 10', dev:'Capcom', img:'media/juegos/devilmaycry5.jpg', desc:`La entrega más espectacular de la saga DMC. Tres cazadores de demonios: Nero, Dante y V, con estilos de juego completamente distintos. Gráficos fotorrealistas y un sistema de combate que establece el nuevo estándar del género.`, features:['🎮 3 personajes con estilos únicos','💎 Motor gráfico RE Engine','🦾 Brazo prostético V-Breaker','⚡ Combate calificado por estilo','🎵 Banda sonora de metal épica'] },
  xenoverse:{ title:'DRAGON BALL XENOVERSE', genre:'Peleas / RPG / Anime', year:'2015', platform:'PC · PS4 · Xbox', rating:'8.0 / 10', dev:'Dimps / Bandai Namco', img:'media/juegos/dragonballxenoverse.jpg', desc:`Crea tu propio guerrero Z y viaja en el tiempo para salvar la historia del universo Dragon Ball. Como miembro de la Patrulla del Tiempo, debes corregir los eventos alterados por misteriosas fuerzas. Personaliza tu personaje y aprende habilidades de los guerreros más poderosos.`, features:['🐉 Crea tu guerrero personalizado','⏰ Viajes en el tiempo','💪 Transformaciones y habilidades','🌐 Multijugador online','🎯 +100 personajes del universo DB'] },
  elden:   { title:'ELDEN RING', genre:'Souls-like / RPG', year:'2022', platform:'PC · PS5 · Xbox', rating:'9.6 / 10', dev:'FromSoftware', img:'media/juegos/elden.jpg', desc:`Forja tu leyenda en las Tierras Intermedias en el soulslike definitivo de FromSoftware, con la colaboración del escritor G.R.R. Martin. Un mundo enorme, oscuro y fascinante que redefine el género de acción-RPG con libertad de exploración total.`, features:['🌍 Mundo abierto masivo','⚔️ Combate desafiante y preciso','📜 Narrativa con G.R.R. Martin','🐉 Jefes épicos e imponentes','🤝 Invasiones y cooperativo online'] },
  fortnite:{ title:'FORTNITE', genre:'Battle Royale', year:'2017', platform:'PC · PS5 · Xbox · Móvil', rating:'8.0 / 10', dev:'Epic Games', img:'media/juegos/fortnite.jpg', desc:`El battle royale más popular del mundo con más de 350 millones de jugadores. Cada temporada trae nueva isla, mecánicas inéditas y colaboraciones con marcas icónicas. Construye, dispara y sé el último en pie en cada partida de 100 jugadores.`, features:['🏆 Battle royale para 100 jugadores','🔨 Sistema de construcción único','🎨 Skins y colaboraciones especiales','🗺️ Mapa cambia cada temporada','🆓 Completamente gratuito'] },
  gta:     { title:'GTA VI', genre:'Mundo Abierto / Acción', year:'2025', platform:'PS5 · Xbox Series', rating:'PRE-VENTA', dev:'Rockstar Games', img:'media/juegos/gta.jpg', desc:`El regreso a Vice City más esperado de la historia. GTA VI presenta dos protagonistas jugables y un mundo abierto masivo con tecnología de punta. Caos, crimen y libertad total en la nueva era de Rockstar Games.`, features:['🌆 Vice City completamente rediseñada','👥 Dos protagonistas jugables','🚗 Flota de vehículos enorme','📱 Economía dinámica','🎬 Narrativa cinematográfica'] },
  halo:    { title:'HALO INFINITE', genre:'Acción / FPS', year:'2021', platform:'PC · Xbox', rating:'8.5 / 10', dev:'343 Industries', img:'media/juegos/Halo_Infinite.jpg', desc:`El Jefe Maestro regresa en la entrega más épica de la saga Halo. Campaña épica con mundo semiabierto y multijugador gratuito que rinde homenaje a los clásicos. La lucha contra los Desterrados en Zeta Halo es el mayor desafío del Spartan.`, features:['🪖 Campaña con mundo semiabierto','🎮 Multijugador gratuito','🔧 Pase de batalla por temporadas','🗺️ Mapas icónicos rediseñados','🤝 Cooperativo hasta 4 jugadores'] },
  l4d2:    { title:'LEFT 4 DEAD 2', genre:'Survival / FPS Cooperativo', year:'2009', platform:'PC · Xbox 360', rating:'9.0 / 10', dev:'Valve', img:'media/juegos/left4dead2.jpg', desc:`4 supervivientes contra hordas de infectados en el cooperativo de zombies más intenso jamás hecho. Con 5 campañas largas, tipos de infectados especiales y modo versus, Left 4 Dead 2 sigue siendo el rey del género cooperativo más de una década después.`, features:['🧟 Hordas masivas de infectados','👥 Cooperativo para 4 jugadores','⚔️ Modo versus infectados especiales','🗺️ 5 campañas con múltiples mapas','🔫 +20 armas y modificadores'] },
  mvc:     { title:'MARVEL VS CAPCOM', genre:'Peleas / Crossover', year:'1998', platform:'Arcade · PS · PC', rating:'8.8 / 10', dev:'Capcom', img:'media/juegos/marvelvscapcom.jpg', desc:`Los héroes de Marvel y los iconos de Capcom frente a frente en el crossover de peleas definitivo. Spider-Man, Ryu, Wolverine, Mega Man y muchos más en combates de equipo frenéticos. Un clásico atemporal que definió el género de los juegos de peleas crossover.`, features:['🦸 Personajes de Marvel y Capcom','⚡ Sistema de combate en equipos','💥 Súper golpes espectaculares','🎮 Jugabilidad accesible y profunda','🏆 Modo arcade y versus local'] },
  minecraft:{ title:'MINECRAFT', genre:'Sandbox / Aventura', year:'2011', platform:'PC · Móvil · Consolas', rating:'9.5 / 10', dev:'Mojang Studios', img:'media/juegos/minecraft.jpg', desc:`Minecraft es el juego más vendido de la historia. En un mundo generado por bloques infinitos, puedes construir cualquier cosa, explorar cuevas llenas de recursos y criaturas, sobrevivir noches plagadas de monstruos o crear libremente sin límites.`, features:['🏗️ Construcción sin límites','⛏️ Extracción y crafteo','👾 Modo supervivencia','🌍 Servidores multijugador masivos','🎮 Compatible con mods'] },
  rdr2:    { title:'RED DEAD REDEMPTION 2', genre:'Western / Aventura', year:'2018', platform:'PC · PS4 · Xbox One', rating:'9.7 / 10', dev:'Rockstar Games', img:'media/juegos/read.jpg', desc:`La historia de Arthur Morgan en el ocaso del viejo oeste americano. Una narrativa cinematográfica sin igual en un mundo abierto vivo y detallado como ningún otro. Red Dead Redemption 2 es una obra maestra técnica y artística del videojuego moderno.`, features:['🤠 Historia épica del viejo oeste','🐴 Mundo abierto con clima dinámico','🎯 Sistema de honor y reputación','🏕️ Vida en pandilla','🌐 Red Dead Online multijugador'] },
  rerequiem:{ title:'RESIDENT EVIL: REQUIEM', genre:'Survival Horror', year:'2025', platform:'PC · PS5 · Xbox Series', rating:'NUEVO', dev:'Capcom', img:'media/juegos/resident-evil-requiem.jpg', desc:`La nueva pesadilla de la saga más icónica del survival horror regresa con todo. Resident Evil: Requiem lleva el terror a nuevos niveles con tecnología de última generación, nuevos protagonistas y una amenaza biológica que pondrá a prueba todos tus límites.`, features:['😱 Terror en primera persona','🧬 Nueva amenaza biológica','🔦 Ambientes oscuros y opresivos','🎮 Gestión de recursos','🌍 Historia conectada con la saga'] },
  re2:     { title:'RESIDENT EVIL 2', genre:'Survival Horror', year:'2019', platform:'PC · PS4 · Xbox One', rating:'9.4 / 10', dev:'Capcom', img:'media/juegos/residentevil2.jpg', desc:`El remake definitivo del clásico survival horror de 1998. Leon S. Kennedy y Claire Redfield atrapados en Raccoon City con el implacable Mr. X persiguiéndolos sin descanso. Terror puro en uno de los mejores remakes de la historia del videojuego.`, features:['👮 Dos campañas: Leon y Claire','🏥 Raccoon City recreada','💀 Mr. X como enemigo implacable','🔫 Gestión estratégica de munición','🎨 Gráficos fotorrealistas RE Engine'] },
  re3:     { title:'RESIDENT EVIL 3', genre:'Survival Horror', year:'2020', platform:'PC · PS4 · Xbox One', rating:'8.5 / 10', dev:'Capcom', img:'media/juegos/residentevil3.jpg', desc:`Jill Valentine huye de Nemesis en las calles de Raccoon City en llamas. El remake de uno de los clásicos más amados de la saga Resident Evil. Pánico, adrenalina y horror puro con un antagonista que no te dejará respirar.`, features:['🏃 Mecánica de esquiva y carrera','👾 Nemesis como antagonista dinámico','💣 Arsenal amplio y modificable','🌆 Raccoon City en llamas','🤝 Modo Resistance incluido'] },
  roblox:  { title:'ROBLOX', genre:'Plataforma / Sandbox', year:'2006', platform:'PC · Móvil · Xbox · PS', rating:'8.0 / 10', dev:'Roblox Corporation', img:'media/juegos/roblox.jpg', desc:`Miles de juegos creados por usuarios en una sola plataforma. Roblox es un universo donde puedes jugar experiencias de todos los géneros, crear tus propios mundos con Lua y compartirlos con millones de jugadores de todo el mundo.`, features:['🌍 Millones de juegos de usuarios','🔨 Editor de mundos completo','👕 Personalización de avatar','💰 Economía virtual con Robux','🤝 Social y multijugador'] },
  sh2:     { title:'SILENT HILL 2', genre:'Survival Horror / Psicológico', year:'2024', platform:'PC · PS5', rating:'9.0 / 10', dev:'Bloober Team / Konami', img:'media/juegos/silenthill2.jpg', desc:`El remake del horror psicológico más perturbador de la historia. James Sunderland regresa a la niebla de Silent Hill tras recibir una carta de su esposa fallecida. Una experiencia que explora el trauma, la culpa y los miedos más profundos del ser humano.`, features:['🌫️ Silent Hill con Unreal Engine 5','👁️ Pirámide y monstruos rediseñados','🧠 Horror psicológico profundo','🔦 Exploración en tercera persona','🎵 Banda sonora de Akira Yamaoka'] },
  shf:     { title:'SILENT HILL f', genre:'Survival Horror / Psicológico', year:'2025', platform:'PC · PS5 · Xbox Series', rating:'NUEVO', dev:'NeoBards / Konami', img:'media/juegos/silenthillf.jpg', desc:`La nueva pesadilla de Silent Hill ambientada en el Japón rural de los años 60. Una historia de terror floral y oscuridad que protagoniza Shimizu Hinako, una joven que debe enfrentarse a una realidad distorsionada llena de flores y horror.`, features:['🌸 Ambientación japonesa años 60','🌿 Terror floral y orgánico','👩 Nueva protagonista original','🎭 Horror psicológico cultural','🎮 Perspectiva en tercera persona'] },
  theforest:{ title:'THE FOREST', genre:'Survival Horror / Sandbox', year:'2018', platform:'PC · PS4', rating:'8.5 / 10', dev:'Endnight Games', img:'media/juegos/theforest.jpg', desc:`Sobrevive en un bosque misterioso habitado por caníbales mutantes después de un accidente aéreo. Construye refugios, fabrica armas, caza animales y descubre los perturbadores secretos bajo la superficie del bosque. Solo o cooperativo con amigos.`, features:['🌲 Bosque abierto con secretos','🏕️ Construcción de bases compleja','🐗 Caza y recolección de recursos','🧟 Caníbales con IA dinámica','🤝 Cooperativo online hasta 8 jugadores'] },
  witcher: { title:'THE WITCHER 3', genre:'RPG / Fantasía', year:'2015', platform:'PC · PS5 · Xbox · Switch', rating:'9.8 / 10', dev:'CD Projekt RED', img:'media/juegos/thewitcher3.jpg', desc:`Geralt de Rivia en la aventura RPG más aclamada de la historia. Con más de 200 horas de contenido, decisiones morales complejas y un mundo vivo lleno de detalles, The Witcher 3 sigue siendo el estándar de oro del RPG de mundo abierto.`, features:['🗡️ +200 horas de contenido','🌳 Mundo abierto masivo','⚖️ Decisiones con consecuencias reales','🧙 Sistema de alquimia y combate','📖 Dos expansiones de gran calidad'] }
};

if (document.body.classList.contains('page-detalles')) {
  const params  = new URLSearchParams(window.location.search);
  const gameKey = params.get('game') || 'cod';
  const data    = gamesData[gameKey] || gamesData['cod'];
  document.title = `JUEGOS — ${data.title}`;
  document.getElementById('detail-title').textContent    = data.title;
  document.getElementById('detail-genre').textContent    = data.genre;
  document.getElementById('detail-genre2').textContent   = data.genre;
  document.getElementById('detail-year').textContent     = `📅 ${data.year}`;
  document.getElementById('detail-year2').textContent    = data.year;
  document.getElementById('detail-platform').textContent = `🎮 ${data.platform}`;
  document.getElementById('detail-rating').textContent   = `⭐ ${data.rating}`;
  document.getElementById('detail-dev').textContent      = data.dev;
  document.getElementById('detail-desc').textContent     = data.desc;
  document.getElementById('detail-banner').src           = data.img;
  document.getElementById('sidebar-img').src             = data.img;
  const fl = document.getElementById('detail-features');
  fl.innerHTML = '';
  data.features.forEach(f => { const li = document.createElement('li'); li.textContent = f; fl.appendChild(li); });
}