
import React, { useState } from 'react';
import { ModuleType } from './types';
import Layout from './components/Layout';
import Home from './views/Home';
import ELN from './views/ELN';
import Calculator from './views/Calculator';
import MSDS from './views/MSDS';
import LibraryView from './views/Library';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.HOME);

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.HOME:
        return <Home onNavigate={setActiveModule} />;
      case ModuleType.LIBRARY:
        return <LibraryView />;
      case ModuleType.CALCULATOR:
        return <Calculator />;
      case ModuleType.ELN:
        return <ELN />;
      case ModuleType.SAFETY:
        return <MSDS />;
      default:
        return <Home onNavigate={setActiveModule} />;
    }
  };

  return (
    <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
      {renderContent()}
    </Layout>
  );
};

export default App;
