import { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Database, 
  Activity, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Server, 
  RefreshCcw,
  Cpu,
  HardDrive
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { cn } from '../components/UI';

const API_BASE = "http://localhost:3000/admin";

export default function Settings() {
  const [health, setHealth] = useState({ status: 'loading', uptime: 0, memory: 0 });
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const fetchHealth = async () => {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      setHealth(res.data);
    } catch (err) {
      setHealth({ status: 'disconnected', uptime: 0, memory: 0 });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText("http://localhost:3000/mock");
    setCopied(true);
    toast.success("Base URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportData = async () => {
    const t = toast.loading("Preparing backup...");
    try {
      const res = await axios.get(`${API_BASE}/export`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mockflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success("Backup downloaded!", { id: t });
    } catch (err) {
      toast.error("Export failed", { id: t });
    }
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const t = toast.loading("Importing rules...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const mocks = JSON.parse(event.target.result);
        await axios.post(`${API_BASE}/import`, { mocks });
        toast.success("Project restored successfully!", { id: t });
        fetchHealth();
      } catch (err) {
        toast.error("Import failed. Invalid JSON format.", { id: t });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-border/50 pb-8">
        <h2 className="text-4xl font-black tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2 text-lg">System infrastructure and data management.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SYSTEM HEALTH CARDS */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HealthCard 
              icon={Database} 
              label="Database" 
              value={health.status === 'connected' ? "Connected" : "Disconnected"} 
              sub="MongoDB v7.0.x"
              active={health.status === 'connected'}
            />
            <HealthCard 
              icon={Cpu} 
              label="Uptime" 
              value={`${Math.floor(health.uptime / 60)}m ${Math.round(health.uptime % 60)}s`} 
              sub="Process runtime"
              active={true}
            />
            <HealthCard 
              icon={HardDrive} 
              label="Memory Usage" 
              value={`${Math.round(health.memory / 1024 / 1024)} MB`} 
              sub="Heap Heap Usage"
              active={true}
            />
          </div>

          <section className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-foreground/5">
            <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server size={20} className="text-primary" />
                <h3 className="font-bold text-lg">Network Configuration</h3>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="font-bold text-base">Public Base URL</p>
                  <p className="text-sm text-muted-foreground">All your mock endpoints are rooted at this address.</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-muted rounded-2xl border border-border group w-full md:w-auto">
                  <code className="px-4 py-2 text-sm font-mono font-bold text-primary truncate max-w-[200px] md:max-w-none">
                    http://localhost:3000/mock
                  </code>
                  <button 
                    onClick={copyUrl}
                    className="p-3 bg-background hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="h-[1px] bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-base">Request Retention</p>
                  <p className="text-sm text-muted-foreground">Memory-safe logging limit for performance.</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 uppercase tracking-widest">
                  Auto-Rotate (100)
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* DATA MANAGEMENT */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <RefreshCcw size={20} />
              </div>
              <h3 className="font-bold text-xl">Backup & Recovery</h3>
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take full control of your mock environment. Export your configuration as a portable JSON file or restore from a previous session.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={exportData}
                  className="flex items-center gap-4 p-5 bg-muted/30 hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[2rem] transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Download size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">Download Backup</span>
                    <span className="block text-[10px] text-muted-foreground">Export all {health.status === 'connected' ? 'live' : ''} rules to JSON</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-4 p-5 bg-muted/30 hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[2rem] transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Upload size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">Restore Project</span>
                    <span className="block text-[10px] text-muted-foreground">Upload and overwrite current rules</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border/50 text-center">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                 Local Environment Control v1.0
               </p>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importData} 
              className="hidden" 
              accept=".json"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ icon: Icon, label, value, sub, active }) {
  return (
    <div className="p-6 bg-card border border-border rounded-3xl shadow-lg shadow-foreground/5 space-y-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        active ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
      )}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-xl font-black mt-1 tracking-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}
