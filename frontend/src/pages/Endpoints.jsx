import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Trash2, 
  PlusCircle, 
  Copy, 
  ExternalLink, 
  Clock, 
  Loader2, 
  Pencil,
  Globe,
  Search,
  Filter,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, MockAction } from '../components/UI';
import { useNavigate } from 'react-router-dom';

const API_BASE = "/admin";
const MOCK_BASE = "/mock";

export default function Endpoints({ searchQuery }) {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/mocks`);
      setMocks(res.data);
    } catch (err) {
      toast.error("Failed to fetch mocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMocks(); }, []);

  const filteredMocks = useMemo(() => {
    return mocks.filter(mock => 
      mock.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mock.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mocks, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mock endpoint?")) return;
    try {
      await axios.delete(`${API_BASE}/delete/${id}`);
      setMocks(mocks.filter(m => m._id !== id));
      toast.success("Mock deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const copyToClipboard = (path) => {
    const url = `${MOCK_BASE}/${path}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  };

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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">API Endpoints</h2>
          <p className="text-muted-foreground text-sm">Managing {mocks.length} active environments</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle size={18} />
          <span>New Endpoint</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {loading && mocks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-card border border-border rounded-3xl">
              <Loader2 size={40} className="animate-spin text-primary/40" />
              <p className="font-medium animate-pulse">Scanning server infrastructure...</p>
            </div>
          ) : filteredMocks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/5 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Globe size={32} className="text-primary/40" />
              </div>
              <h3 className="text-lg font-bold">No endpoints found</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                {searchQuery ? `No mocks match "${searchQuery}"` : "You haven't deployed any mock endpoints yet."}
              </p>
            </div>
          ) : filteredMocks.map(mock => (
            <motion.div 
              key={mock._id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider",
                      methodColors[mock.method] || "bg-gray-100 text-gray-500 border-gray-200"
                    )}>
                      {mock.method}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      HTTP {mock.statusCode}
                    </span>
                    {mock.delay > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-full border border-orange-500/10">
                        <Clock size={10} />
                        {mock.delay}ms delay
                      </span>
                    )}
                  </div>
                  <h3 className="font-mono font-bold text-xl text-foreground group-hover:text-primary transition-colors truncate">
                    /mock/{mock.path}
                  </h3>
                  {mock.matchRules && mock.matchRules.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mock.matchRules.map((rule, i) => (
                        <span key={i} className="text-[9px] font-mono bg-accent/50 border border-border px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="opacity-60">{rule.type}:</span>
                          <span className="font-bold">{rule.key}={rule.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Filter size={12} />
                      JSON Response
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RefreshCcw size={12} className="opacity-60" />
                      Updated {new Date(mock.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MockAction 
                    icon={ExternalLink} 
                    onClick={() => window.open(`${MOCK_BASE}/${mock.path}`, '_blank')}
                    tooltip="Test Endpoint"
                  />
                  <MockAction 
                    icon={Pencil} 
                    onClick={() => navigate('/', { state: { editMode: mock } })}
                    tooltip="Edit Configuration"
                  />
                  <MockAction 
                    icon={Copy} 
                    onClick={() => copyToClipboard(mock.path)}
                    tooltip="Copy URL"
                  />
                  <div className="w-[1px] h-6 bg-border mx-2" />
                  <MockAction 
                    icon={Trash2} 
                    onClick={() => handleDelete(mock._id)}
                    danger
                    tooltip="Delete URL"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
