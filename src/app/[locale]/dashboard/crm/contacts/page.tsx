"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl"; // 👈 هوک ترجمه
import { api } from "@/lib/api";
import { 
  Card, CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Users, Phone, Eye, Loader2, User, RefreshCcw
} from "lucide-react";

interface Contact {
  id: number;
  phone: string;
  pushName?: string;
  tags?: { id: number; name: string; color: string }[];
}

export default function ContactsListPage() {
  const t = useTranslations('CrmContacts'); // 👈 کلید ترجمه
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContacts = async (query = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/crm/contacts`, {
        params: { search: query }
      });
      setContacts(res.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* هدر و نوار ابزار */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            {t('title')}
          </h1>
          <p className="text-slate-500 mt-1">{t('description')}</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              className="pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {t('searchBtn')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => { setSearchTerm(""); fetchContacts(""); }}
            title={t('resetBtn')}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* جدول نمایش داده‌ها */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                <TableHead className="w-[70px] text-center">{t('table.image')}</TableHead>
                <TableHead className="text-right">{t('table.name')}</TableHead>
                <TableHead className="text-right">{t('table.phone')}</TableHead>
                <TableHead className="text-right">{t('table.tags')}</TableHead>
                <TableHead className="text-left">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center">
                     <div className="flex justify-center items-center gap-2 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span>{t('loading')}</span>
                     </div>
                   </TableCell>
                 </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    {t('noData')}
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} className="group hover:bg-slate-50 transition-colors">
                    
                    {/* آواتار */}
                    <TableCell className="text-center py-3">
                      <Avatar className="h-10 w-10 border mx-auto">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                          {contact.pushName ? contact.pushName[0] : <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* نام */}
                    <TableCell className="font-medium text-slate-700">
                      {contact.pushName || <span className="text-slate-400 italic">{t('noName')}</span>}
                    </TableCell>
                    
                    {/* شماره تلفن */}
                    <TableCell className="font-mono text-slate-500 dir-ltr text-right">
                       <div className="flex items-center justify-end gap-2">
                         {contact.phone}
                         <Phone className="h-3 w-3 text-slate-300" />
                       </div>
                    </TableCell>

                    {/* تگ‌ها */}
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-1">
                        {contact.tags && contact.tags.length > 0 ? (
                            contact.tags.map((tag) => (
                                <Badge 
                                    key={tag.id} 
                                    variant="outline" 
                                    style={{ borderColor: tag.color, color: tag.color }}
                                    className="bg-white"
                                >
                                  {tag.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-slate-300">-</span>
                        )}
                      </div>
                    </TableCell>

                    {/* دکمه مشاهده پروفایل (لینک اصلاح شد) */}
                    <TableCell className="text-left">
                      <Link href={`/${currentLocale}/dashboard/crm/contacts/${contact.phone}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Eye className="h-4 w-4 ml-1" />
                          {t('profileBtn')}
                        </Button>
                      </Link>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}