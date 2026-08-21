(function () {
  'use strict';

  const DATA = window.NAJUMMA_DATA;
  const params = new URLSearchParams(location.search);
  const view = document.body.dataset.view;
  const id = params.get('id');

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function renderNotFound(root) {
    root.innerHTML = `
      <section class="not-found">
        <p class="eyebrow">404 · ARCHIVE NOT FOUND</p>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <a class="gold-button" href="index.html">메인으로 돌아가기</a>
      </section>`;
  }

  function characterLink(personId, compact = false) {
    const p = DATA.people[personId];
    return `<a class="member-card${compact ? ' compact' : ''}" href="profile.html?id=${personId}">
      <span class="member-no">${p.no}</span>
      <span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.en)} · ${escapeHtml(p.role)}</small></span>
      <em>${p.animal}</em><i>↗</i>
    </a>`;
  }

  function renderCompany() {
    const root = document.getElementById('page-root');
    const company = DATA.companies[id];
    if (!company) return renderNotFound(root);
    document.title = `${company.name} · 나 같은 아줌마가 뭐가 좋다고`;
    root.innerHTML = `
      <section class="company-hero detail-hero">
        <div class="ornament-circle" aria-hidden="true"></div>
        <p class="detail-label">${escapeHtml(company.label)} · COMPANY ARCHIVE</p>
        <h1>${escapeHtml(company.name)}</h1>
        <p class="company-ko">${escapeHtml(company.ko)}</p>
        <p class="company-motto">“${escapeHtml(company.motto)}”</p>
        <span class="company-type">${escapeHtml(company.type)}</span>
      </section>
      <section class="detail-content">
        <div class="story-block">
          <p class="eyebrow">About</p>
          <h2>${escapeHtml(company.ko)}에 대하여</h2>
          <p>${escapeHtml(company.description)}</p>
        </div>
        <dl class="fact-list">
          ${company.facts.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
        </dl>
        <div class="related-block">
          <p class="eyebrow">People</p>
          <h2>소속 인물</h2>
          <div class="member-grid">${company.members.map(member => characterLink(member)).join('')}</div>
        </div>
      </section>
      <nav class="bottom-nav"><a href="index.html">← MAIN</a><a href="index.html#people-title">PEOPLE →</a></nav>`;
  }

  function renderProfile() {
    const root = document.getElementById('page-root');
    const p = DATA.people[id];
    if (!p) return renderNotFound(root);
    document.title = `${p.name} · 나 같은 아줌마가 뭐가 좋다고`;
    root.innerHTML = `
      <section class="profile-hero detail-hero">
        <div class="profile-watermark" aria-hidden="true">${escapeHtml(p.no)}</div>
        <p class="detail-label">CHARACTER ARCHIVE · ${escapeHtml(p.no)}</p>
        <div class="animal-mark" aria-hidden="true">${p.animal}</div>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="profile-en">${escapeHtml(p.en)}</p>
        <div class="profile-role"><span>${escapeHtml(p.affiliation)}</span><i></i><b>${escapeHtml(p.role)}</b></div>
        <div class="keyword-row">${p.keywords.map(word => `<span>${escapeHtml(word)}</span>`).join('')}</div>
      </section>
      <section class="detail-content profile-content">
        <div class="identity-grid">
          <div><span>BIRTH</span><b>${escapeHtml(p.birth)}</b><small>${escapeHtml(p.age)}</small></div>
          <div><span>TYPE</span><b>${escapeHtml(p.mbti)}</b><small>${escapeHtml(p.nationality)}</small></div>
          <div><span>HEIGHT</span><b>${escapeHtml(p.height)}</b><small>PROFILE</small></div>
        </div>
        <div class="story-block">
          <p class="eyebrow">Story</p>
          <h2>그녀가 살아온 방식</h2>
          <p>${escapeHtml(p.bio)}</p>
        </div>
        <div class="appearance-block">
          <span>APPEARANCE</span>
          <p>${escapeHtml(p.look)}</p>
        </div>
        <p class="profile-note">${escapeHtml(p.note)}</p>
        ${p.company ? `<a class="gold-button wide" href="company.html?id=${p.company}">${escapeHtml(DATA.companies[p.company].name)} 보러가기 <span>↗</span></a>` : ''}
      </section>
      <nav class="bottom-nav">
        <a href="profile.html?id=${previousPerson(id)}">← PREV</a>
        <a href="index.html#people-title">ALL PEOPLE</a>
        <a href="profile.html?id=${nextPerson(id)}">NEXT →</a>
      </nav>`;
  }

  function previousPerson(current) {
    const keys = Object.keys(DATA.people);
    return keys[(keys.indexOf(current) - 1 + keys.length) % keys.length];
  }

  function nextPerson(current) {
    const keys = Object.keys(DATA.people);
    return keys[(keys.indexOf(current) + 1) % keys.length];
  }

  if (view === 'company') renderCompany();
  if (view === 'profile') renderProfile();

  const TRACKS = {
    main: { src: 'assets/audio/glass-and-gold.mp3', title: 'GLASS AND GOLD', subtitle: 'MAIN THEME' },
    yuna: { src: 'assets/audio/jung-yuna.mp3', title: 'JUNG YUNA', subtitle: 'CHARACTER THEME' }
  };

  const trackKey = view === 'profile' && id === 'yuna' ? 'yuna' : 'main';
  const track = TRACKS[trackKey];

  function createPlayer() {
    const shell = document.createElement('aside');
    shell.className = 'music-player';
    shell.setAttribute('aria-label', '뮤직 플레이어');
    shell.innerHTML = `
      <audio id="site-audio" preload="auto" loop src="${track.src}"></audio>
      <button class="play-toggle" type="button" aria-label="재생 또는 일시정지"><span class="play-icon">▶</span></button>
      <div class="track-meta"><span>${track.subtitle}</span><b>${track.title}</b></div>
      <div class="progress-wrap"><input class="progress" type="range" min="0" max="100" value="0" step="0.1" aria-label="재생 위치"></div>
      <div class="volume-wrap">
        <button class="mute-toggle" type="button" aria-label="음소거">◖</button>
        <input class="volume" type="range" min="0" max="1" value="0.65" step="0.01" aria-label="볼륨 조절">
      </div>`;
    document.body.appendChild(shell);

    const audio = shell.querySelector('#site-audio');
    const playButton = shell.querySelector('.play-toggle');
    const playIcon = shell.querySelector('.play-icon');
    const progress = shell.querySelector('.progress');
    const volume = shell.querySelector('.volume');
    const mute = shell.querySelector('.mute-toggle');
    const storedVolume = Number(localStorage.getItem('najumma-volume'));
    audio.volume = Number.isFinite(storedVolume) ? Math.min(1, Math.max(0, storedVolume)) : 0.65;
    volume.value = audio.volume;

    function syncPlayState() {
      const playing = !audio.paused;
      playIcon.textContent = playing ? 'Ⅱ' : '▶';
      shell.classList.toggle('is-playing', playing);
    }

    function playAudio() {
      const attempt = audio.play();
      if (attempt) attempt.then(syncPlayState).catch(() => {
        shell.classList.add('needs-interaction');
        syncPlayState();
      });
    }

    playButton.addEventListener('click', () => audio.paused ? playAudio() : audio.pause());
    audio.addEventListener('play', syncPlayState);
    audio.addEventListener('pause', syncPlayState);
    audio.addEventListener('loadedmetadata', () => {
      const saved = Number(sessionStorage.getItem(`najumma-time-${trackKey}`));
      if (Number.isFinite(saved) && saved > 0 && saved < audio.duration) audio.currentTime = saved;
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
    });
    progress.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    });
    volume.addEventListener('input', () => {
      audio.volume = Number(volume.value);
      audio.muted = false;
      localStorage.setItem('najumma-volume', String(audio.volume));
      mute.textContent = audio.volume === 0 ? '×' : '◖';
    });
    mute.addEventListener('click', () => {
      audio.muted = !audio.muted;
      mute.textContent = audio.muted ? '×' : '◖';
    });
    window.addEventListener('pagehide', () => {
      sessionStorage.setItem(`najumma-time-${trackKey}`, String(audio.currentTime));
    });

    playAudio();
    document.addEventListener('pointerdown', event => {
      if (event.target.closest('.music-player')) return;
      if (audio.paused && shell.classList.contains('needs-interaction')) {
        shell.classList.remove('needs-interaction');
        playAudio();
      }
    }, { once: true });
  }

  createPlayer();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.content-section, .story-block, .fact-list, .related-block').forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
})();
