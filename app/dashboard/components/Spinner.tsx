"use client";

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function SnakeSpinner({ size = 'md', color = '#3b82f6' }: SpinnerProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="relative flex items-center justify-center">
      <style>{`
        @keyframes snakeMove {
          0% {
            transform: rotate(0deg) translateX(0) scale(1);
            opacity: 1;
          }
          25% {
            transform: rotate(90deg) translateX(5px) scale(1.1);
            opacity: 0.9;
          }
          50% {
            transform: rotate(180deg) translateX(0) scale(1);
            opacity: 0.8;
          }
          75% {
            transform: rotate(270deg) translateX(-5px) scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: rotate(360deg) translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 5px ${color}40);
          }
          50% {
            filter: drop-shadow(0 0 15px ${color}80);
          }
        }

        @keyframes trailEffect {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .snake-dot {
          animation: snakeMove 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: calc(var(--i) * -0.15s);
        }

        .snake-container {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .trail-dot {
          animation: trailEffect 1.5s ease-in-out infinite;
          animation-delay: calc(var(--i) * -0.1s);
        }
      `}</style>

      {/* Main Snake Container */}
      <div className={`relative ${sizes[size]} snake-container`}>
        {/* Snake Head (larger dot) */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ '--i': 0 } as React.CSSProperties}
        >
          <div
            className={`${dotSizes[size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg']} rounded-full`}
            style={{
              backgroundColor: color,
              boxShadow: `0 0 15px ${color}`,
              transform: 'scale(1.3)',
              animation: 'snakeMove 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
        </div>

        {/* Snake Body Dots - Circular Pattern */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={
              {
                '--i': i + 1,
                transform: `rotate(${i * 45}deg) translateX(${
                  size === 'sm' ? '20px' : size === 'md' ? '30px' : '40px'
                })`,
              } as React.CSSProperties
            }
          >
            <div
              className={`${dotSizes[size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg']} rounded-full snake-dot`}
              style={{
                backgroundColor: color,
                opacity: 1 - i * 0.1,
                transform: `scale(${1 - i * 0.05})`,
              }}
            />
          </div>
        ))}

        {/* Inner Ring - Smaller dots for detail */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`inner-${i}`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={
              {
                '--i': i + 5,
                transform: `rotate(${i * 90 + 45}deg) translateX(${
                  size === 'sm' ? '10px' : size === 'md' ? '15px' : '20px'
                })`,
              } as React.CSSProperties
            }
          >
            <div
              className={`${
                size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'
              } rounded-full snake-dot`}
              style={{
                backgroundColor: color,
                opacity: 0.7,
              }}
            />
          </div>
        ))}

        {/* Trail Effect Dots */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`trail-${i}`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={
              {
                '--i': i,
                transform: `rotate(${i * 120}deg) translateX(${
                  size === 'sm' ? '15px' : size === 'md' ? '22px' : '30px'
                })`,
              } as React.CSSProperties
            }
          >
            <div
              className={`${
                size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2'
              } rounded-full trail-dot`}
              style={{
                backgroundColor: color,
                opacity: 0.3,
              }}
            />
          </div>
        ))}
      </div>

      {/* Optional Loading Text */}
      <div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap"
        style={{ color }}
      >
        Loading...
      </div>
    </div>
  );
}

// Example usage component
export function SpinnerDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center gap-12 p-8">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-white text-xl font-bold mb-4">Snake Spinner - Small</h2>
        <SnakeSpinner size="sm" color="#3b82f6" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-white text-xl font-bold mb-4">Snake Spinner - Medium</h2>
        <SnakeSpinner size="md" color="#10b981" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-white text-xl font-bold mb-4">Snake Spinner - Large</h2>
        <SnakeSpinner size="lg" color="#f59e0b" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-white text-xl font-bold mb-4">Custom Color</h2>
        <SnakeSpinner size="md" color="#ec4899" />
      </div>
    </div>
  );
}