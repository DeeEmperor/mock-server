import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, 
  Trash2, 
  RefreshCcw, 
  ChevronRight, 
  Search,
  Activity,
  Calendar,
  Layers,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/UI';

const API_BASE = "/admin";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/logs`);
      setLogs(res.data);
    } catch (err) {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all request history?")) return;
    try {
      await axios.delete(`${API_BASE}/logs`);
      setLogs([]);
      toast.success("History cleared");
    } catch (err) {
      toast.error("Failed to clear logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const methodColors = {
    GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
    PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Request History</h2>
          <p className="text-muted-foreground text-sm">Real-time logs of all incoming mock requests</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm font-medium hover:bg-destructive hover:text-white transition-all"
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Method</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Path</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-primary/40" />
                        <p className="text-muted-foreground font-medium">Fetching recent traffic...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <Activity size={48} />
                        <p className="text-lg font-bold">No traffic detected yet</p>
                        <p className="text-sm max-w-xs mx-auto">Requests to your mock endpoints will appear here in real-time.</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.map((log) => (
                  <LogItem 
                    key={log._id} 
                    log={log} 
                    expanded={expandedId === log._id} 
                    onToggle={() => setExpandedId(expandedId === log._id ? null : log._id)}
                    methodColors={methodColors}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LogItem({ log, expanded, onToggle, methodColors }) {
  const date = new Date(log.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <>
      <tr 
        className={cn(
          "hover:bg-muted/20 transition-colors cursor-pointer group",
          expanded && "bg-muted/10"
        )}
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
            log.statusCode >= 200 && log.statusCode < 300 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            {log.statusCode}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
            methodColors[log.method] || "bg-gray-100 text-gray-500 border-gray-200"
          )}>
            {log.method}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              /mock/{log.path}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{timeStr}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{dateStr}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <ChevronRight size={18} className={cn("text-muted-foreground transition-transform duration-300", expanded && "rotate-90 text-primary")} />
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan="5" className="p-0">
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-muted/5 border-b border-border"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Layers size={12} />
                      Request Headers
                    </h4>
                    <pre className="p-4 bg-card border border-border rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                      {JSON.stringify(log.headers, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Calendar size={12} />
                      Request Body
                    </h4>
                    <pre className="p-4 bg-card border border-border rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                      {log.body && Object.keys(log.body).length > 0 ? JSON.stringify(log.body, null, 2) : "// No body provided"}
                    </pre>
                  </div>
                  {log.query && Object.keys(log.query).length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Search size={12} />
                        Query Parameters
                      </h4>
                      <pre className="p-4 bg-card border border-border rounded-xl text-[11px] font-mono overflow-x-auto">
                        {JSON.stringify(log.query, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
