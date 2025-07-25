import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black"
        >
          <motion.div
            initial={{ scale: 0.8, filter: 'blur(8px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-space-mono text-neon-blue drop-shadow-neon mb-4 animate-pulse">Zizo OrderVerse</h1>
            <p className="text-xl text-neon-violet animate-fadeIn">Welcome to the Future of Shopping</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
