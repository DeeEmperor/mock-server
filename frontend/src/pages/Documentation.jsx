import { BookOpen, Code, Terminal, Zap, Info, ChevronRight, Globe, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      icon: Zap,
      content: "MockFlow allows you to create instant API endpoints for frontend development. Simply define a path, choose a method, and provide a JSON response."
    },
    {
      title: "Wildcard Routes",
      icon: Globe,
      content: "You can use * to match any subpath. For example, /api/* matches /api/users, /api/posts, etc."
    },
    {
      title: "Dynamic Data (Faker.js)",
      icon: Code,
      content: "Inject randomized data into your responses using placeholders like {{faker:person.fullName}}, {{faker:internet.email}}, or {{faker:image.avatar}}."
    },
    {
      title: "Advanced Matching",
      icon: Layers,
      content: "Create multiple responses for the same path by adding matching rules for specific Headers or Query Parameters."
    },
    {
      title: "Request History",
      icon: Terminal,
      content: "Monitor all incoming traffic in real-time in the History tab. See detailed headers, bodies, and query strings for every request."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <header className="space-y-4 text-center md:text-left">
        <h2 className="text-4xl font-extrabold tracking-tight">Documentation</h2>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Everything you need to know about building, testing, and mocking your APIs with MockFlow.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card border border-border rounded-2xl shadow-lg shadow-foreground/5 hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <section.icon size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2 flex items-center justify-between">
              {section.title}
              <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-muted/20 border border-border rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 animate-pulse">
          <Info size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Need specialized help?</h3>
          <p className="text-muted-foreground text-sm">
            MockFlow is designed for speed. If you encounter bugs or need custom integrations, feel free to modify the backend in <code className="bg-card px-1 rounded">server.js</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
