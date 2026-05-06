/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { useOS } from '../context/OSContext';
import { XCircle, X } from 'lucide-react';

// A Windows-style error dialog that prompts the user to switch networks during scheduled maintenance (Days 2-5).
const NetworkErrorDialog: React.FC = () => {
  /* --- Hooks & Context State --- */
  const { showNetworkError, dismissNetworkError } = useOS();

  /* --- Render Return Logic --- */
  if (!showNetworkError) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f0f0f0] border border-gray-400 shadow-[2px_2px_10px_rgba(0,0,0,0.5)] w-[400px] font-sans text-sm select-none flex flex-col">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-red-700 to-red-500 text-white px-3 py-1.5 flex justify-between items-center cursor-default">
          <span className="font-semibold text-xs tracking-wide">Network Error</span>
          <button
            onClick={dismissNetworkError}
            className="hover:bg-red-600/50 p-0.5 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex items-start gap-4 bg-white">
          <XCircle size={32} className="text-red-600 shrink-0 mt-1" />
          <div className="flex flex-col gap-4 text-gray-800">
            <p>
              CorpNet is currently undergoing scheduled maintenance.
            </p>
            <p>
              Please connect to an alternative network to continue your work.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f0f0f0] border-t border-gray-300 p-3 flex justify-end">
          <button
            onClick={dismissNetworkError}
            className="px-6 py-1 bg-gray-200 border border-gray-400 hover:bg-gray-300 hover:border-gray-500 active:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorDialog;
