import { CustomerInteractionRecord } from './market-generator';

export interface RecommendationScore {
  productId: string;
  productName: string;
  brand: string;
  score: number;
}

export class ProductRecommenderModel {
  // Co-occurrence / user-affinity matrix: user -> product -> aggregated score
  private userProductScores: Map<string, Map<string, number>> = new Map();
  // Item-item similarity: item -> item -> co-occurrence count
  private itemCoOccurrence: Map<string, Map<string, number>> = new Map();
  private productMetadata: Map<string, { name: string; brand: string }> = new Map();

  train(interactions: CustomerInteractionRecord[]): void {
    // 1. Group interactions by session & user
    const sessionItems: Map<string, Set<string>> = new Map();

    for (const record of interactions) {
      this.productMetadata.set(record.productId, {
        name: record.productName,
        brand: record.brand,
      });

      // Update User Affinity Matrix
      if (!this.userProductScores.has(record.userId)) {
        this.userProductScores.set(record.userId, new Map());
      }
      const userScores = this.userProductScores.get(record.userId)!;
      const currentScore = userScores.get(record.productId) || 0;
      userScores.set(record.productId, currentScore + record.weight);

      // Track items in session
      if (!sessionItems.has(record.sessionId)) {
        sessionItems.set(record.sessionId, new Set());
      }
      sessionItems.get(record.sessionId)!.add(record.productId);
    }

    // 2. Compute Item-Item Co-occurrence
    for (const [, items] of sessionItems) {
      const itemArray = Array.from(items);
      for (let i = 0; i < itemArray.length; i++) {
        const itemA = itemArray[i];
        if (!this.itemCoOccurrence.has(itemA)) {
          this.itemCoOccurrence.set(itemA, new Map());
        }
        const coMap = this.itemCoOccurrence.get(itemA)!;

        for (let j = 0; j < itemArray.length; j++) {
          if (i === j) continue;
          const itemB = itemArray[j];
          coMap.set(itemB, (coMap.get(itemB) || 0) + 1);
        }
      }
    }
  }

  recommendForUser(userId: string, topK: number = 3): RecommendationScore[] {
    const userScores = this.userProductScores.get(userId);
    if (!userScores) return [];

    const candidateScores: Map<string, number> = new Map();

    for (const [interactedItem, userAffinity] of userScores) {
      const relatedItems = this.itemCoOccurrence.get(interactedItem);
      if (!relatedItems) continue;

      for (const [relatedItem, coOccurrences] of relatedItems) {
        if (userScores.has(relatedItem)) continue; // Don't recommend what they already interacted with heavily
        const weight = userAffinity * coOccurrences;
        candidateScores.set(relatedItem, (candidateScores.get(relatedItem) || 0) + weight);
      }
    }

    const sorted = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    return sorted.map(([productId, score]) => {
      const meta = this.productMetadata.get(productId);
      return {
        productId,
        productName: meta?.name || productId,
        brand: meta?.brand || 'Unknown',
        score,
      };
    });
  }

  getVendorPerformanceSummary(interactions: CustomerInteractionRecord[]): Record<string, { views: number; purchases: number; revenueKES: number }> {
    const summary: Record<string, { views: number; purchases: number; revenueKES: number }> = {};

    for (const record of interactions) {
      if (!summary[record.vendorName]) {
        summary[record.vendorName] = { views: 0, purchases: 0, revenueKES: 0 };
      }
      const entry = summary[record.vendorName];
      if (record.interactionType === 'view_item') entry.views++;
      if (record.interactionType === 'purchase') {
        entry.purchases++;
        entry.revenueKES += record.priceCents / 100;
      }
    }

    return summary;
  }
}

