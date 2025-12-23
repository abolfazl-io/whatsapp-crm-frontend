"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  LayoutDashboard, 
  Settings, 
  Megaphone, 
  LogOut,
  Send,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  LinkIcon,
  Webhook,
  Bot,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa'; 

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{name?: string, email?: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("خطا در خواندن اطلاعات کاربر", e);
        }
    }
  }, []);

  const navItems = [
    { name: t('dashboard'), href: `/${currentLocale}/dashboard`, icon: LayoutDashboard },
    { name: "ارسال پیام فوری", href: `/${currentLocale}/dashboard/send`, icon: Send },
    { name: "ارسال تصویر", href: `/${currentLocale}/dashboard/send-image`, icon: ImageIcon }, 
    { name: "ارسال فایل (لینک)", href: `/${currentLocale}/dashboard/send-file`, icon: LinkIcon },
    { name: t('inbox'), href: `/${currentLocale}/dashboard/chat`, icon: MessageSquare },
    { name: t('contacts'), href: `/${currentLocale}/dashboard/contacts`, icon: Users },
    { name: t('bulk'), href: `/${currentLocale}/dashboard/bulk`, icon: Megaphone },
    { name: "تنظیم وب‌هوک", href: `/${currentLocale}/dashboard/webhook`, icon: Webhook },
    { name: "پاسخ خودکار", href: `/${currentLocale}/dashboard/keywords`, icon: Bot }, 
    { name: t('settings'), href: `/${currentLocale}/dashboard/settings`, icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = `/${currentLocale}/login`;
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-slate-950 border-e border-slate-800 text-white py-6 shadow-xl z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      
      {/* دکمه باز و بسته کردن (اصلاح شده برای RTL) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute top-9 z-50 h-6 w-6 rounded-full bg-blue-600 p-0 text-white shadow-md hover:bg-blue-700 border border-slate-900",
          // 👇 تغییر مهم: در حالت فارسی (RTL) دکمه باید سمت چپ باشد
          currentLocale === 'fa' ? "-left-3" : "-right-3"
        )}
      >
        {/* جهت فلش‌ها را متناسب با وضعیت تنظیم می‌کنیم */}
        {isCollapsed ? (
             currentLocale === 'fa' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        ) : (
             currentLocale === 'fa' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* لوگو */}
      <div className={cn("mb-8 flex items-center gap-3 px-4 transition-all overflow-hidden", isCollapsed ? "justify-center" : "")}>
        <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/40 shrink-0">
          TI
        </div>
        {!isCollapsed && (
          <h1 className="font-bold text-xl tracking-tight text-slate-100 animate-in fade-in duration-300 whitespace-nowrap">
            TeamInbox
          </h1>
        )}
      </div>

      {/* منوها */}
      <div className="flex-1 w-full px-3 space-y-2 flex flex-col">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full h-11 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-700" 
                        : "text-slate-400 hover:text-white hover:bg-slate-900",
                      isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="left" className="bg-slate-800 text-white border-slate-700 mr-2">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* پروفایل */}
      <div className="mt-auto pt-4 px-3 border-t border-slate-800">
        <div className={cn(
            "flex items-center rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 transition-colors",
            isCollapsed ? "justify-center p-2 flex-col gap-2" : "gap-3 p-3"
        )}>
           <Avatar className="h-10 w-10 border border-slate-700 shrink-0">
             <AvatarImage src="https://github.com/shadcn.png" />
             <AvatarFallback className="bg-slate-800 text-slate-200">
                {user?.name?.[0] || 'U'}
             </AvatarFallback>
           </Avatar>
           
           {!isCollapsed && (
             <div className="flex-1 overflow-hidden min-w-0 text-right animate-in fade-in duration-300">
                <p className="text-sm font-medium truncate text-slate-200">
                  {user?.name || 'کاربر مهمان'}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-mono dir-ltr text-left">
                  {user?.email || 'user@example.com'}
                </p>
             </div>
           )}

           <Button 
             variant="ghost" 
             size="icon" 
             onClick={handleLogout}
             title={t('logout')}
             className={cn(
               "shrink-0 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg",
               isCollapsed ? "h-8 w-8 mt-1" : "h-8 w-8"
             )}
           >
             <LogOut className="h-4 w-4" />
           </Button>
        </div>
      </div>
    </div>
  );
}