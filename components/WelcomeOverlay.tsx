/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useEffect, useState } from 'react';
import { useOS } from '../context/OSContext';

// A multi-stage introductory overlay that displays a welcome message followed by reporting instructions.
const WelcomeOverlay: React.FC = () => {
  /* --- Hooks & Local State --- */
  const { showWelcome, dismissWelcome } = useOS();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [stage, setStage] = useState(0); // 0: Welcome, 1: Instructions

  useEffect(() => {
    if (showWelcome) {
      setShouldRender(true);
      setStage(0);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setStage(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  /* --- Event Handlers --- */
  // Manages transitions between introductory stages or dismisses the overlay.
  const handleClick = () => {
    if (stage === 0) {
      // Transition to Stage 1
      setIsVisible(false);
      setTimeout(() => {
        setStage(1);
        setIsVisible(true);
      }, 500); // Wait for fade out
    } else {
      // Final dismissal
      dismissWelcome();
    }
  };

  /* --- Visibility & Rendering Logic --- */
  if (!shouldRender) return null;

  /* ==========================================================================
     RENDER RETURN
     ========================================================================== */
  return (
    <div
      onClick={handleClick}
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 transition-opacity duration-500 cursor-pointer ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center">
        <img
          src={stage === 0 ? "/assets/welcome msg.jpg" : "/assets/Report Instructions.jpg"}
          alt={stage === 0 ? "Welcome" : "Instructions"}
          className="max-w-full max-h-[85vh] object-contain shadow-[0_0_100px_rgba(255,255,255,0.1)] rounded-xl border border-white/20"
        />
        <div className="mt-6 text-white/50 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
          {stage === 0 ? "Click to see report instructions" : "Click anywhere to start Day 1 shift"}
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
