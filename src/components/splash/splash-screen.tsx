import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <div className="text-5xl font-bold text-neon-blue font-space-mono animate-pulse mb-4">
          NASA x Alibaba
        </div>
        <div className="text-xl text-neon-violet font-mono animate-fadeIn">
          TechStore Fusion
        </div>
        <div className="mt-6">
          <span className="px-4 py-2 bg-neon-violet text-white rounded-xl shadow-neon animate-bounce">
            Initializing HUD...
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
