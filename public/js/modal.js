// Modal System — Sudan (Online Events, No Login)

function buildGoogleCalendarUrl(event) {
  const title = encodeURIComponent(event.title || '');
  const fmtDate = (d) => d ? d.replace(/-/g, '') : '';
  const start = fmtDate(event.start_date);
  const end = fmtDate(event.end_date || event.start_date);
  const endDate = end || start;
  const nextDay = endDate ? String(Number(endDate) + 1) : '';
  const location = encodeURIComponent('Online Event');
  const details = encodeURIComponent(
    (event.description ? event.description.substring(0, 500) + '\n\n' : '') +
    (event.event_link ? 'Join: ' + event.event_link : '')
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${nextDay}&location=${location}&details=${details}`;
}

function downloadICS(event) {
  const fmtDate = (d) => d ? d.replace(/-/g, '') : '';
  const start = fmtDate(event.start_date);
  const end = fmtDate(event.end_date || event.start_date);
  const nextDay = end ? String(Number(end) + 1) : String(Number(start) + 1);
  const desc = (event.description || '').substring(0, 500).replace(/\n/g, '\\n');
  const url = event.event_link || '';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Conferix//Impact//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${nextDay}`,
    `SUMMARY:${event.title || ''}`,
    `LOCATION:Online Event`,
    `DESCRIPTION:${desc}${url ? '\\nJoin: ' + url : ''}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (event.title || 'event').replace(/[^a-z0-9]/gi, '_') + '.ics';
  link.click();
  URL.revokeObjectURL(link.href);
}

function openEventModal(event) {
  const modal = document.getElementById('event-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  body.innerHTML = buildEventModalContent(event);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleEscapeKey);
}

function closeEventModal() {
  const modal = document.getElementById('event-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscapeKey);
  }
}

function buildEventModalContent(event) {
  const imageHtml = event.image_url
    ? `<img src="${escapeHtml(event.image_url)}" alt="${escapeHtml(event.title)}" class="modal-image">`
    : `<div class="modal-image" style="background: ${getIndustryGradient(event.industry)};display:flex;align-items:center;justify-content:center;"><span style="font-size:22px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:1px;">${escapeHtml(event.industry || 'Event')}</span></div>`;

  const startDate = formatFullDateTime(event.start_date);
  const endDate = event.end_date && event.end_date !== event.start_date ? formatFullDateTime(event.end_date) : '';

  const organizerHtml = event.organizer ? `
    <div class="meta-block">
      <strong>Organized by</strong>
      <p>${escapeHtml(event.organizer)}</p>
    </div>` : '';

  const descriptionHtml = event.description ? `
    <div class="description">
      <strong>About this event</strong>
      <p>${escapeHtml(event.description)}</p>
    </div>` : '';

  const eventLink = event.event_link || '#';

  return `
    ${imageHtml}
    <h2 style="margin-bottom:var(--space-md);color:var(--navy-dark);font-family:var(--font-serif);font-weight:400;">${escapeHtml(event.title)}</h2>
    <p class="modal-subtitle">
      <strong style="color:var(--primary-teal);">${(!event.pricing || event.pricing === 'Free') ? 'FREE' : escapeHtml(event.pricing)} · ONLINE EVENT</strong>
      ${event.source ? `&nbsp;&middot;&nbsp;<span style="color:var(--grey-dark);">via ${escapeHtml(event.source)}</span>` : ''}
    </p>
    <div class="modal-event-meta">
      <div class="meta-block">
        <strong>Date</strong>
        <p>${startDate}${event.start_time ? ` at ${event.start_time}` : ''}</p>
        ${endDate ? `<p>to ${endDate}</p>` : ''}
      </div>
      <div class="meta-block">
        <strong>Format</strong>
        <p>${(!event.pricing || event.pricing === 'Free') ? 'Free' : escapeHtml(event.pricing)} · Online</p>
      </div>
      ${organizerHtml}
      <div class="meta-block">
        <strong>Industry</strong>
        <p style="color:${getIndustryColor(event.industry)};font-weight:600;">${escapeHtml(event.industry || 'General')}</p>
      </div>
    </div>
    ${descriptionHtml}
    <button class="btn-primary btn-full" onclick="window.open('${escapeHtml(eventLink)}','_blank','noopener,noreferrer')" style="margin-top:var(--space-lg);">
      Join Event
    </button>
    <div class="cal-buttons" style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
      <a href="${buildGoogleCalendarUrl(event)}" target="_blank" rel="noopener" class="btn-cal">Google Calendar</a>
      <button type="button" class="btn-cal" onclick='downloadICS(${JSON.stringify({title:event.title,start_date:event.start_date,end_date:event.end_date,description:event.description,event_link:event.event_link})})'>Outlook / Apple</button>
    </div>
    <div style="margin-top:var(--space-lg);text-align:center;">
      <p style="font-size:14px;color:var(--grey-dark);margin-bottom:var(--space-sm);">Share this event</p>
      <div style="display:flex;gap:var(--space-sm);justify-content:center;flex-wrap:wrap;">
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventLink)}" target="_blank" rel="noopener" style="padding:8px 16px;background:#0077B5;color:white;border-radius:6px;font-size:14px;font-weight:500;">LinkedIn</a>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(eventLink)}" target="_blank" rel="noopener" style="padding:8px 16px;background:#1DA1F2;color:white;border-radius:6px;font-size:14px;font-weight:500;">Twitter</a>
        <a href="https://wa.me/?text=${encodeURIComponent(event.title + ' - ' + eventLink)}" target="_blank" rel="noopener" style="padding:8px 16px;background:#25D366;color:white;border-radius:6px;font-size:14px;font-weight:500;">WhatsApp</a>
      </div>
    </div>
    <p class="privacy-note" style="margin-top:var(--space-md);">You'll join via the organizer's online platform</p>
  `;
}

// Chip toggle: selecting specific chips unchecks "All", unchecking all re-checks "All"
function setupChipToggle(containerId, inputName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const checkboxes = container.querySelectorAll(`input[name="${inputName}"]`);
  const allChip = container.querySelector(`input[name="${inputName}"][value=""]`);

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb === allChip) {
        if (cb.checked) {
          checkboxes.forEach(c => { if (c !== allChip) c.checked = false; });
        } else {
          cb.checked = true;
        }
      } else {
        const anySpecific = Array.from(checkboxes).some(c => c !== allChip && c.checked);
        if (anySpecific) {
          allChip.checked = false;
        } else {
          allChip.checked = true;
        }
      }
    });
  });
}

// Gather checked chip values as comma-separated string
function getChipValues(inputName) {
  const checkboxes = document.querySelectorAll(`input[name="${inputName}"]:checked`);
  const values = Array.from(checkboxes).map(cb => cb.value).filter(v => v !== '');
  return values.join(', ');
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeEventModal();
  }
}

function getIndustryColor(industry) {
  const colors = {
    'Finance & Banking': '#10B981',
    'Healthcare & Medical': '#EF4444',
    'Technology & IT': '#0EA5E9',
    'Engineering': '#F59E0B',
    'Operations & Supply Chain': '#6366F1',
    'HR & People Development': '#EC4899',
    'Marketing': '#14B8A6',
  };
  return colors[industry] || '#64748B';
}
