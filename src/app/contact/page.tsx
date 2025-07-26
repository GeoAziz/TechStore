
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Bot, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Transmission Sent',
      description: 'Our support drones have received your message. We will respond shortly.',
    });
    // Here you would typically handle form submission logic
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Contact Command</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Open a secure channel to our support crew. We're on standby to assist with your mission.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold glow-accent flex items-center gap-3"><Mail /> Email Support</h2>
            <p className="text-muted-foreground">For general inquiries and support tickets.</p>
            <a href="mailto:support@zizo.net" className="text-primary hover:underline">support@zizo.net</a>
          </div>
          <div>
            <h2 className="text-2xl font-bold glow-accent flex items-center gap-3"><Bot /> AI Assistance</h2>
            <p className="text-muted-foreground">For instant help, activate our AI Assistant from the bottom right corner.</p>
          </div>
           <div>
            <h2 className="text-2xl font-bold glow-accent flex items-center gap-3"><MessageSquare /> Live Chat</h2>
            <p className="text-muted-foreground">Chat directly with a human operator (Mon-Fri, 0900-1700 UTC).</p>
            <Button variant="outline">Initiate Live Chat</Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 p-8 glass-panel rounded-xl">
            <div className="space-y-2">
              <Label htmlFor="name" className="glow-primary">Your Callsign (Name)</Label>
              <Input id="name" name="name" required placeholder="Commander Zizo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="glow-primary">Secure Channel (Email)</Label>
              <Input id="email" name="email" type="email" required placeholder="commander@zizo.net" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="glow-primary">Subject</Label>
              <Input id="subject" name="subject" required placeholder="Inquiry about Order #ZOV-84920" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="glow-primary">Message Transmission</Label>
              <Textarea id="message" name="message" required rows={5} placeholder="Describe your request..."/>
            </div>
            <Button type="submit" className="w-full" size="lg">
              <Send className="w-5 h-5 mr-2" />
              Send Transmission
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
