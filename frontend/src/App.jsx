import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Endpoints from './pages/Endpoints';
import Documentation from './pages/Documentation';
import Settings from './pages/Settings';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ 
        className: 'bg-card border border-border text-foreground',
        duration: 3000
      }} />
      
      <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <Routes>
          <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
          <Route path="/endpoints" element={<Endpoints searchQuery={searchQuery} />} />
          <Route path="/history" element={<History />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;