/**
 * projects.js — category filters and the project details dialog.
 */

import { $, $$, escapeHTML as esc, icon } from '../utils/dom.js';
import { projectCardHTML, projectCategory, renderProjectFilters } from './render.js';
import { observeReveals } from './reveal.js';

export function initProjects(projects, filters) {
  const grid = $('#projects-grid');
  const filterWrap = $('#project-filters');
  if (!grid) return;

  let current = 'all';
  let firstRender = true;

  const render = () => {
    const list = current === 'all' ? projects : projects.filter((p) => p.category === current);
    grid.innerHTML = list.length
      ? list.map((p, i) => projectCardHTML(p, i, filters, { revealed: !firstRender })).join('')
      : '<p class="projects__empty">No projects in this category yet.</p>';
    if (firstRender) observeReveals(grid);
    firstRender = false;
  };

  renderProjectFilters(filters, projects);
  render();

  /* ---------- Filters ---------- */
  filterWrap?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.dataset.filter === current) return;
    current = btn.dataset.filter;
    $$('[data-filter]', filterWrap).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    render();
  });

  /* ---------- Details dialog ---------- */
  const modal = $('#project-modal');
  if (!modal) return;
  let lastTrigger = null;

  const open = (project) => {
    const category = projectCategory(project, filters);
    $('#modal-image').src = project.image;
    $('#modal-image').alt = project.imageAlt ?? '';
    // absolute URL: a relative url() in a custom property resolves against the stylesheet, not the page
    $('#modal-media')?.style.setProperty('--media', `url("${new URL(project.image, document.baseURI).href}")`);
    $('#modal-category').textContent = category.label;
    $('#modal-title').textContent = project.title;
    $('#modal-details').textContent = project.details ?? project.summary;
    $('#modal-features').innerHTML = (project.features ?? []).map((f) => `<li>${esc(f)}</li>`).join('');
    $('#modal-tech').innerHTML = project.tech.map((t) => `<li class="chip">${esc(t)}</li>`).join('');

    const actions = [];
    if (project.github) {
      actions.push(`<a class="btn btn--ghost btn--sm" href="${esc(project.github)}" target="_blank" rel="noopener noreferrer">${icon('github')}<span>View on GitHub</span></a>`);
    }
    if (project.demo) {
      actions.push(`<a class="btn btn--primary btn--sm" href="${esc(project.demo)}" target="_blank" rel="noopener noreferrer">${icon('play')}<span>Live Demo</span></a>`);
    }
    $('#modal-actions').innerHTML = actions.join('');

    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    modal.querySelector('[data-close]')?.focus();
  };

  const close = () => {
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  };

  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
    lastTrigger?.focus({ preventScroll: true });
  });

  grid.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-project]');
    if (!trigger) return;
    const project = projects.find((p) => p.id === trigger.dataset.project);
    if (!project) return;
    lastTrigger = trigger;
    open(project);
  });

  modal.addEventListener('click', (e) => {
    // Close on the close button, or on a click outside the panel (the backdrop)
    if (e.target.closest('[data-close]') || e.target === modal) close();
  });
}
