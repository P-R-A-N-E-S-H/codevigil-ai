import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeCodeOffline } from '../analyzers/staticAnalyzer.js';
import { calculateCodeMetrics } from '../analyzers/metricsEngine.js';

const PERSONA_PROMPTS = {
  architect: 'You are a Senior Principal Software Architect. Focus on system design, idiomatic patterns, scalability, maintainability, and clean architecture principles (SOLID, DRY).',
  security: 'You are a Cybersecurity Red Team Lead and Application Security Specialist. Focus on OWASP Top 10, CWE vulnerabilities, input validation, authentication, authorization, and secret safety.',
  performance: 'You are a High-Performance Systems & Algorithm Specialist. Focus on Big-O time and space complexity, memory allocations, caching, concurrency, and bottlenecks.',
  linter: 'You are a Strict Code Quality & Clean Code Specialist. Focus on style consistency, dead code removal, cyclomatic complexity reduction, naming conventions, and testability.',
  mentor: 'You are a Friendly Staff Engineer and Mentor. Provide encouraging, clear, and educational explanations with simple analogies and actionable step-by-step guidance.'
};

export async function reviewCodeWithAI({
  code,
  language = 'javascript',
  persona = 'architect',
  customRules = '',
  apiKey = null,
  modelName = 'gemini-2.0-flash'
}) {
  const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

  // Base metrics for fallback and enrichment
  const baseMetrics = calculateCodeMetrics(code, language);

  if (!activeApiKey) {
    console.log('[AI Service] No Gemini API key provided. Using built-in offline analysis engine.');
    return analyzeCodeOffline(code, language);
  }

  try {
    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({
      model: modelName || 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const personaInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.architect;

    const prompt = `
${personaInstruction}

Analyze the following ${language} code thoroughly.
${customRules ? `Additional Custom Rules to Enforce: ${customRules}` : ''}

You MUST return a valid JSON object matching this exact schema:
{
  "summary": "Concise summary of the code review findings and overall assessment.",
  "overallScore": 85, // Integer 0-100 reflecting overall code quality and security
  "healthGrade": "A" | "A+" | "B" | "C" | "D" | "F",
  "metrics": {
    "estimatedTimeComplexity": "O(N)",
    "estimatedSpaceComplexity": "O(1)",
    "cyclomaticComplexity": 3,
    "maintainabilityIndex": 88
  },
  "issues": [
    {
      "id": "ISSUE-1",
      "line": 12,
      "category": "Bug Risk" | "Performance" | "Maintainability" | "Async / Concurrency" | "Reliability",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "message": "Detailed description of the issue.",
      "suggestedFix": "How to resolve this issue."
    }
  ],
  "securityVulnerabilities": [
    {
      "name": "SQL Injection",
      "category": "Injection (A03:2021)",
      "cwe": "CWE-89",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "line": 15,
      "description": "Why this is insecure and what exploit it enables.",
      "remediation": "Specific secure fix instructions."
    }
  ],
  "fixedCode": "Full production-ready fixed and refactored code without bugs or vulnerabilities.",
  "explanation": [
    {
      "step": 1,
      "title": "Short title of change",
      "detail": "Detailed explanation of why and how this part was refactored."
    }
  ],
  "testCases": "// Ready to run unit tests in standard framework for ${language}"
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    // Merge calculated line counts & debt minutes with AI metrics
    parsedData.metrics = {
      ...baseMetrics,
      ...parsedData.metrics,
      overallScore: parsedData.overallScore || 85
    };

    return parsedData;
  } catch (error) {
    console.warn('[AI Service] Gemini API call failed or timed out. Falling back to offline analyzer:', error.message);
    const offlineResult = analyzeCodeOffline(code, language);
    offlineResult.warning = `AI API Error (${error.message}). Results served by offline static analyzer.`;
    return offlineResult;
  }
}

export async function chatWithAICodeAssistant({
  code,
  language = 'javascript',
  messages = [],
  apiKey = null,
  modelName = 'gemini-2.0-flash'
}) {
  const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeApiKey) {
    // Offline simulated responses
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let reply = "I am operating in offline mode. Please configure a Gemini API key in Settings for full interactive conversational AI.";

    if (lastUserMsg.includes('optimize') || lastUserMsg.includes('speed')) {
      reply = "To optimize this code, consider caching repeated computations, replacing nested O(N²) loops with Hash Maps/Sets for O(N) lookups, and leveraging asynchronous stream operations.";
    } else if (lastUserMsg.includes('security') || lastUserMsg.includes('vuln')) {
      reply = "Key security checks: 1) Always sanitize external inputs, 2) Use parameterized queries, 3) Avoid innerHTML and dynamic eval(), 4) Store secrets in environment variables.";
    } else if (lastUserMsg.includes('test')) {
      reply = "Good unit tests should verify happy paths, boundary inputs (empty arrays, 0, null, large inputs), and error handling triggers.";
    }

    return { reply };
  }

  try {
    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: modelName || 'gemini-2.0-flash' });

    const systemPrompt = `You are CodeVigil AI, an expert software engineer and pair programmer assistant.
Current Code in Editor (${language}):
\`\`\`${language}
${code}
\`\`\`

Answer the developer's question accurately, concisely, and with concrete code snippets whenever relevant.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to analyze and assist you with your code.' }] }
    ];

    messages.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    const result = await model.generateContent({ contents });
    return { reply: result.response.text() };
  } catch (err) {
    console.error('[AI Chat Service] Error:', err);
    return { reply: `Error connecting to AI assistant: ${err.message}. Please check your API key in Settings.` };
  }
}
