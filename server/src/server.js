import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { reviewCodeWithAI, chatWithAICodeAssistant } from './services/aiService.js';
import { executeCodeSandbox } from './services/codeRunner.js';
import { generateTestCases } from './services/testGenerator.js';
import { SAMPLE_SNIPPETS } from './data/sampleSnippets.js';
import { analyzeCodeOffline } from './analyzers/staticAnalyzer.js';
import { calculateCodeMetrics } from './analyzers/metricsEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CodeVigil AI Reviewer & Debugger Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Snippets Library
app.get('/api/snippets', (req, res) => {
  res.json({
    success: true,
    count: SAMPLE_SNIPPETS.length,
    snippets: SAMPLE_SNIPPETS
  });
});

// Code Review & Debug Endpoint
app.post('/api/review', async (req, res) => {
  try {
    const {
      code,
      language = 'javascript',
      persona = 'architect',
      customRules = '',
      apiKey = null,
      modelName = 'gemini-2.0-flash'
    } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Source code string is required.' });
    }

    const headerApiKey = req.headers['x-gemini-api-key'];
    const effectiveApiKey = apiKey || headerApiKey || process.env.GEMINI_API_KEY;

    const result = await reviewCodeWithAI({
      code,
      language,
      persona,
      customRules,
      apiKey: effectiveApiKey,
      modelName
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[API /review Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during code review.'
    });
  }
});

// Interactive Pair Programmer Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { code, language = 'javascript', messages = [], apiKey = null, modelName = 'gemini-2.0-flash' } = req.body;
    const headerApiKey = req.headers['x-gemini-api-key'];
    const effectiveApiKey = apiKey || headerApiKey || process.env.GEMINI_API_KEY;

    const result = await chatWithAICodeAssistant({
      code,
      language,
      messages,
      apiKey: effectiveApiKey,
      modelName
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[API /chat Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error in AI chat.'
    });
  }
});

// Safe Sandbox Code Runner
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language = 'javascript', stdin = '' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required for execution.' });
    }

    const result = await executeCodeSandbox({ code, language, stdin });
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[API /execute Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal error executing code.'
    });
  }
});

// Unit Test Case Generator
app.post('/api/generate-tests', async (req, res) => {
  try {
    const { code, language = 'javascript', framework = 'auto', apiKey = null } = req.body;
    const headerApiKey = req.headers['x-gemini-api-key'];
    const effectiveApiKey = apiKey || headerApiKey || process.env.GEMINI_API_KEY;

    const result = await generateTestCases({ code, language, framework, apiKey: effectiveApiKey });
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[API /generate-tests Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate unit tests.'
    });
  }
});

// Calculate Quick Metrics
app.post('/api/metrics', (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const metrics = calculateCodeMetrics(code, language);
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  CodeVigil AI Backend Server is RUNNING on http://localhost:${PORT}`);
  console.log(`✨  AI Model: ${process.env.DEFAULT_MODEL || 'gemini-2.0-flash'}`);
  console.log(`🔑  Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Offline Engine / Client Key'}`);
  console.log(`====================================================`);
});
