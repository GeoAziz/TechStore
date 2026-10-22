import { QualityGateResult } from './gate';
import * as fs from 'fs';
import * as path from 'path';

export class QualityReporter {
  static formatJson(results: QualityGateResult[]): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalRuns: results.length,
          passedRuns: results.filter(r => r.passed).length,
          failedRuns: results.filter(r => !r.passed).length,
          allPassed: results.every(r => r.passed),
        },
        runs: results,
      },
      null,
      2
    );
  }

  static formatJUnitXml(results: QualityGateResult[]): string {
    const totalTests = results.length;
    const failures = results.filter(r => !r.passed).length;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<testsuites name="CommerceAnalyticsSimulator" tests="${totalTests}" failures="${failures}" errors="0" time="0.05">\n`;
    xml += `  <testsuite name="AnalyticsQualityGate" tests="${totalTests}" failures="${failures}" errors="0">\n`;

    for (const res of results) {
      xml += `    <testcase name="[Seed:${res.seed}] ${res.personaId}" classname="CommerceAnalyticsSimulator" time="0.01">\n`;
      if (!res.passed) {
        const failureDetails = res.violations
          .map(v => `[${v.code}] ${v.message}`)
          .join('\n');
        xml += `      <failure message="${res.violations[0].code}">${this.escapeXml(failureDetails)}</failure>\n`;
      }
      xml += `    </testcase>\n`;
    }

    xml += `  </testsuite>\n`;
    xml += `</testsuites>\n`;
    return xml;
  }

  static writeReports(results: QualityGateResult[], outputDir: string): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'analytics-quality-report.json'), this.formatJson(results), 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'analytics-quality-report.xml'), this.formatJUnitXml(results), 'utf-8');
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
