import React from 'react';

const DotMatrix: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 opacity-[0.02]">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dot-matrix"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="20"
                cy="20"
                r="1"
                fill="currentColor"
                className="text-gray-900"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#dot-matrix)"
          />
        </svg>
      </div>
    </div>
  );
};

export default DotMatrix;