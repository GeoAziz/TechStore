
"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Undo2, Clock } from 'lucide-react';

const policies = [
  {
    title: 'Standard Shipping',
    icon: Ship,
    content: 'All orders are processed within 24 standard hours. Estimated delivery time within primary sectors is 3-5 business days. You will receive a tracking link once your package is dispatched.',
  },
  {
    title: 'Return Protocol',
    icon: Undo2,
    content: 'We accept returns on unopened and non-damaged goods within 30 days of receipt. To initiate a return, please open a ticket on our Contact page with your order ID. A return shipping label will be generated for you.',
  },
  {
    title: 'Expedited Delivery',
    icon: Clock,
    content: 'For urgent missions, we offer expedited delivery at an additional cost. This service guarantees delivery within 1-2 business days for most locations. This option can be selected at checkout.',
  },
];

export default function ShippingReturnsPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Shipping & Returns</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Our logistics and reverse-logistics protocols.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {policies.map((policy, i) => (
          <motion.div
            key={policy.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <Card className="glass-panel h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <policy.icon className="w-10 h-10 text-accent" />
                <CardTitle className="text-2xl text-primary">{policy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{policy.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
