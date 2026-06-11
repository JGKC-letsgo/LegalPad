import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[40%] h-full flex flex-col justify-center px-[8vw] z-20">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[var(--color-accent)] font-semibold tracking-widest text-[1.2vw] mb-4 uppercase">Capture</div>
          <h2 className="text-[4vw] font-display font-bold leading-tight mb-6">Log matters<br/>in seconds.</h2>
          <p className="text-[1.5vw] text-white/60">Structured intake designed for legal teams. Drop the messy spreadsheets.</p>
        </motion.div>
      </div>

      <div className="w-[60%] h-full relative flex items-center justify-center p-[5vw]">
        <motion.div 
          className="w-full aspect-[4/3] bg-[#221f2e] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 100, rotateY: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 100, rotateY: 20 }}
          transition={{ duration: 1, type: "spring", stiffness: 100, damping: 20 }}
          style={{ perspective: 1000 }}
        >
          <div className="h-[15%] border-b border-white/10 flex items-center px-8">
             <div className="text-[1.2vw] font-medium text-white/80">New Matter</div>
          </div>
          <div className="p-8 flex flex-col gap-6 flex-1">
             {[
               { w: "40%", label: "Matter Name" },
               { w: "70%", label: "Description" },
               { w: "30%", label: "Category" },
             ].map((field, i) => (
               <div key={i} className="flex flex-col gap-2">
                 <div className="text-[0.9vw] text-white/40">{field.label}</div>
                 <motion.div 
                   className="h-[3vw] rounded border border-white/10 bg-white/5 relative overflow-hidden"
                   initial={{ scaleX: 0, originX: 0 }}
                   animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
                   transition={{ duration: 0.6, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                 >
                   <motion.div 
                     className="absolute inset-0 bg-white/10"
                     initial={{ width: "0%" }}
                     animate={phase >= 3 ? { width: field.w } : { width: "0%" }}
                     transition={{ duration: 0.8, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                   />
                 </motion.div>
               </div>
             ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}