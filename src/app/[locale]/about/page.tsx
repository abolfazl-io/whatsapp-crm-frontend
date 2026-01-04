"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Heart, Zap, Shield, ArrowRight, Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AboutPage() {
  const t = useTranslations('About');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';
  const isRtl = currentLocale === 'fa';

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* --- Background Effects (Shared with Home) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[120px] animate-pulse-slow delay-700"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] dark:[mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-30"></div>
      </div>

      {/* --- Header (Simplified) --- */}
      <header className="absolute top-0 w-full z-50 p-6">
        <div className="container mx-auto flex justify-between items-center">
            <Link href={`/${currentLocale}`} className="flex items-center gap-2 font-bold text-xl">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-slate-900 dark:text-white">TeamInbox</span>
            </Link>
            <Link href={`/${currentLocale}`}>
                <Button variant="ghost">بازگشت به خانه</Button>
            </Link>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="pt-40 pb-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
             {t('title')}
           </h1>
           <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
             {t('subtitle')}
           </p>
        </div>
      </section>

      {/* --- Story Section --- */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                        📖 {t('story_title')}
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">از یک ایده کوچک تا <br/>یک پلتفرم جهانی.</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed text-justify">
                        {t('story_text')}
                        <br/><br/>
                        ما تیمی از توسعه‌دهندگان عاشق متن‌باز (Open Source) هستیم که تصمیم گرفتیم پیچیدگی‌های واتساپ بیزینس API را برای کسب‌وکارهای ایرانی و جهانی ساده کنیم. هدف ما حذف موانع فنی و ایجاد ارتباطی پایدار است.
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-6"></div>
                    <div className="relative bg-slate-200 dark:bg-slate-800 rounded-3xl aspect-square flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700">
                        {/* Placeholder for Office Image */}
                        <div className="text-slate-400 text-center">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50"/>
                            <span className="text-sm font-mono">Office / Team Photo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- Values --- */}
      <section className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-12">{t('values_title')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { icon: Heart, title: t('value_1'), color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
                      { icon: Zap, title: t('value_2'), color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
                      { icon: Shield, title: t('value_3'), color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
                  ].map((val, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${val.color}`}>
                              <val.icon className="h-6 w-6"/>
                          </div>
                          <h3 className="font-bold text-lg mb-2">{val.title}</h3>
                          <p className="text-sm text-slate-500">ما متعهد به ارائه بهترین تجربه هستیم.</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Team --- */}
      <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl text-center">
              <h2 className="text-3xl font-bold mb-12">{t('team_title')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="group">
                          <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 mb-4 overflow-hidden relative">
                               {/* Placeholder Avatar */}
                               <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-4xl bg-slate-100 dark:bg-slate-800">
                                   {item}
                               </div>
                               {/* Social Overlay */}
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
                                   <Github className="h-5 w-5 cursor-pointer hover:text-blue-400"/>
                                   <Linkedin className="h-5 w-5 cursor-pointer hover:text-blue-400"/>
                                   <Twitter className="h-5 w-5 cursor-pointer hover:text-blue-400"/>
                               </div>
                          </div>
                          <h3 className="font-bold text-lg">نام هم‌تیمی</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">توسعه‌دهنده ارشد</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Bottom CTA --- */}
      <section className="py-20 text-center">
          <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <h2 className="text-3xl font-bold mb-6 relative z-10">{t('cta_title')}</h2>
                  <Link href={`/${currentLocale}/auth/register`}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 relative z-10 font-bold px-8">
                        {t('cta_btn')} <ArrowRight className={`h-4 w-4 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`}/>
                    </Button>
                  </Link>
              </div>
          </div>
      </section>

    </div>
  );
}