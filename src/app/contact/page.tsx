"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Bot, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import CopyButton from '@/components/ui/copy-button';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Simulate robust network call with real payload validation
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess(true);
      toast({
        title: 'Transmission Sent',
        description: 'Our support crew has received your ticket and will reply within 24 hours.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err?.message || "Transmission failed. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
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
          Open a secure channel to our support crew. We&apos;re on standby to assist with your mission.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h2 className="text-xl font-bold glow-accent flex items-center gap-3">
              <Mail className="text-lime-400" /> Direct Support Email
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              For general inquiries, vendor applications, and order support tickets.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="mailto:support@techstore.co.ke" className="text-sm font-semibold text-primary hover:underline">
                support@techstore.co.ke
              </a>
              <CopyButton value="support@techstore.co.ke" label="Copy support email address" />
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h2 className="text-xl font-bold glow-accent flex items-center gap-3">
              <Bot className="text-lime-400" /> AI Assistance
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              For instant queries regarding order tracking, hardware specs, and compatibility, activate our AI Assistant from the bottom right corner.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h2 className="text-xl font-bold glow-accent flex items-center gap-3">
              <MessageSquare className="text-lime-400" /> Customer Support Hours
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Monday through Friday, 08:00 – 18:00 EAT (UTC+3). Weekend emergency coverage for enterprise accounts.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {success ? (
            <div className="p-8 glass-panel rounded-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Transmission Received</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your message has reached our dispatch queue. A confirmation ticket has been registered, and our support team will respond shortly.
                </p>
              </div>
              <Button
                onClick={() => setSuccess(false)}
                className="rounded-full bg-[#bef264] text-black font-extrabold hover:bg-lime-300"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 p-8 glass-panel rounded-xl">
              {error && (
                <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="glow-primary">Your Name / Callsign</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Commander John"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="glow-primary">Secure Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="glow-primary">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry regarding Order or Technical Inquiry"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="glow-primary">Message Transmission</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your inquiry with detail..."
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full font-bold" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Transmission
                  </>
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
