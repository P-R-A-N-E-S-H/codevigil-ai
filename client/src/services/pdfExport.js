import { jsPDF } from 'jspdf';

/**
 * Export audit review results to a formatted PDF document
 */
export function exportReviewToPdf(reviewData, language, rawCode) {
  if (!reviewData) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title Banner
  doc.setFillColor(15, 23, 42); // Navy / Dark slate
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CodeVigil AI — Code Review & Security Audit', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleString()} | Language: ${language.toUpperCase()} | Score: ${reviewData.overallScore || 0}/100 (Grade: ${reviewData.healthGrade || 'N/A'})`, 14, 27);

  yPos = 45;

  // Executive Summary
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. Executive Summary', 14, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(reviewData.summary || 'No summary available.', pageWidth - 28);
  doc.text(summaryLines, 14, yPos);
  yPos += summaryLines.length * 5 + 8;

  // Metrics Section
  if (reviewData.metrics) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Code Metrics & Complexity Analysis', 14, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    const m = reviewData.metrics;
    const metricsText = [
      `• Estimated Time Complexity: ${m.estimatedTimeComplexity || 'O(1)'}`,
      `• Estimated Space Complexity: ${m.estimatedSpaceComplexity || 'O(1)'}`,
      `• Cyclomatic Complexity: ${m.cyclomaticComplexity || 1}`,
      `• Maintainability Index: ${m.maintainabilityIndex || 100}/100`,
      `• Total Lines of Code (LOC): ${m.loc || 0} (Source: ${m.codeLines || 0}, Comments: ${m.commentLines || 0})`,
      `• Estimated Technical Debt: ${m.technicalDebtMinutes || 0} minutes`
    ];

    metricsText.forEach(line => {
      doc.text(line, 16, yPos);
      yPos += 5;
    });
    yPos += 6;
  }

  // Security Vulnerabilities (OWASP)
  if (reviewData.securityVulnerabilities && reviewData.securityVulnerabilities.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`3. Security Vulnerabilities (${reviewData.securityVulnerabilities.length} Found)`, 14, yPos);
    yPos += 7;

    reviewData.securityVulnerabilities.forEach((v, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(254, 242, 242);
      doc.roundedRect(14, yPos - 3, pageWidth - 28, 22, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(185, 28, 28);
      doc.text(`[${v.severity?.toUpperCase()}] ${idx + 1}. ${v.name} (${v.cwe || 'CWE'}) — Line ${v.line || 'N/A'}`, 18, yPos + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(`Description: ${v.description}`, pageWidth - 36);
      doc.text(descLines, 18, yPos + 8);

      const remLines = doc.splitTextToSize(`Fix: ${v.remediation}`, pageWidth - 36);
      doc.text(remLines, 18, yPos + 14);

      yPos += 26;
    });
    yPos += 5;
  }

  // Quality Issues
  if (reviewData.issues && reviewData.issues.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`4. Code Quality & Bug Risks (${reviewData.issues.length} Detected)`, 14, yPos);
    yPos += 7;

    reviewData.issues.forEach((issue, idx) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${idx + 1}. [${issue.severity || 'Medium'}] ${issue.category || 'Bug'}: Line ${issue.line || 1}`, 16, yPos);
      yPos += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const msgLines = doc.splitTextToSize(`Issue: ${issue.message}`, pageWidth - 32);
      doc.text(msgLines, 18, yPos);
      yPos += msgLines.length * 4;

      const fixLines = doc.splitTextToSize(`Suggested Fix: ${issue.suggestedFix || 'Refactor recommended.'}`, pageWidth - 32);
      doc.text(fixLines, 18, yPos);
      yPos += fixLines.length * 4 + 3;
    });
  }

  // Save PDF
  doc.save(`codevigil-audit-${language}-${Date.now()}.pdf`);
}

/**
 * Export audit review to structured Markdown format
 */
export function exportReviewToMarkdown(reviewData, language, rawCode) {
  if (!reviewData) return;

  const mdContent = `# 🛡️ CodeVigil AI — Code Review & Security Audit Report

**Date:** ${new Date().toLocaleString()}  
**Target Language:** \`${language}\`  
**Overall Quality Score:** **${reviewData.overallScore || 0}/100** (Grade: **${reviewData.healthGrade || 'N/A'}**)

---

## 📋 1. Executive Summary
${reviewData.summary || 'No summary provided.'}

---

## 📈 2. Code Metrics & Complexity Analysis
- **Estimated Time Complexity:** \`${reviewData.metrics?.estimatedTimeComplexity || 'O(1)'}\`
- **Estimated Space Complexity:** \`${reviewData.metrics?.estimatedSpaceComplexity || 'O(1)'}\`
- **Cyclomatic Complexity:** \`${reviewData.metrics?.cyclomaticComplexity || 1}\`
- **Maintainability Index:** \`${reviewData.metrics?.maintainabilityIndex || 100}/100\`
- **Lines of Code (LOC):** ${reviewData.metrics?.loc || 0} (Code: ${reviewData.metrics?.codeLines || 0}, Comments: ${reviewData.metrics?.commentLines || 0})
- **Technical Debt:** ~${reviewData.metrics?.technicalDebtMinutes || 0} minutes

---

## 🔒 3. Security Vulnerabilities (${reviewData.securityVulnerabilities?.length || 0})
${(reviewData.securityVulnerabilities || []).map((v, i) => `
### ${i + 1}. [${v.severity?.toUpperCase()}] ${v.name} (${v.cwe || 'CWE'}) — Line ${v.line || 'N/A'}
- **Category:** ${v.category}
- **Description:** ${v.description}
- **Remediation:** ${v.remediation}
`).join('\n') || '*No security vulnerabilities identified.*'}

---

## 🐛 4. Code Quality & Bug Risk Findings (${reviewData.issues?.length || 0})
${(reviewData.issues || []).map((issue, i) => `
- **${i + 1}. [${issue.severity || 'Medium'}] ${issue.category} (Line ${issue.line}):**
  - **Problem:** ${issue.message}
  - **Suggested Fix:** ${issue.suggestedFix}
`).join('\n') || '*No quality issues identified.*'}

---

## 💡 5. Step-by-Step Refactoring Explanations
${(reviewData.explanation || []).map((step) => `
**Step ${step.step}: ${step.title}**  
${step.detail}
`).join('\n\n') || '*No explanation provided.*'}

---

## 🚀 6. Production-Ready Refactored Code
\`\`\`${language}
${reviewData.fixedCode || rawCode}
\`\`\`

---
*Generated automatically by CodeVigil AI Reviewer & Debugger*
`;

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codevigil-audit-${language}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
