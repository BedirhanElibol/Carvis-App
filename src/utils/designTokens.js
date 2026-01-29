// ================================================
// CARVIS DESIGN TOKENS
// ================================================
// Based on 8px grid system and clean-code principles
// Reference: frontend-design skill

// ================================================
// SPACING (8px Grid)
// ================================================
export const SPACING = {
    xs: 4,    // 0.5x (micro adjustments)
    sm: 8,    // 1x
    md: 16,   // 2x
    lg: 24,   // 3x
    xl: 32,   // 4x
    '2xl': 48, // 6x
    '3xl': 64, // 8x
};

// ================================================
// TYPOGRAPHY SCALE (1.25 ratio)
// ================================================
export const FONT_SIZE = {
    xs: '10px',   // Labels, badges
    sm: '12px',   // Secondary text
    base: '14px', // Body text
    md: '16px',   // Emphasized body
    lg: '18px',   // Subheadings
    xl: '20px',   // Section titles
    '2xl': '24px', // Page titles
    '3xl': '32px', // Hero text
    '4xl': '40px', // Display
};

// ================================================
// BORDER RADIUS
// ================================================
export const RADIUS = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
};

// ================================================
// SHADOWS
// ================================================
export const SHADOW = {
    sm: '0 2px 8px -2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 16px -4px rgba(0, 0, 0, 0.25)',
    lg: '0 8px 32px -8px rgba(0, 0, 0, 0.3)',
    xl: '0 16px 48px -12px rgba(0, 0, 0, 0.35)',
};

// ================================================
// Z-INDEX SYSTEM
// ================================================
export const Z_INDEX = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    header: 30,
    overlay: 40,
    modal: 50,
    popover: 60,
    toast: 70,
    tooltip: 80,
    max: 100,
};

// ================================================
// ANIMATION DURATION
// ================================================
export const DURATION = {
    fast: 150,      // Micro-interactions
    normal: 200,    // Standard transitions
    slow: 300,      // Deliberate animations
    slower: 500,    // Emphasis animations
};

// ================================================
// BREAKPOINTS
// ================================================
export const BREAKPOINT = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

// ================================================
// TOUCH TARGET (Fitts' Law)
// ================================================
export const TOUCH_TARGET = {
    min: 44, // Minimum touch target size
    recommended: 48,
};
