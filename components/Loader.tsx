import React from 'react';

const Loader: React.FC = () => {
  const messages = [
    "Conducting deep research...",
    "Analyzing sources...",
    "Synthesizing information...",
    "Structuring the guide...",
    "Formatting citations...",
    "Building learning paths...",
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1E1E2E]/90 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-t-transparent border-[#CBA6F7] rounded-full animate-spin"></div>
      <p className="mt-6 text-lg text-[#CDD6F4] transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default Loader;
