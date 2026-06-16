// Small page-specific script - runs only on education.html
(function () {
  if (!document.querySelector('.container')) return;

  /* ============================================
     NOTES: Content structure & author guidance
     ============================================
     - Structure each major block with semantic headings:
         <section aria-labelledby="id"><h2 id="id">Title</h2>...</section>
     - Keep short paragraphs (40-70 chars per line) for readability.
     - Use .cards for grouped topics; each .card should have:
         - a visible summary (always shown)
         - an optional <div class="extra hidden">More details...</div>
           that will be revealed when the card is expanded.
     - Provide image elements with descriptive alt text and consider
       a lightweight caption element <figcaption>.
  */

  /* ============================================
     NOTES: Accessibility & UX
     ============================================
     - Ensure color contrast meets WCAG AA (check accent and background).
     - Add aria-live regions for dynamic announcements (e.g., flood alerts).
     - Keyboard: interactive elements must be tabbable and respond to Enter/Space.
     - Use aria-expanded on expandable cards and aria-controls where applicable.
  */

  /* ============================================
     NOTES: Images, media & performance
     ============================================
     - Use responsive images: <img src="..." srcset="..." sizes="...">
     - Lazy-load non-critical images with loading="lazy".
     - Optimize images (WebP/AVIF) and serve appropriate sizes.
  */

  /* ============================================
     NOTES: Content sourcing & citations
     ============================================
     - Cite authoritative sources (IPCC, local gov, WHO) with links.
     - For Sierra Leone-specific data, cite local ministries or respected NGOs.
     - Store citation metadata in a small .references list for editors.
  */

  /* ============================================
     NOTES: Localization & copy
     ============================================
     - Keep strings in HTML or data-* attributes so they can be extracted.
     - Consider language toggles if translating content; mark <html lang>.
  */

  /* ============================================
     NOTES: Privacy & analytics
     ============================================
     - If adding analytics, respect GDPR/consent flows.
     - Avoid logging PII from report forms (report page handles that).
  */

  /* ============================================
     Optional: Small interactive helpers
     - Expandable cards (progressive enhancement)
     ============================================ */
  const cards = document.querySelectorAll('.cards .card');
  if (cards.length) {
    cards.forEach((card, i) => {
      // make card keyboard-accessible and announce state
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');

      // if an .extra panel exists, link aria-controls
      const extra = card.querySelector('.extra');
      if (extra) {
        const id = extra.id || `card-extra-${i}`;
        extra.id = id;
        card.setAttribute('aria-controls', id);
        extra.classList.add('hidden'); // ensure hidden by default
      }

      const toggle = () => {
        const expanded = card.getAttribute('aria-expanded') === 'true';
        card.setAttribute('aria-expanded', String(!expanded));
        card.classList.toggle('expanded', !expanded);
        if (extra) extra.classList.toggle('hidden', expanded);
      };

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ============================================
     NOTES: Testing checklist for editors / devs
     ============================================
     - Mobile: verify menu, card expansion, and readable type sizes.
     - Keyboard-only: tab through header, nav, cards, and links.
     - Screen reader: check aria-expanded announcements on cards.
     - Performance: run Lighthouse, target FCP < 1.5s on mobile.
  */

  /* Placeholder for future interactive bits (e.g. quizzes, maps) */
})();