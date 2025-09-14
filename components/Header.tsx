import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#89B4FA] to-[#CBA6F7]">
        Deep Research Study Guide Generator
      </h1>
      <p className="mt-2 text-lg text-[#A6ADC8]">Your Personal AI Research Assistant</p>
    </header>
  );
};

export default Header;
