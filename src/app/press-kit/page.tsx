
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';

const assets = [
  {
    title: 'Zizo OrderVerse Logo (Vector)',
    description: 'High-resolution vector logo in SVG and AI formats.',
    type: 'Logo',
    icon: ImageIcon,
    file: '/logos.zip',
  },
  {
    title: 'Brand Guidelines',
    description: 'Official guide on color palettes, fonts, and logo usage.',
    type: 'PDF',
    icon: FileText,
    file: '/guidelines.pdf',
  },
  {
    title: 'Promotional Banners',
    description: 'A set of high-quality banners for web and social media.',
    type: 'Images',
    icon: ImageIcon,
    file: '/banners.zip',
  },
];

export default function PressKitPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Press & Media Kit</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Download official Zizo OrderVerse brand assets and guidelines.
        </p>
      </motion.div>
      
       <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
        <Card className="glass-panel p-8 text-center">
            <h2 className="text-2xl font-bold glow-accent mb-4">Download Full Kit</h2>
            <p className="text-muted-foreground mb-6">Get all logos, guidelines, and promotional materials in a single download.</p>
            <Button size="lg">
                <Download className="mr-2" /> Download Full Press Kit (.zip)
            </Button>
        </Card>
       </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset, i) => (
          <motion.div
            key={asset.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <Card className="glass-panel card-glow h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <asset.icon className="w-10 h-10 text-accent" />
                  <div>
                    <CardTitle className="text-xl text-primary">{asset.title}</CardTitle>
                    <CardDescription>{asset.type}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{asset.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2" /> Download
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
