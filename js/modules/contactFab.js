/**
 * contactFab.js — the floating "Contact me" button in the bottom-left corner.
 * It takes the visitor straight to the contact form (smooth scrolling is
 * handled by navigation.js) and steps aside while the form is on screen.
 */

import { $, hasFinePointer } from '../utils/dom.js';

export function initContactFab() {
  const fab = $('#contact-fab');
  const contact = $('#contact');
  if (!fab || !contact) return;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => fab.classList.toggle('is-hidden', entry.isIntersecting), {
      threshold: 0.2,
    }).observe(contact);
  }

  fab.addEventListener('click', () => {
    // On desktop, put the cursor in the first field once the scroll lands.
    // (On phones this would pop the keyboard up unasked, so skip it there.)
    if (!hasFinePointer()) return;
    setTimeout(() => $('#cf-name')?.focus({ preventScroll: true }), 750);
  });
}
