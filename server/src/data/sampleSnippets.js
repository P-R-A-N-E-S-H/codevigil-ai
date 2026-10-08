export const SAMPLE_SNIPPETS = [
  {
    id: "py-memory-resource-leak",
    title: "Python: Unclosed File & Memory Leak in Loop",
    language: "python",
    category: "Reliability & Resource Management",
    difficulty: "Intermediate",
    description: "Iterates over massive datasets opening file handles without context managers, causing OS descriptor leaks and memory accumulation.",
    code: `import os
import sys

def process_logs(log_directory):
    total_entries = 0
    results = []
    
    # Bug 1: Resource leak - file handles never closed in loop
    # Bug 2: Unbounded memory growth by keeping all lines in memory
    for root, dirs, files in os.walk(log_directory):
        for file in files:
            if file.endswith(".log"):
                path = os.path.join(root, file)
                f = open(path, "r")
                data = f.readlines()
                for line in data:
                    if "ERROR" in line:
                        results.append(line)
                        total_entries += 1
                        
    # Bug 3: Division by zero risk if no entries found
    average_err_per_file = total_entries / len(files)
    print(f"Total Errors: {total_entries}, Avg: {average_err_per_file}")
    return results

if __name__ == "__main__":
    process_logs("/var/log")
`,
    fixedCode: `import os
import sys
from typing import List, Generator

def process_logs(log_directory: str) -> List[str]:
    total_entries = 0
    results: List[str] = []
    matched_files_count = 0
    
    if not os.path.exists(log_directory):
        print(f"Directory {log_directory} does not exist.")
        return []
    
    for root, _, files in os.walk(log_directory):
        for file in files:
            if file.endswith(".log"):
                matched_files_count += 1
                path = os.path.join(root, file)
                try:
                    # FIX: Use context manager to guarantee file descriptor release
                    with open(path, "r", encoding="utf-8", errors="replace") as f:
                        for line in f: # Stream line by line to prevent OOM
                            if "ERROR" in line:
                                results.append(line.strip())
                                total_entries += 1
                except (IOError, OSError) as e:
                    print(f"Warning: Failed to read {path}: {e}", file=sys.stderr)
                    
    # FIX: Guard against ZeroDivisionError
    avg = (total_entries / matched_files_count) if matched_files_count > 0 else 0.0
    print(f"Total Errors: {total_entries}, Processed Files: {matched_files_count}, Avg/File: {avg:.2f}")
    return results

if __name__ == "__main__":
    process_logs("/var/log")
`
  },
  {
    id: "js-async-race-condition",
    title: "JavaScript: Async State Race Condition & Memory Leak",
    language: "javascript",
    category: "Asynchronous & Frontend Bugs",
    difficulty: "Advanced",
    description: "React useEffect / async data fetching with unhandled race condition, setState after unmount, and uncaught Promise rejections.",
    code: `// Async user profile search with rapid debouncing bug
let activeRequest = null;
let cachedUsers = {};

async function searchUsers(searchTerm) {
  // Bug 1: Global state mutation causes race conditions when user types quickly
  activeRequest = searchTerm;
  
  const response = await fetch(\`https://api.example.com/users?q=\${searchTerm}\`);
  const data = await response.json();
  
  // Bug 2: No check if response matches latest search term
  cachedUsers[searchTerm] = data;
  
  // Bug 3: DOM mutation directly inside API function without error handling
  document.getElementById("user-list").innerHTML = data
    .map(u => \`<li>\${u.name} - \${u.email}</li>\`)
    .join("");
    
  return data;
}

// Example calling trigger
searchUsers("alex");
searchUsers("alexander"); // Faster response can overwrite later query!
`,
    fixedCode: `// Fixed: AbortController support, request sequence tagging, and sanitized DOM rendering
const cachedUsers = new Map();
let currentAbortController = null;
let requestSequence = 0;

/**
 * Searches users safely with cancellation and sanitization.
 * @param {string} searchTerm
 * @returns {Promise<Array<{name: string, email: string}>>}
 */
async function searchUsers(searchTerm) {
  const sanitizedTerm = searchTerm.trim().toLowerCase();
  if (!sanitizedTerm) return [];

  // Cancel in-flight prior requests to prevent race conditions
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const currentSeq = ++requestSequence;

  if (cachedUsers.has(sanitizedTerm)) {
    return cachedUsers.get(sanitizedTerm);
  }

  try {
    const response = await fetch(
      \`https://api.example.com/users?q=\${encodeURIComponent(sanitizedTerm)}\`,
      { signal: currentAbortController.signal }
    );

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();

    // Guard: Discard stale responses if a newer search was initiated
    if (currentSeq !== requestSequence) {
      return [];
    }

    cachedUsers.set(sanitizedTerm, data);
    renderUserList(data);
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Search request was superseded and aborted.");
      return [];
    }
    console.error("Failed to fetch users:", error);
    renderError("Failed to load users. Please try again.");
    return [];
  }
}

function renderUserList(users) {
  const container = document.getElementById("user-list");
  if (!container) return;
  
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = \`\${u.name} - \${u.email}\`; // Safe against XSS
    fragment.appendChild(li);
  });
  
  container.appendChild(fragment);
}

function renderError(message) {
  const container = document.getElementById("user-list");
  if (container) {
    container.textContent = message;
  }
}
`
  },
  {
    id: "sql-injection-node",
    title: "SQL / Node.js: Critical SQL Injection & Auth Bypass",
    language: "javascript",
    category: "Security & OWASP Top 10",
    difficulty: "Critical",
    description: "Direct string concatenation in database query allowing authentication bypass and database exfiltration.",
    code: `const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

// Vulnerable Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // CRITICAL VULNERABILITY: Raw SQL string interpolation (CWE-89)
    // Payload: "admin' --" or "' OR 1=1 --"
    const query = "SELECT id, username, role FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    
    db.query(query, (err, results) => {
        if (err) {
            // INFORMATION DISCLOSURE: Exposing internal DB error stack
            return res.status(500).send(err.message);
        }
        
        if (results.length > 0) {
            // SENSITIVE DATA EXPOSURE: Returning raw user records without tokenization
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});
`,
    fixedCode: `const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const app = express();

app.use(express.json());

// Rate limiting to mitigate brute-force attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP
    message: { message: "Too many login attempts. Please try again later." }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // FIX 1: Parameterized query to prevent SQL Injection
        const query = 'SELECT id, username, password_hash, role FROM users WHERE username = $1 LIMIT 1';
        const result = await db.query(query, [username]);

        if (result.rows.length === 0) {
            // Constant-time response to prevent user enumeration
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = result.rows[0];
        
        // FIX 2: Secure Argon2/Bcrypt salted hash verification
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // FIX 3: Issue signed JWT instead of returning raw user db record
        const token = jwt.sign(
            { sub: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        // FIX 4: Sanitize error response, log securely internally
        console.error("Auth error:", err);
        return res.status(500).json({ message: "An internal authentication error occurred." });
    }
});
`
  },
  {
    id: "cpp-buffer-overflow",
    title: "C++: Buffer Overflow & Dangling Pointer",
    language: "cpp",
    category: "Memory Safety & Undefined Behavior",
    difficulty: "Advanced",
    description: "Unsafe strcpy usage into fixed-size buffer and returning pointer to stack-allocated local memory.",
    code: `#include <iostream>
#include <cstring>

char* create_greeting(const char* name) {
    // Bug 1: Local stack buffer returned to caller (Dangling pointer / UB)
    char buffer[16];
    
    // Bug 2: Unbounded strcpy causes buffer overflow (CWE-120)
    strcpy(buffer, "Hello, ");
    strcat(buffer, name);
    
    return buffer; // Dangerous!
}

int main(int argc, char* argv[]) {
    if (argc > 1) {
        char* msg = create_greeting(argv[1]);
        std::cout << msg << std::endl;
    }
    return 0;
}
`,
    fixedCode: `#include <iostream>
#include <string>
#include <string_view>

/**
 * Safely creates a greeting string using modern C++ memory management.
 * @param name User name string view
 * @return Safe std::string heap-managed object
 */
std::string create_greeting(std::string_view name) {
    // FIX: Using std::string eliminates buffer overflows and stack lifetime issues
    std::string greeting = "Hello, ";
    greeting.append(name);
    return greeting;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && argv[1] != nullptr) {
        std::string msg = create_greeting(argv[1]);
        std::cout << msg << std::endl;
    } else {
        std::cout << "Usage: ./app <name>" << std::endl;
    }
    return 0;
}
`
  },
  {
    id: "py-quadratic-complexity",
    title: "Python: O(N²) Quadratic Performance Bottleneck",
    language: "python",
    category: "Performance & Big-O Optimization",
    difficulty: "Intermediate",
    description: "Nested linear searches inside large list operations resulting in O(N²) execution times on arrays of 50k+ records.",
    code: `def find_duplicates_and_common(list_a, list_b):
    # Bug 1: Nested search across large lists is O(N * M)
    # Bug 2: List membership check 'item in list' is O(K) each time
    common_items = []
    for item in list_a:
        if item in list_b and item not in common_items:
            common_items.append(item)
            
    # Bug 3: Inefficient duplicate counting using list.count() in loop -> O(N^2)
    duplicates_in_a = []
    for item in list_a:
        if list_a.count(item) > 1 and item not in duplicates_in_a:
            duplicates_in_a.append(item)
            
    return common_items, duplicates_in_a
`,
    fixedCode: `from collections import Counter
from typing import List, Tuple, Any, Set

def find_duplicates_and_common(list_a: List[Any], list_b: List[Any]) -> Tuple[List[Any], List[Any]]:
    """
    Optimized O(N + M) implementation using Hash Sets and Counters.
    Reduces time complexity from O(N^2) to linear O(N + M).
    """
    # FIX 1: Hash set intersection for O(N + M) time complexity
    set_b: Set[Any] = set(list_b)
    # Preserve original insertion order while ensuring uniqueness
    seen: Set[Any] = set()
    common_items: List[Any] = []
    
    for item in list_a:
        if item in set_b and item not in seen:
            seen.add(item)
            common_items.append(item)
            
    # FIX 2: Counter dictionary for O(N) frequency check
    counts_a = Counter(list_a)
    duplicates_in_a: List[Any] = [item for item, count in counts_a.items() if count > 1]
    
    return common_items, duplicates_in_a
`
  },
  {
    id: "go-goroutine-leak",
    title: "Go: Goroutine Leak & Deadlock on Unbuffered Channel",
    language: "go",
    category: "Concurrency & Deadlocks",
    difficulty: "Advanced",
    description: "Goroutines blocked indefinitely trying to send to an unbuffered channel when early timeout occurs.",
    code: `package main

import (
    "context"
    "fmt"
    "time"
)

func queryFirstFastest(ctx context.Context, urls []string) string {
    // Bug: Unbuffered channel causes goroutine leak if receiver exits early!
    ch := make(chan string)
    
    for _, url := range urls {
        go func(u string) {
            // Simulated network fetch
            time.Sleep(100 * time.Millisecond)
            ch <- u // Blocks forever if another goroutine returned first!
        }(url)
    }
    
    select {
    case res := <-ch:
        return res
    case <-ctx.Done():
        return "timeout"
    }
}
`,
    fixedCode: `package main

import (
    "context"
    "fmt"
    "time"
)

func queryFirstFastest(ctx context.Context, urls []string) string {
    if len(urls) == 0 {
        return ""
    }
    
    // FIX: Buffer channel to length of URLs so goroutines never block on send
    ch := make(chan string, len(urls))
    
    for _, url := range urls {
        go func(u string) {
            select {
            case <-ctx.Done():
                // Cancel worker if context completed
                return
            default:
                // Simulated network fetch
                time.Sleep(100 * time.Millisecond)
                ch <- u
            }
        }(url)
    }
    
    select {
    case res := <-ch:
        return res
    case <-ctx.Done():
        return "timeout"
    }
}
`
  }
];
