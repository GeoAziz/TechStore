
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Cpu, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const jobPostings = [
  {
    title: 'Senior Frontend Engineer (React/Next.js)',
    location: 'Remote / Sector 7G',
    type: 'Full-Time',
    category: 'Engineering',
    icon: Cpu,
  },
  {
    title: 'AI Systems Operator (Genkit)',
    location: 'Remote',
    type: 'Full-Time',
    category: 'AI/ML',
    icon: Bot,
  },
  {
    title: 'Product Mission Specialist',
    location: 'New Mombasa Station',
    type: 'Contract',
    category: 'Product',
    icon: Rocket,
  },
];

function Bot(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

export default function JoinTheCrewPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Join The Crew</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We are seeking exceptional talent to help us build the future of commerce. If you are passionate about technology and innovation, your next mission starts here.
        </p>
      </motion.div>

      <div className="space-y-8">
        {jobPostings.map((job, i) => (
          <motion.div
            key={job.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <Card className="glass-panel card-glow">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center gap-4">
                   <job.icon className="w-8 h-8 text-accent"/>
                   {job.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 pt-2">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/>{job.location}</span>
                   <Badge variant="secondary">{job.type}</Badge>
                   <Badge variant="outline">{job.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button>Apply Now</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
