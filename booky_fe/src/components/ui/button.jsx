import React from 'react';

// A simple, reusable button component
const Button = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
