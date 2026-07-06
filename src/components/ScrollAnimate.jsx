import React from 'react';
import { motion } from 'framer-motion';

const ScrollAnimate = ({ children, delay = 0, duration = 0.6, yOffset = 30, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimate;
