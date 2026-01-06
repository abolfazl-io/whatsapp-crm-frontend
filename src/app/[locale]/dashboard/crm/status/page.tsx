"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl"; // 👈 هوک‌ها
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, CheckCircle2, XCircle, AlertCircle, Loader2, Hash, Phone, User, UserPlus   
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- تایپ‌ها ---
interface Contact {
  phone: string;
  pushName?: string;
}

interface ConversationItem {
  id: number;
  status: string;
  lastMessageAt: string;
  contact: Contact;
  assignedTo?: number; 
}

interface Agent {
  id: number;
  name: string;
}

export default function StatusPage() {
  const t = useTranslations('CrmStatus'); // 👈 کلید ترجمه
  const locale = useLocale();

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  
  const [result, setResult] = useState<ConversationItem | null>(null);
  const [error, setError] = useState("");
  const [recentList, setRecentList] = useState<ConversationItem[]>([]);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const convRes = await api.get("/whatsapp/conversations");
      const data: ConversationItem[] = convRes.data;
      const sorted = data.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setRecentList(sorted.slice(0, 10));

      try {
        const agentRes = await api.get("/crm/agents");
        setAgents(agentRes.data);
      } catch (e) {
        console.error("Error fetching agents", e);
      }
      
    } catch (err) {
      console.error("Error fetching initial data", err);
    } finally {
      setListLoading(false);
    }
  };

  const handleCheck = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchId) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedAgent("");

    try {
      const found = recentList.find(r => r.id === Number(searchId));
      if (found) {
        setResult(found);
        if (found.assignedTo) setSelectedAgent(String(found.assignedTo));
      } else {
        setError(t('errorNotFound'));
      }
    } catch (err) {
      setError(t('errorSearch'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!result) return;
    setLoading(true);
    try {
      await api.patch(`/crm/conversations/${result.id}/status`, { status: newStatus });
      
      const updated = { ...result, status: newStatus };
      setResult(updated);
      setRecentList(prev => prev.map(item => item.id === result.id ? updated : item));
    } catch (err) {
      alert("Error changing status");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!result || !selectedAgent) return;
    setLoading(true);
    try {
        await api.patch(`/crm/conversations/${result.id}/assign`, { 
            agentId: Number(selectedAgent) 
        });

        const updated = { ...result, assignedTo: Number(selectedAgent) };
        setResult(updated);
        setRecentList(prev => prev.map(item => item.id === result.id ? updated : item));
        
        const agentName = agents.find(a => a.id === Number(selectedAgent))?.name;
        alert(t('successAssign', { name: agentName }));

    } catch (err) {
        console.error(err);
        alert(t('errorAssign'));
    } finally {
        setLoading(false);
    }
  };

  // کامپوننت داخلی برای بج
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      OPEN: "bg-green-100 text-green-700 border-green-200",
      CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
      PENDING: "bg-orange-100 text-orange-700 border-orange-200",
    };
    // ترجمه وضعیت‌ها
    const statusLabel = t(`status.${status}`) || status;
    
    return (
      <Badge variant="outline" className={cn("px-3 py-1", styles[status] || styles.CLOSED)}>
        {statusLabel}
      </Badge>
    );
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "Unknown";
    if (phone.includes('-')) return "Group";
    if (phone.startsWith('98')) return '0' + phone.substring(2);
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-slate-500">{t('description')}</p>
      </div>

      {/* جستجو */}
      <Card className="max-w-md mx-auto border-blue-100 shadow-lg shadow-blue-50 dark:shadow-none dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            {t('searchTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheck} className="flex gap-2">
            <div className="relative flex-1">
                <Hash className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder={t('searchPlaceholder')} 
                    className="pr-9 font-mono text-lg" 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    autoFocus
                />
            </div>
            <Button type="submit" disabled={loading || !searchId} className="bg-blue-600 hover:bg-blue-700 w-24">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('searchBtn')}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* نتیجه جستجو */}
      {result && (
        <Card className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">{t('ticketDetails', { id: result.id })}</CardTitle>
                    <CardDescription>
                        {t('lastActivity')} {formatDate(result.lastMessageAt)}
                    </CardDescription>
                </div>
                <div className="transform scale-125 origin-left">
                    <StatusBadge status={result.status} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* اطلاعات کاربر */}
                    <div className="bg-white dark:bg-slate-950 p-3 rounded border">
                        <span className="text-slate-500 block text-xs mb-1">{t('userPhone')}</span>
                        <span className="font-medium font-mono text-lg dir-ltr flex items-center gap-2 justify-end">
                            {formatPhoneNumber(result.contact.phone)}
                            <Phone className="h-4 w-4 text-slate-400" />
                        </span>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded border">
                        <span className="text-slate-500 block text-xs mb-1">{t('userName')}</span>
                        <span className="font-medium">{result.contact.pushName || "No Name"}</span>
                    </div>

                    {/* نمایش اپراتور فعلی */}
                    <div className="bg-white dark:bg-slate-950 p-3 rounded border border-blue-100 dark:border-blue-900">
                        <span className="text-slate-500 block text-xs mb-1">{t('assignedAgent')}</span>
                        <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
                            <User className="h-4 w-4" />
                            {result.assignedTo 
                                ? agents.find(a => a.id === result.assignedTo)?.name || `ID: ${result.assignedTo}`
                                : t('unassigned')
                            }
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* فوتر: دکمه‌های عملیات */}
            <CardFooter className="flex flex-col md:flex-row items-stretch md:items-center gap-4 border-t bg-white dark:bg-slate-950 pt-4 rounded-b-lg">
                
                {/* بخش اختصاص اپراتور */}
                <div className="flex-1 flex items-center gap-2 border-l border-slate-100 pl-4 ml-4">
                    <span className="text-sm text-slate-500 whitespace-nowrap">{t('assignTo')}</span>
                    <select 
                        className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-800"
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        disabled={agents.length === 0}
                    >
                        <option value="">
                            {agents.length === 0 ? t('noAgents') : t('selectAgent')}
                        </option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                    <Button 
                        size="sm" 
                        onClick={handleAssign} 
                        disabled={loading || !selectedAgent || Number(selectedAgent) === result.assignedTo}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                </div>

                {/* بخش تغییر وضعیت */}
                <div className="flex gap-2 justify-end">
                    {result.status !== 'OPEN' && (
                        <Button size="sm" variant="outline" onClick={() => handleChangeStatus('OPEN')} disabled={loading} className="text-green-600 border-green-200 hover:bg-green-50">
                            <CheckCircle2 className="h-4 w-4 ml-1" /> {t('actions.open')}
                        </Button>
                    )}
                    
                    {result.status !== 'CLOSED' && (
                        <Button size="sm" variant="outline" onClick={() => handleChangeStatus('CLOSED')} disabled={loading} className="text-slate-600 border-slate-200 hover:bg-slate-100">
                            <XCircle className="h-4 w-4 ml-1" /> {t('actions.close')}
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
      )}

      {/* لیست ۱۰ مورد آخر */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 pr-2 border-r-4 border-blue-500">
            {t('recentActivity')}
        </h3>
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {listLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
            ) : recentList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">{t('noData')}</div>
            ) : (
                <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">{t('table.id')}</th>
                                <th className="px-4 py-3 font-medium">{t('table.phone')}</th>
                                <th className="px-4 py-3 font-medium">{t('table.agent')}</th>
                                <th className="px-4 py-3 font-medium">{t('table.lastMsg')}</th>
                                <th className="px-4 py-3 font-medium">{t('table.status')}</th>
                                <th className="px-4 py-3 font-medium text-left">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-500">#{item.id}</td>
                                    <td className="px-4 py-3 font-mono dir-ltr text-right text-blue-600">
                                        {formatPhoneNumber(item.contact.phone)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {item.assignedTo 
                                            ? agents.find(a => a.id === item.assignedTo)?.name || item.assignedTo
                                            : <span className="text-slate-300 text-xs">{t('unassigned')}</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                        {new Date(item.lastMessageAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-4 py-3 text-left">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => {
                                                setSearchId(String(item.id));
                                                setResult(item);
                                                setSelectedAgent(item.assignedTo ? String(item.assignedTo) : "");
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            {t('actions.manage')}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}