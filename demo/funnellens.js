/**
 * FunnelLens Browser Analytics Tracking SDK
 * Client-side script for tracking page views and user click interactions.
 */
(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'funnellens_session_id';

  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'fl-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, val, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getOrCreateSessionId() {
    let sessionId = null;
    try {
      sessionId = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    if (!sessionId) {
      sessionId = getCookie(STORAGE_KEY);
    }

    if (!sessionId) {
      sessionId = generateUUID();
      try {
        localStorage.setItem(STORAGE_KEY, sessionId);
      } catch (_) {}
      setCookie(STORAGE_KEY, sessionId);
    }
    return sessionId;
  }

  class FunnelLensTracker {
    constructor() {
      this.initialized = false;
      this.apiEndpoint = 'http://localhost:5000/api/events';
      this.sessionId = null;
    }

    init(options = {}) {
      if (this.initialized) {
        console.warn('[FunnelLens] Tracker is already initialized.');
        return;
      }

      if (options.apiEndpoint) {
        this.apiEndpoint = options.apiEndpoint;
      }

      this.sessionId = getOrCreateSessionId();
      this.initialized = true;

      // 1. Automatically record page_view
      this.trackPageView();

      // 2. Attach global click listener
      this.attachClickTracker();

      console.info(`[FunnelLens] Initialized session: ${this.sessionId}`);
    }

    sendEvent(payload) {
      const data = {
        session_id: this.sessionId,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        ...payload,
      };

      try {
        fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch((err) => {
          console.debug('[FunnelLens] Failed to send event:', err.message);
        });
      } catch (err) {
        console.debug('[FunnelLens] Ingestion error:', err.message);
      }
    }

    trackPageView() {
      this.sendEvent({
        event_type: 'page_view',
      });
    }

    attachClickTracker() {
      document.addEventListener(
        'click',
        (event) => {
          const x = Math.round(event.clientX);
          const y = Math.round(event.clientY);
          const viewport_width = window.innerWidth;
          const viewport_height = window.innerHeight;

          if (x >= 0 && y >= 0) {
            this.sendEvent({
              event_type: 'click',
              x,
              y,
              viewport_width,
              viewport_height,
            });
          }
        },
        true // capture phase to record clicks reliably
      );
    }
  }

  window.FunnelLens = new FunnelLensTracker();

  // Auto-initialize if data-auto-init attribute is present on script tag
  const currentScript = document.currentScript;
  if (currentScript && currentScript.getAttribute('data-auto-init') !== 'false') {
    const apiEndpoint = currentScript.getAttribute('data-api-endpoint') || undefined;
    window.FunnelLens.init({ apiEndpoint });
  }
})(window, document);
