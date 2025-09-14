import React from 'react';
import { PlusIcon, TrashIcon } from './Icons';

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentConversationId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, onSelect, onNew, onDelete, isOpen, setIsOpen, currentConversationId }) => {
    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent onSelect from firing
        onDelete(id);
    }
    
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#181825] border-r border-[#313244] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="p-4 border-b border-[#313244]">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#45475A] text-[#CDD6F4] font-semibold rounded-lg hover:bg-[#585B70] transition-colors"
          >
            <PlusIcon />
            <span>New Guide</span>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <a
                key={conv.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(conv.id);
                }}
                className={`group flex items-center justify-between p-2 text-sm font-medium rounded-md transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-[#CBA6F7] text-[#1E1E2E]'
                    : 'text-[#A6ADC8] hover:bg-[#313244] hover:text-[#CDD6F4]'
                }`}
              >
                <span className="truncate flex-1 pr-2">{conv.title}</span>
                <button 
                  onClick={(e) => handleDelete(e, conv.id)}
                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${currentConversationId === conv.id ? 'hover:bg-[#1E1E2E]/20' : 'hover:bg-[#F38BA8]/50'}`}
                  aria-label="Delete conversation"
                >
                    <TrashIcon />
                </button>
              </a>
            ))
          ) : (
            <p className="px-2 text-sm text-[#585B70]">No guides yet.</p>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
