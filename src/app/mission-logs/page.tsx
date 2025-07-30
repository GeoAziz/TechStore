
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const logEntries = [
  {
    title: 'System Update v2.1: The Orion Nebula Release',
    date: '2024-07-29',
    category: 'System Update',
    excerpt: 'Enhanced filtering protocols, AI-powered recommendations, and a more immersive UI have been deployed across all sectors. Performance gains of up to 15% have been benchmarked...',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'nebula space',
  },
  {
    title: 'New Partnership: StellarForce GPUs Now Online',
    date: '2024-07-22',
    category: 'Inventory',
    excerpt: 'We have officially integrated the new StellarForce GPU line into our inventory. These next-generation cards offer unparalleled performance in deep learning and graphical rendering tasks...',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'graphics card',
  },
  {
    title: 'Security Protocol Upgrade: Cipher-V Protocol Active',
    date: '2024-07-15',
    category: 'Security',
    excerpt: 'All user data transmissions are now secured with the proprietary Cipher-V encryption protocol, ensuring end-to-end data integrity and confidentiality across the OrderVerse.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'cyber security',
  },
];

export default function MissionLogsPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Mission Logs</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Declassified updates, system upgrades, and transmissions from the Zizo_TechVerse command center.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {logEntries.map((log, i) => (
          <motion.div
            key={log.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <Card className="glass-panel card-glow h-full flex flex-col">
              <CardHeader>
                <div className="relative h-48 w-full mb-4">
                   <Image src={log.imageUrl} alt={log.title} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint={log.dataAiHint} />
                </div>
                <Badge variant="secondary" className="w-fit mb-2">{log.category}</Badge>
                <CardTitle className="text-xl text-primary">{log.title}</CardTitle>
                <CardDescription>{log.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{log.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="#">Read Full Transmission</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
