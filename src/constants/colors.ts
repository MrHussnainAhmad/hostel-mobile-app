// constants/colors.ts

export const COLORS = {
  // ═══════════════════════════════════════════════════════════
  // BACKGROUNDS - Soft whites, easy on eyes, luxury feel
  // ═══════════════════════════════════════════════════════════
  bgPrimary: '#FAFAFA',      // Main canvas - warm off-white
  bgSecondary: '#F5F5F7',    // Subtle sections (Apple-inspired)
  bgCard: '#FFFFFF',         // Cards, inputs - pure white
  bgElevated: '#FFFFFF',     // Elevated surfaces
  bgMuted: '#F8F9FA',        // Muted background areas

  // ═══════════════════════════════════════════════════════════
  // TEXT - Deep, elegant hierarchy
  // ═══════════════════════════════════════════════════════════
  textPrimary: '#1C1C1E',    // Primary text - rich charcoal (iOS-style)
  textSecondary: '#636366',  // Secondary labels
  textMuted: '#AEAEB2',      // Placeholders, hints
  textInverse: '#FFFFFF',    // Text on dark surfaces

  // ═══════════════════════════════════════════════════════════
  // BRAND / ACCENT - Sophisticated, futuristic indigo
  // ═══════════════════════════════════════════════════════════
  primary: '#5856D6',        // Refined indigo (luxury tech feel)
  primaryLight: '#F2F2FF',   // Soft tint for backgrounds
  primaryMedium: '#7A79E0',  // Hover/active states
  primaryDark: '#3634A3',    // Pressed states
  primarySubtle: '#E8E8FF',  // Very subtle accent backgrounds

  // ═══════════════════════════════════════════════════════════
  // FEEDBACK - Refined, muted tones
  // ═══════════════════════════════════════════════════════════
  success: '#34C759',        // Clean green
  successLight: '#F0FDF4',   // Soft success background
  successMuted: '#86EFAC',   // Subtle success accent

  error: '#FF3B30',          // Clear but not aggressive
  errorLight: '#FEF2F2',     // Soft error background
  errorMuted: '#FECACA',     // Subtle error accent

  warning: '#FF9500',        // Warm amber
  warningLight: '#FFFBEB',   // Soft warning background
  warningMuted: '#FDE68A',   // Subtle warning accent

  info: '#007AFF',           // iOS blue
  infoLight: '#EFF6FF',      // Soft info background
  infoMuted: '#BFDBFE',      // Subtle info accent

  // ═══════════════════════════════════════════════════════════
  // BORDERS & DIVIDERS - Minimal, almost invisible
  // ═══════════════════════════════════════════════════════════
  border: '#E5E5EA',         // Default border
  borderLight: '#F2F2F7',    // Subtle border
  borderFocus: '#5856D6',    // Focus state (matches primary)
  divider: '#F2F2F7',        // Section dividers

  // ═══════════════════════════════════════════════════════════
  // SHADOWS - Soft, elegant depth
  // ═══════════════════════════════════════════════════════════
  shadow: 'rgba(0, 0, 0, 0.04)',           // Light shadow
  shadowMedium: 'rgba(0, 0, 0, 0.08)',     // Medium elevation
  shadowStrong: 'rgba(0, 0, 0, 0.12)',     // High elevation
  shadowPrimary: 'rgba(88, 86, 214, 0.15)', // Accent glow effect

  // ═══════════════════════════════════════════════════════════
  // OVERLAY - For modals, sheets
  // ═══════════════════════════════════════════════════════════
  overlay: 'rgba(0, 0, 0, 0.4)',           // Modal backdrop
  overlayLight: 'rgba(0, 0, 0, 0.2)',      // Light overlay

  // ═══════════════════════════════════════════════════════════
  // DECORATIVE - Watermarks, subtle patterns
  // ═══════════════════════════════════════════════════════════
  watermarkIcon: 'rgba(28, 28, 30, 0.04)',      // Faint icons
  watermarkIconSoft: 'rgba(28, 28, 30, 0.02)',  // Extra soft

  // ═══════════════════════════════════════════════════════════
  // UTILITY - Additional helpers
  // ═══════════════════════════════════════════════════════════
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  
  // Skeleton loading
  skeleton: '#F2F2F7',
  skeletonHighlight: '#FAFAFA',

  // Input specific
  inputBg: '#FFFFFF',
  inputBorder: '#E5E5EA',
  inputBorderFocus: '#5856D6',
  inputPlaceholder: '#C7C7CC',

  // Button specific
  buttonDisabled: '#F2F2F7',
  buttonDisabledText: '#C7C7CC',
};

// ═══════════════════════════════════════════════════════════
// GRADIENTS - For subtle luxury touches (use sparingly)
// ═══════════════════════════════════════════════════════════
export const GRADIENTS = {
  primary: ['#5856D6', '#7A79E0'],
  subtle: ['#FAFAFA', '#F5F5F7'],
  shimmer: ['#F2F2F7', '#FAFAFA', '#F2F2F7'],
};

// ═══════════════════════════════════════════════════════════
// OPACITY VALUES - Consistent transparency
// ═══════════════════════════════════════════════════════════
export const OPACITY = {
  pressed: 0.7,
  disabled: 0.5,
  muted: 0.6,
};