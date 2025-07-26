
"use client";

import { motion } from 'framer-motion';
import { Users, Rocket, Target, Cpu } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const teamMembers = [
  { name: 'Jax "Binary" Thorne', role: 'CEO & Lead Architect', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'man portrait' },
  { name: 'Eva "Nexus" Rostova', role: 'COO & Mission Commander', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'woman portrait' },
  { name: 'Codex "Glitch" Veridian', role: 'CTO & AI Core Developer', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait' },
];

export default function AboutPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">About Zizo OrderVerse</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We are a collective of tech-enthusiasts, futurists, and engineers dedicated to building the future of commerce.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image src="https://placehold.co/600x400.png" data-ai-hint="futuristic office" alt="Zizo Command Center" width={600} height={400} className="rounded-xl shadow-neon-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold glow-accent">Our Origin Protocol</h2>
          <p className="text-muted-foreground">
            Zizo OrderVerse was forged in the silicon crucible of innovation, born from a simple directive: to create a marketplace that doesn't just sell technology, but embodies it. We grew tired of beige boxes and bland interfaces. We envisioned a platform that was as exciting as the components it offered.
          </p>
          <p className="text-muted-foreground">
            Our mission is to provide a seamless, immersive, and secure experience for acquiring the tools that will build tomorrow.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
        <Card className="glass-panel">
          <CardHeader>
            <Rocket className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle className="glow-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            To empower creators and innovators by providing frictionless access to the world's most advanced technology.
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <Target className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle className="glow-primary">Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            To be the central hub of the new digital frontier—a universe where technology and human potential merge.
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <Cpu className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle className="glow-primary">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            Innovation, Integrity, and Interstellar Customer Support. We push boundaries, operate with transparency, and are always on-frequency for our users.
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tighter mb-2 glow-primary">The Command Crew</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The architects and operators behind the OrderVerse.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 * (i + 1) }}
          >
            <Card className="glass-panel text-center p-6">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-accent shadow-neon-accent">
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-accent">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
