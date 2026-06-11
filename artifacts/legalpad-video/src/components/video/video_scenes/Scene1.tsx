import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center z-10 flex flex-col items-center">
        <div className="overflow-hidden mb-6">
          <motion.div
            initial={{ y: '100%' }}
            animate={phase >= 1 ? { y: 0 } : { y: '100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center space-x-4"
          >
            <div className="w-[3vw] h-[3vw] rounded bg-[var(--color-accent)] flex items-center justify-center">
               <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <span className="text-[2vw] font-display font-semibold tracking-wider uppercase text-white">LEGALPAD</span>
          </motion.div>
        </div>

        <motion.h1 
          className="text-[6vw] font-display font-bold leading-[1.1] text-white tracking-tight"
        >
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: '100%', rotateX: -20 }}
              animate={phase >= 1 ? { y: 0, rotateX: 0 } : { y: '100%', rotateX: -20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Legal matters,
            </motion.div>
          </div>
          <div className="overflow-hidden text-[var(--color-accent-light)]">
            <motion.div
              initial={{ y: '100%', rotateX: -20 }}
              animate={phase >= 2 ? { y: 0, rotateX: 0 } : { y: '100%', rotateX: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              under control.
            </motion.div>
          </div>
        </motion.h1>
        
        <motion.div
          className="mt-[4vh] w-[10vw] h-[2px] bg-white/20"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}