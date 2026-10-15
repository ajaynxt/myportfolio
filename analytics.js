/**
 * AJAYNXT Lightweight Client-Side Analytics & Click Tracker
 * Tracks user engagement, button clicks, WhatsApp leads, demo visits & video plays.
 * 
 * View Dashboard:
 *  1. Press Ctrl + Shift + A (or Cmd + Shift + A on Mac)
 *  2. Or visit https://ajaynxt.com/?analytics=view
 *  3. Or run ajayAnalytics.show() in browser console
 */
(() => {
  'use strict';

  const STORAGE_KEY_STATS = 'ajaynxt_metrics';
  const STORAGE_KEY_LOGS = 'ajaynxt_events_log';
  const STORAGE_KEY_CLARITY = 'ajaynxt_clarity_id';
  const MAX_LOGS = 150;

  // Initial stats schema
  const defaultStats = () => ({
    pageViews: 0,
    whatsappClicks: 0,
    demoClicks: 0,
    callClicks: 0,
    emailClicks: 0,
    filmPlays: 0,
    socialClicks: 0,
    formSubmissions: 0,
    topProjects: {},
    lastUpdated: new Date().toISOString()
  });

  const getStats = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      return data ? { ...defaultStats(), ...JSON.parse(data) } : defaultStats();
    } catch {
      return defaultStats();
    }
  };

  const saveStats = (stats) => {
    try {
      stats.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('[Analytics] Failed to save stats:', e);
    }
  };

  const getLogs = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const logEvent = (category, label, details = {}) => {
    const stats = getStats();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toISOString().slice(0, 10);

    // Update aggregate counters
    switch (category) {
      case 'whatsapp':
        stats.whatsappClicks++;
        break;
      case 'demo':
        stats.demoClicks++;
        if (label) {
          stats.topProjects[label] = (stats.topProjects[label] || 0) + 1;
        }
        break;
      case 'call':
        stats.callClicks++;
        break;
      case 'email':
        stats.emailClicks++;
        break;
      case 'film':
        stats.filmPlays++;
        break;
      case 'social':
        stats.socialClicks++;
        break;
      case 'form':
        stats.formSubmissions++;
        break;
      case 'pageview':
        stats.pageViews++;
        break;
    }

    saveStats(stats);

    // Append to detailed logs
    try {
      const logs = getLogs();
      logs.unshift({
        time: `${dateStr} ${timeStr}`,
        category,
        label: label || 'N/A',
        page: window.location.pathname || '/',
        ...details
      });
      if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('[Analytics] Log error:', e);
    }
  };

  // 1. Log Page View
  logEvent('pageview', document.title || 'Page');

  // 2. Global Click Tracker
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, input[type="submit"]');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const text = (target.innerText || target.getAttribute('aria-label') || target.title || '').trim().slice(0, 50);

    // WhatsApp Click
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      logEvent('whatsapp', text || 'WhatsApp CTA', { url: href });
      return;
    }

    // Call / Phone Click
    if (href.startsWith('tel:')) {
      logEvent('call', href.replace('tel:', ''), { text });
      return;
    }

    // Email Click
    if (href.startsWith('mailto:')) {
      logEvent('email', href.replace('mailto:', ''), { text });
      return;
    }

    // Demo Project / Client Link Click
    const isProjectCard = target.closest('.project-card, .project-preview, [data-project-item]');
    if (isProjectCard || href.includes('ajaynxt.com') || href.includes('diamondrestaurants.com')) {
      // Find project title if available
      const projectTitle = isProjectCard?.querySelector('h3, h2, .project-title')?.innerText || text || href;
      if (href && !href.startsWith('#')) {
        logEvent('demo', projectTitle.trim(), { url: href });
        return;
      }
    }

    // Social Links
    if (/instagram\.com|linkedin\.com|facebook\.com|github\.com/.test(href)) {
      const platform = href.match(/(instagram|linkedin|facebook|github)/)?.[1] || 'social';
      logEvent('social', platform.toUpperCase(), { url: href });
      return;
    }

    // Video / Film click
    if (target.matches('[data-video-open], .film-card, .film-card *') || target.closest('[data-video-open], .film-card')) {
      const filmName = target.closest('[data-video-title]')?.getAttribute('data-video-title') || text || 'Film Play';
      logEvent('film', filmName);
      return;
    }
  }, { passive: true });

  // 3. Form Submit Tracker
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const formId = form.id || form.getAttribute('data-form') || 'Booking Form';
    logEvent('form', formId);
  }, { passive: true });

  // 4. Clarity Bootloader (Auto-starts if Clarity ID is present)
  const initClarity = (clarityId) => {
    if (!clarityId || window.__clarity_loaded) return;
    window.__clarity_loaded = true;
    try {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", clarityId);
      console.log(`[Analytics] Microsoft Clarity initialized with ID: ${clarityId}`);
    } catch (e) {
      console.warn('[Analytics] Clarity init error:', e);
    }
  };

  // Check if Clarity ID is saved or declared
  const configuredClarity = window.CLARITY_ID || localStorage.getItem(STORAGE_KEY_CLARITY);
  if (configuredClarity) {
    initClarity(configuredClarity);
  }

  // 5. Visual Dashboard UI
  const createDashboardModal = () => {
    const existing = document.getElementById('ajaynxt-analytics-dashboard');
    if (existing) existing.remove();

    const stats = getStats();
    const logs = getLogs();

    const topProjectsHtml = Object.entries(stats.topProjects || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;">
          <span style="color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px;">${name}</span>
          <b style="color:#d4af37;">${count} clicks</b>
        </div>
      `).join('') || '<p style="color:#94a3b8;font-size:12px;margin:8px 0;">No demo clicks recorded yet.</p>';

    const logsHtml = logs.slice(0, 15).map(l => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px;">
        <td style="padding:6px 8px;color:#94a3b8;">${l.time.split(' ')[1] || l.time}</td>
        <td style="padding:6px 8px;"><span style="background:rgba(212,175,55,0.15);color:#f1c40f;padding:2px 6px;border-radius:4px;font-weight:600;text-transform:uppercase;font-size:9px;">${l.category}</span></td>
        <td style="padding:6px 8px;color:#e2e8f0;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.label}</td>
      </tr>
    `).join('') || '<tr><td colspan="3" style="padding:12px;text-align:center;color:#94a3b8;">No click events logged yet.</td></tr>';

    const overlay = document.createElement('div');
    overlay.id = 'ajaynxt-analytics-dashboard';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(5,7,12,0.85);backdrop-filter:blur(10px);
      z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,sans-serif;
    `;

    overlay.innerHTML = `
      <div style="background:#0e131f;border:1px solid rgba(212,175,55,0.3);border-radius:18px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.6);color:#f8fafc;padding:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:18px;">
          <div>
            <h2 style="margin:0;font-size:20px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;">
              <span style="color:#d4af37;">⚡</span> AjayNXT Live Click Analytics
            </h2>
            <small style="color:#94a3b8;font-size:11px;">Local Real-Time User Interaction Tracking</small>
          </div>
          <button id="close-ajay-analytics" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;padding:4px 8px;border-radius:6px;">✕</button>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
          <div style="background:#151c2d;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600;">WhatsApp Clicks</div>
            <div style="font-size:26px;font-weight:800;color:#22c55e;margin-top:4px;">${stats.whatsappClicks}</div>
          </div>
          <div style="background:#151c2d;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600;">Demo Visits</div>
            <div style="font-size:26px;font-weight:800;color:#38bdf8;margin-top:4px;">${stats.demoClicks}</div>
          </div>
          <div style="background:#151c2d;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600;">Calls / Emails</div>
            <div style="font-size:26px;font-weight:800;color:#f59e0b;margin-top:4px;">${stats.callClicks + stats.emailClicks}</div>
          </div>
          <div style="background:#151c2d;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600;">Films / Reels</div>
            <div style="font-size:26px;font-weight:800;color:#e879f9;margin-top:4px;">${stats.filmPlays}</div>
          </div>
        </div>

        <!-- Top Projects & Demos -->
        <div style="background:#151c2d;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:20px;">
          <h4 style="margin:0 0 10px 0;font-size:14px;color:#cbd5e1;font-weight:600;">Top Clicked Client Demos</h4>
          ${topProjectsHtml}
        </div>

        <!-- Recent Real-Time Click Activity -->
        <div style="background:#151c2d;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:20px;">
          <h4 style="margin:0 0 10px 0;font-size:14px;color:#cbd5e1;font-weight:600;">Recent Click Stream</h4>
          <div style="max-height:180px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1);font-size:10px;color:#94a3b8;text-transform:uppercase;">
                  <th style="padding:6px 8px;">Time</th>
                  <th style="padding:6px 8px;">Type</th>
                  <th style="padding:6px 8px;">Target / Action</th>
                </tr>
              </thead>
              <tbody>
                ${logsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bottom Controls -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-top:10px;">
          <div style="font-size:11px;color:#64748b;">
            Shortcut: <kbd style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#cbd5e1;">Ctrl</kbd> + <kbd style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#cbd5e1;">Shift</kbd> + <kbd style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#cbd5e1;">A</kbd>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="reset-ajay-analytics" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;">Reset Data</button>
            <button id="export-ajay-analytics" style="background:#d4af37;color:#0b1120;border:none;padding:6px 14px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:700;">Export JSON</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#close-ajay-analytics').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#reset-ajay-analytics').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all tracked clicks?')) {
        localStorage.removeItem(STORAGE_KEY_STATS);
        localStorage.removeItem(STORAGE_KEY_LOGS);
        overlay.remove();
        createDashboardModal();
      }
    });

    overlay.querySelector('#export-ajay-analytics').addEventListener('click', () => {
      const exportObj = { stats: getStats(), logs: getLogs() };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ajaynxt_analytics_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  };

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      createDashboardModal();
    }
  });

  // URL trigger check: ?analytics=view or ?analytics=1
  if (/[?&]analytics=(view|1|show)/i.test(window.location.search)) {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(createDashboardModal, 500);
    });
  }

  // Global window API for console usage
  window.ajayAnalytics = {
    show: createDashboardModal,
    hide: () => document.getElementById('ajaynxt-analytics-dashboard')?.remove(),
    getStats,
    getLogs,
    logEvent,
    setClarityId: (id) => {
      if (id) {
        localStorage.setItem(STORAGE_KEY_CLARITY, id.trim());
        initClarity(id.trim());
        alert(`Clarity ID "${id}" saved and activated!`);
      }
    }
  };

  console.log('[AjayNXT Analytics] Click tracker loaded. Press Ctrl+Shift+A or visit ?analytics=view to inspect live clicks.');
})();
