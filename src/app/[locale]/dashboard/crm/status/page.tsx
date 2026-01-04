"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, UserCheck, CheckCircle, Clock } from "lucide-react";

export default function StatusPage() {
  const t = useTranslations('Status');
  const tCommon = useTranslations('Common');
  const [searchId, setSearchId] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const handleSearch = async () => {
    if (!searchId) return;
    try {
      // دریافت همزمان اطلاعات مکالمه و لیست ایجنت‌ها
      const [convRes, agentsRes] = await Promise.all([
        api.get(`/crm/conversations/${searchId}`),
        api.get("/crm/agents")
      ]);
      setConversation(convRes.data);
      setAgents(agentsRes.data);
      if(convRes.data.assignedTo) setSelectedAgent(convRes.data.assignedTo.toString());
    } catch (error) {
      alert(tCommon('error'));
      setConversation(null);
    }
  };

  const handleAssign = async () => {
    if (!conversation || !selectedAgent) return;
    try {
      await api.patch(`/crm/conversations/${conversation.id}/assign`, { agentId: parseInt(selectedAgent) });
      alert(t('assign_success'));
      handleSearch(); // رفرش
    } catch (error) { alert(tCommon('error')); }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/crm/conversations/${conversation.id}/status`, { status });
      handleSearch();
    } catch (error) { alert(tCommon('error')); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg"><Activity className="h-6 w-6 text-blue-600" /></div>
        <div><h1 className="text-2xl font-bold">{t('title')}</h1><p className="text-slate-500">{t('subtitle')}</p></div>
      </div>

      <div className="flex gap-2">
        <Input placeholder={t('search_placeholder')} value={searchId} onChange={(e) => setSearchId(e.target.value)} className="max-w-xs" />
        <Button onClick={handleSearch}><Search className="mr-2 h-4 w-4" />{t('check_btn')}</Button>
      </div>

      {conversation && (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="bg-slate-50 border-b"><CardTitle>{t('details_title')} #{conversation.id}</CardTitle></CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-slate-500">{t('user_phone')}</label>
                    <p className="text-lg font-mono">{conversation.contact.phone}</p>
                </div>
                <div>
                    <label className="text-sm text-slate-500">{t('table_status')}</label>
                    <div className="mt-1">
                        {conversation.status === 'OPEN' && <Badge className="bg-green-500">{t('status_open')}</Badge>}
                        {conversation.status === 'CLOSED' && <Badge variant="secondary">{t('status_closed')}</Badge>}
                        {conversation.status === 'PENDING' && <Badge className="bg-yellow-500">{t('status_pending')}</Badge>}
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded-lg bg-slate-50/50">
                <label className="text-sm font-medium block mb-2">{t('assign_label')}</label>
                <div className="flex gap-2">
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder={t('select_agent')} /></SelectTrigger>
                        <SelectContent>
                            {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id.toString()}>{agent.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAssign} variant="default">{t('assign_btn')}</Button>
                </div>
            </div>

            <div className="flex gap-2">
                {conversation.status !== 'OPEN' && <Button onClick={() => handleStatusChange('OPEN')} variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"><CheckCircle className="mr-2 h-4 w-4" />{t('open_btn')}</Button>}
                {conversation.status !== 'CLOSED' && <Button onClick={() => handleStatusChange('CLOSED')} variant="outline" className="text-slate-600"><Clock className="mr-2 h-4 w-4" />{t('close_btn')}</Button>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}