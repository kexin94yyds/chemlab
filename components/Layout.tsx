
import React from 'react';
import { ModuleType } from '../types';
import { Beaker, BookOpen, Calculator, ShieldAlert, Library, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeModule, setActiveModule }) => {
  const navItems = [
    { type: ModuleType.HOME, icon: Home, label: '概览' },
    { type: ModuleType.LIBRARY, icon: Library, label: '知识库' },
    { type: ModuleType.CALCULATOR, icon: Calculator, label: '计算' },
    { type: ModuleType.ELN, icon: BookOpen, label: '实验记录' },
    { type: ModuleType.SAFETY, icon: ShieldAlert, label: '安全预警' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Beaker className="w-8 h-8 text-indigo-200" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-none">ChemLab 智囊</h1>
              <span className="text-[10px] text-indigo-200/70 mt-1 uppercase tracking-widest font-bold">Research Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 mb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveModule(item.type)}
              className={`flex flex-col items-center flex-1 p-2 rounded-xl transition-all ${
                activeModule === item.type
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-400 hover:text-indigo-500'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeModule === item.type ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-bold mt-1.5">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
