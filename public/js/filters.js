// Filters Logic — Sudan (Industry + Month only, no city/cost)

let allEvents = [];
let activeFilters = {
  month: '',
  industries: []
};

function initializeFilters() {
  // Month filter
  const monthFilter = document.getElementById('filter-month');
  if (monthFilter) {
    const months = getNext6Months();
    months.forEach(month => {
      const option = document.createElement('option');
      option.value = month.value;
      option.textContent = month.label;
      monthFilter.appendChild(option);
    });

    monthFilter.addEventListener('change', (e) => {
      activeFilters.month = e.target.value;
      applyFilters();
    });
  }

  // Industry multi-select
  setupMultiSelect('industry', 'industries', 'All Industries');

  // Clear filters
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.multi-select')) {
      document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.remove('open'));
    }
  });
}

function setupMultiSelect(name, filterKey, defaultLabel) {
  const btn = document.getElementById(`${name}-btn`);
  const dropdown = document.getElementById(`${name}-dropdown`);

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.multi-select-dropdown').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });
    dropdown.classList.toggle('open');
  });

  dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = dropdown.querySelectorAll('input:checked');
      const values = Array.from(checked).map(c => c.value);
      activeFilters[filterKey] = values;

      if (values.length === 0) {
        btn.textContent = defaultLabel + ' ▾';
      } else if (values.length === 1) {
        btn.textContent = values[0] + ' ▾';
      } else {
        btn.textContent = values.length + ' selected ▾';
      }

      applyFilters();
    });
  });
}

function applyFilters() {
  let filtered = [...allEvents];

  // Month
  if (activeFilters.month) {
    filtered = filtered.filter(e => e.start_date.substring(0, 7) === activeFilters.month);
  }

  // Industries (multi)
  if (activeFilters.industries.length > 0) {
    filtered = filtered.filter(e => activeFilters.industries.includes(e.industry));
  }

  renderEventCards(filtered);
  updateClearButtonVisibility();
}

function clearFilters() {
  activeFilters = { month: '', industries: [] };

  const monthFilter = document.getElementById('filter-month');
  if (monthFilter) monthFilter.value = '';

  document.querySelectorAll('.multi-select-dropdown input').forEach(cb => cb.checked = false);

  const industryBtn = document.getElementById('industry-btn');
  if (industryBtn) industryBtn.textContent = 'All Industries ▾';

  renderEventCards(allEvents);
  updateClearButtonVisibility();
}

function updateClearButtonVisibility() {
  const clearBtn = document.getElementById('clear-filters');
  if (!clearBtn) return;

  const hasFilters = activeFilters.month || activeFilters.industries.length > 0;
  clearBtn.style.display = hasFilters ? 'inline-block' : 'none';
}

function setAllEvents(events) {
  allEvents = events || [];
  renderEventCards(allEvents);
}

function getFilterQueryString() {
  const params = new URLSearchParams();
  if (activeFilters.month) params.append('month', activeFilters.month);
  if (activeFilters.industries.length > 0) params.append('industries', activeFilters.industries.join(','));
  return params.toString();
}

// Export
window.initializeFilters = initializeFilters;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.setAllEvents = setAllEvents;
window.getFilterQueryString = getFilterQueryString;
