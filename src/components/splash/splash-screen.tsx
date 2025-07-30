
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from '../layout/logo';

// Define a type for a single particle's properties
type Particle = {
  id: number;
  width: number;
  height: number;
  left: string;
  top: string;
  yAnimate: number[];
  duration: number;
  delay: number;
};

// Simple particle field background
function ParticleField() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particle data only on the client-side
    const newParticles = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      width: Math.random() * 6 + 2,
      height: Math.random() * 6 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      yAnimate: [0, Math.random() * 40 - 20, 0],
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/10 shadow-lg"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            left: p.left,
            top: p.top,
            filter: 'blur(1.5px)',
          }}
          animate={{
            y: p.yAnimate,
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}


const TypewriterText = ({ text, delay = 0, onComplete, className = "" }: { text: string; delay?: number; onComplete?: () => void; className?: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timeout = setTimeout(function type() {
      setDisplayed(text.slice(0, i + 1));
      if (i < text.length - 1) {
        i++;
        setTimeout(type, 22 + Math.random() * 30);
      } else if (onComplete) {
        setTimeout(onComplete, 200);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, onComplete]);
  return (
    <span className={`font-mono tracking-wide ${className}`}>{displayed}<span className="animate-pulse">█</span></span>
  );
};



export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [step, setStep] = useState(0);

  // Sequence: ["Initializing Tech Store Systems…", "Loading Inventory Engine…", "Welcome, Commander."]
  useEffect(() => {
    const sequence = [
      () => setStep(1),
      () => setStep(2),
      () => setStep(3),
      () => onFinished(),
    ];
    let currentIndex = 0;
    const timeouts = [1400, 1400, 1200, 500];
    function runSequence() {
      if (currentIndex < sequence.length) {
        sequence[currentIndex]();
        setTimeout(runSequence, timeouts[currentIndex]);
        currentIndex++;
      }
    }
    const startTimeout = setTimeout(runSequence, 400);
    return () => clearTimeout(startTimeout);
  }, [onFinished]);

  return (
    <AnimatePresence>
      {step < 4 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0c1e] via-[#10102a] to-[#0c0c1e] text-cyan-300 font-mono select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <ParticleField />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="relative flex items-center justify-center mb-8 z-10"
          >
            <motion.div
              className="absolute w-[220px] h-[220px] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: [1, 1.08, 1], boxShadow: [
                '0 0 0px #00fff7',
                '0 0 32px #00fff7, 0 0 64px #00fff7',
                '0 0 0px #00fff7'
              ] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              style={{ borderRadius: '50%' }}
            />
            <Logo className="w-44 h-auto drop-shadow-[0_0_16px_#00fff7]" />
            {/* Scanner ring */}
            <motion.div
              className="absolute w-[260px] h-[260px] border-2 border-cyan-400/60 rounded-full pointer-events-none"
              initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: 1.1, rotate: 360 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 0.2 }}
            />
            {/* Light scan */}
            <motion.div
              className="absolute w-[260px] h-[260px] rounded-full pointer-events-none"
              style={{
                background: 'conic-gradient(from 90deg at 50% 50%, #00fff7bb 0deg, transparent 120deg, transparent 360deg)'
              }}
              initial={{ rotate: 0, opacity: 0.18 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <div className="h-16 text-cyan-400/90 flex items-center z-10 font-[Orbitron,Space Grotesk,monospace] text-lg md:text-xl">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                >
                  <TypewriterText text="Initializing Tech Store Systems…" />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                >
                  <TypewriterText text="Loading Inventory Engine…" />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: {delay: 0.2} }}
                  exit={{ opacity: 0 }}
                  className="text-xl text-cyan-200 glow-primary"
                >
                  <TypewriterText text="Welcome, Commander." className="text-cyan-200" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
