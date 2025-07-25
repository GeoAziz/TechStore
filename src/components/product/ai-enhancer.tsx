"use client";

import { useState } from 'react';
import { enhanceProductInfo, EnhanceProductInfoOutput } from '@/ai/flows/ai-enhance-product-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AiEnhancer({ productDescription }: { productDescription: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnhanceProductInfoOutput | null>(null);

  const handleEnhance = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await enhanceProductInfo({
        productDescription,
        selectedComponents: ['NovaCore i9 CPU', 'StellarForce RTX 6090 TITAN'], // Example components
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleEnhance} disabled={loading} className="w-full group">
        {loading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:text-accent" />
        )}
        Enhance with Zizo_AI
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-4 bg-card/50 backdrop-blur-sm border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Sparkles className="w-6 h-6" />
              AI Enhanced Analysis
            </CardTitle>
            <CardDescription>Powered by Zizo_AI Core</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-1 text-primary">Enhanced Description</h4>
              <p className="text-muted-foreground text-sm">{result.enhancedDescription}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1 text-primary">Comparative Stats</h4>
              <p className="text-muted-foreground text-sm">{result.comparativeStats}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1 text-primary">Compatibility Info</h4>
              <p className="text-muted-foreground text-sm">{result.compatibilityInfo}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
