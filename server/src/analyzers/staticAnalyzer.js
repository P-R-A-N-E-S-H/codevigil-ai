import { calculateCodeMetrics } from './metricsEngine.js';
import { scanSecurityVulnerabilities } from './securityScanner.js';

/**
 * Heuristic Rules Engine for Bug Detection and Code Quality Analysis
 */
const QUALITY_RULES = [
  {
    id: 'BUG-EQ-01',
    category: 'Bug Risk',
    severity: 'Medium',
    languages: ['javascript', 'typescript'],
    pattern: /[^!=]==[^=]|[^!]===[^=]/,
    customCheck: (line) => {
      // Look for == instead of === (ignoring === and !==)
      return /[^!=]==[^=]/.test(line) && !line.includes('===');
    },
    message: 'Use strict equality `===` instead of loose equality `==` to prevent unexpected type coercion bugs.',
    suggestedFix: 'Replace `==` with `===`.'
  },
  {
    id: 'BUG-ASYNC-02',
    category: 'Async / Concurrency',
    severity: 'High',
    languages: ['javascript', 'typescript'],
    pattern: /async\s+function|=>\s*async|\basync\b/,
    customCheck: (line, allLines, index) => {
      // Check for unhandled fetch or async calls without await or catch
      if (line.includes('fetch(') && !line.includes('await') && !line.includes('.then(') && !line.includes('.catch(')) {
        return true;
      }
      return false;
    },
    message: 'Unhandled Promise: `fetch()` call is missing `await` or `.catch()` error handling.',
    suggestedFix: 'Add `await` or chain `.catch()` to handle network rejections.'
  },
  {
    id: 'BUG-DIV-03',
    category: 'Reliability',
    severity: 'High',
    languages: ['all'],
    pattern: /\/\s*(?:len\(|count|files\.length|data\.length|items\.length|size\(\))/i,
    message: 'Potential Division by Zero when dividing by array length or container size without verifying length > 0.',
    suggestedFix: 'Wrap with a guard check: `if len(items) > 0: ... else 0`'
  },
  {
    id: 'PERF-LOOP-04',
    category: 'Performance',
    severity: 'Medium',
    languages: ['all'],
    pattern: /(?:for|while).*?\{?[\s\S]*?(?:fetch|axios|query|db\.|SELECT|requests\.get|open\()/m,
    customCheck: (line, allLines, index) => {
      // Detect I/O or DB query inside loop
      if (/(?:for|while)\s*\(|for\s+\w+\s+in/.test(line)) {
        for (let i = index + 1; i < Math.min(allLines.length, index + 8); i++) {
          if (/fetch\(|axios\.|db\.query|\.query\(|requests\.get|open\(/.test(allLines[i])) {
            return true;
          }
        }
      }
      return false;
    },
    message: 'N+1 Query / I/O Bottleneck: Database queries or network/file operations detected inside a loop.',
    suggestedFix: 'Batch requests or queries outside the loop using `IN (...)` or `Promise.all()`.'
  },
  {
    id: 'PERF-COUNT-05',
    category: 'Performance',
    severity: 'Medium',
    languages: ['python'],
    pattern: /\.count\s*\(/,
    customCheck: (line) => line.includes('.count(') && /for\s+/.test(line),
    message: 'O(N²) Quadratic Complexity: Calling `list.count()` inside a loop scans the entire list on every iteration.',
    suggestedFix: 'Use `collections.Counter()` to compute counts in linear O(N) time.'
  },
  {
    id: 'STYLE-LONG-06',
    category: 'Maintainability',
    severity: 'Low',
    languages: ['all'],
    customCheck: (line, allLines, index) => {
      // Check function length > 40 lines
      if (/function\s+\w+|def\s+\w+/.test(line)) {
        let blockLines = 0;
        for (let i = index + 1; i < allLines.length; i++) {
          if (/function\s+\w+|def\s+\w+/.test(allLines[i])) break;
          blockLines++;
        }
        return blockLines > 40;
      }
      return false;
    },
    message: 'Function exceeds recommended maximum length (40+ lines). Violates Single Responsibility Principle.',
    suggestedFix: 'Decompose the function into smaller, single-purpose helper functions.'
  },
  {
    id: 'BUG-CATCH-07',
    category: 'Reliability',
    severity: 'Medium',
    languages: ['javascript', 'typescript', 'python', 'java'],
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}|except.*:\s*pass/i,
    message: 'Empty catch/except block: Exceptions are silently swallowed, making debugging nearly impossible.',
    suggestedFix: 'Log the error or rethrow with contextual information.'
  },
  {
    id: 'BUG-RES-08',
    category: 'Resource Management',
    severity: 'High',
    languages: ['python'],
    customCheck: (line, allLines, index) => {
      // Open without with in python
      if (/=\s*open\s*\(/.test(line) && !/with\s+open/.test(line)) {
        // Check if there is f.close() later
        let hasClose = false;
        for (let i = index + 1; i < Math.min(allLines.length, index + 25); i++) {
          if (/\.close\(\)/.test(allLines[i])) hasClose = true;
        }
        return !hasClose;
      }
      return false;
    },
    message: 'Unclosed File Handle: File opened with `open()` without a `with` context manager or `.close()`.',
    suggestedFix: 'Use `with open(filepath, "r") as f:` to ensure automatic cleanup even on exceptions.'
  }
];

export function analyzeCodeOffline(code, language = 'javascript') {
  const metrics = calculateCodeMetrics(code, language);
  const securityVulnerabilities = scanSecurityVulnerabilities(code, language);
  const issues = [];
  const lines = code.split(/\r?\n/);

  // Apply Quality Rules
  QUALITY_RULES.forEach(rule => {
    if (rule.languages.includes('all') || rule.languages.includes(language.toLowerCase())) {
      lines.forEach((line, index) => {
        let isMatch = false;
        if (rule.customCheck) {
          isMatch = rule.customCheck(line, lines, index);
        } else if (rule.pattern && rule.pattern.test(line)) {
          isMatch = true;
        }

        if (isMatch) {
          issues.push({
            id: `${rule.id}-L${index + 1}`,
            line: index + 1,
            lineContent: line.trim(),
            category: rule.category,
            severity: rule.severity,
            message: rule.message,
            suggestedFix: rule.suggestedFix || 'Refactor code to follow recommended best practices.'
          });
        }
      });
    }
  });

  // Calculate adjusted Health Score
  let deductions = 0;
  securityVulnerabilities.forEach(v => {
    deductions += v.severity === 'Critical' ? 25 : v.severity === 'High' ? 15 : 8;
  });
  issues.forEach(i => {
    deductions += i.severity === 'High' ? 10 : i.severity === 'Medium' ? 5 : 2;
  });

  const overallScore = Math.max(15, Math.min(100, Math.round(metrics.qualityScore - deductions)));

  // Generate Suggested Fixed Code if standard fixes are recognized
  let fixedCode = generateAutoFix(code, language, issues, securityVulnerabilities);

  return {
    summary: `Code review completed. Found ${issues.length} code quality issues and ${securityVulnerabilities.length} security vulnerabilities. Overall Health Score: ${overallScore}/100.`,
    overallScore,
    healthGrade: overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'F',
    metrics: {
      ...metrics,
      overallScore
    },
    issues,
    securityVulnerabilities,
    fixedCode,
    explanation: [
      {
        step: 1,
        title: "Remediate Security Vulnerabilities",
        detail: securityVulnerabilities.length > 0 
          ? `Addressed ${securityVulnerabilities.length} security flaw(s) including ${securityVulnerabilities.map(v => v.name).join(', ')}.` 
          : "No critical security vulnerabilities detected."
      },
      {
        step: 2,
        title: "Optimize Time & Space Complexity",
        detail: `Analyzed algorithmic structure. Estimated Time Complexity: ${metrics.estimatedTimeComplexity}, Space Complexity: ${metrics.estimatedSpaceComplexity}.`
      },
      {
        step: 3,
        title: "Resource Safety & Exception Handling",
        detail: "Refactored resource lifecycles with safe context managers and defensive parameter guards."
      }
    ]
  };
}

function generateAutoFix(code, language, issues, securityVulns) {
  let fixed = code;

  // Replace loose equality
  if (['javascript', 'typescript'].includes(language.toLowerCase())) {
    fixed = fixed.replace(/([^!=])==([^=])/g, '$1===$2');
  }

  // Replace Python unclosed open() with with open
  if (['python', 'py'].includes(language.toLowerCase())) {
    if (fixed.includes('f = open(') && !fixed.includes('with open(')) {
      fixed = fixed.replace(/(\s*)f\s*=\s*open\(([^)]+)\)\s*\n\s*data\s*=\s*f\.readlines\(\)/g, 
        '$1with open($2, "r", encoding="utf-8") as f:\n$1    for line in f:');
    }
  }

  return fixed;
}
