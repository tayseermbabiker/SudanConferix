// Feedback submission — name + email(optional) + message → Airtable
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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.name || !data.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name and message are required' })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const today = new Date().toISOString().split('T')[0];

    await base('Feedback').create({
      name: data.name,
      email: data.email || '',
      message: data.message,
      created_at: today
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Thank you for your feedback!' })
    };

  } catch (error) {
    console.error('Feedback submission error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
    };
  }
};
