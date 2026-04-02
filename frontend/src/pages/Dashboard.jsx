import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, 
  PlusCircle, 
  Send, 
  Copy, 
  ExternalLink, 
  Code, 
  Check,
  AlertCircle,
  Clock,
  Loader2,
  Pencil,
  X,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, MockAction } from '../components/UI';

const API_BASE = "/admin";
const MOCK_BASE = "/mock";

export default function Dashboard({ searchQuery }) {
  const location = useLocation();
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isValidJson, setIsValidJson] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    path: '',
    method: 'GET',
    statusCode: 200,
    delay: 0,
    responseBody: '',
    matchRules: []
  });

  // Load existing mocks
  const fetchMocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/mocks`);
      if (Array.isArray(res.data)) {
        setMocks(res.data);
      } else {
        setMocks([]);
        console.error("Expected array but got:", res.data);
      }
    } catch (err) {
      toast.error("Backend unreachable. Check port 3000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMocks(); }, []);

  // Handle edit mode from navigation state
  useEffect(() => {
    if (location.state?.editMode) {
      handleEdit(location.state.editMode);
      // Clear state after handling to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // JSON Validation Logic
  useEffect(() => {
    if (!formData.responseBody.trim()) {
      setIsValidJson(true);
      return;
    }
    try {
      JSON.parse(formData.responseBody);
      setIsValidJson(true);
    } catch (e) {
      setIsValidJson(false);
    }
  }, [formData.responseBody]);

  // Filtered Mocks
  const filteredMocks = useMemo(() => {
    if (!Array.isArray(mocks)) return [];
    return mocks.filter(mock => 
      mock.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mock.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mocks, searchQuery]);

  // Submit mock (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidJson) {
      toast.error("Invalid JSON content");
      return;
    }

    const actionLabel = editingId ? "Updating" : "Deploying";
    const t = toast.loading(`${actionLabel} mock...`);
    try {
      const payload = { 
        ...formData, 
        statusCode: Number(formData.statusCode),
        delay: Number(formData.delay),
        responseBody: JSON.parse(formData.responseBody) 
      };

      if (editingId) {
        await axios.put(`${API_BASE}/update/${editingId}`, payload);
        toast.success("Mock updated!", { id: t });
      } else {
        await axios.post(`${API_BASE}/create`, payload);
        toast.success("Mock endpoint live!", { id: t });
      }

      handleCancelEdit(); // Clear form and state
      fetchMocks();
    } catch (err) {
      toast.error(editingId ? "Update failed." : "Failed to deploy. Check if path is unique.", { id: t });
    }
  };

  const handleEdit = (mock) => {
    setEditingId(mock._id);
    setFormData({
      path: mock.path,
      method: mock.method,
      statusCode: mock.statusCode,
      delay: mock.delay,
      responseBody: JSON.stringify(mock.responseBody, null, 2),
      matchRules: mock.matchRules || []
    });
    
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast.success(`Editing /${mock.path}`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ path: '', method: 'GET', statusCode: 200, delay: 0, responseBody: '', matchRules: [] });
  };

  const handleDelete = async (id) => {
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
    toast.success("Copied to clipboard!");
  };

  const formatJson = () => {
    try {
      const obj = JSON.parse(formData.responseBody);
      setFormData({ ...formData, responseBody: JSON.stringify(obj, null, 2) });
      toast.success("Idented!");
    } catch (e) {
      toast.error("Cannot format invalid JSON");
    }
  };

  const methodColors = {
    GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
    PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  };

  const addRule = () => {
    setFormData({
      ...formData,
      matchRules: [...formData.matchRules, { type: 'header', key: '', value: '' }]
    });
  };

  const removeRule = (index) => {
    const newRules = [...formData.matchRules];
    newRules.splice(index, 1);
    setFormData({ ...formData, matchRules: newRules });
  };

  const updateRule = (index, field, value) => {
    const newRules = [...formData.matchRules];
    newRules[index][field] = value;
    setFormData({ ...formData, matchRules: newRules });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* FORM SIDE */}
      <div className="xl:col-span-12 2xl:col-span-5" ref={formRef}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "bg-card border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden sticky top-24 transition-colors duration-300",
            editingId && "border-orange-500/30 bg-orange-500/[0.02]"
          )}
        >
          <div className={cn(
            "p-6 border-b border-border bg-muted/50 flex justify-between items-center",
            editingId && "bg-orange-500/5"
          )}>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {editingId ? <Pencil size={20} className="text-orange-500" /> : <PlusCircle size={20} className="text-primary" />}
                {editingId ? "Update Endpoint" : "Configure Endpoint"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {editingId ? `Modifying /${formData.path}` : "Define your new mock behavior"}
              </p>
            </div>
            {editingId && (
              <button 
                onClick={handleCancelEdit}
                className="p-2 hover:bg-orange-500/10 text-orange-600 rounded-full transition-colors"
                title="Cancel Editing"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-4 gap-3 text-left">
              <div className="col-span-3 space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Route Path</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">/mock/</span>
                  <input 
                    style={{ paddingLeft: '58px' }}
                    className="w-full pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="api/v1/users"
                    value={formData.path}
                    onChange={e => setFormData({...formData, path: e.target.value.replace(/^(\/|mock\/)/, '')})} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Method</label>
                <select 
                  className="w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer transition-all"
                  value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
              </div>
            </div>

            {/* MATCH RULES */}
            <div className="space-y-3 pt-2 text-left">
              <div className="flex items-center justify-between ml-1 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Matching Rules (Optional)</label>
                <button 
                  type="button" 
                  onClick={addRule}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <PlusCircle size={12} />
                  Add Rule
                </button>
              </div>
              
              <div className="space-y-2 text-left">
                {formData.matchRules.map((rule, index) => (
                  <div key={index} className="flex gap-2 items-center bg-muted/20 p-2 rounded-xl border border-border/50">
                    <select 
                      className="bg-background border border-border rounded-lg text-[10px] p-1.5 focus:ring-1 focus:ring-primary outline-none"
                      value={rule.type}
                      onChange={(e) => updateRule(index, 'type', e.target.value)}
                    >
                      <option value="header">Header</option>
                      <option value="query">Query</option>
                    </select>
                    <input 
                      placeholder="Key"
                      className="flex-1 bg-background border border-border rounded-lg text-[10px] p-1.5 focus:ring-1 focus:ring-primary outline-none"
                      value={rule.key}
                      onChange={(e) => updateRule(index, 'key', e.target.value)}
                    />
                    <input 
                      placeholder="Value"
                      className="flex-1 bg-background border border-border rounded-lg text-[10px] p-1.5 focus:ring-1 focus:ring-primary outline-none"
                      value={rule.value}
                      onChange={(e) => updateRule(index, 'value', e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeRule(index)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {formData.matchRules.length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic ml-1 opacity-60">No specific matching rules. This will act as a fallback for the path.</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Response Body (JSON)</label>
                <div className="flex gap-2">
                  {!isValidJson && (
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      Invalid JSON
                    </span>
                  )}
                  <button 
                    type="button"
                    onClick={formatJson}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <Check size={12} />
                    Format
                  </button>
                </div>
              </div>
              <div className="relative group">
                <textarea 
                  className={cn(
                    "w-full h-48 px-4 py-3 bg-muted/20 border border-border rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none",
                    !isValidJson && "border-red-500/50 bg-red-500/5 focus:ring-red-500/20"
                  )}
                  placeholder='{"status": "success", "data": []}'
                  value={formData.responseBody}
                  onChange={e => setFormData({...formData, responseBody: e.target.value})}
                  required
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Code size={16} className="text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Status Code</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="200" 
                  value={formData.statusCode}
                  onChange={e => setFormData({...formData, statusCode: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Delay (ms)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="0" 
                  value={formData.delay}
                  onChange={e => setFormData({...formData, delay: e.target.value})} 
                />
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <div className="flex gap-3">
                <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-bold text-primary mb-1.5 text-sm underline decoration-primary/30 underline-offset-4">Pro Tip: Dynamic Data</p>
                  <p>Inject randomized data into your responses by using <code className="bg-card border border-border px-1.5 py-0.5 rounded font-mono text-[10px]">{`{{faker:person.fullName}}`}</code> or <code className="bg-card border border-border px-1.5 py-0.5 rounded font-mono text-[10px]">{`{{faker:internet.email}}`}</code> directly in your JSON body.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center pl-1 pr-1">
              {editingId && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3.5 border border-border bg-card text-foreground font-semibold rounded-xl hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={!isValidJson}
                className={cn(
                  "flex-1 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:translate-y-0",
                  editingId 
                    ? "bg-orange-500 text-white shadow-orange-500/20 hover:shadow-orange-500/30" 
                    : "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5",
                  !isValidJson && "opacity-50 cursor-not-allowed transform-none hover:shadow-none bg-muted text-muted-foreground border border-border"
                )}
              >
                {editingId ? <Check size={18} /> : <Send size={18} />}
                {editingId ? "Update Architecture" : "Deploy Architecture"}
              </button>
            </div>
          </form>
        </motion.section>
      </div>

      {/* LIST SIDE */}
      <div className="xl:col-span-12 2xl:col-span-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Active Mocks</h2>
            <p className="text-muted-foreground text-sm">Managing {mocks.length} live environments</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchMocks} className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading && mocks.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 size={40} className="animate-spin text-primary/40" />
                <p className="font-medium animate-pulse">Initializing cloud workers...</p>
              </div>
            ) : filteredMocks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/5 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                  <Search size={32} className="text-primary/40" />
                </div>
                <h3 className="text-lg font-bold">No results found</h3>
                <p className="text-muted-foreground max-w-[240px] mt-2">
                  {searchQuery ? `No mocks match "${searchQuery}"` : "Get started by deploying your first mock endpoint."}
                </p>
              </motion.div>
            ) : filteredMocks.map(mock => (
              <motion.div 
                key={mock._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider",
                        methodColors[mock.method] || "bg-gray-100 text-gray-500 border-gray-200"
                      )}>
                        {mock.method}
                      </span>
                      {mock.delay > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Clock size={10} />
                          {mock.delay}ms
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {mock.statusCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        /mock/{mock.path}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1 opacity-60">
                      {JSON.stringify(mock.responseBody).substring(0, 80)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-center">
                    <MockAction 
                      icon={ExternalLink} 
                      onClick={() => window.open(`${MOCK_BASE}/${mock.path}`, '_blank')}
                      tooltip="Quick Test"
                    />
                    <MockAction 
                      icon={Pencil} 
                      onClick={() => handleEdit(mock)}
                      tooltip="Edit Mock"
                      highlight={editingId === mock._id}
                    />
                    <MockAction 
                      icon={Copy} 
                      onClick={() => copyToClipboard(mock.path)}
                      tooltip="Copy URL"
                    />
                    <div className="w-[1px] h-6 bg-border mx-1" />
                    <MockAction 
                      icon={Trash2} 
                      onClick={() => handleDelete(mock._id)}
                      danger
                      tooltip="Delete"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
