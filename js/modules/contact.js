/**
 * contact.js — contact form validation and sending, the WhatsApp option and
 * copy-to-clipboard buttons.
 *
 * "Send message" (configure in js/data/portfolio.js):
 *  1. `contact.formEndpoint` set → the message is POSTed as JSON
 *     (FormSubmit / Formspree compatible) and lands in the inbox.
 *  2. Otherwise, or if that fails → the visitor's email app opens with the
 *     message pre-filled, and a "copy message" fallback is offered.
 *
 * "Send on WhatsApp" opens a chat with the message already typed.
 */

import { $, copyText, showToast } from '../utils/dom.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const RULES = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).'),
  email: (v) => (EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'),
};

export const whatsappLink = (contact, text = contact.whatsapp?.message ?? '') =>
  `https://wa.me/${contact.whatsapp.number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export function initContact(contact) {
  /* ---------- Copy buttons (event delegation) ---------- */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const what = btn.dataset.copyLabel || 'Text';
    const ok = await copyText(btn.dataset.copy);
    showToast(ok ? `${what} copied` : `Copy failed. It is ${btn.dataset.copy}`);
  });

  const form = $('#contact-form');
  const status = $('#form-status');
  if (!form || !status) return;

  const submitBtn = form.querySelector('[type="submit"]');
  const submitLabel = submitBtn?.querySelector('.btn__label');
  const waBtn = $('#cf-whatsapp');

  const setStatus = (html, type = '') => {
    status.className = `contact-form__status${type ? ` is-${type}` : ''}`;
    status.innerHTML = html;
  };

  const validateField = (field) => {
    const rule = RULES[field.name];
    if (!rule) return true;
    const message = rule(field.value);
    const errorEl = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (errorEl) errorEl.textContent = message;
    return !message;
  };

  const validate = (names) => {
    const fields = [...form.elements].filter((el) => names.includes(el.name));
    const results = fields.map(validateField);
    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      setStatus('Check the highlighted fields and try again.', 'error');
      return false;
    }
    return true;
  };

  // Validate on blur, and re-validate as the visitor fixes an error
  form.addEventListener('focusout', (e) => {
    if (e.target.name in RULES && e.target.value) validateField(e.target);
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') validateField(e.target);
  });

  const read = () => {
    const data = Object.fromEntries(new FormData(form));
    const name = data.name.trim();
    const subject = data.subject?.trim() || `Portfolio message from ${name}`;
    return { ...data, name, email: data.email.trim(), message: data.message.trim(), subject };
  };

  const openMailApp = ({ name, email, message, subject }, note = '') => {
    const body = `${message}\n\n${name}\n${email}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(
      `${note}Your email app should open with the message ready to send to ${contact.email}. ` +
        `If it did not, <button type="button" id="copy-message">copy the message</button> and send it yourself, ` +
        `or <a href="${whatsappLink(contact)}" target="_blank" rel="noopener noreferrer">message me on WhatsApp</a>.`
    );
    $('#copy-message')?.addEventListener('click', async () => {
      const ok = await copyText(`To: ${contact.email}\nSubject: ${subject}\n\n${body}`);
      showToast(ok ? 'Message copied' : 'Copy failed. Select the text in the form and copy it.');
    });
  };

  /* ---------- Send by email ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(['name', 'email', 'message'])) return;
    const data = read();

    if (!contact.formEndpoint) {
      openMailApp(data);
      return;
    }

    submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';
    setStatus('');
    try {
      const res = await fetch(contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          _subject: data.subject,
          _replyto: data.email,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const json = await res.json().catch(() => ({}));
      const ok = res.ok && json.success !== false && json.success !== 'false';
      if (!ok) throw new Error(json.message || `Status ${res.status}`);
      form.reset();
      setStatus('Message sent. Thanks for reaching out, I will reply soon.', 'success');
      showToast('Message sent');
    } catch {
      openMailApp(data, 'The message could not be sent from the page. ');
    } finally {
      submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send message';
    }
  });

  /* ---------- Send on WhatsApp ---------- */
  waBtn?.addEventListener('click', () => {
    if (!validate(['name', 'message'])) return;
    const { name, email, subject, message } = read();
    const text =
      `Hi Awadhe, I'm ${name}${email ? ` (${email})` : ''}.\n\n` +
      `${form.elements.subject.value.trim() ? `${subject}\n` : ''}${message}`;
    const url = whatsappLink(contact, text);
    // (no 'noopener' feature here: with it, window.open always returns null)
    const tab = window.open(url, '_blank');
    if (!tab) {
      // Popup blocked: show a plain link the visitor can tap instead
      setStatus(`<a href="${url}" target="_blank" rel="noopener noreferrer">Open WhatsApp with your message</a>`, 'success');
      return;
    }
    try {
      tab.opener = null;
    } catch {
      /* cross-origin already */
    }
    setStatus('WhatsApp opened in a new tab with your message ready to send.', 'success');
  });
}
