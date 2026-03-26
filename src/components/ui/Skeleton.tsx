import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className = '',
  style = {}
}: SkeletonProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        ...style,
      }}
    />
  );
}
