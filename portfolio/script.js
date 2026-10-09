(function () {
  'use strict';

  /* Year */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });

  /* Scroll reveal */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* Contact links (from config.js — only filled fields are shown) */
  var c = window.CONTACT || {};
  var box = document.getElementById('contact-links');
  var count = 0;
  function add(label, href, ext) {
    var a = document.createElement('a');
    a.className = 'btn btn-line'; a.textContent = label; a.href = href;
    if (ext) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    box.appendChild(a); count++;
  }
  if (c.email) add('Email', 'mailto:' + c.email, false);
  if (c.github) add('GitHub', c.github, true);
  if (c.linkedin) add('LinkedIn', c.linkedin, true);
  if (!count) document.getElementById('contact-note').hidden = false;

  /* Photo fallback if the image file is missing */
  var img = document.querySelector('.arch img');
  img.addEventListener('error', function () { img.style.display = 'none'; });

  /* ---- 3D hero object ---- */
  var canvas = document.getElementById('three');
  var cube = document.getElementById('cube');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function useFallback() {
    canvas.style.display = 'none';
    cube.hidden = false;
    var s = cube.offsetWidth || 110;
    cube.style.setProperty('--s', s + 'px');
    window.addEventListener('resize', function () { cube.style.setProperty('--s', cube.offsetWidth + 'px'); });
  }

  function start() {
    if (!window.THREE) return useFallback();
    var THREE = window.THREE, renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) { return useFallback(); }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    /* Soft studio environment built from the palette, so the metal has real reflections */
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x302C28);
    function panel(color, intensity, w, h, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
    }
    panel(0xFFFCF7, 3.2, 8, 5, -6, 5, 6);
    panel(0xF5F0E8, 2.0, 6, 6, 7, 2, 4);
    panel(0xE8DFD2, 1.4, 10, 3, 0, -6, 3);
    panel(0x47413A, 1.0, 10, 10, 0, 3, -8);
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;

    scene.add(new THREE.AmbientLight(0xF5F0E8, 0.35));
    var key = new THREE.DirectionalLight(0xFFFCF7, 1.6); key.position.set(-4, 5, 6); scene.add(key);
    var rim = new THREE.DirectionalLight(0xE8DFD2, 0.9); rim.position.set(5, -2, -4); scene.add(rim);

    var knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.34, 220, 36, 2, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0x302C28, metalness: 0.85, roughness: 0.22,
        clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 1.25
      })
    );
    var holder = new THREE.Group();
    holder.add(knot);
    holder.position.set(1.9, -1.55, 0);
    scene.add(holder);

    var mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      var narrow = window.innerWidth < 860;
      holder.position.set(narrow ? 1.7 : 1.9, narrow ? -1.5 : -1.55, 0);
      holder.scale.setScalar(narrow ? 0.9 : 1);
    }
    resize();
    window.addEventListener('resize', resize);

    var visible = true, last = performance.now(), running = false;
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !running) { last = performance.now(); loop(last); }
    }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && visible && !running) { last = performance.now(); loop(last); }
    });

    var speed = reduce ? 0.12 : 0.45; /* radians per second — continuous 360° rotation */
    function loop(now) {
      if (!visible || document.hidden) { running = false; return; }
      running = true;
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      knot.rotation.y += dt * speed;
      knot.rotation.x += dt * speed * 0.35;
      holder.rotation.y += ((mx * 0.5) - holder.rotation.y) * 0.04;
      holder.rotation.x += ((my * 0.4) - holder.rotation.x) * 0.04;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* three.js is loaded with defer from a CDN; wait for it, then fall back if it never arrives */
  var tries = 0;
  (function wait() {
    if (window.THREE) return start();
    if (++tries > 60) return useFallback();
    setTimeout(wait, 100);
  })();
})();
