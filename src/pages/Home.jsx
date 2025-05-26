import { motion } from "framer-motion";
import { fadeInContainer, slideInTitle } from "../components/animations/animation";
import "../styles/Home/home.css";

export function Home() {
  return (
    <motion.div className="home-container" {...fadeInContainer}>
      <motion.h1 className="home-title" {...slideInTitle}>
        Gemukore
      </motion.h1>
    </motion.div>
  );
}
