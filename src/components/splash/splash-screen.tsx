'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from '../layout/logo';

const TypewriterText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const characters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay + i * 0.05 },
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
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ display: 'flex', overflow: 'hidden' }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span variants={child} key={index}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};


export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      () => setStep(1), // Booting
      () => setStep(2), // Connecting
      () => setStep(3), // Welcome
      () => setShow(false), // Fade out
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < sequence.length) {
        sequence[currentIndex]();
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800); // Total duration is ~3.2s, exit animation adds more

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0c0c1e] text-cyan-300 font-mono"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
        >
          {/* Logo and Scanner */}
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
          
          {/* Diagnostic Text */}
          <div className="h-16 text-sm text-cyan-500/80">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TypewriterText text="Booting Tech Store Systems..." />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
                  className="text-lg text-primary glow-primary"
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