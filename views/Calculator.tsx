
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Info, RefreshCw, Layers, Database, Sparkles } from 'lucide-react';
import { lookupChemicalProperties } from '../services/geminiService';
import { Reagent } from '../types';

const Calculator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reagent, setReagent] = useState<Reagent | null>(null);
  const [dataSource, setDataSource] = useState<'local' | 'ai' | null>(null);
  
  const [concentration, setConcentration] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [result, setResult] = useState<{ weight?: number; volume?: number } | null>(null);

  // 从本地数据库获取试剂数据
  const getLocalReagents = (): Reagent[] => {
    try {
      const stored = localStorage.getItem('chem_saved_reagents');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const handleLookup = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // 优先从本地数据库查找 - 支持模糊匹配
    const localReagents = getLocalReagents();
    const searchTerm = query.toLowerCase().replace(/浓|稀|无水|分析纯|化学纯/g, '').trim();
    
    const localMatch = localReagents.find(r => {
      const name = r.name.toLowerCase();
      // 精确匹配
      if (name.includes(query.toLowerCase())) return true;
      // 模糊匹配（去除浓/稀等前缀）
      if (name.includes(searchTerm) || searchTerm.includes(name.replace(/\s*\(.*\)/g, ''))) return true;
      // CAS 号匹配
      if (r.cas?.includes(query)) return true;
      return false;
    });
    
    if (localMatch) {
      setReagent(localMatch);
      setDataSource('local');
      setLoading(false);
      return;
    }
    
    // 本地未找到，调用 AI 检索
    try {
      const data = await lookupChemicalProperties(query);
      setReagent(data);
      setDataSource(data ? 'ai' : null);
    } catch (error) {
      console.error('AI lookup failed:', error);
      setReagent(null);
      setDataSource(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (reagent && concentration && volume) {
      const c = parseFloat(concentration); // M
      const v = parseFloat(volume); // mL
      const vInL = v / 1000;
      const weight = c * vInL * reagent.mw;
      
      let liquidVolume: number | undefined = undefined;
      if (reagent.density) {
        liquidVolume = weight / reagent.density;
      }
      
      setResult({ weight, volume: liquidVolume });
    } else {
      setResult(null);
    }
  }, [reagent, concentration, volume]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">智能计算工具箱</h2>
        <RefreshCw className="w-5 h-5 text-emerald-500" />
      </div>

      {/* 功能说明卡片 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-emerald-800 space-y-1">
            <p className="font-bold">溶液配制计算器</p>
            <p className="text-emerald-600">输入试剂名称自动获取分子量和密度，计算配制指定浓度溶液所需的称量质量或量取体积。</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        {/* Step 1: Lookup */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">1. 试剂参数检索</label>
          <p className="text-[10px] text-slate-400 mb-2">从本地数据库 (107种) 或 AI 检索试剂的分子量、密度等物化参数</p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="输入试剂名称或 CAS 号..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button
              onClick={handleLookup}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {reagent && (
          <div className={`flex items-center justify-between p-4 rounded-2xl border animate-in fade-in ${dataSource === 'local' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {dataSource === 'local' ? (
                  <><Database className="w-3 h-3 text-emerald-600" /><p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">本地数据库</p></>
                ) : (
                  <><Sparkles className="w-3 h-3 text-indigo-600" /><p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">AI 检索</p></>
                )}
              </div>
              <p className="text-sm font-black text-slate-800">{reagent.name}</p>
              {reagent.cas && <p className="text-[10px] text-slate-400 font-bold">CAS: {reagent.cas}</p>}
            </div>
            <div className="text-right">
              <p className={`text-[10px] font-bold ${dataSource === 'local' ? 'text-emerald-600' : 'text-indigo-600'}`}>MW: {reagent.mw} g/mol</p>
              {reagent.density && <p className={`text-[10px] font-bold ${dataSource === 'local' ? 'text-emerald-600' : 'text-indigo-600'}`}>ρ: {reagent.density} g/mL</p>}
              {reagent.mp && <p className={`text-[10px] font-bold ${dataSource === 'local' ? 'text-emerald-600' : 'text-indigo-600'}`}>mp: {reagent.mp}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Inputs */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">2. 输入目标参数</label>
          <p className="text-[10px] text-slate-400 mb-2">设置需要配制的溶液浓度和体积</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">目标浓度 (M)</label>
              <input
                type="number"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                placeholder="如: 0.1"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">目标体积 (mL)</label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="如: 100"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl animate-in zoom-in">
            <div className="flex items-center space-x-2 mb-4 opacity-50">
              <Layers className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">称量/量取建议</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">如果是固体 (质量)</p>
                <p className="text-3xl font-black text-emerald-400">
                  {result.weight?.toFixed(4)} <span className="text-sm font-normal text-white/50">g</span>
                </p>
              </div>
              
              {result.volume && (
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">如果是液体 (体积)</p>
                  <p className="text-3xl font-black text-sky-400">
                    {result.volume?.toFixed(4)} <span className="text-sm font-normal text-white/50">mL</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center text-[9px] text-white/40 italic">
              <Info className="w-3 h-3 mr-1.5" /> 自动同步知识库物理常数进行计算
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
