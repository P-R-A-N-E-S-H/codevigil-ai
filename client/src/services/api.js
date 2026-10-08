/**
 * CodeVigil AI — Unified Client API Service
 */

const API_BASE_URL = '/api';

function getStoredApiKey() {
  return localStorage.getItem('codevigil_gemini_api_key') || '';
}

function getStoredModel() {
  return localStorage.getItem('codevigil_selected_model') || 'gemini-2.0-flash';
}

function getHeaders(customApiKey = null) {
  const apiKey = customApiKey || getStoredApiKey();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers['x-gemini-api-key'] = apiKey;
  }
  return headers;
}

export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Health check failed (${res.status})`);
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      service: 'Offline Local Engine',
      aiConfigured: Boolean(getStoredApiKey()),
      error: err.message
    };
  }
}

export async function fetchSampleSnippets() {
  try {
    const res = await fetch(`${API_BASE_URL}/snippets`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load snippets (${res.status})`);
    const data = await res.json();
    return data.snippets || [];
  } catch (err) {
    console.warn('[API] Could not fetch server snippets, using fallback defaults.');
    return [];
  }
}

export async function reviewCode({
  code,
  language = 'javascript',
  persona = 'architect',
  customRules = '',
  apiKey = null,
  modelName = null
}) {
  const effectiveModel = modelName || getStoredModel();
  const effectiveKey = apiKey || getStoredApiKey();

  const res = await fetch(`${API_BASE_URL}/review`, {
    method: 'POST',
    headers: getHeaders(effectiveKey),
    body: JSON.stringify({
      code,
      language,
      persona,
      customRules,
      apiKey: effectiveKey || null,
      modelName: effectiveModel
    })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to review code.');
  }

  return json.data;
}

export async function sendChatMessage({
  code,
  language = 'javascript',
  messages = [],
  apiKey = null,
  modelName = null
}) {
  const effectiveModel = modelName || getStoredModel();
  const effectiveKey = apiKey || getStoredApiKey();

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: getHeaders(effectiveKey),
    body: JSON.stringify({
      code,
      language,
      messages,
      apiKey: effectiveKey || null,
      modelName: effectiveModel
    })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'AI Assistant failed to reply.');
  }

  return json.data;
}

export async function executeCode({ code, language = 'javascript', stdin = '' }) {
  const res = await fetch(`${API_BASE_URL}/execute`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, language, stdin })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Execution failed.');
  }

  return json.data;
}

export async function generateTests({
  code,
  language = 'javascript',
  framework = 'auto',
  apiKey = null
}) {
  const effectiveKey = apiKey || getStoredApiKey();

  const res = await fetch(`${API_BASE_URL}/generate-tests`, {
    method: 'POST',
    headers: getHeaders(effectiveKey),
    body: JSON.stringify({ code, language, framework, apiKey: effectiveKey || null })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate unit tests.');
  }

  return json.data;
}

export async function calculateMetrics({ code, language = 'javascript' }) {
  const res = await fetch(`${API_BASE_URL}/metrics`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, language })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Metrics calculation failed.');
  }

  return json.data;
}
