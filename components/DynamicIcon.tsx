/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DynamicIconProps {
    icon: LucideIcon | string;
    size?: number;
    className?: string;
    alt?: string;
}

// A utility component that renders either a Lucide icon or an image-based icon.
const DynamicIcon: React.FC<DynamicIconProps> = ({ icon, size = 24, className = '', alt = 'icon' }) => {
    /* --- Render Return Logic --- */
    if (typeof icon === 'string') {
        return (
            <img
                src={icon}
                alt={alt}
                style={{ width: size, height: size }}
                className={`object-contain ${className}`}
            />
        );
    }

    const IconComponent = icon;
    return <IconComponent size={size} className={className} />;
};

export default DynamicIcon;
