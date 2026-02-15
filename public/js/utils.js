// Utility helper functions — Conferix Impact Sudan

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatFullDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function getRandomGradient() {
  const gradients = [
    'linear-gradient(135deg, #142952 0%, #00875A 100%)',
    'linear-gradient(135deg, #1E2A38 0%, #FFD700 100%)',
    'linear-gradient(135deg, #00875A 0%, #142952 100%)',
    'linear-gradient(135deg, #2C5364 0%, #203A43 100%)',
    'linear-gradient(135deg, #134E5E 0%, #71B280 100%)'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'block';
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
}

function showEmptyState() {
  const emptyState = document.getElementById('empty-state');
  if (emptyState) emptyState.style.display = 'block';
}

function hideEmptyState() {
  const emptyState = document.getElementById('empty-state');
  if (emptyState) emptyState.style.display = 'none';
}

function showError(message) {
  const eventsGrid = document.getElementById('events-grid');
  if (eventsGrid) {
    eventsGrid.innerHTML = `
      <div class="error-message" style="text-align: center; padding: 2rem; color: var(--error);">
        <p>${message}</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">
          Try Again
        </button>
      </div>
    `;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getNext6Months() {
  const months = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = monthNames[date.getMonth()];

    months.push({
      value: `${year}-${month}`,
      label: `${monthName} ${year}`
    });
  }

  return months;
}

// Sudan-specific industry gradients
function getIndustryGradient(industry) {
  const gradients = {
    'Finance & Banking': 'linear-gradient(135deg, #1C2333 0%, #10B981 100%)',
    'Healthcare & Medical': 'linear-gradient(135deg, #0B1426 0%, #EF4444 100%)',
    'Technology & IT': 'linear-gradient(135deg, #0B1426 0%, #0EA5E9 100%)',
    'Engineering': 'linear-gradient(135deg, #1C2333 0%, #F59E0B 100%)',
    'Operations & Supply Chain': 'linear-gradient(135deg, #2D3748 0%, #6366F1 100%)',
    'HR & People Development': 'linear-gradient(135deg, #2D3748 0%, #EC4899 100%)',
    'Marketing': 'linear-gradient(135deg, #1C2333 0%, #14B8A6 100%)',
    'General': 'linear-gradient(135deg, #1C2333 0%, #64748B 100%)',
  };
  return gradients[industry] || 'linear-gradient(135deg, #142952 0%, #00875A 100%)';
}

// Export functions globally
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatFullDateTime = formatFullDateTime;
window.truncateText = truncateText;
window.getRandomGradient = getRandomGradient;
window.debounce = debounce;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showEmptyState = showEmptyState;
window.hideEmptyState = hideEmptyState;
window.showError = showError;
window.escapeHtml = escapeHtml;
window.getNext6Months = getNext6Months;
window.getIndustryGradient = getIndustryGradient;
