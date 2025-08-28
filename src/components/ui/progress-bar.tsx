import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLProgressElement>, 'value' | 'max'> {
  value: number;
  max?: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '', 
  label,
  ...props 
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;
  const percentageString = percentage.toFixed(1);
  
  return (
    <progress
      className={`${styles.progress} ${className}`}
      value={clampedValue}
      max={max}
      aria-label={label || `Progress: ${percentageString}%`}
      {...props}
    />
  );
}
