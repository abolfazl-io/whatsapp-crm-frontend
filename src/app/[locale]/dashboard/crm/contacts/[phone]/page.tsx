"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl"; // 👈 هوک‌ها
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Phone, User, MessageSquare, StickyNote, ArrowRight, 
  Calendar, Hash, Tag as TagIcon, Loader2, Send, Plus, X
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- تایپ‌ها ---
interface Tag {
  id: number;
  name: string;
  color: string;
}

interface ContactDetail {
  id: number;
  phone: string;
  pushName?: string;
  imageUrl?: string;
  tags: Tag[];
  notes: { id: number; text: string; createdAt: string; authorName?: string }[];
  conversations: { id: number; status: string; lastMessageAt: string; assignedTo?: number }[];
}

export default function ContactProfilePage() {
  const t = useTranslations('CrmProfile'); // 👈 کلید ترجمه
  const locale = useLocale(); // 👈 دریافت زبان برای تاریخ
  
  const params = useParams();
  const router = useRouter();
  const phone = params.phone as string; 

  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [newTag, setNewTag] = useState({ name: "", color: "#3b82f6" });
  const [tagLoading, setTagLoading] = useState(false);

  useEffect(() => {
    if (phone) {
        fetchContactData();
        fetchAllTags();
    }
  }, [phone]);

  const fetchContactData = async () => {
    try {
      const res = await api.get(`/crm/contacts/${phone}`);
      setContact(res.data);
    } catch (err: any) {
      console.error(err);
      setError(t('notFound'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
        const res = await api.get('/crm/tags');
        setAllTags(res.data);
    } catch (error) {
        console.error("Error fetching tags", error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name) return;
    setTagLoading(true);
    try {
        const res = await api.post('/crm/tags', newTag);
        setAllTags(prev => [...prev, res.data]);
        setNewTag({ name: "", color: "#3b82f6" });
        alert(t('alert.tagCreated'));
    } catch (error) {
        alert(t('alert.tagError'));
    } finally {
        setTagLoading(false);
    }
  };

  const handleAssignTag = async () => {
    if (!selectedTagId || !contact) return;
    setTagLoading(true);
    try {
        await api.post(`/crm/contacts/${contact.id}/tags`, {
            tagId: Number(selectedTagId)
        });
        
        await fetchContactData();
        setIsTagDialogOpen(false);
        setSelectedTagId("");
    } catch (error) {
        console.error(error);
        alert(t('alert.tagExists'));
    } finally {
        setTagLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !contact) return;
    setNoteLoading(true);
    try {
        await api.post(`/crm/contacts/${contact.id}/notes`, { text: noteText });
        setNoteText("");
        fetchContactData();
    } catch (error) { alert(t('alert.noteError')); } 
    finally { setNoteLoading(false); }
  };

  // فرمت تاریخ بر اساس زبان
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { 
      month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
    });
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!contact) return;
    if (!window.confirm(t('alert.deleteConfirm'))) return;

    try {
      await api.delete(`/crm/contacts/${contact.id}/tags/${tagId}`);
      setContact(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: prev.tags.filter(t => t.id !== tagId)
        };
      });
      
    } catch (error) {
      console.error("Error deleting tag", error);
    }
  };
  
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#64748b"];

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (error || !contact) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-5 w-5 text-slate-500" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ستون ۱: مشخصات و تگ‌ها */}
        <div className="space-y-6">
            <Card className="border-t-4 border-t-blue-500 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 relative">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-sm mx-auto">
                            <AvatarImage src={contact.imageUrl} />
                            <AvatarFallback className="bg-slate-100 text-slate-400"><User className="h-10 w-10" /></AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-xl">{contact.pushName || t('unknown')}</CardTitle>
                    <CardDescription className="font-mono text-lg dir-ltr mt-1 flex justify-center items-center gap-2">
                        <Phone className="h-4 w-4" /> {contact.phone}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    
                    {/* بخش تگ‌ها */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <TagIcon className="h-4 w-4" />
                                <span>{t('tagsTitle')}</span>
                            </div>
                            
                            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:bg-blue-50" title={t('addTagBtn')}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[400px]">
                                    <DialogHeader>
                                        <DialogTitle>{t('tagsDialog.title')}</DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6 py-4">
                                        {/* 1. انتخاب تگ موجود */}
                                        <div className="space-y-2">
                                            <Label>{t('tagsDialog.existLabel')}</Label>
                                            <div className="flex gap-2">
                                                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={t('tagsDialog.selectPlaceholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allTags.map(tag => (
                                                            <SelectItem key={tag.id} value={String(tag.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full" style={{ background: tag.color }} />
                                                                    {tag.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={handleAssignTag} disabled={!selectedTagId || tagLoading}>
                                                    {tagLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* 2. ساخت تگ جدید */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-500 text-xs">{t('tagsDialog.createLabel')}</Label>
                                            <Input 
                                                placeholder={t('tagsDialog.createPlaceholder')} 
                                                value={newTag.name}
                                                onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                                            />
                                            <div className="flex gap-2 justify-between">
                                                {colors.map(c => (
                                                    <button 
                                                        key={c}
                                                        onClick={() => setNewTag({...newTag, color: c})}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 transition-all",
                                                            newTag.color === c ? "border-slate-600 scale-110" : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            <Button 
                                                variant="secondary" 
                                                className="w-full mt-2" 
                                                onClick={handleCreateTag}
                                                disabled={!newTag.name || tagLoading}
                                            >
                                                {t('tagsDialog.createBtn')}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* لیست تگ‌های کاربر */}
                        <div className="flex flex-wrap gap-2">
                            {contact.tags.length > 0 ? (
                                contact.tags.map(tag => (
                                    <Badge 
                                        key={tag.id} 
                                        style={{ backgroundColor: tag.color }} 
                                        className="group flex items-center gap-1 px-3 py-1 text-white border-0 shadow-sm cursor-default transition-all"
                                    >
                                        <span>{tag.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleRemoveTag(tag.id);
                                            }}
                                            className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center"
                                            title="Delete"
                                        >
                                            <div className="bg-white/20 hover:bg-white/40 rounded-full p-0.5">
                                                <X className="h-3 w-3 text-white" />
                                            </div>
                                        </button>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">{t('noTags')}</span>
                            )}
                        </div>
                    </div>

                    <Separator />
                    {/* لینک چت - فعلاً به داشبورد انگلیسی می‌رود، بهتر است داینامیک شود */}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => router.push(`/dashboard/chat?phone=${contact.phone}`)}>
                        <MessageSquare className="h-4 w-4" />
                        {t('sendMsgBtn')}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">{t('systemId')}:</span>
                        <span className="font-mono text-slate-700">#{contact.id}</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* ستون ۲ و ۳: تاریخچه و یادداشت‌ها */}
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        {t('conversationsTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {contact.conversations.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">{t('noConversations')}</div>
                    ) : (
                        <div className="space-y-3">
                            {contact.conversations.map((conv) => (
                                <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-full border">
                                            <Hash className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{t('conversation')} #{conv.id}</div>
                                            <div className="text-xs text-slate-500 mt-0.5"><Calendar className="inline h-3 w-3 ml-1" />{formatDate(conv.lastMessageAt)}</div>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{conv.status}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

             {/* بخش یادداشت‌ها */}
             <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 border-b bg-yellow-50/30">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <StickyNote className="h-5 w-5 text-yellow-600" />
                        {t('notesTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 pt-4">
                     <div className="flex gap-2 items-start">
                        <Textarea 
                            placeholder={t('notePlaceholder')} 
                            className="resize-none h-16 bg-white"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                        />
                        <Button className="h-16 w-16 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleAddNote} disabled={noteLoading || !noteText.trim()}>
                            {noteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                     </div>
                     <Separator />
                     <ScrollArea className="h-[250px] pr-4">
                        {contact.notes.map((note) => (
                            <div key={note.id} className="relative pl-4 border-l-2 border-slate-200 pb-2">
                                <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                    <p>{note.text}</p>
                                    <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
                                        <span>{note.authorName}</span>
                                        <span>{formatDate(note.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}