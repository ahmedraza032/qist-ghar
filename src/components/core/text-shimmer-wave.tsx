'use client';
import React, { type JSX } from 'react';
import { motion, Transition } from 'motion/react';
import { cn } from '@/lib/utils';

export type TextShimmerWaveProps = {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  spread?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
  transition?: Transition;
};

export function TextShimmerWave({
  children,
  as: Component = 'span',
  className,
  duration = 0.4,
  zDistance = 5,
  xDistance = 1,
  yDistance = -1,
  spread = 1.2,
  scaleDistance = 1.05,
  rotateYDistance = 5,
  transition,
}: TextShimmerWaveProps) {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements
  );

  const nodes: { type: 'char' | 'node'; content: any }[] = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      child.split('').forEach((char) => {
        nodes.push({ type: 'char', content: char });
      });
    } else {
      nodes.push({ type: 'node', content: child });
    }
  });

  return (
    <MotionComponent
      className={cn(
        'relative inline-flex items-center justify-center [perspective:500px]',
        className
      )}
    >
      {nodes.map((item, i) => {
        if (item.type === 'node') {
          return <span key={i} className="inline-flex shrink-0 z-10">{item.content}</span>;
        }

        const delay = (i * duration * (1 / spread)) / nodes.length;

        return (
          <motion.span
            key={i}
            className="inline-block whitespace-pre [transform-style:preserve-3d]"
            variants={{
              initial: { translateZ: 0, scale: 1, rotateY: 0, translateX: 0, translateY: 0 },
              hover: {
                translateZ: [0, zDistance, 0],
                translateX: [0, xDistance, 0],
                translateY: [0, yDistance, 0],
                scale: [1, scaleDistance, 1],
                rotateY: [0, rotateYDistance, 0],
                transition: {
                  duration: duration,
                  delay,
                  ease: 'easeOut',
                  ...transition,
                }
              }
            }}
          >
            {item.content}
          </motion.span>
        );
      })}
    </MotionComponent>
  );
}
