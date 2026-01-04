"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, User } from "lucide-react";

interface Contact { id: number; name?: string; pushName?: string; phone: string; tags?: { name: string }[]; }

export default function CRMContactsPage() {
  const t = useTranslations('CRMContacts');
  const tCommon = useTranslations('Common');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // اگر اندپوینت سرچ جداگانه دارید، اینجا تغییر دهید
      const res = await api.get(`/crm/contacts?q=${search}`);
      setContacts(res.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { 
      const timeout = setTimeout(fetchContacts, 500); 
      return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t('title')}</h1><p className="text-slate-500">{t('subtitle')}</p></div>
      </div>

      <Card>
        <CardHeader>
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder={t('search_placeholder')} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader><TableRow className="bg-slate-50"><TableHead>{t('table_image')}</TableHead><TableHead>{t('table_name')}</TableHead><TableHead>{t('table_phone')}</TableHead><TableHead>{t('table_tags')}</TableHead><TableHead className="text-left">{t('table_actions')}</TableHead></TableRow></TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />{t('loading')}</TableCell></TableRow>
                    ) : contacts.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">{t('no_data')}</TableCell></TableRow>
                    ) : (
                        contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell><Avatar><AvatarFallback className="bg-blue-100 text-blue-600"><User className="h-4 w-4"/></AvatarFallback></Avatar></TableCell>
                                <TableCell className="font-medium">{contact.name || contact.pushName || '-'}</TableCell>
                                <TableCell className="font-mono text-slate-600">{contact.phone}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {contact.tags?.map((tag, i) => <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-xs">{tag.name}</span>)}
                                    </div>
                                </TableCell>
                                <TableCell><Button variant="outline" size="sm">{t('view_profile')}</Button></TableCell>
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