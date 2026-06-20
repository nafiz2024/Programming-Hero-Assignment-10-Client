export const motionDurations = {
  fast: 0.3,
  base: 0.45,
  slow: 0.6,
};

const easeOut = [0.22, 1, 0.36, 1];

export const motionPresets = {
  reduced: {
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    transition: { duration: 0.2, ease: "linear" },
  },
  staggerFadeUp: {
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 18 },
      visible: { opacity: 1, y: 0, transition: { duration: motionDurations.base, ease: easeOut } },
    },
    transition: { duration: motionDurations.base, ease: easeOut },
  },
  scrollReveal: {
    variants: {
      hidden: { opacity: 0, y: 24, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    transition: { duration: motionDurations.slow, ease: easeOut },
  },
  slideTransition: {
    variants: {
      hidden: { opacity: 0, x: 34 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -34 },
    },
    transition: { duration: motionDurations.base, ease: easeOut },
  },
  viewportReveal: {
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    transition: { duration: motionDurations.base, ease: easeOut },
  },
  contentFade: {
    variants: {
      hidden: { opacity: 0, y: 14 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    },
    transition: { duration: motionDurations.fast, ease: easeOut },
  },
  modalSpring: {
    variants: {
      hidden: { opacity: 0, scale: 0.94, y: 22 },
      visible: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.96, y: 12 },
    },
    transition: { type: "spring", stiffness: 240, damping: 24, mass: 0.85 },
  },
  dashboardCardStagger: {
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.06,
          delayChildren: 0.04,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: motionDurations.fast, ease: easeOut } },
    },
    transition: { duration: motionDurations.fast, ease: easeOut },
  },
};
