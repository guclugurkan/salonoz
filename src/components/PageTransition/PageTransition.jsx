import { motion } from "framer-motion";

// Configuration de l'animation de flou et d'opacité
const blurVariants = {
  initial: {
    opacity: 0,
    filter: "blur(20px)", // Flou intense au départ
    scale: 1.02, // Léger zoom pour un effet de profondeur
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)", // Le flou disparaît
    scale: 1,
    transition: {
      duration: 0.8, // Transition douce et progressive
      ease: [0.22, 1, 0.36, 1], // Ease-out fluide
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(15px)", // Le flou revient quand on part
    scale: 0.98, // Léger dé-zoom
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={blurVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%", willChange: "filter, opacity" }} // Optimisation
    >
      {children}
    </motion.div>
  );
}