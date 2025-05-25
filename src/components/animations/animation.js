// animations.ts
export const fadeInContainer = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1 },
};

export const slideInTitle = {
  initial: { y: -40 },
  animate: { y: 0 },
  transition: { type: "spring", stiffness: 100 },
};
// animations.ts
export const fadeInNav = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
};


// animations/animation.js
export const coolGameEntrance = {
  initial: {
    y: -100,
    opacity: 0,
    filter: 'drop-shadow(0 0 0 #00f0ff)', // sin brillo al inicio
  },
  animate: {
    y: 0,
    opacity: 1,
    filter: [
      'drop-shadow(0 0 10px #00f0ff)', // brilla
      'drop-shadow(0 0 20px #00f0ff)',
      'drop-shadow(0 0 10px #00f0ff)',
    ],
    transition: {
      y: { type: 'spring', stiffness: 120, damping: 12 },
      opacity: { duration: 0.5 },
      filter: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};


// animations/animation.js
export const fadeInNav2 = {
  initial: {
    opacity: 0,
    y: -20,
    height: 0,
    overflow: 'hidden',
  },
  animate: {
    opacity: 1,
    y: 0,
    height: 'auto',
    overflow: 'visible',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    height: 0,
    overflow: 'hidden',
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
};


//Loggin
// Animaciones para LoginForm

export const fadeInForm = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
};

export const slideInInput = (delay = 0.2) => ({
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { delay, duration: 0.5 },
});

export const scaleInMessage = (delay = 0.6) => ({
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { delay, duration: 0.3 },
});

//Crear perfil 
export const containerVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export const buttonHover = {
  whileHover: { scale: 1.05 },
};

export const modalAnimation = {
  initial: { scale: 0.8 },
  animate: { scale: 1 },
  transition: { type: "spring", stiffness: 200 },
};

//Busqueda de videojeugos 
// utils/motionVariants.js
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

export const scaleFadeIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
};


//export const pageVariants = {


export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

// Card animation

// List item animation
export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

// Page transition
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// Button hover effect
export const buttonHover2 = {
  scale: 1.05,
  transition: { type: 'spring', stiffness: 400, damping: 10 }
};

// Button tap effect
export const buttonTap = {
  scale: 0.98
};


//Matches 
export const cardVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      transition: { duration: 0.3 }
    })}

    //card

export const cardFlipAnimation = {
  initial: { rotateY: 0 },
  hidden: { rotateY: 0 },
  visible: { 
    rotateY: 180, 
    transition: { duration: 0.6, ease: "easeInOut" }
  },
};
