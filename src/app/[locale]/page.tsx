"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, Zap, Shield, Globe, 
  ArrowRight, Smartphone, Code2, LayoutDashboard,
  BarChart3, Users, MessageCircle
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function LandingPage() {
  const t = useTranslations('Landing');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';
  const isRtl = currentLocale === 'fa';

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* --- Header / Navbar --- */}
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tight">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
              TeamInbox
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href={`/${currentLocale}/docs`} className="hidden md:flex text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
              {t('nav_docs')}
            </Link>
            <Link href={`/${currentLocale}/login`}>
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-full px-8 py-6 shadow-md hover:shadow-xl transition-all duration-300 font-semibold">
                {t('nav_login')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- Hero Section with Advanced Mockup --- */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-visible">
        
        {/* Dynamic Background Effects (Aurora) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px] animate-pulse-slow delay-700"></div>
            <div className="absolute top-[20%] right-[30%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] dark:[mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-40"></div>
        </div>

        <div className="container mx-auto max-w-6xl text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 dark:bg-slate-900/80 backdrop-blur-md text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-100 dark:border-blue-900/50 shadow-sm mx-auto hover:scale-105 transition-transform cursor-default">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span>{t('hero_badge')}</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] drop-shadow-sm">
            {t('hero_title').split(' ').slice(0, -2).join(' ')} <br className="hidden md:block"/>
            <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
               {t('hero_title').split(' ').slice(-2).join(' ')}
               <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/30 dark:text-blue-400/30" viewBox="0 0 358 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 5.7C62.8 2.3 186.7-1.4 356 6.3" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('hero_desc')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 pb-16">
            <Link href={`/${currentLocale}/login`}>
              <Button size="lg" className="h-16 px-10 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 dark:shadow-blue-900/50 w-full sm:w-auto rounded-2xl hover:-translate-y-1 transition-all font-bold">
                {t('cta_primary')} <ArrowRight className={`h-6 w-6 ${isRtl ? 'mr-3 rotate-180' : 'ml-3'}`} />
              </Button>
            </Link>
            <Link href={`/${currentLocale}/docs`}>
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg w-full sm:w-auto rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:-translate-y-1 transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <Code2 className={`h-6 w-6 ${isRtl ? 'ml-3' : 'mr-3'} text-slate-500`} /> {t('cta_secondary')}
                </Button>
            </Link>
          </div>

          {/* --- High-End Dashboard Mockup (CSS only, no images) --- */}
          <div className="relative mx-auto max-w-5xl perspective-1000">
             {/* Glow effect behind mockup */}
             <div className="absolute -inset-4 bg-gradient-to-t from-blue-500/40 to-purple-600/40 rounded-[2.5rem] blur-2xl opacity-50 dark:opacity-70 -z-10 transform rotate-x-12 scale-95 translate-y-10"></div>
             
             {/* The Browser Window */}
             <div className="relative rounded-3xl border-[3px] border-slate-200/80 dark:border-slate-700/80 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden aspect-[16/10] transform rotate-x-6 hover:rotate-x-2 transition-transform duration-500 ease-out">
                
                {/* Browser Top Bar */}
                <div className="h-10 bg-slate-100 dark:bg-slate-800 flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto text-xs font-medium text-slate-400">teaminbox.app/dashboard</div>
                </div>

                {/* Dashboard Content Area */}
                <div className="flex h-[calc(100%-2.5rem)] dir-ltr">
                    
                    {/* 1. Fake Sidebar */}
                    <div className="w-20 lg:w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200/50 dark:border-slate-700/50 p-4 flex flex-col gap-4">
                        {/* Logo Placeholder */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg shrink-0 opacity-80"></div>
                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block opacity-50"></div>
                        </div>
                        {/* Menu Items Skeletons */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${i === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                                <div className={`h-6 w-6 rounded-lg shrink-0 ${i === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'} opacity-70`}></div>
                                <div className={`h-3 rounded w-full hidden lg:block ${i === 0 ? 'bg-blue-300 w-20' : 'bg-slate-200 dark:bg-slate-700 w-28'} opacity-50`}></div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Main Content Area */}
                    <div className="flex-1 p-6 bg-white dark:bg-slate-900 flex flex-col gap-6">
                        
                        {/* Header Skeleton */}
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="h-6 w-48 bg-slate-800 dark:bg-white rounded opacity-80 mb-2"></div>
                                <div className="h-3 w-64 bg-slate-400 dark:bg-slate-500 rounded opacity-50"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full opacity-80"></div>
                                <div className="h-10 w-10 bg-blue-600 rounded-full opacity-80"></div>
                            </div>
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-3">
                                    <div className={`h-10 w-10 rounded-xl ${['bg-blue-100 text-blue-600','bg-green-100 text-green-600','bg-purple-100 text-purple-600'][i]} flex items-center justify-center opacity-80`}>
                                        {[<MessageCircle key={0}/>, <Users key={1}/>, <BarChart3 key={2}/>][i]}
                                    </div>
                                    <div className="h-8 w-20 bg-slate-800 dark:bg-white rounded opacity-80"></div>
                                    <div className="h-3 w-24 bg-slate-400 dark:bg-slate-500 rounded opacity-50"></div>
                                </div>
                            ))}
                        </div>

                        {/* Chat / List Skeleton */}
                        <div className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 flex gap-4 overflow-hidden">
                            {/* Chat List Column */}
                            <div className="w-1/3 flex flex-col gap-3 border-r border-slate-200 dark:border-slate-700 pr-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0 opacity-60"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-20 bg-slate-400 dark:bg-slate-500 rounded opacity-60"></div>
                                            <div className="h-2 w-28 bg-slate-300 dark:bg-slate-600 rounded opacity-40"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Active Chat Column */}
                            <div className="flex-1 flex flex-col justify-between space-y-4 p-2">
                                 <div className="flex flex-col gap-3 items-start">
                                    <div className="h-10 w-3/5 bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-tl-none opacity-80"></div>
                                    <div className="h-16 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-tl-none opacity-80"></div>
                                 </div>
                                 <div className="flex flex-col gap-3 items-end">
                                    <div className="h-12 w-3/5 bg-blue-500 rounded-2xl rounded-tr-none opacity-80"></div>
                                 </div>
                                 <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl mt-auto opacity-60"></div>
                            </div>
                        </div>

                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid (Glassmorphism & Glow) --- */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-4 relative">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              همه ابزارهایی که نیاز دارید، <span className="text-blue-600 dark:text-blue-400">یکجا.</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              ما پیچیدگی‌های واتساپ را مدیریت می‌کنیم تا شما روی رشد کسب‌وکارتان تمرکز کنید.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Smartphone,
                color: "from-blue-400 to-blue-600",
                shadow: "shadow-blue-500/20",
                title: t('feature_1_title'),
                desc: t('feature_1_desc')
              },
              {
                icon: Zap,
                color: "from-orange-400 to-red-600",
                shadow: "shadow-orange-500/20",
                title: t('feature_2_title'),
                desc: t('feature_2_desc')
              },
              {
                icon: Code2,
                color: "from-purple-400 to-indigo-600",
                shadow: "shadow-purple-500/20",
                title: t('feature_3_title'),
                desc: t('feature_3_desc')
              }
            ].map((item, i) => (
              <div key={i} className="group relative p-8 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 border border-white/20 dark:border-slate-800/50 backdrop-blur-xl shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${item.color} blur-2xl -z-10`}></div>
                
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Stats Section (Modernized) --- */}
      <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-900/10 -skew-y-3 transform origin-top-left -z-10"></div>
          <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200/50 dark:divide-slate-800/50">
                  {[
                      { num: "10K+", label: t('stat_1'), icon: Users },
                      { num: "5M+", label: t('stat_2'), icon: MessageSquare },
                      { num: "99.9%", label: t('stat_3'), icon: Shield },
                      { num: "24/7", label: "پشتیبانی", icon: Zap },
                  ].map((stat, i) => (
                      <div key={i} className="px-4 group">
                          <stat.icon className="h-8 w-8 mx-auto mb-4 text-blue-500 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all"/>
                          <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{stat.num}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-base font-semibold uppercase tracking-wider">{stat.label}</div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Footer (Dark & Premium) --- */}
      <footer className="mt-auto py-16 bg-slate-950 text-slate-400 text-sm relative overflow-hidden">
        {/* Footer Subtle Glow */}
        <div className="absolute bottom-[-20%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 relative z-10">
            <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-2xl text-white">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" /> 
                    </div>
                    TeamInbox
                </div>
                <p className="text-slate-500 leading-relaxed pr-4">
                    پلتفرم جامع ارتباط با مشتریان واتساپ برای کسب‌وکارهای پیشرو.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">محصول</h4>
                <ul className="space-y-3">
                    <li><Link href="#" className="hover:text-white transition-colors">ویژگی‌ها</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">امنیت</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">رودمپ</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">منابع</h4>
                <ul className="space-y-3">
                    <li><Link href={`/${currentLocale}/docs`} className="hover:text-white transition-colors">مستندات API</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">راهنما</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">بلاگ</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">شرکت</h4>
                <ul className="space-y-3">
                    <li><Link href={`/${currentLocale}/about`} className="hover:text-white transition-colors">درباره ما</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">تماس با ما</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">قوانین</Link></li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto px-4 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="font-medium">{t('footer_rights')}</p>
          <div className="flex gap-8">
            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Globe className="h-5 w-5"/></Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Zap className="h-5 w-5"/></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}