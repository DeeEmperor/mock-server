import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function NavItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon size={18} className={cn(
        "transition-transform group-hover:scale-110",
        active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
      )} />
      {label}
    </button>
  );
}

export function MockAction({ icon: Icon, onClick, danger = false, highlight = false, tooltip }) {
  return (
    <div className="relative group/action">
      <button 
        onClick={onClick}
        className={cn(
          "p-2.5 rounded-xl border border-border bg-background transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm",
          danger 
            ? "hover:border-red-500/50 hover:bg-red-500 hover:text-white" 
            : highlight
              ? "border-orange-500 bg-orange-500/10 text-orange-600 shadow-orange-500/20"
              : "hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        )}
      >
        <Icon size={18} />
      </button>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  );
}
