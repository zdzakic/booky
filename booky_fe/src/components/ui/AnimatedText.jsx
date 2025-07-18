import React from 'react';

const AnimatedText = ({ text, tag: Tag = 'span', className = '' }) => {
  return (
    <Tag key={text} className={`animate-fade-in ${className}`}>
      {text}
    </Tag>
  );
};

export default AnimatedText;
