"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Shield, Activity, ArrowRight } from "lucide-react";

export default function CRMDashboard() {
  const t = useTranslations('CRM');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';

  const menuItems = [
    { title: t('sections.contacts'), desc: t('sections.contacts_desc'), icon: Users, href: `/${currentLocale}/dashboard/crm/contacts`, color: "text-blue-600", linkText: t('sections.view_list') },
    { title: t('sections.canned'), desc: t('sections.canned_desc'), icon: MessageSquare, href: `/${currentLocale}/dashboard/crm/canned-responses`, color: "text-green-600", linkText: t('sections.manage_msg') },
    { title: t('sections.agents'), desc: t('sections.agents_desc'), icon: Shield, href: `/${currentLocale}/dashboard/crm/agents`, color: "text-purple-600", linkText: t('sections.manage_team') },
    { title: t('sections.status'), desc: t('sections.status_desc'), icon: Activity, href: `/${currentLocale}/dashboard/crm/status`, color: "text-orange-600", linkText: t('sections.view_status') },
  ];

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-slate-500 mt-2 text-lg">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {menuItems.map((item, i) => (
          <Card key={i} className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                 <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 ${item.color}`}>
                    <item.icon className="h-8 w-8" />
                 </div>
              </div>
              <CardTitle className="mt-4 text-xl">{item.title}</CardTitle>
              <CardDescription className="text-base mt-2">{item.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={item.href} className={`flex items-center text-sm font-medium ${item.color} hover:underline`}>
                {item.linkText} <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}