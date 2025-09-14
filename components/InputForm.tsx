import React from 'react';

interface InputFormProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
  userInput: string;
  onUserInput: (value: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, userInput, onUserInput }) => {

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGenerate(userInput);
  };

  return (
    <div className="bg-[#181825]/50 p-6 rounded-xl border border-[#313244] shadow-lg">
      <form onSubmit={handleSubmit}>
        <label htmlFor="userInput" className="block text-lg font-medium text-[#A6ADC8] mb-2">
          Enter Topic or URL
        </label>
        <textarea
          id="userInput"
          rows={4}
          className="w-full p-3 bg-[#11111B] border border-[#45475A] rounded-lg focus:ring-2 focus:ring-[#CBA6F7] focus:border-[#CBA6F7] transition duration-200 text-[#CDD6F4] placeholder-[#585B70]"
          placeholder="e.g., 'The fundamentals of quantum computing', 'https://react.dev', or a YouTube link..."
          value={userInput}
          onChange={(e) => onUserInput(e.target.value)}
          disabled={isLoading}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-6 py-3 bg-[#CBA6F7] text-[#1E1E2E] font-semibold rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CBA6F7] focus:ring-offset-[#1E1E2E] disabled:bg-[#45475A] disabled:text-[#A6ADC8] disabled:cursor-not-allowed transition duration-200 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Study Guide'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;