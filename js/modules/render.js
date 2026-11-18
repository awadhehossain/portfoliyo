/**
 * render.js — turns the content in js/data/portfolio.js into markup.
 * Every function here is pure string-building plus a single DOM write,
 * so adding a project or skill never requires touching index.html.
 */

import { $, escapeHTML as esc, icon } from '../utils/dom.js';

/* ---------------------------------------------------------------- */
/*  Hero                                                             */
/* ---------------------------------------------------------------- */
export function renderHero(profile) {
  const roles = $('#hero-roles');
  if (roles) {
    roles.innerHTML = profile.roles
      .map((role, i) => `${i ? '<span class="hero__sep" aria-hidden="true"></span>' : ''}<span>${esc(role)}</span>`)
      .join('');
    // Keep the exact title text available to assistive tech and search engines
    roles.setAttribute('aria-label', profile.roles.join(' | '));
  }

  const intro = $('#hero-intro');
  if (intro) intro.textContent = profile.intro;
}

/* ---------------------------------------------------------------- */
/*  Social icon rows (hero, contact, footer)                         */
/* ---------------------------------------------------------------- */
export function renderSocialRow(container, socials) {
  if (!container) return;
  container.innerHTML = socials
    .map(
      (s) => `
      <li>
        <a class="social-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"
           aria-label="${esc(s.label)} (opens in a new tab)" title="${esc(s.label)}">
          ${icon(s.icon)}
        </a>
      </li>`
    )
    .join('');
}

/* ---------------------------------------------------------------- */
/*  About                                                            */
/* ---------------------------------------------------------------- */
export function renderAbout(about) {
  const text = $('#about-text');
  if (text) text.innerHTML = about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');

  const list = $('#focus-list');
  if (list) {
    list.innerHTML = about.focus
      .map(
        (item, i) => `
        <li class="focus-item" data-reveal style="--i:${i}">
          <span class="focus-item__icon">${icon(item.icon)}</span>
          <h3 class="focus-item__title">${esc(item.title)}</h3>
          <p class="focus-item__text">${esc(item.text)}</p>
        </li>`
      )
      .join('');
  }
}

/* ---------------------------------------------------------------- */
/*  Skills                                                           */
/* ---------------------------------------------------------------- */

/** Small SVG neural network with pulsing nodes, used in the ML card. */
function neuralNetworkSVG() {
  const layers = [3, 5, 5, 2];
  const width = 300;
  const height = 150;
  const xStep = width / (layers.length - 1);
  const nodes = layers.map((count, li) =>
    Array.from({ length: count }, (_, ni) => ({
      x: li * xStep,
      y: ((ni + 1) * height) / (count + 1),
    }))
  );

  let edges = '';
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const a of nodes[l]) {
      for (const b of nodes[l + 1]) {
        edges += `<line class="nn__edge" x1="${a.x}" y1="${a.y.toFixed(1)}" x2="${b.x}" y2="${b.y.toFixed(1)}"/>`;
      }
    }
  }

  let dots = '';
  let pulses = '';
  let k = 0;
  for (const layer of nodes) {
    for (const n of layer) {
      dots += `<circle class="nn__node" cx="${n.x}" cy="${n.y.toFixed(1)}" r="6"/>`;
      pulses += `<circle class="nn__pulse" cx="${n.x}" cy="${n.y.toFixed(1)}" r="3" style="animation-delay:${((k * 0.37) % 2.8).toFixed(2)}s"/>`;
      k++;
    }
  }

  return `<svg class="nn" viewBox="-10 0 320 150" aria-hidden="true" focusable="false">${edges}${dots}${pulses}</svg>`;
}

export function renderSkills(groups) {
  const grid = $('#skills-grid');
  if (!grid) return;

  grid.innerHTML = groups
    .map((group, i) => {
      const isFeature = group.layout === 'prog';
      const chips = group.skills
        .map(
          (skill, ci) =>
            `<li class="chip" style="--ci:${ci}">${isFeature ? '' : '<span class="chip__dot" aria-hidden="true"></span>'}${esc(skill)}</li>`
        )
        .join('');

      return `
      <article class="skill-card glass spotlight${isFeature ? ' skill-card--feature' : ''}"
               style="grid-area:${esc(group.layout)};--i:${i % 3}" data-reveal data-tilt
               aria-labelledby="skill-${esc(group.id)}">
        <div class="skill-card__head">
          <span class="skill-card__icon">${icon(group.icon)}</span>
          <h3 class="skill-card__title" id="skill-${esc(group.id)}">${esc(group.title)}</h3>
        </div>
        <p class="skill-card__blurb">${esc(group.blurb)}</p>
        ${group.illustration ? neuralNetworkSVG() : ''}
        <ul class="chips reveal-chips" aria-label="${esc(group.title)} skills">${chips}</ul>
      </article>`;
    })
    .join('');
}

/* ---------------------------------------------------------------- */
/*  Projects                                                         */
/* ---------------------------------------------------------------- */
export function projectCategory(project, filters) {
  return filters.find((f) => f.id === project.category) ?? { label: project.category, icon: 'code' };
}

export function projectCardHTML(project, index, filters, { revealed = false } = {}) {
  const category = projectCategory(project, filters);
  const tech = project.tech.map((t, ci) => `<li class="chip" style="--ci:${ci}">${esc(t)}</li>`).join('');

  const github = project.github
    ? `<a class="btn btn--ghost btn--sm" href="${esc(project.github)}" target="_blank" rel="noopener noreferrer"
          aria-label="${esc(project.title)} on GitHub (opens in a new tab)">
         ${icon('github')}<span>GitHub</span>
       </a>`
    : '';

  const demo = project.demo
    ? `<a class="btn btn--primary btn--sm" href="${esc(project.demo)}" target="_blank" rel="noopener noreferrer"
          aria-label="Live demo of ${esc(project.title)} (opens in a new tab)">
         ${icon('play')}<span>Live Demo</span>
       </a>`
    : '';

  const details = project.demo
    ? `<button class="btn btn--ghost btn--sm" type="button" data-project="${esc(project.id)}"
               aria-label="Details for ${esc(project.title)}">${icon('info')}<span>Details</span></button>`
    : `<button class="btn btn--primary btn--sm" type="button" data-project="${esc(project.id)}"
               aria-label="View details for ${esc(project.title)}">${icon('info')}<span>View Details</span></button>`;

  const revealClasses = revealed ? ' is-visible reveal-done is-entering' : '';

  return `
    <article class="project-card glass spotlight${revealClasses}" data-tilt data-reveal
             style="--i:${index}" aria-labelledby="project-${esc(project.id)}">
      <div class="project-card__media">
        <span class="project-card__category">${icon(category.icon ?? 'code')}${esc(category.label)}</span>
        <img src="${esc(project.image)}"${project.imageSmall ? ` srcset="${esc(project.imageSmall)} 640w, ${esc(project.image)} 1200w" sizes="(max-width: 820px) 92vw, 590px"` : ''}
             alt="${esc(project.imageAlt ?? '')}" width="1200" height="750" loading="lazy" decoding="async" />
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title" id="project-${esc(project.id)}">${esc(project.title)}</h3>
        <p class="project-card__summary">${esc(project.summary)}</p>
        <ul class="chips reveal-chips" aria-label="Technologies used">${tech}</ul>
        <div class="project-card__actions">${github}${demo}${details}</div>
      </div>
    </article>`;
}

export function renderProjectFilters(filters, projects) {
  const wrap = $('#project-filters');
  if (!wrap) return;
  wrap.innerHTML = filters
    .map((f) => {
      const count = f.id === 'all' ? projects.length : projects.filter((p) => p.category === f.id).length;
      if (f.id !== 'all' && count === 0) return '';
      return `<button class="filter" type="button" data-filter="${esc(f.id)}" aria-pressed="${f.id === 'all'}">
                ${esc(f.label)}<span class="filter__count" aria-hidden="true">${count}</span>
                <span class="visually-hidden">, ${count} project${count === 1 ? '' : 's'}</span>
              </button>`;
    })
    .join('');
}

/* ---------------------------------------------------------------- */
/*  Education timeline                                               */
/* ---------------------------------------------------------------- */
export function renderTimeline(entries) {
  const list = $('#timeline-list');
  if (!list) return;
  list.innerHTML = entries
    .map(
      (e, i) => `
      <li class="timeline__item">
        <span class="timeline__dot" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <article class="timeline__card glass spotlight" data-reveal>
          <p class="timeline__period">${esc(e.period)}${e.current ? '<span class="timeline__now">Now</span>' : ''}</p>
          <h3 class="timeline__title">${esc(e.title)}</h3>
          ${e.institution ? `<p class="timeline__institution">${esc(e.institution)}</p>` : ''}
          <p class="timeline__desc">${esc(e.description)}</p>
          ${e.tags?.length ? `<ul class="chips reveal-chips" aria-label="Topics">${e.tags.map((t, ci) => `<li class="chip" style="--ci:${ci}">${esc(t)}</li>`).join('')}</ul>` : ''}
        </article>
      </li>`
    )
    .join('');
}

/* ---------------------------------------------------------------- */
/*  Contact methods                                                  */
/* ---------------------------------------------------------------- */
export function renderContactList(contact, socials) {
  const list = $('#contact-list');
  if (!list) return;

  const item = ({ iconName, label, value, href, external = false, action = '', accent = '' }) => `
      <li class="contact-item${accent ? ` contact-item--${accent}` : ''}">
        <span class="contact-item__icon">${icon(iconName)}</span>
        <span class="contact-item__text">
          <span class="contact-item__label">${esc(label)}</span>
          <a class="contact-item__value contact-item__link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            ${esc(value)}${external ? `<span class="visually-hidden"> (opens in a new tab)</span>` : ''}
          </a>
        </span>
        ${action || (external ? `<span class="contact-item__arrow" aria-hidden="true">${icon('external')}</span>` : '')}
      </li>`;

  const copyBtn = (value, label) => `
        <button class="contact-item__action" type="button" data-copy="${esc(value)}" data-copy-label="${esc(label)}"
                aria-label="Copy ${esc(label.toLowerCase())}" title="Copy ${esc(label.toLowerCase())}">
          ${icon('copy')}
        </button>`;

  const items = [];

  if (contact.email) {
    items.push(item({
      iconName: 'mail', label: 'Email', value: contact.email, href: `mailto:${contact.email}`,
      action: copyBtn(contact.email, 'Email address'),
    }));
  }

  if (contact.phone) {
    items.push(item({
      iconName: 'phone', label: 'Phone', value: contact.phone.display, href: `tel:${contact.phone.tel}`,
      action: copyBtn(contact.phone.local ?? contact.phone.display, 'Phone number'),
    }));
  }

  if (contact.whatsapp) {
    const text = contact.whatsapp.message ? `?text=${encodeURIComponent(contact.whatsapp.message)}` : '';
    items.push(item({
      iconName: 'whatsapp', label: 'WhatsApp', value: `Chat on WhatsApp`,
      href: `https://wa.me/${contact.whatsapp.number}${text}`, external: true, accent: 'whatsapp',
    }));
  }

  socials
    .filter((s) => s.primary)
    .forEach((s) => {
      items.push(item({ iconName: s.icon, label: s.label, value: s.handle, href: s.url, external: true }));
    });

  list.innerHTML = items.join('');
}
