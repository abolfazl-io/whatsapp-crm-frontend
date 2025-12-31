"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { api } from "@/lib/api"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Search, Paperclip, MoreVertical, Phone, Video, 
  Loader2, Users, MessageSquare, ArrowRight, Plus, X,
  Image as ImageIcon, FileText, Download 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- تایپ‌ها ---
interface Message {
  id: number;
  text: string;
  isFromMe: boolean;
  createdAt: string;
  type: 'text' | 'image' | 'document';
  mediaUrl?: string;
}

interface Contact {
  id: number;
  phone: string;
  pushName?: string;
  profilePicUrl?: string;
}

interface Conversation {
  id: number;
  contact: Contact;
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[];
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // --- توابع کمکی ---
  const isGroup = (phone: string) => phone.includes('-') || phone.length > 15;

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "ناشناس";
    if (isGroup(phone)) return "گروه";
    if (phone.startsWith('98') && phone.length >= 10) return '0' + phone.substring(2);
    if (phone.startsWith('+98')) return '0' + phone.substring(3);
    return phone;
  };

  const getDisplayName = (contact?: Contact) => {
    if (!contact) return "کاربر ناشناس";
    if (contact.pushName) return contact.pushName;
    if (isGroup(contact.phone)) return "گروه واتساپ";
    return formatPhoneNumber(contact.phone);
  };

  // --- هوک‌ها ---
  useEffect(() => {
    fetchConversations();
    
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    socketRef.current = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
    });

    socketRef.current.on("message:new", (data: any) => handleNewMessage(data));

    return () => { 
        if (socketRef.current) socketRef.current.disconnect(); 
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, selectedChatId]);

  useEffect(() => {
    if (selectedChatId) {
      if (selectedChatId < 0) {
        setMessages([]);
      } else {
        fetchMessages(selectedChatId);
        setConversations(prev => prev.map(c => 
          c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
        ));
      }
    }
  }, [selectedChatId]);

  // --- درخواست‌ها ---
  const fetchConversations = async () => {
    try {
      const res = await api.get("/whatsapp/conversations");
      setConversations(res.data);
    } catch (error) {
      console.error("❌ خطا در دریافت لیست چت:", error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/whatsapp/messages/${conversationId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("❌ خطا در دریافت پیام‌ها:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // --- لاجیک چت ---
  const startNewChat = () => {
    if (!newChatPhone) return;
    let searchPhone = newChatPhone.replace(/\D/g, '');
    if (searchPhone.startsWith('09')) searchPhone = '98' + searchPhone.substring(1);

    const existingChat = conversations.find(c => c.contact.phone === searchPhone);
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      const tempId = -Date.now();
      const newChat: Conversation = {
        id: tempId,
        contact: { id: tempId, phone: searchPhone, pushName: 'مخاطب جدید' },
        unreadCount: 0,
        lastMessageAt: new Date().toISOString(),
        messages: []
      };
      setConversations([newChat, ...conversations]);
      setSelectedChatId(tempId);
    }
    setIsNewChatOpen(false);
    setNewChatPhone("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;

    const chat = conversations.find(c => c.id === selectedChatId);
    if (!chat) return;

    const optimisticMsg: Message = {
      id: Date.now(),
      text: inputText,
      isFromMe: true,
      createdAt: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText("");

    try {
      await api.post("/whatsapp/send/text", {
        phone: chat.contact.phone,
        message: optimisticMsg.text
      });
      setTimeout(() => fetchConversations(), 1000);
    } catch (error) {
      alert("خطا در ارسال پیام.");
    }
  };

  const handleNewMessage = (data: any) => {
    const { conversationId, message } = data;
    if (selectedChatId === conversationId) setMessages(prev => [...prev, message]);
    
    setConversations(prev => {
      const chatIndex = prev.findIndex(c => c.id === conversationId);
      if (chatIndex === -1) { fetchConversations(); return prev; }

      const updatedChat = { ...prev[chatIndex] };
      updatedChat.messages = [message];
      updatedChat.lastMessageAt = new Date().toISOString();
      if (selectedChatId !== conversationId) updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
      
      const newChats = [...prev];
      newChats.splice(chatIndex, 1);
      return [updatedChat, ...newChats];
    });
  };

  // --- رندر محتوای پیام (تکست، عکس، فایل) ---
  const renderMessageContent = (msg: Message) => {
    // ۱. اگر عکس باشد
    if (msg.type === 'image') {
      return (
        <div className="flex flex-col gap-2 max-w-[260px]"> {/* 👈 محدود کردن عرض عکس */}
           {/* اگر لینک مدیا داشته باشیم نمایش می‌دهیم، وگرنه پلیس‌هولدر */}
           {msg.mediaUrl ? (
             <img src={msg.mediaUrl} alt="تصویر" className="rounded-md w-full h-auto object-cover" />
           ) : (
             <div className="bg-slate-200 dark:bg-slate-800 h-40 w-full rounded-md flex flex-col items-center justify-center text-slate-500 gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700">
                <ImageIcon className="h-8 w-8 opacity-50" />
                <span className="text-[10px] opacity-70">تصویر (بدون پیش‌نمایش)</span>
             </div>
           )}
           {/* نمایش متن کپشن (اگر [Image] نباشد) */}
           {msg.text && msg.text !== '[Image]' && (
             <p className="text-sm leading-relaxed px-1">{msg.text}</p>
           )}
        </div>
      );
    }

    // ۲. اگر فایل باشد
    if (msg.type === 'document') {
      return (
        <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/10 p-3 rounded-md">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full shrink-0">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate dir-ltr">{msg.text.replace('[Document]', 'فایل ضمیمه')}</p>
                    <span className="text-[10px] opacity-70">سند / فایل</span>
                </div>
                {msg.mediaUrl && (
                    <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <Download className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
      );
    }

    // ۳. پیش‌فرض (متن)
    return <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.text}</p>;
  };

  const selectedChatInfo = conversations.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-7rem)] w-full overflow-hidden bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-2">
      
      {/* سایدبار لیست چت 
          - کلاس‌ها اصلاح شدند تا در دسکتاپ (md) همیشه نمایش داده شود 
          - در موبایل اگر چتی باز باشد مخفی می‌شود
      */}
      <div className={cn(
          "flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full md:w-80 transition-all duration-300 h-full",
          selectedChatId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="جستجو..." className="pr-9 bg-white dark:bg-slate-950" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsNewChatOpen(true)} className="bg-white dark:bg-slate-950">
            <Plus className="h-4 w-4 text-blue-600" />
          </Button>
        </div>

        {isNewChatOpen && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-700">شماره موبایل:</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsNewChatOpen(false)}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Input 
                        value={newChatPhone}
                        onChange={(e) => setNewChatPhone(e.target.value)}
                        placeholder="0912..." 
                        className="bg-white h-8 text-sm dir-ltr"
                        autoFocus
                    />
                    <Button size="sm" onClick={startNewChat} className="h-8 bg-blue-600 text-white">شروع</Button>
                </div>
            </div>
        )}
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
             {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right border-b border-slate-100 dark:border-slate-800/50 last:border-0 w-full",
                    selectedChatId === chat.id && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={chat.contact.profilePicUrl} />
                    <AvatarFallback className="bg-blue-500 text-white">{getDisplayName(chat.contact)[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm truncate">{getDisplayName(chat.contact)}</span>
                      <span className="text-[10px] text-slate-400">{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-[140px] dir-rtl text-right">
                          {chat.messages?.[0]?.type === 'image' ? '📷 تصویر' : chat.messages?.[0]?.text || "..."}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{chat.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </button>
            ))}
        </div>
      </div>

      {/* پنجره چت */}
      <div className={cn(
          "flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative h-full transition-all duration-300",
          !selectedChatId ? "hidden md:flex" : "flex"
      )}>
        {selectedChatId && selectedChatInfo ? (
          <>
            <div className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                {/* 👇 دکمه بازگشت (در دسکتاپ هم می‌تواند برای بستن چت استفاده شود) */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden text-slate-500 hover:bg-slate-100" // در موبایل دیده می‌شود
                    onClick={() => setSelectedChatId(null)}
                >
                    <ArrowRight className="h-5 w-5" />
                </Button>

                <Avatar>
                   <AvatarImage src={selectedChatInfo.contact.profilePicUrl} />
                   <AvatarFallback className="bg-blue-600 text-white">{getDisplayName(selectedChatInfo.contact)[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm">{getDisplayName(selectedChatInfo.contact)}</h3>
                  <p className="text-[10px] text-green-600 font-mono">{formatPhoneNumber(selectedChatInfo.contact.phone)}</p>
                </div>
              </div>
              
              {/* دکمه بستن چت در دسکتاپ (اختیاری) */}
              <Button variant="ghost" size="icon" className="hidden md:flex text-slate-400" onClick={() => setSelectedChatId(null)}>
                  <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[url('/whatsapp-bg.png')] bg-repeat bg-opacity-5 space-y-4 custom-scrollbar">
                 {loadingMessages ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                 ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                      <MessageSquare className="h-12 w-12 mb-2" />
                      <p>هنوز پیامی نیست.</p>
                    </div>
                 ) : (
                   messages.map((msg) => (
                     <div key={msg.id} className={cn(
                         "flex w-max max-w-[85%] md:max-w-[70%] flex-col gap-1 rounded-lg px-3 py-2 shadow-sm border",
                         msg.isFromMe 
                            ? "ml-auto bg-blue-600 text-white rounded-br-none border-blue-600" 
                            : "mr-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border-slate-200 dark:border-slate-700"
                       )}>
                       
                       {/* 👇 استفاده از تابع رندر محتوا (اصلاح شده) */}
                       {renderMessageContent(msg)}

                       <span className={cn("text-[10px] self-end opacity-70", msg.isFromMe ? "text-blue-100" : "text-slate-400")}>
                         {new Date(msg.createdAt).toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                   ))
                 )}
                 <div ref={scrollRef} className="h-1" />
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-slate-400"><Paperclip className="h-5 w-5" /></Button>
                <Input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="پیام..." className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 focus-visible:ring-0" />
                <Button type="submit" disabled={!inputText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 w-10 p-0 shadow-sm">
                  <Send className={cn("h-4 w-4 rotate-180", !inputText.trim() ? "opacity-50" : "")} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4"><MessageSquare className="h-10 w-10 text-slate-300" /></div>
             <p>یک گفتگو را انتخاب کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
}