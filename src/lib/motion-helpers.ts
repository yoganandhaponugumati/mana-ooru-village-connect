/**
 * Motion Helpers & Animation Utilities
 * Reusable animation functions for Framer Motion
 */

import type { Variants, TargetAndTransition, Transition } from "framer-motion";
import { animationConfig } from "./design-tokens";

type MotionPreset = {
  [key: string]: unknown;
  transition?: Transition;
  whileHover?: TargetAndTransition;
};

/**
 * Container for staggered child animations
 */
export const getStaggerContainer = (staggerDelay = 0.08, delayChildren = 0.1): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Child item for staggered animations
 */
export const getStaggerItem = (duration = 0.3): Variants => ({
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: "easeOut" },
  },
});

/**
 * Fade in animation
 */
export const fadeInAnimation = (): MotionPreset => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
});

/**
 * Slide up animation (entrance from bottom)
 */
export const slideUpAnimation = (offset = 20): MotionPreset => ({
  initial: { opacity: 0, y: offset },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: offset },
  transition: { duration: 0.4, ease: "easeOut" },
});

/**
 * Slide down animation (entrance from top)
 */
export const slideDownAnimation = (offset = 20): MotionPreset => ({
  initial: { opacity: 0, y: -offset },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -offset },
  transition: { duration: 0.4, ease: "easeOut" },
});

/**
 * Slide left animation
 */
export const slideLeftAnimation = (offset = 20): MotionPreset => ({
  initial: { opacity: 0, x: offset },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: offset },
  transition: { duration: 0.4, ease: "easeOut" },
});

/**
 * Slide right animation
 */
export const slideRightAnimation = (offset = 20): MotionPreset => ({
  initial: { opacity: 0, x: -offset },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -offset },
  transition: { duration: 0.4, ease: "easeOut" },
});

/**
 * Scale in animation
 */
export const scaleInAnimation = (startScale = 0.95): MotionPreset => ({
  initial: { opacity: 0, scale: startScale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: startScale },
  transition: { duration: 0.3, ease: "easeOut" },
});

/**
 * Pop in animation (bigger scale)
 */
export const popInAnimation = (startScale = 0.8): MotionPreset => ({
  initial: { opacity: 0, scale: startScale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: startScale },
  transition: { duration: 0.35, ease: "easeOut" },
});

/**
 * Float in animation
 */
export const floatInAnimation = (offset = 40): MotionPreset => ({
  initial: { opacity: 0, y: offset },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: offset },
  transition: { duration: 0.5, ease: "easeOut" },
});

/**
 * Rotate in animation
 */
export const rotateInAnimation = (rotation = -10): MotionPreset => ({
  initial: { opacity: 0, rotate: rotation },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: rotation },
  transition: { duration: 0.4, ease: "easeOut" },
});

/**
 * Hover scale animation
 */
export const hoverScaleAnimation = (scale = 1.05): TargetAndTransition => ({
  scale,
  transition: { type: "spring", stiffness: 400, damping: 30 },
});

/**
 * Hover lift animation (translateY + shadow)
 */
export const hoverLiftAnimation = (offset = 8): TargetAndTransition => ({
  y: -offset,
  transition: { type: "spring", stiffness: 400, damping: 30 },
});

/**
 * Button press animation
 */
export const buttonPressAnimation = (): Variants => ({
  tap: { scale: 0.95, y: 2 },
});

/**
 * Loading pulse animation
 */
export const loadingPulseAnimation = (): MotionPreset => ({
  initial: { opacity: 0.6 },
  animate: { opacity: 1 },
  transition: { duration: 1, repeat: Infinity, repeatType: "reverse" },
});

/**
 * Rotate continuous animation (for spinners)
 */
export const rotateAnimation = (): MotionPreset => ({
  animate: { rotate: 360 },
  transition: { duration: 2, repeat: Infinity, ease: "linear" },
});

/**
 * Bounce animation
 */
export const bounceAnimation = (distance = 10): MotionPreset => ({
  initial: { y: 0 },
  animate: {
    y: [-distance, 0, -distance / 2, 0],
  },
  transition: { duration: 0.8, repeat: Infinity },
});

/**
 * Shake animation for errors
 */
export const shakeAnimation = (): MotionPreset => ({
  animate: { x: [-10, 10, -10, 10, 0] },
  transition: { duration: 0.5 },
});

/**
 * Pulse ring animation (for notifications)
 */
export const pulseRingAnimation = (): MotionPreset => ({
  animate: { scale: [1, 1.1, 1] },
  transition: { duration: 2, repeat: Infinity },
});

/**
 * Floating animation (vertical movement)
 */
export const floatingAnimation = (distance = 10): MotionPreset => ({
  animate: {
    y: [0, -distance, 0],
  },
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
});

/**
 * Glow pulse animation
 */
export const glowPulseAnimation = (): MotionPreset => ({
  initial: { boxShadow: "0 0 0 0 rgba(22, 101, 52, 0.7)" },
  animate: {
    boxShadow: "0 0 0 20px rgba(22, 101, 52, 0)",
  },
  transition: { duration: 2, repeat: Infinity },
});

/**
 * Slide and fade (combined animation)
 */
export const slideAndFadeAnimation = (
  direction: "up" | "down" | "left" | "right" = "up",
): MotionPreset => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
  };

  const offset = directions[direction];

  return {
    initial: { opacity: 0, ...offset },
    animate: { opacity: 1, y: 0, x: 0 },
    exit: { opacity: 0, ...offset },
    transition: { duration: 0.4, ease: "easeOut" },
  };
};

/**
 * Success animation (check mark scale)
 */
export const successAnimation = (): MotionPreset => ({
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", stiffness: 400, damping: 30 },
});

/**
 * Error shake animation combined with color
 */
export const errorAnimation = (): MotionPreset => ({
  animate: { x: [-10, 10, -10, 10, 0] },
  transition: { duration: 0.4 },
});

/**
 * Page transition animation (for route changes)
 */
export const pageTransitionAnimation = (): MotionPreset => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeInOut" },
});

/**
 * Accordion expand animation
 */
export const accordionAnimation = (): MotionPreset => ({
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3 },
});

/**
 * Modal backdrop fade animation
 */
export const backdropAnimation = (): MotionPreset => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
});

/**
 * Modal content scale animation
 */
export const modalContentAnimation = (): MotionPreset => ({
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: 0.3, ease: "easeOut" },
});

/**
 * Drawer slide animation (from side)
 */
export const drawerAnimation = (from: "left" | "right" = "left"): MotionPreset => {
  const direction = from === "left" ? { x: -100 } : { x: 100 };
  return {
    initial: { ...direction, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { ...direction, opacity: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };
};

/**
 * Toast notification animation
 */
export const toastAnimation = (position: "top" | "bottom" = "top"): MotionPreset => {
  const initial = position === "top" ? { y: -100 } : { y: 100 };
  return {
    initial: { ...initial, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { ...initial, opacity: 0 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  };
};

/**
 * Tooltip fade animation
 */
export const tooltipAnimation = (): MotionPreset => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.15 },
});

/**
 * Skeleton loading shimmer animation
 */
export const skeletonAnimation = (): MotionPreset => ({
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
  transition: { duration: 2, repeat: Infinity, ease: "linear" },
});

/**
 * Countdown timer animation
 */
export const countdownAnimation = (): MotionPreset => ({
  animate: { scale: [1, 0.9, 1] },
  transition: { duration: 1, repeat: Infinity },
});

/**
 * Viewport-triggered animation (scroll reveal)
 */
export const viewportAnimation = (): {
  initial: { opacity: number; y: number };
  whileInView: { opacity: number; y: number };
  viewport: { once: boolean; amount: number };
  transition: { duration: number; ease: string };
} => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: "easeOut" },
});

/**
 * Image zoom on hover
 */
export const imageZoomAnimation = (): MotionPreset => ({
  initial: { scale: 1 },
  whileHover: { scale: 1.05 },
  transition: { duration: 0.3 },
});

/**
 * Parallax scroll animation
 */
export const parallaxAnimation = (offset = 50) => ({
  y: [0, offset],
  transition: { type: "tween", ease: "easeOut" },
});

/**
 * Get animation duration in milliseconds
 */
export const getDuration = (key: keyof typeof animationConfig.duration): number => {
  return animationConfig.duration[key];
};

/**
 * Get easing function
 */
export const getEasing = (key: keyof typeof animationConfig.easing): string => {
  return animationConfig.easing[key];
};
