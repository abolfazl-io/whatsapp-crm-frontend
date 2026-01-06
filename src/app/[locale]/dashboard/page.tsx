"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Activity, BarChart3, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useTranslations, useLocale } from "next-intl"; // 👈 ایمپورت‌های جدید

export default function DashboardPage() {
  const t = useTranslations('Dashboard'); // 👈 دسترسی به ترجمه‌های داشبورد
  const locale = useLocale(); // 👈 دریافت زبان فعلی (fa یا en)
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); 
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
      return <div className="flex justify-center pt-20"><Loader2 className="animate-spin h-8 w-8 text-blue-500"/></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title={t('totalMessages')}
          value={stats?.messages.total.toLocaleString()} 
          desc={t('newMessages', {count: stats?.messages.today})} // 👈 استفاده از پارامتر
          icon={MessageSquare} 
        />
        <StatsCard 
          title={t('activeContacts')}
          value={stats?.contacts.total.toLocaleString()} 
          desc={t('newContacts', {count: stats?.contacts.new})}
          icon={Users} 
        />
        <StatsCard 
          title={t('connectionStatus')}
          value={stats?.whatsapp.status === 'CONNECTED' ? t('connected') : t('disconnected')} 
          desc={t('ping', {value: stats?.whatsapp.ping})}
          icon={Activity} 
          success={stats?.whatsapp.status === 'CONNECTED'}
        />
        <StatsCard 
          title={t('queue')}
          value={stats?.campaigns.active} 
          desc={t('sentSuccessfully', {count: stats?.campaigns.completed})}
          icon={BarChart3} 
        />
      </div>

      {/* بخش نمودار و فعالیت‌ها */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 📊 نمودار فعالیت هفته */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>{t('chartTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full pr-4">
               {stats?.chart ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats.chart}>
                     <defs>
                       <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                     <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12, fill: '#6b7280'}} 
                        axisLine={false}
                        tickLine={false}
                     />
                     <YAxis 
                        tick={{fontSize: 12, fill: '#6b7280'}} 
                        axisLine={false}
                        tickLine={false}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="sent" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorSent)" 
                        name={t('sent')} // 👈 ترجمه لیبل نمودار
                     />
                     <Area 
                        type="monotone" 
                        dataKey="received" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorReceived)" 
                        name={t('received')} // 👈 ترجمه لیبل نمودار
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">
                   {t('noData')}
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        {/* لیست فعالیت‌های اخیر */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {stats?.activities?.length > 0 ? (
                  stats.activities.map((act: any, i: number) => (
                    <div key={i} className="flex items-start">
                      <div className={`mt-1 p-1.5 rounded-full shrink-0 ${act.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {act.type === 'in' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="mr-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {act.text}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          "{act.subText}"
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap mr-2">
                        {/* 👈 فرمت تاریخ بر اساس زبان */}
                        {new Date(act.time).toLocaleTimeString(locale === 'fa' ? 'fa-IR' : 'en-US', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">{t('noActivity')}</p>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, desc, icon: Icon, success = false }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${success ? 'text-green-500' : 'text-slate-500'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${success ? 'text-green-600' : ''}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
           {desc}
        </p>
      </CardContent>
    </Card>
  );
}