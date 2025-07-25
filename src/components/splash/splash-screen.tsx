
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from '../layout/logo';

const TypewriterText = ({ text, delay = 0, onComplete }: { text: string; delay?: number; onComplete?: () => void }) => {
  const characters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        delayChildren: delay + i * 0.05,
        when: "afterChildren",
      },
    }),
  };
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.div
      className="flex overflow-hidden text-lg"
      variants={container}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
    >
      {characters.map((char, index) => (
        <motion.span variants={child} key={index}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};


export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      () => setStep(1), // Booting...
      () => setStep(2), // Connecting...
      () => setStep(3), // Welcome!
      () => onFinished(), // Tell parent to fade out
    ];
    
    let currentIndex = 0;
    const timeouts = [800, 800, 1000, 500]; // Delays for each step

    function runSequence() {
      if (currentIndex < sequence.length) {
        sequence[currentIndex]();
        setTimeout(runSequence, timeouts[currentIndex]);
        currentIndex++;
      }
    }
    
    const startTimeout = setTimeout(runSequence, 500);

    return () => clearTimeout(startTimeout);
  }, [onFinished]);

  return (
    <AnimatePresence>
      {step < 4 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0c0c1e] text-cyan-300 font-mono"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="relative flex items-center justify-center mb-8"
          >
            <Logo className="w-48 h-auto" />
            <motion.div
              className="absolute w-[150%] h-[150%] border-2 border-primary rounded-full"
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: [0.5, 1, 0.5], scale: 1.1, rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.2 }}
            />
          </motion.div>
          
          <div className="h-16 text-cyan-500/80 flex items-center">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                >
                  <TypewriterText text="Booting Zizo_OrderVerse Systems..." />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                >
                   <TypewriterText text="Connecting to Neural Grid..." />
                </motion.div>
              )}
              {step === 3 && (
                 <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: {delay: 0.2} }}
                  exit={{ opacity: 0 }}
                  className="text-xl text-primary glow-primary"
                >
                  <TypewriterText text="Welcome, Commander." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
