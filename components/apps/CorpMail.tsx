/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { Search, Send, File, Inbox, Star, Trash2, FileText, X, AlertCircle } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { Email } from '../../types';

/* ==========================================================================
   MAIN COMPONENT: CorpMail
   ========================================================================== */
const CorpMail: React.FC = () => {
  /* --- Hooks & Context State --- */
  const { emails, markEmailRead, deleteEmail, openApp, triggerMalwareAttack } = useOS();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showHeaders, setShowHeaders] = useState(false);

  /* --- Effects --- */
  // Set initial selected email only once when component mounts or if selection becomes invalid
  useEffect(() => {
    if (!selectedEmail && emails.length > 0) {
      setSelectedEmail(emails[0]);
    } else if (selectedEmail && !emails.find(e => e.id === selectedEmail.id) && emails.length > 0) {
      setSelectedEmail(emails[0]);
    }
  }, [emails, selectedEmail]);

  /* --- Event Handlers --- */
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowHeaders(false); // Reset header view when switching emails
    if (!email.read) {
      markEmailRead(email.id);
    }
  };

  const handleDelete = () => {
    if (selectedEmail) {
      deleteEmail(selectedEmail.id);
      setSelectedEmail(null);
    }
  };

  /* --- Helper Functions & Calculated State --- */
  const filteredEmails = emails.filter(e =>
    e.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.time.getTime() - a.time.getTime());

  const formatTime = (date: Date) => {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const openLink = (url: string, type?: string) => {
    openApp('corp_browser', { url, type });
  };

  const renderBody = (body: string) => {
    // Simple URL regex
    const urlRegex = /(https?:\/\/[^\s]+|\[[^\s]+\])/g;
    const parts = body.split(urlRegex);
    const matches = body.match(urlRegex);

    if (!matches) return body;

    return parts.map((part, i) => {
      if (matches.includes(part)) {
        const url = part.startsWith('[') ? part.slice(1, -1) : part;
        const displayUrl = part.startsWith('[') ? part : url;
        return (
          <span
            key={i}
            onClick={() => openLink(url, selectedEmail?.type)}
            className="text-[#60a5fa] hover:underline cursor-pointer font-bold"
          >
            {displayUrl}
          </span>
        );
      }
      return part;
    });
  };

  // Scroll to top when new email arrives
  const listRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (emails.length > 0 && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [emails]);

  /* ==========================================================================
     RENDER LOGIC
     ========================================================================== */
  return (
    <div className="flex flex-col h-full bg-[#121212] font-sans text-sm text-gray-300 relative">
      {/* --- Browser-like Header --- */}
      <div className="bg-[#0078d4] text-white p-2 flex items-center justify-between h-12 shrink-0">Content-Type: application/javascript; charset=UTF-8
        <div className="flex items-center space-x-3 ml-2">
          <div className="grid grid-cols-3 gap-0.5 w-4 h-4 cursor-pointer hover:opacity-80">
            {[...Array(9)].map((_, i) => <div key={i} className="bg-white rounded-[1px]"></div>)}
          </div>
          <span className="font-semibold text-lg tracking-tight">CorpMail</span>
        </div>
        <div className="bg-[#005a9e] rounded px-2 py-1 w-1/3 flex items-center border border-white/10">
          <Search size={14} className="mr-2 opacity-70" />
          <input
            className="bg-transparent border-none outline-none text-white placeholder-white/70 w-full text-sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3 mr-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">JD</div>
        </div>
      </div>

      {/* --- Action Toolbar --- */}
      <div className="bg-[#1f1f1f] border-b border-white/10 p-2 flex space-x-4 shrink-0 shadow-sm">
        <div className="flex flex-col items-center cursor-pointer opacity-80 hover:opacity-100 hover:bg-[#333] p-1 rounded px-2 transition-colors">
          <Send size={18} className="text-[#60a5fa] mb-1" />
          <span className="text-xs text-[#60a5fa]">New Mail</span>
        </div>
        <div className="w-[1px] bg-white/10 h-full mx-2"></div>
        <div className="flex flex-col items-center cursor-pointer opacity-80 hover:opacity-100 hover:bg-[#333] p-1 rounded px-2 transition-colors">
          <Inbox size={18} className="mb-1 text-gray-300" />
          <span className="text-xs">Archive</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer opacity-80 hover:opacity-100 hover:bg-[#333] p-1 rounded px-2 transition-colors" onClick={handleDelete}>
          <Trash2 size={18} className="mb-1 text-gray-300" />
          <span className="text-xs">Delete</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- Sidebar Navigation --- */}
        <div className="w-48 bg-[#181818] border-r border-white/10 flex flex-col pt-4">
          <div className="px-4 py-2 font-semibold text-gray-500 text-xs uppercase">Favorites</div>
          <div className="bg-[#2d2d2d] px-4 py-1.5 flex items-center cursor-pointer border-l-4 border-[#0078d4] text-white">
            <Inbox size={14} className="mr-3 text-[#60a5fa]" />
            <span>Inbox</span>
            {emails.filter(e => !e.read).length > 0 && (
              <span className="ml-auto text-[#60a5fa] font-bold">{emails.filter(e => !e.read).length}</span>
            )}
          </div>
          <div className="hover:bg-[#2d2d2d] px-4 py-1.5 flex items-center cursor-pointer border-l-4 border-transparent text-gray-300">
            <Send size={14} className="mr-3 text-gray-500" />
            <span>Sent Items</span>
          </div>
          <div className="hover:bg-[#2d2d2d] px-4 py-1.5 flex items-center cursor-pointer border-l-4 border-transparent text-gray-300">
            <File size={14} className="mr-3 text-gray-500" />
            <span>Drafts</span>
          </div>
        </div>

        {/* --- Inbox Email List --- */}
        <div ref={listRef} className="w-72 bg-[#1f1f1f] border-r border-white/10 overflow-y-auto">
          <div className="p-3 border-b border-white/10 flex justify-between items-center">
            <span className="font-semibold text-gray-200">Inbox</span>
            <span className="text-xs text-[#60a5fa] cursor-pointer hover:underline">Filter</span>
          </div>
          {filteredEmails.map(email => (
            <div
              key={email.id}
              className={`p-3 border-b border-[#333] cursor-pointer group relative ${selectedEmail?.id === email.id ? 'bg-[#2d2d2d] border-l-4 border-l-[#0078d4]' : 'border-l-4 border-l-transparent hover:bg-[#252525]'}`}
              onClick={() => handleSelectEmail(email)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`truncate font-semibold ${!email.read ? 'text-[#60a5fa]' : 'text-gray-200'}`}>{email.from}</span>
                <span className={`text-xs whitespace-nowrap ml-2 ${!email.read ? 'text-[#0078d4] font-bold' : 'text-gray-500'}`}>{formatTime(email.time)}</span>
              </div>
              <div className={`text-xs mb-1 truncate ${!email.read ? 'font-bold text-white' : 'text-gray-400'}`}>
                {email.priority && <span className="text-red-500 mr-1">!</span>}
                {email.subject}
              </div>
              <div className={`text-xs truncate ${!email.read ? 'text-gray-300' : 'text-gray-500'}`}>{email.preview}</div>
              <div className="absolute right-2 top-8 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-yellow-500 transition-opacity">
                <Star size={12} />
              </div>
            </div>
          ))}
          {filteredEmails.length === 0 && (
            <div className="p-4 text-center text-gray-500 italic">No emails found</div>
          )}
        </div>

        {/* --- Reading Pane: Email Content --- */}
        {selectedEmail ? (
          <div className="flex-1 bg-[#121212] p-6 overflow-y-auto relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">{selectedEmail.subject}</h2>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 border border-transparent shadow-sm ${selectedEmail.type === 'phishing' ? 'bg-red-900' : selectedEmail.type === 'funny' ? 'bg-purple-900' : 'bg-[#333]'}`}>
                    {selectedEmail.from.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-200">{selectedEmail.from}</div>
                    <div className="text-xs text-gray-500">To: You</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500 mb-2">{formatTime(selectedEmail.time)}</div>
                <button
                  onClick={() => setShowHeaders(true)}
                  className="text-xs flex items-center gap-1 text-[#60a5fa] hover:text-white transition-colors"
                  title="View Message Headers"
                >
                  <FileText size={12} /> Headers
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 whitespace-pre-wrap leading-relaxed text-gray-300 font-serif text-base">
              {renderBody(selectedEmail.body)}
            </div>

            {selectedEmail.type === 'malware' && (
              <div className="mt-8 p-4 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-between group/attach">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-900/30 rounded text-red-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-200">attachment_01.exe</div>
                    <div className="text-xs text-gray-500">2.4 MB - Executable Binary</div>
                  </div>
                </div>
                <button
                  onClick={() => triggerMalwareAttack()}
                  className="px-4 py-2 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded transition-all active:scale-95"
                >
                  Download & Run
                </button>
              </div>
            )}



            <div className="mt-12 pt-4 border-t border-white/10 flex space-x-2">
              <button className="px-4 py-2 border border-[#444] rounded hover:bg-[#2d2d2d] text-xs font-semibold flex items-center text-gray-300 transition-colors">
                <Send size={12} className="mr-2" /> Reply
              </button>
              <button className="px-4 py-2 border border-[#444] rounded hover:bg-[#2d2d2d] text-xs font-semibold text-gray-300 transition-colors">Forward</button>
            </div>

            {/* Headers Modal Overlay */}
            {showHeaders && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
                <div className="bg-[#1f1f1f] border border-white/10 shadow-2xl w-full h-full max-h-[500px] max-w-3xl flex flex-col rounded">
                  <div className="flex justify-between items-center p-3 border-b border-white/10 bg-[#252525]">
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <FileText size={14} className="text-[#60a5fa]" /> Message Headers
                    </h3>
                    <button
                      onClick={() => setShowHeaders(false)}
                      className="hover:bg-red-600 hover:text-white p-1 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 bg-[#111]">
                    <pre className="text-xs font-mono text-green-500 whitespace-pre-wrap break-all select-text selection:bg-green-900 selection:text-white">
                      {selectedEmail.headers}
                    </pre>
                  </div>
                  <div className="p-2 border-t border-white/10 bg-[#252525] flex justify-end">
                    <button
                      onClick={() => setShowHeaders(false)}
                      className="px-4 py-1.5 bg-[#333] hover:bg-[#444] text-xs text-white rounded transition-colors border border-[#444]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-[#121212] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Inbox size={48} className="mx-auto mb-2 opacity-50" />
              <p>Select an item to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorpMail;