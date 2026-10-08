/**
 * Metrics Engine for Code Quality, Complexity and Maintainability Analysis
 */

export function calculateCodeMetrics(code, language = 'javascript') {
  if (!code || typeof code !== 'string') {
    return {
      loc: 0,
      blankLines: 0,
      commentLines: 0,
      codeLines: 0,
      cyclomaticComplexity: 1,
      maintainabilityIndex: 100,
      estimatedTimeComplexity: 'O(1)',
      estimatedSpaceComplexity: 'O(1)',
      technicalDebtMinutes: 0,
      qualityScore: 100,
      healthGrade: 'A+'
    };
  }

  const lines = code.split(/\r?\n/);
  const totalLoc = lines.length;
  let blankLines = 0;
  let commentLines = 0;

  const isJsLike = ['javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php'].includes(language.toLowerCase());
  const isPython = ['python', 'py'].includes(language.toLowerCase());
  const isSql = ['sql'].includes(language.toLowerCase());

  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      blankLines++;
      continue;
    }

    if (isJsLike) {
      if (inBlockComment) {
        commentLines++;
        if (trimmed.includes('*/')) inBlockComment = false;
        continue;
      }
      if (trimmed.startsWith('/*')) {
        commentLines++;
        if (!trimmed.includes('*/')) inBlockComment = true;
        continue;
      }
      if (trimmed.startsWith('//')) {
        commentLines++;
        continue;
      }
    } else if (isPython) {
      if (trimmed.startsWith('#')) {
        commentLines++;
        continue;
      }
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        commentLines++;
        continue;
      }
    } else if (isSql) {
      if (trimmed.startsWith('--')) {
        commentLines++;
        continue;
      }
    }
  }

  const codeLines = Math.max(1, totalLoc - blankLines - commentLines);

  // 1. Calculate Cyclomatic Complexity
  let cyclomaticComplexity = 1;

  const branchPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\belif\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\bexcept\b/g,
    /&&/g,
    /\|\|/g,
    /\band\b/g,
    /\bor\b/g,
    /\?\s*[^:]+\s*:/g // Ternary operator
  ];

  for (const pattern of branchPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      cyclomaticComplexity += matches.length;
    }
  }

  // 2. Estimate Big-O Time Complexity based on loop nesting and algorithms
  let estimatedTimeComplexity = 'O(1)';
  let estimatedSpaceComplexity = 'O(1)';

  // Check nested loops
  const loopKeywords = (code.match(/\b(for|while)\b/g) || []).length;
  const recursionMatch = code.match(/function\s+(\w+)|def\s+(\w+)/);
  const funcName = recursionMatch ? (recursionMatch[1] || recursionMatch[2]) : null;
  const isRecursive = funcName ? new RegExp(`\\b${funcName}\\s*\\(`, 'g').test(code.replace(new RegExp(`def\\s+${funcName}|function\\s+${funcName}`), '')) : false;

  // Search for nested loops indentation or bracket levels
  let maxLoopNesting = 0;
  let currentLoopNesting = 0;

  lines.forEach(l => {
    if (/\b(for|while)\b/.test(l)) {
      currentLoopNesting++;
      if (currentLoopNesting > maxLoopNesting) {
        maxLoopNesting = currentLoopNesting;
      }
    }
    if (l.includes('}') || (isPython && l.length > 0 && l.charAt(0) !== ' ' && l.charAt(0) !== '\t')) {
      if (currentLoopNesting > 0) currentLoopNesting = Math.max(0, currentLoopNesting - 1);
    }
  });

  if (maxLoopNesting >= 3) {
    estimatedTimeComplexity = 'O(N³)';
  } else if (maxLoopNesting === 2) {
    estimatedTimeComplexity = 'O(N²)';
  } else if (maxLoopNesting === 1) {
    if (code.includes('sort(') || code.includes('.sort') || code.includes('sorted(')) {
      estimatedTimeComplexity = 'O(N log N)';
    } else {
      estimatedTimeComplexity = 'O(N)';
    }
  } else if (isRecursive) {
    estimatedTimeComplexity = 'O(2ⁿ) or O(N)';
    estimatedSpaceComplexity = 'O(N) Call Stack';
  }

  if (/new\s+Array|malloc|vector|\[\s*\]|\{\s*\}|set\(|dict\(|map</.test(code)) {
    estimatedSpaceComplexity = maxLoopNesting > 0 ? 'O(N)' : 'O(1)';
  }

  // 3. Maintainability Index calculation (Simplified Halstead + Cyclomatic model)
  // MI = 171 - 5.2 * ln(V) - 0.23 * (CC) - 16.2 * ln(LOC)
  const safeLoc = Math.max(1, codeLines);
  const rawMI = 171 - 5.2 * Math.log(safeLoc * 4) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(safeLoc);
  const normalizedMI = Math.max(10, Math.min(100, Math.round((rawMI / 171) * 100)));

  // 4. Calculate Quality Score & Grade
  let qualityScore = Math.round(normalizedMI * 0.5 + Math.max(0, 100 - (cyclomaticComplexity * 4)) * 0.5);
  qualityScore = Math.max(20, Math.min(99, qualityScore));

  let healthGrade = 'A+';
  if (qualityScore < 60) healthGrade = 'D';
  else if (qualityScore < 70) healthGrade = 'C';
  else if (qualityScore < 80) healthGrade = 'B';
  else if (qualityScore < 90) healthGrade = 'A';

  return {
    loc: totalLoc,
    blankLines,
    commentLines,
    codeLines,
    cyclomaticComplexity,
    maintainabilityIndex: normalizedMI,
    estimatedTimeComplexity,
    estimatedSpaceComplexity,
    technicalDebtMinutes: Math.round(cyclomaticComplexity * 5 + codeLines * 0.4),
    qualityScore,
    healthGrade
  };
}
