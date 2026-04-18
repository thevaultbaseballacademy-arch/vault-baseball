import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Wraps page content in a fade + subtle slide animation on route change.
 * Keyed by pathname so React remounts on navigation.
 */
const PageTransition = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
