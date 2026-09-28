import React, { useState, useEffect, Suspense, useRef } from 'react';
import { MessageSquare, X, Send, ChevronDown, ChevronUp, UserCircle, Move, RotateCcw } from 'lucide-react';
import { UserRole } from '../../types';
import { Canvas } from '@react-three/fiber';
import { Bounds } from '@react-three/drei';
import { VRMAvatar } from './VRMAvatar';

interface AssistantWidgetProps {
  userRole: UserRole;
  userId?: string;
  onNavigate: (tab: string) => void;
}

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({ userRole, userId, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [tempAppearance, setTempAppearance] = useState<'boy' | 'girl' | null>(null);
  
  // Use a shared localStorage key for persistence across both views
  const getSavedAppearance = () => {
    const key = userId ? `avatarAppearance_${userId}` : 'avatarAppearance';
    return (localStorage.getItem(key) as 'boy' | 'girl') || 'boy';
  };
  const [appearance, setAppearance] = useState<'boy' | 'girl'>(getSavedAppearance());

  const [messages, setMessages] = useState<{sender: 'assistant'|'user', text: string}[]>([
    { sender: 'assistant', text: `Hi! I'm your SchoolDesk Assistant. How can I help you today?` }
  ]);
  
  useEffect(() => {
    setMessages([{ sender: 'assistant', text: `Hi! I'm your SchoolDesk Guide. How can I help you today?` }]);
    setIsOpen(false);
  }, [userRole, userId]);

  // Sync appearance whenever local storage changes externally (like from campus settings)
  // Or just rely on local state updates if we want
  useEffect(() => {
    const handleStorage = () => setAppearance(getSavedAppearance());
    window.addEventListener('storage', handleStorage);
    // Custom event for same-window updates without refresh
    window.addEventListener('avatarAppearanceChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('avatarAppearanceChanged', handleStorage);
    };
  }, []);
  
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Scripted navigation
    let response = "I don't have an AI backend connected right now, but I can guide you! ";
    const lower = userMsg.toLowerCase();

    if (userRole === 'STUDENT') {
      if (lower.includes('attendance')) {
        response = "Opening your attendance records...";
        onNavigate('student_services');
      } else if (lower.includes('result') || lower.includes('grade')) {
        response = "Here are your latest results.";
        onNavigate('student_services');
      }
    } else if (userRole === 'TEACHER') {
      if (lower.includes('class') || lower.includes('student')) {
        response = "Opening your assigned classes.";
        onNavigate('student_services');
      } else if (lower.includes('attendance')) {
        response = "You can mark attendance in the student services section.";
        onNavigate('student_services');
      }
    } else if (userRole === 'ACCOUNTANT') {
      if (lower.includes('fee') || lower.includes('payment')) {
        response = "Opening outstanding fees.";
        onNavigate('fees');
      }
    } else {
      if (lower.includes('fee')) {
        response = "Going to fees management.";
        onNavigate('fees');
      } else if (lower.includes('attendance')) {
        response = "Going to attendance records.";
        onNavigate('attendance');
      }
    }
    setMessages(prev => [...prev, { sender: 'assistant', text: response }]);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging.current) return;
    setIsOpen(!isOpen);
    if (!isOpen) setIsMinimized(false);
  };

  const applyAppearance = () => {
    if (tempAppearance) {
      setAppearance(tempAppearance);
      const key = userId ? `avatarAppearance_${userId}` : 'avatarAppearance';
      localStorage.setItem(key, tempAppearance);
      window.dispatchEvent(new Event('avatarAppearanceChanged'));
    }
    setShowPicker(false);
  };

  // --- Drag and Positioning Logic ---
  const defaultPos = { x: 280, y: 24 }; // 280px clears the 256px sidebar
  const getSavedPosition = (): { x: number, y: number } => {
    const key = userId ? `assistantPos_${userId}` : 'assistantPos';
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultPos;
  };
  const [pos, setPos] = useState(getSavedPosition());
  const posRef = useRef(pos);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0 });
  const [isKeyboardMoving, setIsKeyboardMoving] = useState(false);

  useEffect(() => { posRef.current = pos; }, [pos]);

  useEffect(() => {
    const key = userId ? `assistantPos_${userId}` : 'assistantPos';
    localStorage.setItem(key, JSON.stringify(pos));
  }, [pos, userId]);

  useEffect(() => {
    const checkClipping = () => {
      setPos(prev => {
         const widgetWidth = isOpen ? (window.innerWidth < 640 ? 320 : 480) : 180;
         const widgetHeight = isOpen ? (isMinimized ? 200 : 500) : 200;
         let newX = Math.max(0, Math.min(prev.x, window.innerWidth - widgetWidth));
         let newY = Math.max(0, Math.min(prev.y, window.innerHeight - widgetHeight));
         if (newX !== prev.x || newY !== prev.y) return { x: newX, y: newY };
         return prev;
      });
    };
    checkClipping();
    window.addEventListener('resize', checkClipping);
    window.addEventListener('orientationchange', checkClipping);
    return () => {
      window.removeEventListener('resize', checkClipping);
      window.removeEventListener('orientationchange', checkClipping);
    };
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isKeyboardMoving) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 20 : 5;
      if (e.key === 'ArrowUp') setPos(p => ({ ...p, y: p.y + step }));
      if (e.key === 'ArrowDown') setPos(p => ({ ...p, y: Math.max(0, p.y - step) }));
      if (e.key === 'ArrowLeft') setPos(p => ({ ...p, x: Math.max(0, p.x - step) }));
      if (e.key === 'ArrowRight') setPos(p => ({ ...p, x: p.x + step }));
      if (e.key === 'Enter' || e.key === 'Escape') setIsKeyboardMoving(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKeyboardMoving]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, .chat-message-area, .no-drag')) return;

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: posRef.current.x,
      startPosY: posRef.current.y
    };

    const handlePointerMove = (eMove: PointerEvent) => {
      eMove.stopPropagation();
      const dx = eMove.clientX - dragStart.current.x;
      const dy = eMove.clientY - dragStart.current.y;
      
      if (!isDragging.current && Math.sqrt(dx*dx + dy*dy) > 5) {
        isDragging.current = true;
      }

      if (isDragging.current) {
        let newX = dragStart.current.startPosX + dx;
        let newY = dragStart.current.startPosY - dy;
        const widgetWidth = isOpen ? (window.innerWidth < 640 ? 320 : 480) : 180;
        const widgetHeight = isOpen ? (isMinimized ? 200 : 500) : 200;
        
        newX = Math.max(0, Math.min(newX, window.innerWidth - widgetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - widgetHeight));
        setPos({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setTimeout(() => { isDragging.current = false; }, 50);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };


  return (
    <div 
      className={`fixed z-[60] flex items-end pointer-events-auto gap-2 sm:gap-4 ${isOpen ? 'flex-row' : 'flex-row'}`}
      style={{ left: pos.x, bottom: pos.y, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    >
      {isKeyboardMoving && (
        <div className="absolute -top-10 left-0 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap animate-pulse shadow-lg font-semibold">
          Use Arrow Keys to Move (Enter to Finish)
        </div>
      )}

      {/* 3D Character Viewport */}
      <div className={`transition-all duration-300 relative cursor-grab active:cursor-grabbing shrink-0 ${!isOpen ? 'w-[140px] h-[180px]' : 'w-[90px] h-[120px] sm:w-[140px] sm:h-[180px]'}`} onClick={toggleOpen}>
        <Canvas camera={{ position: [0, 1, 2], fov: 40 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[0, 2, 3]} intensity={1.5} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.2}>
              <VRMAvatar 
                url={`/models/avatars/${appearance}.vrm`} 
                isAssistant={true} 
              />
            </Bounds>
          </Suspense>
        </Canvas>
      </div>
      
      {/* Action Buttons OR Chat Panel */}
      {!isOpen ? (
         <div className="flex flex-col gap-2 pb-2 no-drag relative shrink-0">
           <button 
             onClick={toggleOpen}
             className="bg-white rounded-full p-3 shadow-lg border border-slate-200 text-indigo-600 hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
             title="Chat with Guide"
           >
             <MessageSquare className="w-5 h-5" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
             className="bg-white rounded-full p-2 shadow-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
             title="Change Character"
           >
             <UserCircle className="w-4 h-4" />
           </button>

           {/* Compact Avatar Picker Popover */}
           {showPicker && (
              <div className="absolute left-full ml-4 bottom-0 bg-white p-4 rounded-xl shadow-xl border border-slate-200 w-64 cursor-default z-10 no-drag pointer-events-auto">
                <h4 className="font-bold text-sm text-slate-800 mb-3">Change Character</h4>
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setTempAppearance('boy'); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${(tempAppearance || appearance) === 'boy' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    Boy
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setTempAppearance('girl'); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${(tempAppearance || appearance) === 'girl' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    Girl
                  </button>
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowPicker(false); setTempAppearance(null); }}
                    className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); applyAppearance(); }}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
           )}
         </div>
      ) : (
        <div className={`w-[calc(100vw-120px)] sm:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border border-slate-200 pointer-events-auto shrink-0 ${isMinimized ? 'h-14' : 'h-[500px] max-h-[75vh]'}`}>
          {/* Header */}
          <div className="bg-indigo-600 text-white p-3 flex items-center justify-between shadow-md cursor-grab active:cursor-grabbing z-10" 
               onClick={(e) => { if (!isDragging.current) setIsMinimized(!isMinimized); }}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 opacity-80" />
              <div>
                <h3 className="font-bold text-sm leading-tight">SchoolDesk Guide</h3>
                {!isMinimized && <p className="text-[10px] opacity-75">Guided help</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 no-drag">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsKeyboardMoving(!isKeyboardMoving); }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Move Keyboard"
              >
                <Move className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setPos(defaultPos); }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Reset Position"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer ml-1"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50 chat-message-area cursor-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white self-end rounded-tr-sm shadow-md' : 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-sm shadow-sm'}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              
              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100 no-drag">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full p-1 shadow-inner focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                  <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your question..." 
                    className="flex-1 bg-transparent px-3 text-sm focus:outline-none placeholder:text-slate-400 cursor-text"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
