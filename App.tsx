import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputForm from './components/InputForm';
import Loader from './components/Loader';
import MarkdownRenderer from './components/MarkdownRenderer';
import { generateStudyGuide } from './services/geminiService';
import { MenuIcon, CopyIcon, DownloadIcon } from './components/Icons';

interface Source {
  web?: {
    uri: string;
    title: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  topic: string;
  guide: string;
  sources: Source[];
  date: string;
}

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [copyButtonText, setCopyButtonText] = useState('Copy Markdown');

  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (e) {
      console.error("Failed to parse conversations from localStorage", e);
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);
  
  const handleGenerate = useCallback(async (topic: string) => {
    if (!topic.trim()) {
      setError('Please enter a topic or URL.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const { guide, sources } = await generateStudyGuide(topic);
      const titleMatch = guide.match(/^title:\s*(.*)$/m);
      const title = titleMatch ? titleMatch[1] : topic;
      
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        title: title.trim(),
        topic,
        guide,
        sources: sources || [],
        date: new Date().toISOString(),
      };

      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      setCurrentConversationId(newConversation.id);
    } catch (err) {
      console.error(err);
      setError('Failed to generate study guide. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [conversations]);
  
  const handleSelectConversation = (id: string | null) => {
    setCurrentConversationId(id);
    if (window.innerWidth < 768) { // md breakpoint
        setSidebarOpen(false);
    }
  };

  const handleNewGuide = () => {
    setCurrentConversationId(null);
    setError('');
  };
  
  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const handleCopyToClipboard = useCallback(() => {
    if (!currentConversation) return;
    navigator.clipboard.writeText(currentConversation.guide).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Markdown'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Failed to copy');
       setTimeout(() => setCopyButtonText('Copy Markdown'), 2000);
    });
  }, [currentConversation]);

  const handleDownload = useCallback(() => {
    if (!currentConversation) return;
    const safeTitle = currentConversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeTitle}.md`;
    const blob = new Blob([currentConversation.guide], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentConversation]);


  if (isLoading && !currentConversation) {
    return <Loader />;
  }

  const validSources = currentConversation?.sources.filter(source => source.web && source.web.uri && source.web.title) || [];


  return (
    <div className="flex h-screen bg-[#1E1E2E] text-[#CDD6F4] font-sans">
      <Sidebar
        conversations={conversations}
        onSelect={handleSelectConversation}
        onNew={handleNewGuide}
        onDelete={handleDeleteConversation}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        currentConversationId={currentConversationId}
      />
      
      <main className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
        <div className="md:hidden p-2 bg-[#181825] border-b border-[#313244] flex items-center">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-[#45475A]">
                <MenuIcon />
            </button>
            <h2 className="ml-4 font-semibold text-sm truncate">
              {currentConversation ? currentConversation.title : 'New Study Guide'}
            </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {currentConversation ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-[#89B4FA]">{currentConversation.title}</h1>
                     <div className="flex items-center space-x-4">
                        <button onClick={handleCopyToClipboard} className="flex items-center space-x-2 text-sm text-[#A6ADC8] hover:text-white transition">
                            <CopyIcon /> <span>{copyButtonText}</span>
                        </button>
                        <button onClick={handleDownload} className="flex items-center space-x-2 text-sm text-[#A6ADC8] hover:text-white transition">
                            <DownloadIcon /> <span>Download .md</span>
                        </button>
                    </div>
                  </div>
                  <MarkdownRenderer content={currentConversation.guide} />
                  {validSources.length > 0 && (
                      <div className="mt-8">
                          <h3 className="text-xl font-bold mb-4 text-[#89B4FA]">Research Sources</h3>
                          <div className="bg-[#181825]/50 p-4 rounded-xl border border-[#313244]">
                              <ul className="space-y-2">
                                  {validSources.map((source, index) => (
                                      <li key={index} className="text-sm">
                                          <a 
                                              href={source.web!.uri} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-[#94E2D5] hover:text-[#81C9BE] hover:underline transition"
                                          >
                                              {source.web!.title || 'Untitled Source'}
                                          </a>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  )}
                </div>
            ) : (
                <div className="w-full max-w-4xl mx-auto flex flex-col justify-center h-full">
                    <Header />
                    <p className="text-center text-[#A6ADC8] mb-8 -mt-4">
                      Enter any idea, topic, webpage URL, or YouTube URL below. Our AI will conduct deep research and generate a comprehensive study guide in Obsidian-flavored Markdown.
                    </p>
                    <InputForm
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                    />
                     {error && (
                      <div className="mt-8 bg-[#F38BA8]/20 border border-[#F38BA8]/50 text-[#F38BA8] px-4 py-3 rounded-lg text-center">
                        <p><strong>Error:</strong> {error}</p>
                      </div>
                    )}
                </div>
            )}
        </div>
      </main>
      <footer className="fixed bottom-2 right-4 text-center text-[#585B70] text-xs">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
