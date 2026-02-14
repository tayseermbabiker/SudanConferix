// Event Submission Handler - Auto-publish (Sudan Impact)
const Airtable = require('airtable');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validate required fields (no city/venue — online only)
    const required = ['title', 'description', 'start_date', 'start_time', 'industry', 'event_link', 'organizer', 'contact_email'];
    for (const field of required) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `${field.replace(/_/g, ' ')} is required` })
        };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact_email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Validate URL format
    try {
      new URL(data.event_link);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid event link URL' })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const today = new Date().toISOString().split('T')[0];

    // Auto-publish: no approval needed
    const record = await base('Events').create({
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date || null,
      start_time: data.start_time,
      industry: data.industry,
      event_link: data.event_link,
      image_url: data.image_url || '',
      organizer: data.organizer,
      contact_email: data.contact_email,
      is_user_submitted: true,
      source: 'User Submitted',
      source_event_id: `user-${Date.now()}`,
      click_count: 0,
      created_at: today
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Event published successfully!',
        id: record.id
      })
    };

  } catch (error) {
    console.error('Event submission error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error. Please try again.' })
    };
  }
};
