import React from 'react';
import { motion } from 'framer-motion';
import { Check, Dot } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for tailwind class merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const milestones = [
  { id: 'funded', label: 'Funded', description: 'Escrow funded' },
  { id: 'in_review', label: 'In Review', description: 'Milestone submitted' },
  { id: 'released', label: 'Released', description: 'Funds distributed' },
];

const springConfig = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export default function MilestoneStepper({ currentStep = 'funded' }) {
  const currentIndex = milestones.findIndex(m => m.id === currentStep);
  const progress = (currentIndex / (milestones.length - 1)) * 100;

  return (
    <div className="relative w-full py-8">
      {/* Background Line */}
      <div className="absolute top-[2.75rem] left-0 w-full h-0.5 bg-slate-800 rounded-full" />
      
      {/* Animated Liquid Progress Line */}
      <motion.div
        className="absolute top-[2.75rem] left-0 h-0.5 bg-emerald-500 rounded-full origin-left shadow-[0_0_10px_theme('colors.emerald.500/40')]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={springConfig}
      />

      <div className="relative flex justify-between items-start">
        {milestones.map((milestone, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={milestone.id} className="flex flex-col items-center group">
              {/* Milestone Node */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? '#10b981' : '#1e293b',
                  borderColor: isCompleted || isActive ? '#10b981' : '#334155',
                }}
                transition={springConfig}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center z-10",
                  (isCompleted || isActive) && "shadow-[0_0_15px_theme('colors.emerald.500/50')]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                ) : isActive ? (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-1.5 h-1.5 bg-slate-950 rounded-full"
                  />
                ) : (
                  <Dot className="w-4 h-4 text-slate-500" />
                )}
              </motion.div>

              {/* Label & Description */}
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-xs font-semibold tracking-wider uppercase transition-colors duration-300",
                  isActive ? "text-emerald-400" : isCompleted ? "text-emerald-500/80" : "text-slate-500"
                )}>
                  {milestone.label}
                </p>
                <p className="mt-1 text-[10px] text-slate-600 font-medium hidden sm:block">
                  {milestone.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
