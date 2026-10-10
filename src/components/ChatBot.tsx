import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import {
  ChatMessage,
  processMessage,
  generateId,
  getInitialBotMessage,
  saveChatHistory,
  loadChatHistory,
  shouldEscalateToHuman,
  getEscalationMessage,
  getReclameAquiMessage
} from '../services/chatbot';

interface ChatBotProps {
  onEscalate?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onEscalate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load chat history and add initial message if empty
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length === 0) {
      const initialMessage = getInitialBotMessage();
      setMessages([initialMessage]);
      saveChatHistory([initialMessage]);
    } else {
      setMessages(history);
    }
  }, []);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check if conversation should be escalated
  useEffect(() => {
    if (messages.length > 0 && shouldEscalateToHuman(messages) && !showEscalation) {
      setShowEscalation(true);
      
      // Add escalation message
      const escalationMessage = getEscalationMessage();
      const updatedMessages = [...messages, escalationMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
      
      // Call escalation callback if provided
      if (onEscalate) {
        onEscalate();
      }
    }
  }, [messages, showEscalation, onEscalate]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      text: inputValue,
      sender: 'user',
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInputValue('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Process message and respond with delay for natural feel
    setTimeout(() => {
      const botResponse = processMessage(userMessage.text);
      const newMessages = [...updatedMessages, botResponse];
      setMessages(newMessages);
      saveChatHistory(newMessages);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };
  
  const handleReclameAquiClick = () => {
    // Add bot message about Reclame Aqui
    const reclameAquiMessage = getReclameAquiMessage();
    const updatedMessages = [...messages, reclameAquiMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col bg-indigo-950 border border-purple-800 rounded-lg overflow-hidden h-[500px]">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-3 flex justify-between items-center">
        <h3 className="text-white font-semibold">Assistente Virtual</h3>
        <div className="flex space-x-2">
          <a
            href="https://wa.me/5511970603441"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md transition-colors"
          >
            WhatsApp
          </a>
          <button
            onClick={handleReclameAquiClick}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded-md transition-colors"
          >
            Reclame Aqui
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-indigo-950/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-purple-700 text-white'
                  : 'bg-indigo-900 text-purple-200'
              }`}
            >
              <div className="text-sm">{message.text}</div>
              <div className="text-xs mt-1 opacity-70 text-right">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* Bot typing indicator */}
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="bg-indigo-900 text-purple-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="border-t border-purple-900 p-2">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-indigo-900 border border-purple-800 text-white rounded-l-md px-3 py-2 focus:outline-none focus:border-purple-600"
          />
          <button
            type="submit"
            disabled={inputValue.trim() === '' || isTyping}
            className="bg-purple-700 hover:bg-purple-600 text-white rounded-r-md px-3 py-2 disabled:opacity-50 transition-colors"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
