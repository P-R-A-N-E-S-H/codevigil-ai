/**
 * Security Vulnerability Scanner & OWASP Top 10 Analyzer
 */

const SECURITY_RULES = [
  {
    id: 'SEC-SQL-01',
    name: 'SQL Injection Vulnerability',
    category: 'Injection (A03:2021)',
    cwe: 'CWE-89',
    severity: 'Critical',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*?(?:\+|%|\$)\s*.*?['"]/i,
    description: 'Dynamic SQL query construction detected via string concatenation or template literals. Allows unauthorized database reading or modification.',
    remediation: 'Use parameterized queries, prepared statements, or ORM/query builder parameter binding ($1, ?, :param).'
  },
  {
    id: 'SEC-CMD-02',
    name: 'Arbitrary Command Injection',
    category: 'Injection (A03:2021)',
    cwe: 'CWE-78',
    severity: 'Critical',
    pattern: /\b(?:exec|execSync|spawn|popen|system|eval)\s*\(\s*[^'"][^)]*?\)/,
    description: 'Unsanitized input passed directly to system command execution or dynamic code evaluation runtime.',
    remediation: 'Avoid invoking system shells directly. Pass arguments as arrays using spawn or parameterized execution utilities.'
  },
  {
    id: 'SEC-XSS-03',
    name: 'Cross-Site Scripting (XSS)',
    category: 'Injection (A03:2021)',
    cwe: 'CWE-79',
    severity: 'High',
    pattern: /\b(?:innerHTML|outerHTML|dangerouslySetInnerHTML|document\.write)\s*=/i,
    description: 'Direct insertion of raw HTML/strings into the DOM allows malicious scripts to execute within the victim browser.',
    remediation: 'Use textContent, innerText, or sanitization libraries like DOMPurify before inserting dynamic HTML.'
  },
  {
    id: 'SEC-KEY-04',
    name: 'Hardcoded Secret / API Token',
    category: 'Cryptographic Failures (A02:2021)',
    cwe: 'CWE-798',
    severity: 'Critical',
    pattern: /(?:(?:api[_-]?key|secret|password|token|bearer|auth|jwt_secret)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{12,}['"])|(?:AIza[0-9A-Za-z-_]{35})|(?:ghp_[a-zA-Z0-9]{36})|(?:sk-[a-zA-Z0-9]{32,})|(?:-----BEGIN (?:RSA )?PRIVATE KEY-----)/i,
    description: 'Hardcoded sensitive credential, token, or private key discovered in source code.',
    remediation: 'Store credentials in environment variables (`process.env` or `os.environ`) and use secret management vaults.'
  },
  {
    id: 'SEC-TRAV-05',
    name: 'Path Traversal Vulnerability',
    category: 'Broken Access Control (A01:2021)',
    cwe: 'CWE-22',
    severity: 'High',
    pattern: /(?:readFile|open|createReadStream|sendFile)\s*\(\s*.*?(?:\+|path\.join).*?(?:req\.|params|query|body|input)/i,
    description: 'User-controlled file paths passed to file system operations without validation against directory traversal (../).',
    remediation: 'Validate input against an allowlist, use `path.basename()`, or verify `path.resolve()` remains inside the intended root directory.'
  },
  {
    id: 'SEC-CRYPTO-06',
    name: 'Insecure Cryptography / Weak Hash',
    category: 'Cryptographic Failures (A02:2021)',
    cwe: 'CWE-327',
    severity: 'Medium',
    pattern: /\b(?:createHash\s*\(\s*['"](?:md5|sha1)['"]|hashlib\.(?:md5|sha1)\s*\(|Math\.random\s*\()/i,
    description: 'Use of deprecated hash algorithm (MD5/SHA-1) or predictable pseudo-random number generator for security purposes.',
    remediation: 'Use SHA-256/SHA-512 for data integrity, bcrypt/Argon2 for passwords, and `crypto.randomBytes()` / `secrets` module for crypto tokens.'
  },
  {
    id: 'SEC-DESER-07',
    name: 'Insecure Deserialization',
    category: 'Software & Data Integrity Failures (A08:2021)',
    cwe: 'CWE-502',
    severity: 'Critical',
    pattern: /\b(?:pickle\.loads|yaml\.load\s*\([^)]*?(?:Loader\s*=\s*yaml\.(?:FullLoader|Loader))?|unserialize\s*\(|node-serialize)/i,
    description: 'Untrusted input deserialization may allow arbitrary object instantiation and remote code execution.',
    remediation: 'Use safe serialization formats like JSON, or `yaml.safe_load()` instead of unrestricted deserializers.'
  },
  {
    id: 'SEC-MEM-08',
    name: 'Unsafe Memory Operation / Buffer Overflow',
    category: 'Memory Safety',
    cwe: 'CWE-120',
    severity: 'High',
    pattern: /\b(?:strcpy|strcat|sprintf|gets|scanf\s*\(\s*["']%s["'])\b/,
    description: 'Use of unbounded C-string manipulation functions susceptible to memory corruption and buffer overflow attacks.',
    remediation: 'Replace with bounded equivalents like `strncpy`, `snprintf`, or modern C++ `std::string` and `std::string_view`.'
  },
  {
    id: 'SEC-PROTO-09',
    name: 'Prototype Pollution Vulnerability',
    category: 'Software & Data Integrity Failures (A08:2021)',
    cwe: 'CWE-1321',
    severity: 'Medium',
    pattern: /\[\s*['"]__proto__['"]\s*\]|Object\.prototype|merge\s*\(.*?target.*?source\)/,
    description: 'Modification of base JavaScript Object prototype can cause denial-of-service or remote code execution across the application.',
    remediation: 'Freeze Object.prototype, use Map objects instead of plain objects, or validate against keys like `__proto__` and `constructor`.'
  }
];

export function scanSecurityVulnerabilities(code, language = 'javascript') {
  const vulnerabilities = [];
  if (!code || typeof code !== 'string') return vulnerabilities;

  const lines = code.split(/\r?\n/);

  SECURITY_RULES.forEach(rule => {
    lines.forEach((line, index) => {
      if (rule.pattern.test(line)) {
        vulnerabilities.push({
          id: `${rule.id}-L${index + 1}`,
          ruleId: rule.id,
          name: rule.name,
          category: rule.category,
          cwe: rule.cwe,
          severity: rule.severity,
          line: index + 1,
          lineContent: line.trim(),
          description: rule.description,
          remediation: rule.remediation
        });
      }
    });
  });

  return vulnerabilities;
}
