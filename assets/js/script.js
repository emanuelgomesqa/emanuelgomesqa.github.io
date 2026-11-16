'use strict';

const CAREER_START = new Date(2021, 6, 1); // jul 2021, MJV
const GITHUB_USER = 'emanuelgomesqa';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- anos de experiência e ano atual ---------- */

const now = new Date();
const years = Math.floor((now - CAREER_START) / (365.25 * 24 * 3600 * 1000));
document.querySelectorAll('[data-years]').forEach((el) => { el.textContent = years; });
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = now.getFullYear(); });

/* ---------- tema ---------- */

const root = document.documentElement;
const themeBtn = document.querySelector('[data-theme-toggle]');

function currentTheme() {
  const set = root.getAttribute('data-theme');
  if (set) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

themeBtn?.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) { /* armazenamento indisponível */ }
});

/* ---------- topbar e menu mobile ---------- */

const topbar = document.querySelector('[data-topbar]');
const onScroll = () => topbar?.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuBtn = document.querySelector('[data-menu-toggle]');
const navList = document.querySelector('[data-nav-list]');

function setMenu(open) {
  navList?.classList.toggle('is-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  menuBtn?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}
menuBtn?.addEventListener('click', () => setMenu(!navList.classList.contains('is-open')));
navList?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* seção ativa no menu */
const navLinks = [...document.querySelectorAll('.nav-list a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
}

/* ---------- runner do hero ---------- */

const specs = [
  'atua como Sr. QA na RPE desde set/2024',
  `testa produtos digitais há ${years} anos`,
  'aplica shift-left desde o refinamento',
  'automatiza E2E com Cypress e Playwright',
  'valida APIs com RestAssured e Postman',
  'mede performance com k6',
  'roda a suíte no CI a cada push',
  'mentora o time e mede a qualidade com OKRs',
];

const runnerList = document.querySelector('[data-runner-list]');
const runnerSummary = document.querySelector('[data-runner-summary]');
const rerunBtn = document.querySelector('[data-rerun]');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let runId = 0;

function specLine(text, ms, state) {
  const li = document.createElement('li');
  li.className = state;
  li.innerHTML = '<span class="r-mark" aria-hidden="true"></span><span class="r-text"></span><span class="r-time"></span>';
  li.querySelector('.r-text').textContent = text;
  if (state.includes('is-pass')) {
    li.querySelector('.r-mark').textContent = '✓';
    li.querySelector('.r-time').textContent = `${ms}ms`;
  }
  return li;
}

async function runSpecs() {
  if (!runnerList) return;
  const id = ++runId;
  runnerList.innerHTML = '';
  runnerSummary.hidden = true;
  rerunBtn.disabled = true;

  const times = specs.map(() => 40 + Math.round(Math.random() * 260));
  const total = times.reduce((a, b) => a + b, 0);

  if (reduceMotion) {
    specs.forEach((s, i) => runnerList.append(specLine(s, times[i], 'is-pass')));
  } else {
    await wait(500);
    for (let i = 0; i < specs.length; i += 1) {
      if (id !== runId) return;
      const li = specLine(specs[i], times[i], 'is-running is-enter');
      runnerList.append(li);
      await wait(180 + times[i]);
      if (id !== runId) return;
      li.replaceWith(specLine(specs[i], times[i], 'is-pass'));
    }
    await wait(250);
  }

  runnerSummary.innerHTML = `${specs.length} passing <span>(${(total / 1000).toFixed(1)}s)</span>`;
  runnerSummary.hidden = false;
  rerunBtn.disabled = false;
}

rerunBtn?.addEventListener('click', runSpecs);
runSpecs();

/* ---------- abas da stack (padrão WAI-ARIA) ---------- */

const tabList = document.querySelector('[data-tabs]');
if (tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];

  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); next.focus(); select(next); }
    });
  });
}

/* ---------- repositórios do GitHub ---------- */

const LANG_COLORS = {
  JavaScript: '#E3C341', TypeScript: '#3178C6', Python: '#3572A5', Java: '#B07219',
  Shell: '#4EAA25', HTML: '#E34C26', CSS: '#563D7C', C: '#555555', Dockerfile: '#384D54',
  'Jupyter Notebook': '#DA5B0B', Gherkin: '#5B2063', RobotFramework: '#00C0B5',
};

const FALLBACK_REPOS = [
  { name: 'qaops-boilerplate-docker', description: '', language: 'Docker', html_url: `https://github.com/${GITHUB_USER}/qaops-boilerplate-docker` },
  { name: 'cypress-qa-boilerplate-config', description: '', language: 'JavaScript', html_url: `https://github.com/${GITHUB_USER}/cypress-qa-boilerplate-config` },
  { name: 'primeiros-passos-cypress', description: 'Aplicação web de exemplo com testes automatizados', language: 'JavaScript', html_url: `https://github.com/${GITHUB_USER}/primeiros-passos-cypress` },
  { name: 'pytest-calculadora', description: '', language: 'Python', html_url: `https://github.com/${GITHUB_USER}/pytest-calculadora` },
];

const HIDE = new Set([GITHUB_USER, `${GITHUB_USER}.github.io`]);
const reposEl = document.querySelector('[data-repos]');
const reposStatus = document.querySelector('[data-repos-status]');
const dateFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' });

function repoCard(r) {
  const li = document.createElement('li');
  li.className = 'repo';
  const a = document.createElement('a');
  a.href = r.html_url;
  a.target = '_blank';
  a.rel = 'noopener';

  const name = document.createElement('span');
  name.className = 'repo-name';
  name.textContent = r.name;
  a.append(name);

  const desc = document.createElement('span');
  desc.className = 'repo-desc';
  desc.textContent = r.description || '';
  a.append(desc);

  const meta = document.createElement('span');
  meta.className = 'repo-meta';
  if (r.language) {
    const lang = document.createElement('span');
    lang.className = 'repo-lang';
    lang.style.setProperty('--lang', LANG_COLORS[r.language] || 'currentColor');
    lang.textContent = r.language;
    meta.append(lang);
  }
  if (r.pushed_at) {
    const upd = document.createElement('span');
    upd.textContent = `Atualizado em ${dateFmt.format(new Date(r.pushed_at))}`;
    meta.append(upd);
  }
  if (r.stargazers_count) {
    const stars = document.createElement('span');
    stars.textContent = `★ ${r.stargazers_count}`;
    meta.append(stars);
  }
  a.append(meta);
  li.append(a);
  return li;
}

function renderRepos(list) {
  reposEl.innerHTML = '';
  list.forEach((r) => reposEl.append(repoCard(r)));
  reposEl.setAttribute('aria-busy', 'false');
}

async function loadRepos() {
  if (!reposEl) return;
  reposEl.innerHTML = '<li class="repo is-skeleton"></li>'.repeat(3);

  const CACHE_KEY = 'gh-repos-v1';
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.at < 30 * 60 * 1000) {
      renderRepos(cached.repos);
      reposStatus.textContent = 'Meus repositórios atualizados mais recentemente, direto da API do GitHub.';
      return;
    }
  } catch (e) { /* sem cache */ }

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=50`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
    const data = await res.json();
    const repos = data
      .filter((r) => !r.fork && !r.archived && !HIDE.has(r.name))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6)
      .map(({ name, description, language, html_url, pushed_at, stargazers_count }) =>
        ({ name, description, language, html_url, pushed_at, stargazers_count }));

    if (!repos.length) throw new Error('nenhum repositório público');
    renderRepos(repos);
    reposStatus.textContent = 'Meus repositórios atualizados mais recentemente, direto da API do GitHub.';
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos })); } catch (e) { /* ok */ }
  } catch (err) {
    renderRepos(FALLBACK_REPOS);
    reposStatus.textContent = 'Não consegui carregar a lista ao vivo do GitHub agora, então mostro uma seleção fixa.';
  }
}

loadRepos();

/* ---------- copiar e-mail ---------- */

const copyBtn = document.querySelector('[data-copy]');
const copyStatus = document.querySelector('[data-copy-status]');
copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
    copyStatus.textContent = 'E-mail copiado';
  } catch (e) {
    copyStatus.textContent = 'Não foi possível copiar. Selecione o endereço ao lado.';
  }
  setTimeout(() => { copyStatus.textContent = ''; }, 2500);
});
