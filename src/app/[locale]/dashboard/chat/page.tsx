"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { io } from "socket.io-client";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Paperclip, MoreVertical, Phone, Video, Loader2, Users, MessageSquare } from "lucide-react"; // Users اضافه شد
import { cn } from "@/lib/utils";

// تعریف تایپ‌ها
interface Message {
  id: number;
  text: string;
  isFromMe: boolean;
  createdAt: string;
  type: 'text' | 'image' | 'document';
}

interface Conversation {
  id: number;
  contact: { phone: string; pushName?: string; profilePicUrl?: string };
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[]; // آخرین پیام برای نمایش در لیست
}

export default function ChatPage() {
  const t = useTranslations('Sidebar');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // اتصال سوکت
  const socketRef = useRef<any>(null);

  // 🛠️ توابع کمکی برای تشخیص نام و گروه (مشابه صفحه مخاطبین)
  const isGroup = (phone: string) => {
    return phone.includes('-') || phone.length > 15; // معمولا گروه‌ها id طولانی یا '-' دارند
  };

  const getDisplayName = (contact: { phone: string, pushName?: string }) => {
    if (contact.pushName) return contact.pushName;
    if (isGroup(contact.phone)) return "گروه واتساپ"; // یا شناسه گروه
    return contact.phone; // اگر اسم نداشت، شماره را برگردان
  };

  // ۱. دریافت لیست مکالمات در شروع
  useEffect(() => {
    fetchConversations();

    // اتصال به سوکت
    socketRef.current = io("http://localhost:3000");
    
    // دریافت پیام جدید به صورت زنده
    socketRef.current.on("message:new", (data: any) => {
      handleNewMessage(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // ۲. اسکرول به پایین وقتی پیام جدید می‌آید
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ۳. وقتی چت انتخاب می‌شود، پیام‌هایش را بگیر
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
      // صفر کردن پیام‌های خوانده نشده در لیست (UI)
      setConversations(prev => prev.map(c => 
        c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [selectedChatId]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/whatsapp/conversations");
      setConversations(res.data);
    } catch (error) {
      console.error("Error fetching chats", error);
    }
  };

  const fetchMessages = async (chatId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/whatsapp/messages/${chatId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;

    const chat = conversations.find(c => c.id === selectedChatId);
    if (!chat) return;

    // افزودن پیام به صورت موقت به UI
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
    } catch (error) {
      console.error("Send failed", error);
    }
  };

  const handleNewMessage = (data: any) => {
    const { conversationId, message } = data;

    if (selectedChatId === conversationId) {
      setMessages(prev => [...prev, message]);
    }

    setConversations(prev => {
      const chatIndex = prev.findIndex(c => c.id === conversationId);
      if (chatIndex === -1) {
        fetchConversations();
        return prev;
      }

      const updatedChat = { ...prev[chatIndex] };
      updatedChat.messages = [message];
      updatedChat.lastMessageAt = new Date().toISOString();
      
      if (selectedChatId !== conversationId) {
        updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
      }

      const newChats = [...prev];
      newChats.splice(chatIndex, 1);
      return [updatedChat, ...newChats];
    });
  };

  const selectedChatInfo = conversations.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      
      {/* سایدبار لیست چت‌ها */}
      <div className="w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="جستجو در چت‌ها..." className="pr-9 bg-white dark:bg-slate-950" />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations.map((chat) => {
              const isChatGroup = isGroup(chat.contact.phone);
              const displayName = getDisplayName(chat.contact);

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right border-b border-slate-100 dark:border-slate-800/50 last:border-0",
                    selectedChatId === chat.id && "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  )}
                >
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                    <AvatarImage src={chat.contact.profilePicUrl} />
                    <AvatarFallback className={cn(
                        "text-white",
                        isChatGroup ? "bg-orange-500" : "bg-gradient-to-br from-blue-500 to-purple-500"
                    )}>
                      {isChatGroup ? <Users className="h-6 w-6" /> : (displayName[0] || "U")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm" title={displayName}>
                        {displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(chat.lastMessageAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">
                        {chat.messages?.[0]?.text || "بدون پیام"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm shadow-blue-300">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* پنجره اصلی چت */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative">
        {selectedChatId && selectedChatInfo ? (
          <>
            {/* هدر چت */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar>
                   <AvatarImage src={selectedChatInfo.contact.profilePicUrl} />
                   <AvatarFallback className={cn(
                        "text-white",
                        isGroup(selectedChatInfo.contact.phone) ? "bg-orange-500" : "bg-blue-600"
                    )}>
                     {isGroup(selectedChatInfo.contact.phone) ? <Users className="h-4 w-4" /> : getDisplayName(selectedChatInfo.contact)[0]}
                   </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {getDisplayName(selectedChatInfo.contact)}
                  </h3>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    {isGroup(selectedChatInfo.contact.phone) 
                        ? (selectedChatInfo.contact.pushName ? "گروه" : "گروه (نامشخص)") 
                        : selectedChatInfo.contact.phone}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon"><Phone className="h-5 w-5 text-slate-500" /></Button>
                 <Button variant="ghost" size="icon"><Video className="h-5 w-5 text-slate-500" /></Button>
                 <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5 text-slate-500" /></Button>
              </div>
            </div>

            {/* لیست پیام‌ها */}
            <ScrollArea className="flex-1 p-4 bg-[url('/whatsapp-bg.png')] bg-repeat bg-opacity-5">
               <div className="flex flex-col gap-4 max-w-4xl mx-auto py-4">
                 {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                 ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-20 bg-slate-100/50 rounded-xl mx-10 border border-dashed border-slate-300">
                      هنوز پیامی وجود ندارد. شروع به صحبت کنید! 👋
                    </div>
                 ) : (
                   messages.map((msg) => (
                     <div
                       key={msg.id}
                       className={cn(
                         "flex w-max max-w-[70%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm",
                         msg.isFromMe
                           ? "ml-auto bg-blue-600 text-white rounded-br-none"
                           : "mr-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700"
                       )}
                     >
                       {msg.text}
                       <span className={cn(
                         "text-[10px] self-end opacity-70",
                         msg.isFromMe ? "text-blue-100" : "text-slate-400"
                       )}>
                         {new Date(msg.createdAt).toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                   ))
                 )}
                 <div ref={scrollRef} />
               </div>
            </ScrollArea>

            {/* اینپوت ارسال پیام */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="پیام خود را بنویسید..." 
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500"
                />
                <Button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className={cn("h-5 w-5", !inputText.trim() ? "opacity-50" : "")} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* حالت انتخاب نشده */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
             <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                <MessageSquare className="h-16 w-16 text-blue-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">به صندوق پیام تیم خوش آمدید</h3>
             <p className="max-w-md mx-auto text-slate-500">
               برای شروع گفتگو، یکی از چت‌های سمت راست را انتخاب کنید یا منتظر پیام جدید بمانید.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}