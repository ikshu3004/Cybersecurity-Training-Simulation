/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { FileUp, X } from 'lucide-react';

interface FileUploadPopupProps {
    id: string;
    filename: string;
    onClose: (id: string) => void;
}

// A popup that simulates a malicious file exfiltration progress bar.
const FileUploadPopup: React.FC<FileUploadPopupProps> = ({ id, filename, onClose }) => {
    /* --- Hooks & Effects --- */
    const [progress, setProgress] = useState(0);
    const [position, setPosition] = useState({ top: '50%', left: '50%' });

    useEffect(() => {
        // Random initial position
        setPosition({
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`
        });

        // Simulate upload progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + Math.random() * 5;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    /* ==========================================================================
       RENDER RETURN
       ========================================================================== */
    return (
        <div
            className="absolute w-64 bg-[#2b2b2b] border border-gray-600 rounded shadow-2xl p-3 z-[500] animate-in zoom-in duration-300 font-sans select-none"
            style={{ top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-600">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                    <FileUp size={14} className="text-blue-400 animate-bounce" />
                    <span>Uploading...</span>
                </div>
                <button onClick={() => onClose(id)} className="text-gray-400 hover:text-white">
                    <X size={14} />
                </button>
            </div>

            <div className="text-xs text-gray-400 mb-2 truncate">
                {filename}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>{(progress * 0.45).toFixed(1)} MB / 45.0 MB</span>
                <span>{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

export default FileUploadPopup;
