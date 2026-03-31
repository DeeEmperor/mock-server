import { Settings as SettingsIcon, Shield, Sliders, Database, Save, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const saveSettings = () => {
    toast.success("Settings updated successfully");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <header>
        <h2 className="text-3xl font-extrabold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your project configuration and server preferences.</p>
      </header>

      <div className="space-y-6">
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
            <Activity size={18} className="text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Server Configuration</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Base URL</p>
                <p className="text-xs text-muted-foreground">The public URL where your mocks are served.</p>
              </div>
              <code className="bg-muted px-2 py-1 rounded text-xs font-mono">http://localhost:3000/mock</code>
            </div>
            <div className="h-[1px] bg-border" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Request Retention</p>
                <p className="text-xs text-muted-foreground">How long to keep request logs in history.</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">Last 100 Logs</span>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm opacity-60 grayscale-[0.5]">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
            <Shield size={18} className="text-muted-foreground" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Authentication (Pro)</h3>
          </div>
          <div className="p-10 text-center space-y-2">
             <Sliders className="mx-auto text-muted-foreground mb-2" size={32} />
             <h4 className="font-bold">Upgrade to unlock security</h4>
             <p className="text-xs text-muted-foreground max-w-xs mx-auto">
               Secure your dashboard with JWT and multi-tenant support.
             </p>
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 text-sm font-medium hover:bg-muted rounded-xl transition-colors">Discard</button>
        <button 
          onClick={saveSettings}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
