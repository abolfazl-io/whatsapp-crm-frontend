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
  ChevronDown,
  Image as ImageIcon,
  LinkIcon,
  Webhook,
  Bot,
  Activity,
  UserCog, 
  Contact,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// 1. تعریف تایپ برای کاربر و آیتم‌های منو
interface UserData {
  name?: string;
  email?: string;
  role?: string; // نقش کاربر (ADMIN یا AGENT)
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[]; // چه نقش‌هایی دسترسی دارند؟
  subItems?: NavItem[];
}

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa'; 

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  const [openMenus, setOpenMenus] = useState<string[]>(['/dashboard/crm']);

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

  const toggleMenu = (href: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev => 
      prev.includes(href) ? prev.filter(item => item !== href) : [...prev, href]
    );
  };

  // 2. تعریف منوها با سطح دسترسی (roles)
  const navItems: NavItem[] = [
    { 
      name: t('dashboard'), 
      href: `/${currentLocale}/dashboard`, 
      icon: LayoutDashboard,
      roles: ['ADMIN', 'AGENT'] // همه می‌بینند
    },
    { 
      name: "ارسال پیام فوری", 
      href: `/${currentLocale}/dashboard/send`, 
      icon: Send,
      roles: ['ADMIN', 'AGENT']
    },
    { 
      name: "ارسال تصویر", 
      href: `/${currentLocale}/dashboard/send-image`, 
      icon: ImageIcon,
      roles: ['ADMIN', 'AGENT']
    }, 
    { 
      name: "ارسال فایل (لینک)", 
      href: `/${currentLocale}/dashboard/send-file`, 
      icon: LinkIcon,
      roles: ['ADMIN', 'AGENT']
    },
    { 
      name: t('inbox'), 
      href: `/${currentLocale}/dashboard/chat`, 
      icon: MessageSquare,
      roles: ['ADMIN', 'AGENT']
    },
    { 
      name: t('contacts'), 
      href: `/${currentLocale}/dashboard/contacts`, 
      icon: Users,
      roles: ['ADMIN', 'AGENT']
    },
    { 
      name: t('bulk'), 
      href: `/${currentLocale}/dashboard/bulk`, 
      icon: Megaphone,
      roles: ['ADMIN'] // 👈 فقط ادمین ارسال انبوه انجام دهد (مثال)
    },
    { 
      name: "تنظیم وب‌هوک", 
      href: `/${currentLocale}/dashboard/webhook`, 
      icon: Webhook,
      roles: ['ADMIN'] // 👈 فقط ادمین
    },
    { 
      name: "پاسخ خودکار", 
      href: `/${currentLocale}/dashboard/keywords`, 
      icon: Bot,
      roles: ['ADMIN'] // 👈 فقط ادمین
    }, 
    
    // 👇 بخش CRM
    {
        name: "مدیریت مشتریان (CRM)",
        icon: Users,
        href: "/dashboard/crm",
        roles: ['ADMIN', 'AGENT'],
        subItems: [
          { 
            name: "داشبورد CRM", 
            href: `/${currentLocale}/dashboard/crm`, 
            icon: LayoutDashboard,
            roles: ['ADMIN', 'AGENT']
          },
          { 
            name: "بررسی وضعیت", 
            href: `/${currentLocale}/dashboard/crm/status`, 
            icon: Activity,
            roles: ['ADMIN', 'AGENT']
          },
          { 
            name: "مدیریت اپراتورها", 
            href: `/${currentLocale}/dashboard/crm/agents`, 
            icon: UserCog, 
            roles: ['ADMIN'] // ⛔️ فقط ادمین می‌بیند (علی نمی‌بیند)
          }, 
          { 
            name: "لیست مشتریان", 
            href: `/${currentLocale}/dashboard/crm/contacts`, // به صفحه لیست می‌رود
            icon: Contact, 
            roles: ['ADMIN', 'AGENT'] 
          },
          { 
            name: "پاسخ‌های آماده", 
            href: `/${currentLocale}/dashboard/crm/canned-responses`, 
            icon: Zap, 
            roles: ['ADMIN', 'AGENT'] 
          },
          
        ]
    },

    { 
      name: t('settings'), 
      href: `/${currentLocale}/dashboard/settings`, 
      icon: Settings,
      roles: ['ADMIN'] // ⛔️ فقط ادمین
    },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = `/${currentLocale}/login`;
  };

  // 3. تابع کمکی برای چک کردن دسترسی
  const hasAccess = (itemRoles?: string[]) => {
    // اگر نقشی تعریف نشده باشد، همه دسترسی دارند
    if (!itemRoles || itemRoles.length === 0) return true;
    
    // دریافت نقش کاربر (اگر نداشت، پیش‌فرض AGENT در نظر می‌گیریم تا دسترسی‌های ادمین را نبیند)
    const userRole = user?.role || 'AGENT';
    
    return itemRoles.includes(userRole);
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-slate-950 border-e border-slate-800 text-white py-6 shadow-xl z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      
      {/* دکمه باز و بسته کردن */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute top-9 z-50 h-6 w-6 rounded-full bg-blue-600 p-0 text-white shadow-md hover:bg-blue-700 border border-slate-900",
          currentLocale === 'fa' ? "-left-3" : "-right-3"
        )}
      >
        {isCollapsed ? (
             currentLocale === 'fa' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        ) : (
             currentLocale === 'fa' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* لوگو */}
      <div className={cn("mb-8 flex items-center gap-3 px-4 transition-all overflow-hidden shrink-0", isCollapsed ? "justify-center" : "")}>
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
      <div className="flex-1 w-full px-3 space-y-2 flex flex-col overflow-y-auto custom-scrollbar">
        <TooltipProvider delayDuration={0}>
          {navItems
            .filter(item => hasAccess(item.roles)) // 👈 4. فیلتر کردن منوهای اصلی
            .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            // اینجا هم زیرمنوها را فیلتر می‌کنیم
            const accessibleSubItems = item.subItems?.filter(sub => hasAccess(sub.roles)) || [];
            const hasSubItems = accessibleSubItems.length > 0;
            const isOpen = openMenus.includes(item.href);
            
            // اگر زیرمنو دارد
            if (hasSubItems) {
              return (
                <div key={item.href} className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => toggleMenu(item.href)}
                        className={cn(
                          "w-full h-11 rounded-lg transition-all duration-200 shrink-0 justify-between",
                          isActive && !isOpen 
                            ? "bg-slate-800 text-white" 
                            : "text-slate-400 hover:text-white hover:bg-slate-900",
                          isCollapsed ? "justify-center px-0" : "px-4"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                         </div>
                         {!isCollapsed && (
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                         )}
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="left" className="bg-slate-800 text-white border-slate-700 mr-2">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {/* رندر زیرمنوها */}
                  {!isCollapsed && isOpen && (
                    <div className="mr-4 pl-0 space-y-1 border-r border-slate-800 pr-2 animate-in slide-in-from-top-1 duration-200">
                      {accessibleSubItems.map((sub) => { // 👈 استفاده از لیست فیلتر شده
                          const isSubActive = pathname === sub.href;
                          return (
                            <Button
                                key={sub.href}
                                variant="ghost"
                                asChild
                                className={cn(
                                "w-full h-9 rounded-lg transition-all duration-200 justify-start gap-3 px-3 text-sm",
                                isSubActive 
                                    ? "bg-blue-600/20 text-blue-400 font-medium" 
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                                )}
                            >
                                <Link href={sub.href}>
                                    <sub.icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{sub.name}</span>
                                </Link>
                            </Button>
                          );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // آیتم معمولی
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full h-11 rounded-lg transition-all duration-200 shrink-0",
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
      <div className="mt-auto pt-4 px-3 border-t border-slate-800 shrink-0">
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
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className="truncate font-mono dir-ltr">{user?.email || 'user@example.com'}</span>
                  {/* نمایش نقش کاربر */}
                  <span className="bg-slate-800 px-1 rounded text-slate-400 text-[9px] uppercase">{user?.role || 'AGENT'}</span>
                </div>
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