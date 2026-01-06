"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User, Users, Loader2, MessageSquare, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl"; // 👈 اضافه شده

interface Contact {
  id: number;
  phone: string;
  pushName?: string;
  profilePicUrl?: string;
  tags: { id: number; name: string; color: string }[];
  _count: { conversations: number };
  createdAt: string;
}

export default function ContactsPage() {
  const t = useTranslations('Contacts'); // 👈 دسترسی به ترجمه‌های بخش مخاطبین
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchContacts = async (query = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/crm/contacts?search=${query}`);
      setContacts(res.data);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // تابع تشخیص گروه
  const isGroup = (phone: string) => {
    return phone.includes('-') || phone.length > 15;
  };

  // تابع نمایش نام هوشمند
  const getDisplayName = (contact: Contact) => {
    if (contact.pushName) return contact.pushName;
    if (isGroup(contact.phone)) return t('whatsappGroup'); // 👈 ترجمه
    return contact.phone; 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button>
            <User className="ml-2 h-4 w-4" />
            {t('addManual')}
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 mr-auto hidden md:block">
            {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> {t('updating')}</span>
            ) : (
                <span>{t('itemsFound', { count: contacts.length })}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && contacts.length === 0 ? (
           Array.from({ length: 8 }).map((_, i) => (
             <Card key={i} className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 border-0" />
           ))
        ) : contacts.length > 0 ? (
          contacts.map((contact) => {
            const isContactGroup = isGroup(contact.phone);
            const displayName = getDisplayName(contact);

            return (
              <Card key={contact.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-14 w-14 border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={contact.profilePicUrl} />
                    <AvatarFallback className={`${isContactGroup ? 'bg-orange-500' : 'bg-gradient-to-tr from-blue-500 to-purple-500'} text-white`}>
                      {isContactGroup ? <Users className="h-6 w-6" /> : (displayName[0] || "U")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="overflow-hidden flex-1">
                    <CardTitle className="text-base truncate flex items-center gap-2" title={displayName}>
                      {displayName}
                    </CardTitle>
                    
                    <p className="text-xs text-muted-foreground font-mono mt-1 dir-ltr text-right truncate opacity-70">
                      {contact.pushName ? contact.phone : (isContactGroup ? t('groupId') : t('noSavedName'))} {/* 👈 ترجمه */}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                    {isContactGroup && (
                        <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50 px-1.5 text-[10px]">
                            {t('group')}
                        </Badge>
                    )}
                    
                    {contact.tags.length > 0 ? (
                      contact.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      !isContactGroup && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tag className="h-3 w-3" /> {t('noTag')}
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                     <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {t('messagesCount', { count: contact._count.conversations })}
                     </div>
                     
                     <Link href={`/${currentLocale}/dashboard/chat?chatId=${contact.id}`}>
                       <Button size="sm" variant="ghost" className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          {isContactGroup ? t('openGroup') : t('chat')} {/* 👈 ترجمه */}
                       </Button>
                     </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
             <User className="h-12 w-12 mb-4 opacity-50" />
             <p>{t('noContactsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}