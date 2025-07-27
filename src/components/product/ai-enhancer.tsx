import React from 'react';

"use client";

import { useState } from 'react';
import { enhanceProductInfo, EnhanceProductInfoOutput } from '@/ai/flows/ai-enhance-product-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Check, Cpu, MemoryStick } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_COMPONENTS = {
    'NovaCore i9 CPU': { icon: Cpu, price: 58000 },
    'StellarForce RTX 6090 TITAN': { icon: MemoryStick, price: 150000 },
    'Quantum-Drive 4TB SSD': { icon: MemoryStick, price: 35000 },
    'Hyper-Coolant System': { icon: Cpu, price: 12000 },
}

export default function AiEnhancer({ productDescription }: { productDescription: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnhanceProductInfoOutput | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const toggleComponent = (component: string) => {
    setSelectedComponents(prev => 
        prev.includes(component) ? prev.filter(c => c !== component) : [...prev, component]
    );
  }

  const handleEnhance = async () => {
    if(selectedComponents.length === 0) {
        setError("Please select at least one component to compare.");
        return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await enhanceProductInfo({
        productDescription,
        selectedComponents,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-panel">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent glow-accent">
                <Sparkles className="w-6 h-6 animate-pulse" />
                AI-Powered Analysis
            </CardTitle>
            <CardDescription>Select components you own to see how this product compares.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <p className="text-sm font-medium mb-2 text-primary">Select Your Components:</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(MOCK_COMPONENTS).map(([name, {icon: Icon}]) => (
                        <Button key={name} variant={selectedComponents.includes(name) ? "secondary" : "outline"} onClick={() => toggleComponent(name)} className="flex items-center justify-start gap-2 h-auto py-2 text-left">
                           {selectedComponents.includes(name) ? <Check className="w-4 h-4 text-primary" /> : <Icon className="w-4 h-4 text-muted-foreground" />}
                           <span className="flex-1 text-xs">{name}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <Button onClick={handleEnhance} disabled={loading} className="w-full group">
                {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                <Sparkles className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:text-accent" />
                )}
                Enhance with Zizo_AI
            </Button>

            <AnimatePresence>
                {error && (
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                        <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                 {result && (
                    <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} transition={{duration: 0.5, ease: "easeInOut"}}>
                        <Card className="mt-4 bg-card/50 backdrop-blur-sm border-accent/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-accent text-lg">
                            <Sparkles className="w-5 h-5" />
                            AI Enhanced Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-bold mb-1 text-primary">Enhanced Description</h4>
                                <p className="text-muted-foreground">{result.enhancedDescription}</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 text-primary">Comparative Stats</h4>
                                <p className="text-muted-foreground">{result.comparativeStats}</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 text-primary">Compatibility Info</h4>
                                <p className="text-muted-foreground">{result.compatibilityInfo}</p>
                            </div>
                        </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </CardContent>
    </Card>
  );
}
