
"use client";

import { useCompare } from '@/context/compare-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { X, Star } from 'lucide-react';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter mb-4 glow-primary">Compare Products</h1>
        <p className="text-muted-foreground mb-8">You haven't selected any products to compare yet.</p>
        <Button asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const attributes = ['brand', 'price', 'rating', 'stock', 'category', 'subcategory'];

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter glow-primary">Compare Products</h1>
        <Button variant="outline" onClick={clearCompare}>Clear All</Button>
      </div>
      <Card className="glass-panel">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[150px]">Feature</TableHead>
                  {compareItems.map(item => (
                    <TableHead key={item.id} className="min-w-[250px] text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Image src={item.imageUrl} alt={item.name} width={150} height={150} className="rounded-md border border-border" />
                        <p className="font-bold text-primary">{item.name}</p>
                        <Button variant="destructive" size="sm" onClick={() => removeFromCompare(item.id)}>
                          <X className="w-4 h-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map(attr => (
                  <TableRow key={attr}>
                    <TableCell className="font-semibold capitalize text-muted-foreground">{attr}</TableCell>
                    {compareItems.map(item => (
                      <TableCell key={item.id} className="text-center">
                        {attr === 'rating' ? (
                          <div className="flex items-center justify-center gap-1">
                             {item[attr as keyof typeof item]} <Star className="w-4 h-4 text-yellow-400" />
                          </div>
                        ) : attr === 'price' ? (
                            <span>{item.price.toLocaleString()} {item.currency}</span>
                        ) : (
                          <span>{item[attr as keyof typeof item]?.toString() || 'N/A'}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
