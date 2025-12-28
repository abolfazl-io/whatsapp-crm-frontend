"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { api } from "@/lib/api"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Search, Paperclip, MoreVertical, Phone, Video, 
  Loader2, Users, MessageSquare, ArrowRight, Plus, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- تایپ‌ها ---
interface Message {
  id: number;
  text: string;
  isFromMe: boolean;
  createdAt: string;
  type: 'text' | 'image' | 'document';
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
  
  // استیت‌های چت جدید
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
    socketRef.current = io("http://localhost:3000"); 
    socketRef.current.on("message:new", (data: any) => handleNewMessage(data));
    return () => { socketRef.current.disconnect(); };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, selectedChatId]);

  useEffect(() => {
    if (selectedChatId) {
      // اگر آیدی چت منفی بود (یعنی چت جدید و موقت)، پیام‌ها را خالی کن
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

  // --- ایجاد چت جدید ---
  const startNewChat = () => {
    if (!newChatPhone) return;
    
    // استانداردسازی شماره برای جستجو
    let searchPhone = newChatPhone.replace(/\D/g, '');
    if (searchPhone.startsWith('09')) searchPhone = '98' + searchPhone.substring(1);

    // ۱. بررسی اینکه آیا این چت قبلاً وجود دارد؟
    const existingChat = conversations.find(c => c.contact.phone === searchPhone);
    
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      // ۲. اگر وجود ندارد، یک چت موقت بساز
      const tempId = -Date.now(); // آیدی منفی برای تشخیص موقت بودن
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
        phone: chat.contact.phone, // شماره را می‌فرستیم
        message: optimisticMsg.text
      });
      
      // بعد از ارسال موفق، لیست را رفرش کن تا چت موقت تبدیل به چت واقعی (با آیدی دیتابیس) شود
      setTimeout(() => fetchConversations(), 1000);

    } catch (error) {
      console.error("❌ ارسال ناموفق:", error);
      alert("خطا در ارسال پیام. شماره را چک کنید.");
    }
  };

  const handleNewMessage = (data: any) => {
    const { conversationId, message } = data;
    if (selectedChatId === conversationId) setMessages(prev => [...prev, message]);
    
    setConversations(prev => {
      const chatIndex = prev.findIndex(c => c.id === conversationId);
      if (chatIndex === -1) {
        fetchConversations(); 
        return prev;
      }
      const updatedChat = { ...prev[chatIndex] };
      updatedChat.messages = [message];
      updatedChat.lastMessageAt = new Date().toISOString();
      if (selectedChatId !== conversationId) updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
      const newChats = [...prev];
      newChats.splice(chatIndex, 1);
      return [updatedChat, ...newChats];
    });
  };

  const selectedChatInfo = conversations.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
      
      {/* ------------------- سایدبار ------------------- */}
      <div className={cn(
          "flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 w-full md:w-80 transition-all duration-300",
          selectedChatId ? "hidden md:flex" : "flex"
      )}>
        {/* هدر: جستجو + دکمه چت جدید */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="جستجو..." className="pr-9 bg-white dark:bg-slate-950" />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsNewChatOpen(true)}
            title="گفتگوی جدید"
            className="bg-white dark:bg-slate-950"
          >
            <Plus className="h-4 w-4 text-blue-600" />
          </Button>
        </div>

        {/* مودال چت جدید (ساده داخل لیست) */}
        {isNewChatOpen && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">شماره موبایل را وارد کنید:</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsNewChatOpen(false)}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Input 
                        value={newChatPhone}
                        onChange={(e) => setNewChatPhone(e.target.value)}
                        placeholder="0912..." 
                        className="bg-white dark:bg-slate-950 h-8 text-sm dir-ltr"
                        autoFocus
                    />
                    <Button size="sm" onClick={startNewChat} className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                        شروع
                    </Button>
                </div>
            </div>
        )}
        
        {/* لیست چت‌ها */}
        <div className="flex-1 overflow-y-auto custom-scrollbar custom-scrollbar">
          {conversations.length === 0 ? (
             <div className="text-center text-slate-400 mt-10 text-sm p-4">
                 هیچ گفتگویی ندارید.<br/>
                 از دکمه <b>+</b> بالا برای شروع چت استفاده کنید.
             </div>
          ) : (
             conversations.map((chat) => {
              const displayName = getDisplayName(chat.contact);
              const isChatGroup = isGroup(chat.contact.phone);

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right border-b border-slate-100 dark:border-slate-800/50 last:border-0 w-full",
                    selectedChatId === chat.id && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={chat.contact.profilePicUrl} />
                    <AvatarFallback className={cn("text-white", isChatGroup ? "bg-orange-500" : "bg-blue-500")}>
                      {isChatGroup ? <Users className="h-5 w-5" /> : (displayName[0] || "U")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-[140px] dir-rtl text-right">
                        {chat.messages?.[0]?.text || "..."}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------- پنجره چت ------------------- */}
      <div className={cn(
          "flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative h-full",
          !selectedChatId ? "hidden md:flex" : "flex"
      )}>
        {selectedChatId && selectedChatInfo ? (
          <>
            {/* هدر چت */}
            <div className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChatId(null)}>
                    <ArrowRight className="h-5 w-5" />
                </Button>
                <Avatar>
                   <AvatarImage src={selectedChatInfo.contact.profilePicUrl} />
                   <AvatarFallback className="bg-blue-600 text-white">
                     {getDisplayName(selectedChatInfo.contact)[0]}
                   </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {getDisplayName(selectedChatInfo.contact)}
                  </h3>
                  <p className="text-[10px] text-green-600 flex items-center gap-1 font-mono">
                    {formatPhoneNumber(selectedChatInfo.contact.phone)}
                  </p>
                </div>
              </div>
            </div>

            {/* پیام‌ها */}
            <div className="flex-1 overflow-y-auto p-4 bg-[url('/whatsapp-bg.png')] bg-repeat bg-opacity-5 space-y-4 custom-scrollbar">
                 {loadingMessages ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                 ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                      <MessageSquare className="h-12 w-12 mb-2" />
                      <p>
                          {selectedChatId < 0 ? "اولین پیام را ارسال کنید تا گفتگو ایجاد شود." : "هنوز پیامی نیست."}
                      </p>
                    </div>
                 ) : (
                   messages.map((msg) => (
                     <div key={msg.id} className={cn(
                         "flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm shadow-sm",
                         msg.isFromMe ? "ml-auto bg-blue-600 text-white rounded-br-none" : "mr-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border"
                       )}>
                       <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                       <span className={cn("text-[10px] self-end opacity-70", msg.isFromMe ? "text-blue-100" : "text-slate-400")}>
                         {new Date(msg.createdAt).toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                   ))
                 )}
                 <div ref={scrollRef} className="h-1" />
            </div>

            {/* ورودی پیام */}
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
             <p>یک گفتگو را انتخاب کنید یا چت جدید بسازید.</p>
          </div>
        )}
      </div>
    </div>
  );
}