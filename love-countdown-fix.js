(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const countdown = document.getElementById('countdown');
    if (!countdown || typeof CONFIG === 'undefined') return;

    const configured = new Date(CONFIG.countdownDate);
    if (Number.isNaN(configured.getTime())) return;

    let target = configured;
    const now = new Date();
    while (target <= now) {
      target = new Date(target);
      target.setFullYear(target.getFullYear() + 1);
    }

    const subtitle = document.getElementById('countdown-subtitle');
    if (subtitle) {
      subtitle.textContent = `Until our next special day: ${target.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
    }

    const update = () => {
      const distance = Math.max(0, target.getTime() - Date.now());
      const values = {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000)
      };

      Object.entries(values).forEach(([unit, value]) => {
        const node = document.getElementById(unit);
        if (node) node.textContent = String(value).padStart(2, '0');
        const ring = document.getElementById(`ring-${unit}`);
        if (!ring) return;
        const max = unit === 'days' ? Math.max(values.days, 365) : unit === 'hours' ? 24 : 60;
        const ratio = Math.min(1, value / max);
        ring.style.strokeDashoffset = String(283 - (283 * ratio));
      });
    };

    update();
    const timer = setInterval(update, 1000);
    window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
  }, { once: true });
})();