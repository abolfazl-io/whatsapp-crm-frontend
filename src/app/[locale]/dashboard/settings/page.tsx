"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl"; // 👈 اضافه شد
import { io } from "socket.io-client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wifi, WifiOff, RefreshCw, LogOut, Unplug } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const t = useTranslations('Settings'); // 👈 استفاده از ترجمه
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';

  const [status, setStatus] = useState<"DISCONNECTED" | "SCAN_QR" | "CONNECTED" | "LOADING">("LOADING");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const isStartingRef = useRef(false);

  const handleAppLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = `/${currentLocale}/login`;
  };

  const disconnectWhatsapp = async () => {
    try {
      setLoadingAction(true);
      addLog("⚠️ Disconnecting...");
      await api.delete("/whatsapp/session"); 
      setStatus("DISCONNECTED");
      setQrCode(null);
      setPhone(null);
      addLog("✅ Disconnected.");
    } catch (error) { console.error(error); addLog("❌ Error disconnecting."); } finally { setLoadingAction(false); }
  };

  const addLog = (msg: string) => { setLogs(prev => [msg, ...prev].slice(0, 5)); };

  const startSession = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    try {
      if (!loadingAction) setLoadingAction(true); 
      addLog("🚀 Starting session...");
      await api.post("/whatsapp/start", {});
    } catch (error) { addLog("❌ Error starting session."); } finally { setLoadingAction(false); isStartingRef.current = false; }
  };

  const checkStatus = async (autoStart = false) => {
    try {
      const res = await api.get("/whatsapp/status");
      const backendStatus = res.data.status;
      if (backendStatus === "CONNECTED") {
        setStatus("CONNECTED"); setPhone(res.data.phone); setQrCode(null);
      } else if (backendStatus === "SCAN_QR") {
         setStatus("SCAN_QR"); if(res.data.qr) setQrCode(res.data.qr);
      } else {
        setStatus("DISCONNECTED");
        if (autoStart) startSession();
      }
    } catch (error: any) { setStatus("DISCONNECTED"); }
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("session:qr", (data) => { setStatus("SCAN_QR"); setQrCode(data.qr); addLog("📷 QR Code Received"); });
    socket.on("session:connected", (data) => { setStatus("CONNECTED"); setQrCode(null); setPhone(data.phone); addLog(`✅ Connected: ${data.phone}`); });
    socket.on("session:disconnected", () => { setStatus("DISCONNECTED"); addLog("❌ Disconnected"); setTimeout(() => checkStatus(true), 3000); });
    checkStatus(true);
    const interval = setInterval(() => { checkStatus(false); }, 5000);
    return () => { socket.disconnect(); clearInterval(interval); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2></div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('whatsapp_status')}
              {status === "CONNECTED" ? (<Badge className="bg-green-500 hover:bg-green-600">{t('connected')}</Badge>) : status === "SCAN_QR" ? (<Badge className="bg-yellow-500 hover:bg-yellow-600">{t('scan_qr')}</Badge>) : status === "LOADING" ? (<Badge className="bg-slate-500">{t('checking')}</Badge>) : (<Badge variant="destructive">{t('disconnected')}</Badge>)}
            </CardTitle>
            <CardDescription>{t('manage_connection')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[320px] space-y-6">
            {status === "LOADING" && (<div className="flex flex-col items-center gap-2"><Loader2 className="h-10 w-10 animate-spin text-slate-400" /><p className="text-sm text-slate-400">{t('connecting_server')}</p></div>)}
            {status === "DISCONNECTED" && (
              <div className="text-center space-y-4 w-full px-6">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><WifiOff className="h-10 w-10 text-slate-400" /></div>
                <p className="text-sm text-muted-foreground">{t('not_connected')}</p>
                <Button onClick={() => startSession()} disabled={loadingAction} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4" />}{t('connect_btn')}
                </Button>
              </div>
            )}
            {status === "SCAN_QR" && qrCode && (
              <div className="text-center space-y-4 w-full">
                <div className="relative p-2 bg-white border-2 border-slate-200 rounded-xl shadow-inner mx-auto w-fit"><img src={qrCode} alt="Scan QR" className="w-56 h-56 object-contain" /></div>
                <p className="text-sm text-muted-foreground animate-pulse">{t('scan_guide')}</p>
              </div>
            )}
            {status === "CONNECTED" && (
              <div className="w-full space-y-6">
                <div className="text-center space-y-2">
                    <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto border-4 border-green-50 dark:border-green-900/50 shadow-lg shadow-green-100"><Wifi className="h-10 w-10 text-green-600 dark:text-green-400" /></div>
                    <div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('online_msg')}</h3><p className="font-mono text-slate-500 dir-ltr">{phone}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4">
                    <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="secondary" className="w-full border border-slate-200 text-slate-700 hover:bg-slate-100"><Unplug className="mr-2 h-4 w-4" />{t('change_number')}</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>{t('modal.title')}</AlertDialogTitle><AlertDialogDescription>{t('modal.desc')}</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>{t('modal.cancel')}</AlertDialogCancel><AlertDialogAction onClick={disconnectWhatsapp} className="bg-red-600 hover:bg-red-700">{t('modal.confirm')}</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100" onClick={handleAppLogout}><LogOut className="mr-2 h-4 w-4" />{t('logout_panel')}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium uppercase text-slate-500">{t('terminal')}</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs h-[320px] overflow-y-auto custom-scrollbar" dir="ltr">
                {logs.length === 0 ? (<span className="text-slate-600 opacity-50 flex h-full items-center justify-center">{t('waiting_events')}</span>) : (logs.map((log, i) => (<div key={i} className="border-b border-slate-800/50 last:border-0 py-2 flex items-start"><span className="text-green-500 mr-2 shrink-0">$</span><span>{log}</span></div>)))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}