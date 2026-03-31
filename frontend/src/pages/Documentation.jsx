import { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Zap, 
  Info, 
  ChevronDown, 
  Globe, 
  Layers, 
  ArrowUpRight, 
  Copy, 
  Check,
  Server,
  AlertTriangle,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cn } from '../components/UI';

export default function Documentation() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyCurl = () => {
    navigator.clipboard.writeText("curl -X GET http://localhost:3000/mock/test-api");
    setCopied(true);
    toast.success("Curl command copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    {
      id: 'get-started',
      title: "Getting Started",
      icon: Zap,
      path: "/",
      content: "MockFlow provides high-performance API mocking. Every endpoint you create is instantly available under a common prefix.",
      details: (
        <div className="space-y-4 mt-4">
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Server size={12} /> Base URL Configuration
            </p>
            <div className="flex items-center justify-between gap-4 bg-background p-3 rounded-lg border border-border group-hover:border-primary/30 transition-colors">
              <code className="text-sm font-mono text-primary font-bold">http://localhost:3000/mock/{"{path}"}</code>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              All custom routes are prefixed with <code className="bg-muted px-1 rounded">/mock/</code> to separate them from administration logic.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
             <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
             <p className="text-xs text-muted-foreground">
               Ensure your client sets <code className="text-blue-500 font-bold">Content-Type: application/json</code> for all state-changing requests.
             </p>
          </div>
        </div>
      )
    },
    {
      id: 'wildcards',
      title: "Wildcard Routes",
      icon: Globe,
      path: "/endpoints",
      content: "Master the power of flexible path matching using the asterisk syntax.",
      details: (
        <div className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Using <code className="text-primary font-bold">*</code> matches any nested sub-path. This is perfect for mocking entire modules with one rule.
          </p>
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="p-2 bg-muted rounded border border-border">
              <p className="text-muted-foreground mb-1 font-sans font-bold uppercase tracking-tighter">Route</p>
              <p>api/*</p>
            </div>
            <div className="p-2 bg-muted rounded border border-border">
              <p className="text-muted-foreground mb-1 font-sans font-bold uppercase tracking-tighter">Matches</p>
              <p>api/users, api/v1/posts</p>
            </div>
          </div>
          <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl flex gap-3">
             <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
             <p className="text-[11px] text-muted-foreground">
               <span className="font-bold text-orange-600">Prioritization:</span> Exact matches (e.g. <code className="bg-card px-1 italic">/api/users</code>) are always prioritized over wildcard routes (e.g. <code className="bg-card px-1 italic">/api/*</code>).
             </p>
          </div>
        </div>
      )
    },
    {
      id: 'faker',
      title: "Dynamic Data",
      icon: Code,
      path: "/",
      content: "Inject randomized, realistic data using @faker-js integration.",
      details: (
        <div className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">Top 5 Common Placeholders:</p>
          <div className="space-y-2">
            {[
              { tag: "{{faker:person.fullName}}", desc: "Random full name" },
              { tag: "{{faker:internet.email}}", desc: "Unique email address" },
              { tag: "{{faker:string.uuid}}", desc: "Universal unique ID" },
              { tag: "{{faker:image.avatar}}", desc: "Profile picture URL" },
              { tag: "{{faker:location.city}}", desc: "Global city name" }
            ].map(f => (
              <div key={f.tag} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg border border-border text-[11px]">
                <code className="text-primary font-bold">{f.tag}</code>
                <span className="text-muted-foreground truncate ml-2 italic">{f.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground opacity-70 italic">
            Data is generated fresh at the time of the request.
          </p>
        </div>
      )
    },
    {
      id: 'matching',
      title: "Advanced Matching",
      icon: Layers,
      path: "/endpoints",
      content: "Return different responses for the same URL based on request metadata.",
      details: (
        <div className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add rules to match specific **Headers** or **Query Parameters**.
          </p>
          <div className="p-3 bg-muted/50 rounded-xl border border-border space-y-2">
            <div className="flex gap-2 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[11px] font-medium text-foreground">Header Match: <code className="text-primary font-mono font-bold">x-match: test</code></p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[11px] font-medium text-foreground">Query Match: <code className="text-primary font-mono font-bold">?role=admin</code></p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            The server first looks for any rule that matches perfectly before falling back to the default response.
          </p>
        </div>
      )
    }
  ];

  const statusCodes = [
    { code: 401, label: "Unauthorized", use: "Test sign-in redirects", color: "text-orange-500" },
    { code: 429, label: "Rate Limit", use: "Test request retries/cooldowns", color: "text-purple-500" },
    { code: 503, label: "Maintenance", use: "Verify fallback UI / Offline modes", color: "text-red-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="space-y-4 pt-4 border-b border-border/50 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
          <BookOpen size={12} />
          Developer Guide
        </div>
        <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
          Documentation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The MockFlow manual: From instantaneous deployment to complex dynamic matching.
        </p>
      </header>

      {/* GRID OF CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div 
            key={section.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className={cn(
              "p-6 bg-card border transition-all duration-300 cursor-pointer group",
              expandedSection === section.id 
                ? "border-primary ring-1 ring-primary/20 rounded-3xl z-10 scale-[1.02]" 
                : "border-border rounded-2xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                expandedSection === section.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-primary"
              )}>
                <section.icon size={24} />
              </div>
              <ChevronDown 
                size={20} 
                className={cn("text-muted-foreground transition-transform duration-500", expandedSection === section.id && "rotate-180 text-primary")} 
              />
            </div>
            
            <div className="mt-5">
              <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                {section.title}
                {expandedSection === section.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(section.path); }}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 hover:bg-primary hover:text-white transition-colors uppercase font-bold tracking-widest"
                  >
                    Open View <ArrowUpRight size={10} />
                  </button>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {section.details}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* STATUS CODE LEGEND */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldAlert size={14} className="text-primary" />
              Status Code Reference
            </h3>
          </div>
          <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border">
            {statusCodes.map(s => (
              <div key={s.code} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={cn("text-xl font-black font-mono w-12", s.color)}>{s.code}</span>
                  <div>
                    <h4 className="text-sm font-bold">{s.label}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.use}</p>
                  </div>
                </div>
                <Activity size={16} className="text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </div>

        {/* TRY IT BOX */}
        <div className="lg:col-span-12 xl:col-span-7">
          <div className="p-8 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col justify-between h-full group hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Terminal size={20} className="text-primary" />
                <h3 className="text-xl font-bold">Try Connectivity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Ready to test? Copy this <code className="bg-card px-1.5 rounded text-primary font-bold">curl</code> snippet and run it in your terminal to verify your deployment is responding correctly.
              </p>
              
              <div className="relative">
                <pre className="p-5 bg-card border border-border rounded-3xl font-mono text-sm overflow-x-auto text-primary/80 shadow-inner group-hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground">$</span> curl -X GET http://localhost:3000/mock/test-api
                </pre>
                <button 
                  onClick={copyCurl}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-muted hover:bg-primary hover:text-white rounded-2xl transition-all shadow-lg active:scale-95"
                  title="Copy command"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between text-[11px] text-muted-foreground px-2">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span>Server Status: Online</span>
               </div>
               <span>v1.0.0-beta</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform duration-500">
          <Info size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Enterprise Feedback & Support</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
            MockFlow is designed to evolve. If you're building complex team integrations, encountering specific bugs, or need custom UI branding, reach out via our GitHub repository or internal support channels.
          </p>
        </div>
      </div>
    </div>
  );
}
