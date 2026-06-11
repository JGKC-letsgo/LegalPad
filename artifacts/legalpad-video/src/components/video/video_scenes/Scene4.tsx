import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15)_0%,transparent_70%)]" />

      <div className="w-[45%] h-full flex flex-col justify-center px-[8vw] z-20">
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-red-400 font-semibold tracking-widest text-[1.2vw] mb-4 uppercase flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Urgent
          </div>
          <h2 className="text-[4vw] font-display font-bold leading-tight mb-6">Never miss a critical date.</h2>
          <p className="text-[1.5vw] text-white/60">Approaching deadlines surface automatically. Action items are always clear.</p>
        </motion.div>
      </div>

      <div className="w-[55%] h-full relative flex items-center justify-center">
        <div className="relative w-full h-[60%] flex flex-col gap-6">
          {[
             { title: "File response to motion", time: "Today", color: "red", delay: 0 },
             { title: "Review employment contracts", time: "Tomorrow", color: "orange", delay: 0.2 },
             { title: "Board resolution draft", time: "In 3 Days", color: "gray", delay: 0.4 }
          ].map((item, i) => (
             <motion.div
               key={i}
               className={`p-6 rounded-xl border flex items-center justify-between ${
                 item.color === 'red' ? 'bg-red-500/10 border-red-500/30' : 
                 item.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' : 
                 'bg-white/5 border-white/10'
               }`}
               initial={{ opacity: 0, x: 100 }}
               animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
               transition={{ duration: 0.8, delay: item.delay, type: 'spring', bounce: 0.2 }}
             >
               <div className="flex items-center gap-4">
                 <div className={`w-[3vw] h-[3vw] rounded-full flex items-center justify-center ${
                   item.color === 'red' ? 'bg-red-500/20 text-red-400' :
                   item.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                   'bg-white/10 text-white/60'
                 }`}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                 </div>
                 <div className="text-[1.5vw] font-medium">{item.title}</div>
               </div>
               <div className={`text-[1.2vw] font-bold ${
                 item.color === 'red' ? 'text-red-400' :
                 item.color === 'orange' ? 'text-orange-400' :
                 'text-white/40'
               }`}>
                 {item.time}
               </div>
             </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}