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
      <i>↗</i>
    </a>`;
  }

  function renderPastStory(personId) {
    const story = window.NAJUMMA_STORIES && window.NAJUMMA_STORIES[personId];
    if (!story) return '';
    return `
      <section class="past-story-section">
        <p class="eyebrow">Past story</p>
        <h2>${escapeHtml(DATA.people[personId].name)}의 이야기</h2>
        <details class="novel-reader">
          <summary>
            <span><b>${escapeHtml(story.title)}</b></span>
            <i><span class="reader-open">READ</span><span class="reader-close">CLOSE</span> ＋</i>
          </summary>
          <article>
            <header>
              <h3>${escapeHtml(story.title)}</h3>
              <span></span>
            </header>
            ${story.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            <footer>— END —</footer>
          </article>
        </details>
      </section>`;
  }

  function renderInventory(person) {
    const items = person.inventory || [];
    if (!items.length) return '';
    return `
      <section class="inventory-section">
        <div class="inventory-heading">
          <div><p class="eyebrow">Personal archive</p><h2>인벤토리</h2></div>
          <span>${String(items.length).padStart(2, '0')} ITEMS</span>
        </div>
        <p class="inventory-guide">아이템을 누르면 원본 이미지를 크게 볼 수 있습니다.</p>
        <div class="inventory-grid${items.length === 1 ? ' single' : ''}">
          ${items.map((item, index) => `
            <button class="inventory-item" type="button" data-full="${escapeHtml(item.image)}" data-title="${escapeHtml(item.name)}" data-type="${escapeHtml(item.type)}">
              <span class="inventory-thumb"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(person.name)} ${escapeHtml(item.name)}" loading="lazy"></span>
              <span class="inventory-meta"><small>${String(index + 1).padStart(2, '0')} · ${escapeHtml(item.type)}</small><b>${escapeHtml(item.name)}</b></span>
              <i>＋</i>
            </button>`).join('')}
        </div>
      </section>`;
  }

  function setupInventoryModal() {
    const triggers = document.querySelectorAll('.inventory-item');
    if (!triggers.length) return;
    const modal = document.createElement('div');
    modal.className = 'inventory-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '인벤토리 이미지 크게 보기');
    modal.innerHTML = `
      <button class="modal-close" type="button" aria-label="닫기">×</button>
      <div class="modal-figure"><img alt=""><div><small></small><b></b></div></div>`;
    document.body.appendChild(modal);
    const image = modal.querySelector('img');
    const type = modal.querySelector('small');
    const title = modal.querySelector('b');
    const close = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      setTimeout(() => { image.src = ''; }, 260);
    };
    triggers.forEach(trigger => trigger.addEventListener('click', () => {
      image.src = trigger.dataset.full;
      image.alt = trigger.dataset.title;
      type.textContent = trigger.dataset.type;
      title.textContent = trigger.dataset.title;
      modal.classList.add('open');
      document.body.classList.add('modal-open');
      modal.querySelector('.modal-close').focus();
    }));
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) close(); });
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
        <p class="detail-label">${escapeHtml(p.titleEn)}</p>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="profile-en">${escapeHtml(p.en)}</p>
      </section>
      <section class="detail-content profile-content">
        <div class="identity-grid">
          <div><span>BIRTH</span><b>${escapeHtml(p.birth)}</b><small>${escapeHtml(p.age)}</small></div>
          <div><span>TYPE</span><b>${escapeHtml(p.mbti)}</b><small>${escapeHtml(p.nationality)}</small></div>
          <div><span>HEIGHT</span><b>${escapeHtml(p.height)}</b><small>PROFILE</small></div>
        </div>
        <div class="story-block profile-bio">
          <p>${escapeHtml(p.bio)}</p>
        </div>
        <div class="appearance-block">
          <span>APPEARANCE</span>
          <p>${escapeHtml(p.look)}</p>
        </div>
        <p class="profile-note">${escapeHtml(p.note)}</p>
        ${renderPastStory(id)}
        ${renderInventory(p)}
      </section>
      <nav class="bottom-nav">
        <a href="profile.html?id=${previousPerson(id)}">← PREV</a>
        <a href="index.html#people-title">ALL PEOPLE</a>
        <a href="profile.html?id=${nextPerson(id)}">NEXT →</a>
      </nav>`;
    setupInventoryModal();
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
    main: { src: 'assets/audio/lumen.mp3', title: 'LUMEN', subtitle: 'MAIN THEME' },
    yurim: { src: 'assets/audio/cha-yulim.mp3', title: 'CHA YULIM', subtitle: 'CHARACTER THEME' },
    livia: { src: 'assets/audio/livia-conti.mp3', title: 'LIVIA CONTI', subtitle: 'CHARACTER THEME' },
    jian: { src: 'assets/audio/oh-jian.mp3', title: 'OH JIAN', subtitle: 'CHARACTER THEME' },
    yuna: { src: 'assets/audio/jung-yoonah.mp3', title: 'JUNG YOONAH', subtitle: 'CHARACTER THEME' }
  };

  const trackKey = view === 'profile' && TRACKS[id] ? id : 'main';
  const track = TRACKS[trackKey];

  const pageCurtain = document.getElementById('page-curtain');
  const uncoverPage = () => {
    pageCurtain.classList.remove('is-covering');
    document.body.classList.remove('modal-open');
  };
  requestAnimationFrame(() => requestAnimationFrame(uncoverPage));
  window.addEventListener('pageshow', () => requestAnimationFrame(uncoverPage));
  window.addEventListener('popstate', uncoverPage);

  function createPlayer() {
    const shell = document.createElement('aside');
    shell.className = 'music-player';
    shell.setAttribute('aria-label', '뮤직 플레이어');
    shell.innerHTML = `
      <audio id="site-audio" preload="auto" autoplay loop playsinline src="${track.src}"></audio>
      <button class="play-toggle" type="button" aria-label="재생 또는 일시정지"><span class="play-icon">▶</span></button>
      <div class="track-meta"><span>${track.subtitle}</span><b>${track.title}</b></div>
      <div class="progress-wrap"><input class="progress" type="range" min="0" max="100" value="0" step="0.1" aria-label="재생 위치"></div>
      <div class="volume-wrap">
        <button class="mute-toggle" type="button" aria-label="음소거">◖</button>
        <input class="volume" type="range" min="0" max="1" value="0.5" step="0.01" aria-label="볼륨 조절">
      </div>`;
    document.body.appendChild(shell);

    const audio = shell.querySelector('#site-audio');
    const playButton = shell.querySelector('.play-toggle');
    const playIcon = shell.querySelector('.play-icon');
    const progress = shell.querySelector('.progress');
    const volume = shell.querySelector('.volume');
    const mute = shell.querySelector('.mute-toggle');
    const storedVolumeValue = localStorage.getItem('najumma-volume-v2');
    const storedVolume = Number(storedVolumeValue);
    let targetVolume = storedVolumeValue !== null && Number.isFinite(storedVolume) ? Math.min(1, Math.max(0, storedVolume)) : 0.5;
    let fadeFrame = null;
    audio.volume = 0;
    audio.playsInline = true;
    audio.autoplay = true;
    volume.value = targetVolume;

    function fadeTo(value, duration = 650) {
      if (fadeFrame) cancelAnimationFrame(fadeFrame);
      const from = audio.volume;
      const to = Math.min(1, Math.max(0, value));
      const started = performance.now();
      return new Promise(resolve => {
        const step = now => {
          const progressValue = Math.min(1, (now - started) / duration);
          const eased = progressValue * progressValue * (3 - 2 * progressValue);
          audio.volume = from + ((to - from) * eased);
          if (progressValue < 1) fadeFrame = requestAnimationFrame(step);
          else {
            fadeFrame = null;
            resolve();
          }
        };
        fadeFrame = requestAnimationFrame(step);
      });
    }

    function syncPlayState() {
      const playing = !audio.paused;
      playIcon.textContent = playing ? 'Ⅱ' : '▶';
      shell.classList.toggle('is-playing', playing);
    }

    async function unlockSound() {
      audio.muted = false;
      try {
        if (audio.paused) await audio.play();
        shell.classList.remove('needs-interaction');
        await fadeTo(targetVolume, 1600);
      } catch (error) {
        shell.classList.add('needs-interaction');
      }
      syncPlayState();
    }

    async function playAudio() {
      audio.muted = false;
      try {
        await audio.play();
        shell.classList.remove('needs-interaction');
        fadeTo(targetVolume, 1800);
      } catch (error) {
        audio.muted = true;
        try {
          await audio.play();
          shell.classList.add('needs-interaction');
        } catch (mutedError) {
          shell.classList.add('needs-interaction');
        }
      }
      syncPlayState();
    }

    playButton.addEventListener('click', () => {
      if (audio.muted || shell.classList.contains('needs-interaction')) return unlockSound();
      if (audio.paused) return playAudio();
      audio.pause();
    });
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
      targetVolume = Number(volume.value);
      audio.volume = targetVolume;
      audio.muted = false;
      shell.classList.remove('needs-interaction');
      localStorage.setItem('najumma-volume-v2', String(targetVolume));
      mute.textContent = targetVolume === 0 ? '×' : '◖';
    });
    mute.addEventListener('click', () => {
      if (audio.muted) {
        mute.textContent = '◖';
        unlockSound();
      } else {
        audio.muted = true;
        mute.textContent = '×';
      }
    });
    window.addEventListener('pagehide', () => {
      sessionStorage.setItem(`najumma-time-${trackKey}`, String(audio.currentTime));
    });

    playAudio();
    document.addEventListener('pointerdown', event => {
      if (event.target.closest('.music-player')) return;
      if (audio.muted || audio.paused || shell.classList.contains('needs-interaction')) unlockSound();
    }, { once: true });

    let isNavigating = false;
    window.addEventListener('pageshow', event => {
      isNavigating = false;
      pageCurtain.classList.remove('is-covering');
      if (!event.persisted) return;
      if (audio.paused) playAudio();
      else fadeTo(targetVolume, 900);
    });
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const destination = new URL(link.href, location.href);
      if (destination.origin !== location.origin || link.target === '_blank' || link.hasAttribute('download')) return;
      if (destination.pathname === location.pathname && destination.search === location.search && destination.hash) return;
      event.preventDefault();
      if (isNavigating) return;
      isNavigating = true;
      sessionStorage.setItem(`najumma-time-${trackKey}`, String(audio.currentTime));
      pageCurtain.classList.add('is-covering');
      fadeTo(0, 1250).then(() => { location.href = destination.href; });
    });
  }

  createPlayer();

  const motionSelectors = [
    '.site-header > *',
    '.section-heading > *',
    '.portal-card',
    '.character-link',
    '.site-footer > *',
    '.detail-hero > *',
    '.story-block > *',
    '.fact-list > div',
    '.related-block > *',
    '.member-card',
    '.identity-grid > div',
    '.appearance-block > *',
    '.profile-note',
    '.gold-button',
    '.past-story-section > .eyebrow',
    '.past-story-section > h2',
    '.novel-reader',
    '.inventory-heading',
    '.inventory-guide',
    '.inventory-item',
    '.bottom-nav > a'
  ];
  const motionTargets = [...new Set(document.querySelectorAll(motionSelectors.join(',')))];
  motionTargets.forEach((element, index) => {
    element.classList.add('motion-reveal');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    motionTargets.forEach(element => observer.observe(element));
  } else {
    motionTargets.forEach(element => element.classList.add('visible'));
  }
})();
