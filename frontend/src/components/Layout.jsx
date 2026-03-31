import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  Globe, 
  BookOpen, 
  Settings, 
  Clock, 
  PlusCircle, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { NavItem } from './UI';
import { cn } from './UI';

export default function Layout({ children, searchQuery, setSearchQuery }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Globe, label: "Endpoints", path: "/endpoints" },
    { icon: Clock, label: "History", path: "/history" },
    { icon: BookOpen, label: "Documentation", path: "/docs" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Activity size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">MockFlow</span>
            </div>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                <NavItem 
                  icon={item.icon} 
                  label={item.label} 
                  active={location.pathname === item.path} 
                />
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-border mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="text-xs font-bold">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Dave's Project</p>
                <p className="text-xs text-muted-foreground truncate">v1.0.0-beta</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search mocks by path or method..."
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hidden sm:block">
              <Clock size={20} />
            </button>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <Link to="/">
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:translate-y-0">
                <PlusCircle size={18} />
                <span>Deploy New</span>
              </button>
            </Link>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
