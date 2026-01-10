
import React, { useState } from 'react';
import { 
  Search, ShieldAlert, AlertTriangle, Loader2, CheckCircle2, 
  ClipboardCheck, Thermometer, Wind, UserCheck, ChevronRight,
  Info, Sparkles, FileText, CheckCircle, AlertCircle
} from 'lucide-react';
import { getSafetyDetails, checkCompatibility } from '../services/geminiService';
import { getLocalSafetyInfo } from '../data/safetyDb';
import { SafetyInfo, SafetySummary } from '../types';

const MSDS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chemical' | 'assessment'>('chemical');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo | null>(null);
  
  // Reagent compatibility check
  const [reagentsForCheck, setReagentsForCheck] = useState<string>('');
  const [compatWarning, setCompatWarning] = useState<string | null>(null);
  const [safetySummary, setSafetySummary] = useState<SafetySummary | null>(null);
  const [checkingCompat, setCheckingCompat] = useState(false);
  const [batchSafetyInfoList, setBatchSafetyInfoList] = useState<SafetyInfo[]>([]);

  // Student Self-Assessment State
  const [experimentDesc, setExperimentDesc] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    risks: string[];
    suggestions: string[];
  } | null>(null);

  const [checklist, setChecklist] = useState({
    ppe: false,
    ventilation: false,
    disposal: false,
    backup: false
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // 优先从本地数据库获取
    const localData = getLocalSafetyInfo(query);
    if (localData) {
      setSafetyInfo(localData);
      setLoading(false);
      return;
    }

    // 本地没有则调用 AI
    const data = await getSafetyDetails(query);
    setSafetyInfo(data);
    setLoading(false);
  };

  const handleCompatCheck = async () => {
    const list = reagentsForCheck.split(/[,，、\n]/).map(s => s.trim()).filter(s => s.length > 0);
    if (list.length < 1) return;
    setCheckingCompat(true);
    setBatchSafetyInfoList([]);
    setCompatWarning(null);
    setSafetySummary(null);

    // 批量获取每个试剂的安全信息
    const safetyResults: SafetyInfo[] = [];
    for (const reagent of list) {
      const localData = getLocalSafetyInfo(reagent);
      if (localData) {
        safetyResults.push(localData);
      } else {
        try {
          const aiData = await getSafetyDetails(reagent);
          if (aiData) safetyResults.push(aiData);
        } catch (e) {
          console.error(`获取 ${reagent} 安全信息失败`, e);
        }
      }
    }
    setBatchSafetyInfoList(safetyResults);

    // 如果有多个试剂，检查混合风险并生成总结报告
    if (list.length >= 2) {
      try {
        const result = await checkCompatibility(list);
        if (result) {
          setCompatWarning(result.warning || null);
          if (result.summary) {
            setSafetySummary(result.summary);
          }
        }
      } catch (e) {
        console.error('混合风险检查失败', e);
      }
    }
    setCheckingCompat(false);
  };

  const handleExperimentAssessment = () => {
    if (!experimentDesc.trim()) return;
    setIsAssessing(true);
    // 模拟 AI 对实验场景的逻辑分析
    setTimeout(() => {
      setAssessmentResult({
        score: 85,
        risks: ['高温下有机溶剂挥发', '反应可能产生酸性气体'],
        suggestions: ['必须在通风橱内操作', '准备好饱和碳酸氢钠溶液用于应急中和', '检查冷却水循环是否畅通']
      });
      setIsAssessing(false);
    }, 1500);
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">安全防护中心</h2>
        <ShieldAlert className="w-6 h-6 text-rose-500" />
      </div>

      {/* 顶部 Tab 切换 */}
      <div className="flex p-1 bg-slate-200 rounded-xl">
        <button
          onClick={() => setActiveTab('chemical')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'chemical' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          药剂安全与禁忌
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'assessment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          实验方案自评 (学生版)
        </button>
      </div>

      {activeTab === 'chemical' ? (
        <div className="space-y-6">
          {/* MSDS Search */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">即时 MSDS 危害速查</h3>
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索试剂名称或 CAS 号..."
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 disabled:opacity-50 transition-all shadow-lg shadow-rose-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            {safetyInfo && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div className="p-5 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-xl font-black">{safetyInfo.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {safetyInfo.ghsSignals.map((sig, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                  <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-rose-50/50 p-5 rounded-[2rem] border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-2" /> 核心危害
                    </p>
                    <ul className="text-sm text-rose-900 font-bold space-y-2">
                      {safetyInfo.hazards.map((h, i) => <li key={i} className="flex items-start"><ChevronRight className="w-3 h-3 mt-1 mr-1 flex-shrink-0" /> {h}</li>)}
                    </ul>
                  </div>
                  <div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> 应急与防护
                    </p>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                      {safetyInfo.precautions}
                    </p>
                  </div>
                </div>

                {/* 扩展安全维度：环境、人员、设备 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {safetyInfo.environmentalImpact && (
                    <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center">
                        <Wind className="w-3.5 h-3.5 mr-2" /> 环境污染与处置
                      </p>
                      <p className="text-xs text-blue-900 leading-relaxed font-medium">
                        {safetyInfo.environmentalImpact}
                      </p>
                    </div>
                  )}
                  {safetyInfo.personnelSafety && (
                    <div className="bg-amber-50/50 p-5 rounded-[2rem] border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-2" /> 人员防护要点
                      </p>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">
                        {safetyInfo.personnelSafety}
                      </p>
                    </div>
                  )}
                  {safetyInfo.equipmentSafety && (
                    <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-200">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                        <Thermometer className="w-3.5 h-3.5 mr-2" /> 仪器设备注意事项
                      </p>
                      <p className="text-xs text-slate-900 leading-relaxed font-medium">
                        {safetyInfo.equipmentSafety}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Compatibility Check */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">AI 混合禁忌评估</h3>
            <textarea
              rows={3}
              value={reagentsForCheck}
              onChange={(e) => setReagentsForCheck(e.target.value)}
              placeholder="输入多个试剂（如：乙醇, 浓硝酸），AI 将分析它们混合后的反应风险。"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none mb-4 resize-none"
            />
            <button
              onClick={handleCompatCheck}
              disabled={checkingCompat || reagentsForCheck.length < 3}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-[0.98] shadow-xl"
            >
              {checkingCompat ? "正在检索化学反应数据库..." : "评估安全性"}
            </button>

            {compatWarning && (
              <div className="mt-5 p-6 bg-rose-50 border-2 border-rose-200 rounded-[2.5rem] text-rose-900 animate-in zoom-in">
                <div className="flex items-start">
                  <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg mr-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-lg mb-1 leading-tight">高危混合预警</p>
                    <p className="text-sm leading-relaxed font-medium">{compatWarning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 评估总结报告区域 */}
            {safetySummary && (
              <div className="mt-6 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-500 rounded-xl">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black tracking-tight">🧪 试剂安全评估总结报告</h4>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center">
                      <Wind className="w-3.5 h-3.5 mr-2" /> 1. 环境污染与处置 (Environmental Impact)
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium pl-5.5 border-l-2 border-blue-500/30">
                      {safetySummary.environmental}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center">
                      <UserCheck className="w-3.5 h-3.5 mr-2" /> 2. 人员防护 (Personnel Safety)
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium pl-5.5 border-l-2 border-amber-500/30">
                      {safetySummary.personnel}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                      <Thermometer className="w-3.5 h-3.5 mr-2" /> 3. 仪器设备注意事项 (Equipment Safety)
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium pl-5.5 border-l-2 border-slate-500/30">
                      {safetySummary.equipment}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    <Info className="w-3 h-3 inline mr-1" /> 基于标准实验室安全协议生成
                  </p>
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* 批量试剂安全信息展示 */}
            {batchSafetyInfoList.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">各试剂安全详情</h4>
                {batchSafetyInfoList.map((info, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-slate-800">{info.name}</h5>
                      <div className="flex flex-wrap gap-1">
                        {info.ghsSignals.map((sig, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full">
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {info.environmentalImpact && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-[9px] font-black text-blue-500 uppercase mb-1 flex items-center">
                            <Wind className="w-3 h-3 mr-1" /> 环境
                          </p>
                          <p className="text-[11px] text-blue-900 leading-relaxed">{info.environmentalImpact}</p>
                        </div>
                      )}
                      {info.personnelSafety && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-[9px] font-black text-amber-600 uppercase mb-1 flex items-center">
                            <UserCheck className="w-3 h-3 mr-1" /> 人员
                          </p>
                          <p className="text-[11px] text-amber-900 leading-relaxed">{info.personnelSafety}</p>
                        </div>
                      )}
                      {info.equipmentSafety && (
                        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                          <p className="text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center">
                            <Thermometer className="w-3 h-3 mr-1" /> 设备
                          </p>
                          <p className="text-[11px] text-slate-700 leading-relaxed">{info.equipmentSafety}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Assessment Tab (NEW STUDENT FEATURE) */
        <div className="space-y-6 animate-in fade-in">
          {/* Step 1: Checklist */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">实验前安全自查清单 (Checklist)</h3>
             <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'ppe', label: '防护佩戴齐全', icon: UserCheck },
                  { key: 'ventilation', label: '通风设施开启', icon: Wind },
                  { key: 'disposal', label: '预备废液容器', icon: CheckCircle2 },
                  { key: 'backup', label: '急救装置可用', icon: ShieldAlert }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => toggleCheck(item.key as any)}
                    className={`flex items-center p-4 rounded-2xl border transition-all ${
                      checklist[item.key as keyof typeof checklist] 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' 
                      : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mr-3 ${checklist[item.key as keyof typeof checklist] ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="text-xs font-black">{item.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Step 2: Protocol Input */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">实验方案与环境评估</h3>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md flex items-center">
                   <Sparkles className="w-3 h-3 mr-1" /> AI 智囊分析
                </span>
             </div>
             <textarea
               rows={4}
               value={experimentDesc}
               onChange={(e) => setExperimentDesc(e.target.value)}
               placeholder="描述您的实验操作，例如：'在 50mL 圆底烧瓶中加入 10mL 乙醇和 5g 无水碳酸钾，100℃ 加热回流 2 小时。'"
               className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4 resize-none text-sm font-medium"
             />
             <button
               onClick={handleExperimentAssessment}
               disabled={isAssessing || experimentDesc.length < 10}
               className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 transition-all active:scale-[0.98]"
             >
               {isAssessing ? "正在评估实验风险..." : "生成安全风险报告"}
             </button>
          </div>

          {/* Results: Safety Report */}
          {assessmentResult && (
            <div className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-2xl shadow-indigo-100/50 overflow-hidden animate-in zoom-in">
               <div className="p-8 bg-indigo-600 text-white flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">实验风险评估报告</h4>
                    <p className="text-[10px] font-bold text-indigo-200 mt-1 uppercase tracking-widest">Digital Safety Certificate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black">{assessmentResult.score}</div>
                    <div className="text-[9px] font-black uppercase opacity-60">安全评分</div>
                  </div>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3 flex items-center">
                       <AlertCircle className="w-3.5 h-3.5 mr-2" /> 潜在风险点 (Risks)
                    </h5>
                    <div className="space-y-2">
                       {assessmentResult.risks.map((risk, i) => (
                         <div key={i} className="p-3 bg-rose-50 text-rose-900 text-xs font-bold rounded-xl border border-rose-100 flex items-center">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-3" /> {risk}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center">
                       <ClipboardCheck className="w-3.5 h-3.5 mr-2" /> 安全操作建议 (Suggestions)
                    </h5>
                    <div className="space-y-2">
                       {assessmentResult.suggestions.map((sug, i) => (
                         <div key={i} className="p-3 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-3" /> {sug}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex space-x-3">
                     <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 mr-2" /> 保存为 PDF
                     </button>
                     <button onClick={() => setAssessmentResult(null)} className="px-5 py-3 border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase">
                        重新评估
                     </button>
                  </div>
               </div>
            </div>
          )}

          {!assessmentResult && !isAssessing && (
            <div className="text-center py-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Info className="w-3 h-3 inline mr-1" /> 请确保 Checklist 全部勾选后再开始评估
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MSDS;
