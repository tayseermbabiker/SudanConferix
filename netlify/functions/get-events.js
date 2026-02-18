// Netlify Function: Get Events from Airtable (Sudan - Online Only)
const Airtable = require('airtable');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const params = event.queryStringParameters || {};
    const month = params.month;
    const industry = params.industry;

    // Show events today and in the future
    const today = new Date().toISOString().split('T')[0];
    let filterFormula = `AND({start_date} >= "${today}"`;


    if (month) {
      filterFormula += `, IS_SAME(DATETIME_PARSE({start_date}), DATETIME_PARSE("${month}-01"), "month")`;
    }

    if (industry) {
      filterFormula += `, {industry} = "${industry}"`;
    }

    filterFormula += ')';

    const records = await base('Events')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'start_date', direction: 'asc' }],
        maxRecords: 100
      })
      .all();

    const events = records.map(record => ({
      id: record.id,
      title: record.get('title'),
      description: record.get('description'),
      start_date: record.get('start_date'),
      end_date: record.get('end_date'),
      start_time: record.get('start_time'),
      organizer: record.get('organizer'),
      industry: record.get('industry'),
      event_link: record.get('event_link'),
      image_url: record.get('image_url'),
      source: record.get('source'),
      pricing: record.get('pricing') || 'Free'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        events: events,
        count: events.length
      })
    };

  } catch (error) {
    console.error('Get events error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch events',
        message: error.message
      })
    };
  }
};
