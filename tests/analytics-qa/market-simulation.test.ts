import { MarketDatasetGenerator } from '@/analytics-qa/dataset/market-generator';
import { ProductRecommenderModel } from '@/analytics-qa/dataset/model-trainer';
import * as fs from 'fs';
import * as path from 'path';

describe('Market Simulation & ML Dataset Generation', () => {
  const outputDir = path.resolve(process.cwd(), 'dataset');

  it('generates multi-agent interaction records across real vendors and customers', () => {
    const generator = new MarketDatasetGenerator(2026);
    const interactions = generator.generateDataset(60);

    expect(interactions.length).toBeGreaterThan(60);

    // Verify presence of real vendors
    const vendorNames = new Set(interactions.map(r => r.vendorName));
    expect(vendorNames.has('Apple Official Store')).toBe(true);
    expect(vendorNames.has('Dell Technologies KE')).toBe(true);
    expect(vendorNames.has('Logitech East Africa')).toBe(true);
    expect(vendorNames.has('Samsung Experience Store')).toBe(true);

    // Verify presence of real customers
    const customerEmails = new Set(interactions.map(r => r.userEmail));
    expect(customerEmails.has('client@demo.com')).toBe(true);
    expect(customerEmails.has('brian.otieno@gmail.com')).toBe(true);

    // Save JSONL & CSV datasets
    const files = generator.saveToFile(interactions, outputDir);
    expect(fs.existsSync(files.jsonlPath)).toBe(true);
    expect(fs.existsSync(files.csvPath)).toBe(true);
  });

  it('trains an affinity and collaborative filtering model on generated interaction telemetry', () => {
    const generator = new MarketDatasetGenerator(42);
    const interactions = generator.generateDataset(100);

    const model = new ProductRecommenderModel();
    model.train(interactions);

    // Vendor Performance Summary
    const summary = model.getVendorPerformanceSummary(interactions);
    expect(Object.keys(summary).length).toBeGreaterThanOrEqual(3);

    for (const [vendor, stats] of Object.entries(summary)) {
      expect(stats.views).toBeGreaterThan(0);
    }

    // Recommendation test for customer Brian Otieno
    const recs = model.recommendForUser('client-brian-ke-02', 2);
    expect(Array.isArray(recs)).toBe(true);
  });
});

