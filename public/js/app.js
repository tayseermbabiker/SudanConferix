// Main App Initialization — Conferix Impact Sudan

async function initApp() {
  // Initialize filters
  initializeFilters();

  // Setup newsletter chip toggles (industries only)
  setupChipToggle('nl-industry-group', 'nl-industry');

  // Setup newsletter form handler
  setupNewsletterForm();

  // Setup feedback form handler
  setupFeedbackForm();

  // Load events from API
  await loadEvents();
}

function setupNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value.trim();
    if (!email) return;

    const industries = getChipValues('nl-industry');
    const btn = form.querySelector('.newsletter-btn');
    const msgEl = document.getElementById('newsletter-message');
    const originalText = btn.textContent;

    btn.textContent = 'Subscribing...';
    btn.disabled = true;

    try {
      const res = await fetch('.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, industries }),
      });
      const data = await res.json();

      if (data.success) {
        if (msgEl) {
          msgEl.className = 'newsletter-message success';
          msgEl.textContent = data.message;
        }
        document.getElementById('newsletter-email').value = '';
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (err) {
      console.warn('Subscribe API:', err.message);
      if (msgEl) {
        msgEl.className = 'newsletter-message success';
        msgEl.textContent = 'Signed up! Alerts will activate once deployed.';
      }
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

function setupFeedbackForm() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    const msgEl = document.getElementById('feedback-msg');
    const btn = form.querySelector('.feedback-btn');

    if (!name || !message) return;

    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch('.netlify/functions/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (data.success) {
        if (msgEl) {
          msgEl.className = 'feedback-message success';
          msgEl.textContent = data.message;
        }
        form.reset();
      } else {
        throw new Error(data.error || 'Submission failed');
      }
    } catch (err) {
      if (msgEl) {
        msgEl.className = 'feedback-message error';
        msgEl.textContent = 'Something went wrong. Please try again.';
      }
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

async function loadEvents() {
  try {
    showLoading();

    const queryString = getFilterQueryString();
    const apiUrl = `.netlify/functions/get-events${queryString ? '?' + queryString : ''}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.events) {
      setAllEvents(data.events);
      hideLoading();
    } else {
      throw new Error('Invalid API response');
    }

  } catch (error) {
    console.error('Failed to load events:', error);
    hideLoading();
    showError('Failed to load events. Please try again.');
  }
}

async function reloadEvents() {
  await loadEvents();
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.initApp = initApp;
window.loadEvents = loadEvents;
window.reloadEvents = reloadEvents;
