
"use client";

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'What is the standard shipping time?',
    answer: 'Standard shipping within our designated zones takes 3-5 business days. Interstellar (international) shipping can take up to 14 standard cycles. You can track your order status from your dashboard.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns for malfunctioning or damaged hardware within 30 days of delivery. The component must be in its original packaging. Please open a support channel on our contact page to initiate a return protocol.',
  },
  {
    question: 'Do you offer custom builds?',
    answer: 'Yes! Our PC Customizer tool allows you to configure your own rig from our extensive inventory of compatible components. The Zizo AI will verify compatibility before you can add the build to your cart.',
  },
  {
    question: 'What warranty is provided on products?',
    answer: 'All products sold through Zizo OrderVerse come with a standard 1-year manufacturer warranty. Extended warranty plans can be purchased separately. Visit our Warranty page for more details.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order is processed, a tracking number will be assigned and linked to your order in the "My Orders" section of your user dashboard. You will also receive an email with the tracking link.',
  },
];

export default function FaqPage() {
  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Frequently Asked Questions</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Key intelligence on our most common user queries.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
            >
              <AccordionItem value={`item-${i}`} className="glass-panel px-6 rounded-lg">
                <AccordionTrigger className="text-lg text-left hover:no-underline text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
}
