import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const tabs = ['Notes', 'Tasks', 'Deadlines', 'Contacts', 'Documents', 'Output'];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center pt-[5vh]"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="text-center mb-[6vh] z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-[3.5vw] font-display font-bold">The Complete Workspace</h2>
        <p className="text-[1.5vw] text-white/60 mt-2">Everything in context. Nothing falls through the cracks.</p>
      </motion.div>

      <div className="w-[80vw] h-[60vh] relative perspective-[1000px]">
        <motion.div 
          className="absolute inset-0 bg-[#221f2e] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          initial={{ rotateX: 40, y: 100, opacity: 0, scale: 0.9 }}
          animate={phase >= 2 ? { rotateX: 0, y: 0, opacity: 1, scale: 1 } : { rotateX: 40, y: 100, opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
        >
          {/* Header */}
          <div className="h-[20%] border-b border-white/10 px-8 flex flex-col justify-center bg-white/[0.02]">
            <div className="text-[1.8vw] font-semibold">Acquisition of Acme Corp</div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-[var(--color-accent)]/20 text-[var(--color-accent-light)] text-[0.8vw] rounded">M&A</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-[0.8vw] rounded">In Progress</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 px-8 pt-4">
            {tabs.map((tab, i) => (
              <motion.div
                key={tab}
                className="px-6 py-3 text-[1vw] border-b-2 relative"
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  color: i === 1 ? 'white' : 'rgba(255,255,255,0.4)',
                  borderColor: i === 1 ? 'var(--color-accent)' : 'transparent'
                }}
              >
                {tab}
              </motion.div>
            ))}
          </div>

          {/* Content Area - showing tasks */}
          <div className="flex-1 p-8 flex flex-col gap-4 relative">
             {[1, 2, 3].map((task, i) => (
               <motion.div
                 key={i}
                 className="w-full h-[4vw] bg-white/5 rounded-lg border border-white/5 flex items-center px-6 gap-4"
                 initial={{ opacity: 0, x: -20 }}
                 animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                 transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
               >
                 <div className="w-[1.2vw] h-[1.2vw] rounded border border-white/30" />
                 <div className="h-[1vw] w-[40%] bg-white/20 rounded" />
                 <div className="ml-auto w-[2vw] h-[2vw] rounded-full bg-[var(--color-accent)]/40" />
               </motion.div>
             ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}