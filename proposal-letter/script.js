(() => {
  const $ = id => document.getElementById(id);
  const bow = $('bow'), arrow = $('arrow'), seal = $('seal'), env = $('envelope');
  const flyArrow = $('flyArrow'), win = $('window'), content = $('content');
  const yes = $('yes'), no = $('no'), actions = $('actions'), msg = $('message');

  /* ---------- background hearts ---------- */
  const bg = $('heartsBg');
  for (let i = 0; i < 26; i++) {
    const h = document.createElement('i');
    h.textContent = Math.random() > .5 ? '♥' : '·';
    h.style.left = Math.random() * 100 + '%';
    h.style.top = (100 + Math.random() * 20) + 'vh';
    h.style.fontSize = (6 + Math.random() * 10) + 'px';
    h.style.animationDuration = (12 + Math.random() * 18) + 's';
    h.style.animationDelay = (-Math.random() * 25) + 's';
    bg.appendChild(h);
  }

  /* ---------- pixel cat (SVG built from a map) ---------- */
  const rows = [
    ".BB........BB.",".BBB......BBB.",".BBBBBBBBBBBB.","BBBBBBBBBBBBBB",
    "BBWWWBBBBWWWBB","BBWBWBBBBWBWBB","BBWWWBBBBWWWBB","BBBBBBBBBBBBBB",
    "BBBBRRBBRRBBBB","BBBRRRRRRRRBBB",".BBRRRRRRRRBB.","..BBRRRRRRBB..",
    "...BBBRRBBB...","....BBBBBB...."
  ];
  const happyRows = rows.slice();
  happyRows[4] = "BBBBBBBBBBBBBB"; happyRows[5] = "BBWWWBBBBWWWBB"; happyRows[6] = "BBBBBBBBBBBBBB";
  const colors = { B: '#1b1b1f', W: '#fff', R: '#e8243c' };
  function catSVG(map) {
    let r = '';
    map.forEach((row, y) => [...row].forEach((c, x) => {
      if (c !== '.') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${colors[c]}"/>`;
    }));
    return `<svg viewBox="0 0 14 14">${r}</svg>`;
  }
  $('cat').innerHTML = catSVG(rows);

  /* ---------- bow & arrow ---------- */
  let drawing = false, startY = 0, pull = 0, opened = false;

  bow.addEventListener('pointerdown', e => {
    if (opened) return;
    drawing = true; startY = e.clientY; bow.setPointerCapture(e.pointerId);
    arrow.classList.add('is-drawn'); bow.style.cursor = 'grabbing';
  });
  bow.addEventListener('pointermove', e => {
    if (!drawing) return;
    pull = Math.max(0, Math.min(60, e.clientY - startY + 0)); // drag downward to pull back
    arrow.style.transform = `translate(-50%, ${pull}px)`;
    $('bowString').style.transform = `scaleY(1) translateY(${pull * .6}px)`;
  });
  const release = () => {
    if (!drawing) return;
    drawing = false; bow.style.cursor = 'grab';
    $('bowString').style.transform = '';
    shoot(pull);
    pull = 0; arrow.style.transform = ''; arrow.classList.remove('is-drawn');
  };
  bow.addEventListener('pointerup', release);
  bow.addEventListener('pointercancel', release);

  function shoot(power) {
    const a = arrow.getBoundingClientRect(), s = seal.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top;
    const tx = s.left + s.width / 2, ty = s.top + s.height / 2;
    // weak pull falls short; strong pull hits the heart seal
    const hit = power > 25;
    const endY = hit ? ty : sy - 120 - power * 2;
    const endX = hit ? tx : sx + (Math.random() - .5) * 40;
    const angle = Math.atan2(endX - sx, sy - endY) * 180 / Math.PI;
    Object.assign(flyArrow.style, {
      display: 'block', left: sx + 'px', top: sy + 'px', transition: 'none',
      transform: `rotate(${angle}deg) translateY(-50px)`
    });
    flyArrow.getBoundingClientRect();
    flyArrow.style.transition = 'left .5s ease-in, top .5s ease-in, opacity .3s .45s';
    flyArrow.style.left = endX + 'px'; flyArrow.style.top = endY + 'px';
    setTimeout(() => {
      flyArrow.style.display = 'none'; flyArrow.style.opacity = 1;
      if (hit) openLetter();
      else { env.classList.add('shake'); setTimeout(() => env.classList.remove('shake'), 400); $('hint').textContent = 'Pull the bow back a little more ♡'; }
    }, 520);
  }

  function openLetter() {
    opened = true; env.classList.add('is-hit'); burst(seal.getBoundingClientRect(), 10);
    setTimeout(() => { document.body.classList.add('is-open'); win.classList.add('is-open'); }, 650);
  }

  /* ---------- NO button runs away ---------- */
  let dodges = 0;
  function dodge() {
    const box = actions.getBoundingClientRect();
    const maxX = actions.clientWidth - no.offsetWidth - 6;
    const x = Math.random() * maxX;
    const y = Math.random() * 14 + 2;
    no.style.left = x + 'px'; no.style.top = y + 'px';
    dodges++;
    yes.style.transform = `scale(${Math.min(1 + dodges * .12, 1.7)})`;
    if (dodges === 3) msg.innerHTML = 'Are you sure? ♡<br>Try YES...';
  }
  ['pointerenter', 'pointerdown', 'touchstart'].forEach(ev =>
    no.addEventListener(ev, e => { e.preventDefault(); dodge(); }, { passive: false }));

  /* ---------- YES ---------- */
  yes.addEventListener('click', () => {
    content.classList.add('is-won');
    msg.innerHTML = 'Yayyy! I knew it ♡';
    $('cat').innerHTML = catSVG(happyRows);
    burst(yes.getBoundingClientRect(), 22);
    setInterval(() => burst(win.getBoundingClientRect(), 3), 900);
  });

  function burst(rect, n) {
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'pop'; p.textContent = ['♥', '♡', '💗'][i % 3];
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.color = ['#e8243c', '#ff7a93', '#b79cff'][i % 3];
      p.style.setProperty('--dx', (Math.random() - .5) * 260 + 'px');
      p.style.setProperty('--dy', (-40 - Math.random() * 200) + 'px');
      document.body.appendChild(p); setTimeout(() => p.remove(), 1200);
    }
  }
})();
