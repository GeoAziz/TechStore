
"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Undo2, Clock, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

const policies = [
  {
    title: 'Standard Dispatch',
    icon: Ship,
    content: 'Orders are processed and verified within 24 standard hours. Delivery across primary metropolitan sectors operates on a 24-48 hour window with end-to-end GPS telemetry tracking links sent via email/SMS.',
  },
  {
    title: '30-Day Return Protocol',
    icon: Undo2,
    content: 'We honor a strict 30-day return policy for unopened items and full manufacturer replacement for Dead-On-Arrival (DOA) hardware. Every returned item is bench-tested by certified OrderVerse technicians.',
  },
  {
    title: 'Priority Rush Delivery',
    icon: Clock,
    content: 'For mission-critical deployments in Nairobi, we offer same-day express courier dispatch (2-4 hours). Select Priority Rush at checkout for instantaneous order queue elevation.',
  },
];

const shippingZones = [
  {
    zone: 'Zone 1: Nairobi Metropolitan Area',
    scope: 'CBD, Westlands, Kilimani, Karen, Upper Hill, Industrial Area, Kiambu Rd',
    standardTime: 'Same Day / 24 Hours',
    expressTime: '2 - 4 Hours Flash Courier',
    rate: 'KES 350 (Free over KES 50,000)',
    expressRate: 'KES 750',
  },
  {
    zone: 'Zone 2: Major Urban Centers',
    scope: 'Mombasa, Kisumu, Nakuru, Eldoret, Thika, Machakos, Nyeri',
    standardTime: '24 - 48 Hours',
    expressTime: 'Priority Air Cargo (Next Flight Out)',
    rate: 'KES 650',
    expressRate: 'KES 1,400',
  },
  {
    zone: 'Zone 3: Upcountry & Regional Kenya',
    scope: 'Turkana, Garissa, Lamu, Mandera, Marsabit, Kitui & peripheral towns',
    standardTime: '2 - 4 Business Days',
    expressTime: 'Standard Secure Escort Only',
    rate: 'KES 950',
    expressRate: 'N/A',
  },
  {
    zone: 'Zone 4: East Africa Cross-Border (EAC)',
    scope: 'Uganda (Kampala), Rwanda (Kigali), Tanzania (Dar es Salaam/Arusha)',
    standardTime: '3 - 6 Business Days',
    expressTime: '48-Hour Priority Express (DHL/Aramex)',
    rate: 'KES 3,200 ($25 USD)',
    expressRate: 'KES 6,500 ($50 USD)',
  },
];

export default function ShippingReturnsPage() {
  return (
    <div className="container py-12 space-y-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-mono mb-4">
          <ShieldCheck className="w-4 h-4" /> SECURE LOGISTICS PROTOCOL
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 glow-primary font-mono">
          Shipping & Returns
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Precision logistics, verified hardware escort, and friction-free returns for Zizo OrderVerse operatives.
        </p>
      </motion.div>

      {/* Core Policies */}
      <div className="grid md:grid-cols-3 gap-8">
        {policies.map((policy, i) => (
          <motion.div
            key={policy.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <Card className="glass-panel h-full border-border/60 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <policy.icon className="w-8 h-8 text-accent" />
                <CardTitle className="text-xl text-primary font-mono">{policy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{policy.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Shipping Zones Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-foreground">
            Regional Shipping Zones & Rates
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {shippingZones.map((z, idx) => (
            <Card key={idx} className="glass-panel border-border/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary/20 text-primary font-mono text-xs border-b border-l border-primary/30">
                ZONE {idx + 1}
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-primary font-mono">{z.zone}</CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{z.scope}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-border/40 font-mono">
                  <span className="text-muted-foreground">Standard Delivery:</span>
                  <span className="text-foreground font-medium">{z.standardTime}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40 font-mono">
                  <span className="text-muted-foreground">Standard Fee:</span>
                  <span className="text-primary font-bold">{z.rate}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40 font-mono">
                  <span className="text-muted-foreground">Rush Priority Delivery:</span>
                  <span className="text-foreground">{z.expressTime}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 font-mono">
                  <span className="text-muted-foreground">Rush Fee:</span>
                  <span className="text-accent font-semibold">{z.expressRate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Returns & Warranty SOP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 rounded-xl border border-primary/30 space-y-6"
      >
        <h2 className="text-2xl font-bold font-mono text-primary flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-accent" /> Returns & Technical Inspection SOP
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h3 className="font-mono text-foreground font-semibold">1. Ticket Initiation</h3>
            <p>
              Navigate to the Contact page or initiate an order ticket with your Order ID and photographic proof of serial numbers.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-mono text-foreground font-semibold">2. Hardware Bench Audit</h3>
            <p>
              Returned equipment is bench-tested in our Nairobi QA lab within 48 hours to confirm firmware/hardware diagnostics.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-mono text-foreground font-semibold">3. Instant Resolution</h3>
            <p>
              Approved claims receive immediate replacement dispatch or full reimbursement processed directly back to M-Pesa or Card.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

