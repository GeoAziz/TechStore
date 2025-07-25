import Logo from "@/components/layout/logo";
import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#2F4F4F] via-[#7DF9FF]/30 to-[#9F00FF]/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <style jsx>{`
        .glitch-text {
          animation: glitch 1.5s linear infinite;
          text-shadow: 0 0 8px #7DF9FF, 0 0 16px #9F00FF;
        }
        @keyframes glitch {
          0%, 20%, 22%, 25%, 53%, 55%, 100% {
            opacity: 1;
            transform: scaleX(1) scaleY(1);
          }
          21%, 54% {
            opacity: 0.8;
            transform: scaleX(1.05) scaleY(0.95) skewX(5deg);
          }
        }
      `}</style>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, type: "spring" }}
        className="flex flex-col items-center"
      >
        <Logo className="w-64 h-16 mb-6 drop-shadow-[0_0_16px_#7DF9FF]" />
        <span className="glitch-text text-2xl font-space-mono tracking-widest animate-pulse glow-primary">Welcome to Zizo OrderVerse</span>
        <span className="mt-2 text-sm text-accent/80 font-space-mono">A Sci-Fi Marketplace Experience</span>
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/60 font-space-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        Initializing quantum systems...
      </motion.div>
    </motion.div>
  );
}
