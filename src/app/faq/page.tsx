"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LastUpdated from '@/components/ui/last-updated';
import { Search } from 'lucide-react';

const faqCategories = ['All', 'Shipping', 'Returns', 'Custom Builds', 'Warranty', 'Orders'];

const faqItems = [
  {
    category: 'Shipping',
    question: 'What is the standard shipping time?',
    answer: 'Standard shipping across Kenya takes 1-3 business days. International and regional delivery takes 5-10 standard business days. You can track your real-time parcel dispatch status directly from your TechStore account dashboard.',
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We accept returns for verified malfunctioning or damaged hardware within 30 days of delivery. The item must be preserved in its original packaging with all accompanying accessories and documentation.',
  },
  {
    category: 'Custom Builds',
    question: 'Do you offer custom PC builds and compatibility checks?',
    answer: 'Yes! Our PC Customizer tool allows you to build custom rigs from our extensive inventory of verified processors, GPUs, motherboards, and power supplies with automated real-time wattage and socket compatibility verification.',
  },
  {
    category: 'Warranty',
    question: 'What warranty is provided on purchased hardware?',
    answer: 'All products sold through TechStore come with a minimum 1-year standard authorized manufacturer warranty. Extended warranty coverage and accidental damage protection plans are optionally available during checkout.',
  },
  {
    category: 'Orders',
    question: 'How do I track my order once dispatched?',
    answer: 'Once your order is processed, a tracking number and courier link will be posted to the "My Orders" tab in your user dashboard, with instant email and SMS delivery confirmations.',
  },
  {
    category: 'Shipping',
    question: 'Do you offer same-day delivery in Nairobi?',
    answer: 'Yes! Orders placed before 14:00 EAT within the Nairobi metropolitan area are eligible for same-day express courier dispatch.',
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto mb-4">
          Key intelligence on shipping, returns, custom rig assembly, and hardware warranties.
        </p>
        <LastUpdated date="2026-10-15" />
      </motion.div>

      {/* Search and Category Filter Controls */}
      <div className="max-w-3xl mx-auto mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search FAQs by topic or keyword..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12141c] border border-white/10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            aria-label="Filter FAQs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {faqCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.4)]'
                  : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground glass-panel rounded-xl">
            No questions found matching your filter criteria.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredFaqs.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-panel px-6 rounded-xl border border-white/10">
                <AccordionTrigger className="text-base sm:text-lg text-left hover:no-underline text-white font-semibold py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </motion.div>
    </div>
  );
}
