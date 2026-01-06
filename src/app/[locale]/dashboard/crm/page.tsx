"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // برای دریافت زبان فعلی
import { useTranslations } from "next-intl"; // 👈 هوک ترجمه
import { api } from "@/lib/api";
import { 
  Users, 
  Briefcase, 
  Zap, 
  ArrowRight,
  UserPlus,
  Loader2,
  Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CrmStats {
  contacts: {
    total: number;
    new: number;
  };
  messages: {
    total: number;
    today: number;
  };
}

export default function CrmDashboard() {
  const t = useTranslations('Crm'); // 👈 دسترسی به کلیدهای Crm
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';

  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);

  // تعریف بخش‌ها داخل کامپوننت برای استفاده از ترجمه
  const crmSections = [
    {
      title: t('sections.contactsTitle'),
      description: t('sections.contactsDesc'),
      icon: Users,
      href: `/${currentLocale}/dashboard/crm/contacts`,
      color: "text-blue-600 bg-blue-50",
      action: t('sections.contactsAction')
    },
    {
      title: t('sections.cannedTitle'),
      description: t('sections.cannedDesc'),
      icon: Zap,
      href: `/${currentLocale}/dashboard/crm/canned-responses`,
      color: "text-purple-600 bg-purple-50",
      action: t('sections.cannedAction')
    },
    {
      title: t('sections.agentsTitle'),
      description: t('sections.agentsDesc'),
      icon: Briefcase,
      href: `/${currentLocale}/dashboard/crm/agents`,
      color: "text-orange-600 bg-orange-50",
      action: t('sections.agentsAction')
    },
    {
      title: t('sections.statusTitle'),
      description: t('sections.statusDesc'),
      icon: Activity,
      href: `/${currentLocale}/dashboard/crm/status`,
      color: "text-slate-600 bg-slate-50",
      action: t('sections.statusAction')
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats"); 
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 py-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        
        <Link href={`/${currentLocale}/dashboard/crm/contacts`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                {t('customerListBtn')}
            </Button>
        </Link>
      </div>

      {/* کارت‌های ناوبری به زیربخش‌ها */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {crmSections.map((item, index) => (
          <Link key={index} href={item.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200 dark:border-slate-800 group">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                  {item.action} <ArrowRight className="mr-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* بخش آمار واقعی (متصل به بک‌ند) */}
      <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            title={t('stats.totalContacts')}
            value={stats?.contacts.total} 
            loading={loading} 
            color="text-slate-900 dark:text-white"
          />
          <StatCard 
            title={t('stats.newContacts')}
            value={stats?.contacts.new} 
            loading={loading} 
            color="text-green-600"
          />
          <StatCard 
            title={t('stats.totalMessages')}
            value={stats?.messages.total} 
            loading={loading} 
            color="text-blue-600"
          />
          <StatCard 
            title={t('stats.todayMessages')}
            value={stats?.messages.today} 
            loading={loading} 
            color="text-orange-600"
          />
      </div>

    </div>
  );
}

// کامپوننت کوچک برای نمایش کارت آمار
function StatCard({ title, value, loading, color }: { title: string, value?: number, loading: boolean, color: string }) {
    return (
        <Card className="bg-slate-50 dark:bg-slate-900 border-none">
            <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${color}`}>
                    {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto opacity-50" /> : (value?.toLocaleString() || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{title}</div>
            </CardContent>
        </Card>
    );
}