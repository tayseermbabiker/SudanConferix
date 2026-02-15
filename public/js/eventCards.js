// Event Card Rendering — Sudan (Online Events Only)

function addIndustryPlaceholder(wrapper, industry) {
  wrapper.style.background = getIndustryGradient(industry);
  const label = document.createElement('span');
  label.className = 'placeholder-industry';
  label.textContent = industry || 'Event';
  wrapper.appendChild(label);
}

function createEventCard(event) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.setAttribute('data-event-id', event.id);
  card.onclick = () => openEventModal(event);

  // Image wrapper
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'event-card-image-wrapper';

  if (event.image_url) {
    const img = document.createElement('img');
    img.className = 'event-card-image';
    img.src = event.image_url;
    img.alt = event.title;
    img.loading = 'lazy';
    img.onerror = function() { addIndustryPlaceholder(this.parentElement, event.industry); this.remove(); };
    imageWrapper.appendChild(img);
  } else {
    addIndustryPlaceholder(imageWrapper, event.industry);
  }

  // Category badge (top-left)
  if (event.industry) {
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    categoryBadge.textContent = event.industry;
    imageWrapper.appendChild(categoryBadge);
  }

  // Online badge (top-right) — replaces cost badge
  const onlineBadge = document.createElement('span');
  onlineBadge.className = 'online-badge';
  onlineBadge.textContent = 'ONLINE';
  imageWrapper.appendChild(onlineBadge);

  card.appendChild(imageWrapper);

  // Card content
  const content = document.createElement('div');
  content.className = 'event-card-content';

  const title = document.createElement('h3');
  title.className = 'event-title';
  title.dir = 'auto';
  title.textContent = truncateText(event.title, 80);
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'event-meta';

  // Date + time
  const dateItem = document.createElement('div');
  dateItem.className = 'event-meta-item';
  const timeText = event.start_time ? ` at ${event.start_time}` : '';
  dateItem.innerHTML = `
    <span class="icon">📅</span>
    <span>${formatDate(event.start_date)}${timeText}</span>
  `;
  meta.appendChild(dateItem);

  // Pricing indicator
  const isFree = !event.pricing || event.pricing === 'Free';
  const pricingItem = document.createElement('div');
  pricingItem.className = 'event-meta-item';
  pricingItem.innerHTML = `
    <span class="icon">${isFree ? '🎟️' : '💰'}</span>
    <span>${isFree ? 'Free' : escapeHtml(event.pricing)}</span>
  `;
  meta.appendChild(pricingItem);

  content.appendChild(meta);

  // Organizer
  if (event.organizer) {
    const organizer = document.createElement('p');
    organizer.className = 'event-organizer';
    organizer.textContent = `By ${escapeHtml(event.organizer)}`;
    content.appendChild(organizer);
  }

  // View details hint
  const detailsHint = document.createElement('p');
  detailsHint.className = 'view-details-hint';
  detailsHint.textContent = 'View details \u2192';
  content.appendChild(detailsHint);

  // Join Event button
  const joinBtn = document.createElement('button');
  joinBtn.className = 'btn-primary btn-full';
  joinBtn.textContent = 'Join Event';
  joinBtn.onclick = (e) => {
    e.stopPropagation();
    if (event.event_link) {
      window.open(event.event_link, '_blank', 'noopener,noreferrer');
    }
  };
  content.appendChild(joinBtn);

  card.appendChild(content);

  return card;
}

function renderEventCards(events) {
  const eventsGrid = document.getElementById('events-grid');

  if (!eventsGrid) {
    console.error('Events grid element not found');
    return;
  }

  eventsGrid.innerHTML = '';

  if (!events || events.length === 0) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  events.forEach(event => {
    const card = createEventCard(event);
    eventsGrid.appendChild(card);
  });

  injectJsonLd(events);
}

function injectJsonLd(events) {
  const existing = document.getElementById('json-ld-events');
  if (existing) existing.remove();

  const items = events.slice(0, 50).map((evt, i) => {
    const item = {
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Event',
        'name': evt.title,
        'startDate': evt.start_date,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
        'isAccessibleForFree': !evt.pricing || evt.pricing === 'Free',
      }
    };

    const e = item.item;
    if (evt.end_date) e.endDate = evt.end_date;
    if (evt.description) e.description = evt.description.substring(0, 300);
    if (evt.image_url) e.image = evt.image_url;

    if (evt.event_link) {
      e.location = { '@type': 'VirtualLocation', 'url': evt.event_link };
      e.url = evt.event_link;
    }

    if (evt.organizer) {
      e.organizer = { '@type': 'Organization', 'name': evt.organizer };
    }

    const evtFree = !evt.pricing || evt.pricing === 'Free';
    e.offers = {
      '@type': 'Offer',
      'price': evtFree ? '0' : evt.pricing,
      'priceCurrency': evtFree ? 'USD' : '',
      'availability': 'https://schema.org/InStock',
    };

    return item;
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': items,
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'json-ld-events';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// Export
window.createEventCard = createEventCard;
window.renderEventCards = renderEventCards;
