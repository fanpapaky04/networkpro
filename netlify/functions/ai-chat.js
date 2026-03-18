exports.handler = async function(event, context) {
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

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    const { messages, systemPrompt } = JSON.parse(event.body);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ error: data.error.message })
      };
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: aiResponse })
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
