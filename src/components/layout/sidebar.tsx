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
  LogOut 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  
  // استخراج زبان فعلی از آدرس
  const currentLocale = pathname.split('/')[1] || 'fa'; 

  const navItems = [
    { name: t('dashboard'), href: `/${currentLocale}/dashboard`, icon: LayoutDashboard },
    { name: t('inbox'), href: `/${currentLocale}/dashboard/chat`, icon: MessageSquare },
    { name: t('contacts'), href: `/${currentLocale}/dashboard/contacts`, icon: Users },
    { name: t('bulk'), href: `/${currentLocale}/dashboard/bulk`, icon: Megaphone },
    { name: t('settings'), href: `/${currentLocale}/dashboard/settings`, icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-20 bg-slate-950 border-e border-slate-800 text-white items-center py-6 shadow-xl z-50">
      {/* Logo */}
      <div className="mb-8">
        <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/40">
          TI
        </div>
      </div>

      {/* Navigation */}
      {/* تغییر: اضافه کردن flex flex-col items-center برای وسط‌چین کردن دکمه‌ها */}
      <div className="flex-1 w-full px-3 space-y-3 flex flex-col items-center">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {/* اصلاح مهم: استفاده از asChild برای جلوگیری از nesting دکمه داخل لینک */}
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className={cn(
                      "w-12 h-12 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-700" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-6 w-6" />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={currentLocale === 'fa' ? 'left' : 'right'} className="bg-slate-800 text-white border-slate-700">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Logout */}
      <div className="mt-auto pb-4 px-3 space-y-4 flex flex-col items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-400 hover:bg-slate-900/50 w-10 h-10 rounded-xl"
                onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = `/${currentLocale}/login`;
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={currentLocale === 'fa' ? 'left' : 'right'} className="bg-red-900 text-white border-red-800">
              {t('logout')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="pt-4 border-t border-slate-800 w-full flex justify-center">
           <Avatar className="h-10 w-10 border-2 border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
             <AvatarImage src="https://github.com/shadcn.png" />
             <AvatarFallback>AD</AvatarFallback>
           </Avatar>
        </div>
      </div>
    </div>
  );
}