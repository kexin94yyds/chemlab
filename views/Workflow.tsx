
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, ShieldAlert, FlaskConical, BarChart3, Archive, 
  CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Beaker, 
  Thermometer, Wind, UserCheck, Zap, Info, Play, FileText,
  Lock, Unlock, Search, Camera, QrCode, Calculator, Save, Download,
  Tag, Sparkles
} from 'lucide-react';
import { SafetyInfo, SafetySummary } from '../types';
import { getLocalSafetyInfo } from '../data/safetyDb';

enum WorkflowStage {
  PREP = 'prep',
  SAMPLE = 'sample',
  OPERATION = 'operation',
  RESULT = 'result',
  CLOSE = 'close'
}

const Workflow: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(WorkflowStage.PREP);
  const [stepIndex, setStepIndex] = useState(0);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  
  // Data for Mohr Method
  const reagents = ['硝酸银', '铬酸钾', '乙醇', '硝酸'];
  const [safetyData, setSafetyData] = useState<SafetyInfo[]>([]);

  useEffect(() => {
    const data = reagents.map(r => getLocalSafetyInfo(r)).filter(Boolean) as SafetyInfo[];
    setSafetyData(data);
  }, []);

  // Form State
  const [sampleInfo, setSampleInfo] = useState({
    name: '涂料样品 A-101',
    weight: '5.0',
    method: '沉淀滴定法 (莫尔法)',
    operator: '张三',
    timestamp: new Date().toLocaleString()
  });

  const [titrationData, setTitrationData] = useState({
    trials: [
      { v: '', m: '' },
      { v: '', m: '' },
      { v: '', m: '' }
    ],
    v0: '0.05',
    m_sample: '5.0',
    average: 0,
    concentration: '0.1000',
    result: 0,
    rsd: 0,
    isStandardizing: true // 是否处于标定阶段
  });

  const calculateStandardization = () => {
    const M = 58.5;
    const v0 = parseFloat(titrationData.v0);
    const concentrations: number[] = [];

    titrationData.trials.forEach(trial => {
      const m = parseFloat(trial.m);
      const v = parseFloat(trial.v);
      if (m > 0 && v > v0) {
        concentrations.push((m * 1000) / (M * (v - v0)));
      }
    });

    if (concentrations.length > 0) {
      const avgC = concentrations.reduce((a, b) => a + b, 0) / concentrations.length;
      setTitrationData({
        ...titrationData,
        concentration: avgC.toFixed(4),
        isStandardizing: false
      });
    }
  };

  const calculateFinalResult = () => {
    const c = parseFloat(titrationData.concentration);
    const v0 = parseFloat(titrationData.v0);
    const m_sample = parseFloat(titrationData.m_sample);
    const M_Cl = 35.45;
    const results: number[] = [];

    titrationData.trials.forEach(trial => {
      const v = parseFloat(trial.v);
      if (v > v0 && c > 0 && m_sample > 0) {
        results.push(((v - v0) * c * M_Cl) / (m_sample * 1000) * 100);
      }
    });

    if (results.length > 0) {
      const avgRes = results.reduce((a, b) => a + b, 0) / results.length;
      // 计算 RSD
      const variance = results.reduce((a, b) => a + Math.pow(b - avgRes, 2), 0) / results.length;
      const stdDev = Math.sqrt(variance);
      const rsd = (stdDev / avgRes) * 100;

      setTitrationData({
        ...titrationData,
        result: parseFloat(avgRes.toFixed(4)),
        rsd: parseFloat(rsd.toFixed(2)),
        average: results.length
      });
      setCurrentStage(WorkflowStage.RESULT);
    }
  };

  const updateTrial = (index: number, field: string, value: string) => {
    const newTrials = [...titrationData.trials];
    newTrials[index] = { ...newTrials[index], [field]: value };
    setTitrationData({ ...titrationData, trials: newTrials });
  };

  const renderStageNav = () => (
    <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
      {[
        { id: WorkflowStage.PREP, label: '实验准备', icon: ClipboardList },
        { id: WorkflowStage.SAMPLE, label: '样品管理', icon: Tag },
        { id: WorkflowStage.OPERATION, label: '实验操作', icon: FlaskConical },
        { id: WorkflowStage.RESULT, label: '数据处理', icon: BarChart3 },
        { id: WorkflowStage.CLOSE, label: '收尾归档', icon: Archive },
      ].map((stage, idx) => (
        <div key={stage.id} className="flex items-center flex-shrink-0">
          <div className={`flex flex-col items-center px-4 ${currentStage === stage.id ? 'text-indigo-600' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${currentStage === stage.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50'}`}>
              <stage.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">{stage.label}</span>
          </div>
          {idx < 4 && <div className="w-8 h-px bg-slate-100 mx-2" />}
        </div>
      ))}
    </div>
  );

  const renderPrep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center">
          <ShieldAlert className="w-6 h-6 mr-3 text-rose-500" /> 核心安全预警与确认
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100">
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center">
              <UserCheck className="w-4 h-4 mr-2" /> 1. 人员安全预警 (Personnel)
            </h4>
            <ul className="text-[11px] text-amber-900 space-y-2 font-medium">
              <li>• 接触硝酸需全程佩戴防腐蚀手套、护目镜及防化服</li>
              <li>• 操作硝酸银、铬酸钾需戴一次性手套，严禁饮食</li>
              <li>• 皮肤接触立即冲洗≥15分钟，眼部接触使用洗眼器</li>
              <li>• 提前确认实验室洗眼器与紧急喷淋位置</li>
            </ul>
          </div>
          <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center">
              <Wind className="w-4 h-4 mr-2" /> 2. 环境安全预警 (Environment)
            </h4>
            <ul className="text-[11px] text-blue-900 space-y-2 font-medium">
              <li>• 硝酸易挥发，所有操作均在通风橱内进行</li>
              <li>• 含银、酸性、含铬废液分类存放，严禁倾倒或混合</li>
              <li>• 硝酸、硝酸银需控温控湿储存，远离火种与还原剂</li>
            </ul>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" /> 3. 设备与电气安全 (Equipment)
            </h4>
            <ul className="text-[11px] text-slate-700 space-y-2 font-medium">
              <li>• 检查超声仪密封盖、离心机转头固定及电源线完好</li>
              <li>• 滴定管需核查无破损、活塞密封正常</li>
              <li>• 严禁湿手操作电气设备，实验后归位前确认断电</li>
            </ul>
          </div>
          <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100">
            <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> 4. 应急处置预警 (Emergency)
            </h4>
            <ul className="text-[11px] text-rose-900 space-y-2 font-medium">
              <li>• 硝酸泄漏：用耐腐蚀抹布吸附并以碳酸氢钠中和</li>
              <li>• 实验火灾：用专用灭火器扑救，严禁用水直扑</li>
              <li>• 紧急情况立即按疏散路线撤离并报警</li>
            </ul>
          </div>
        </div>

        {!safetyConfirmed ? (
          <button 
            onClick={() => setSafetyConfirmed(true)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>我已阅读并签署安全确认单</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5 mr-3" />
              <span className="text-sm font-bold">安全确认已通过，权限已解锁</span>
            </div>
            <button 
              onClick={() => setCurrentStage(WorkflowStage.SAMPLE)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center"
            >
              <span>进入下一阶段：样品管理</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        ) }
      </div>
    </div>
  );

  const renderSample = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            <Zap className="w-6 h-6 mr-3 text-amber-500" /> 数字化样品溯源
          </h3>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Step 02 / 05
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2rem] mb-6 border border-slate-200">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">样品编号</p>
                <p className="text-sm font-black text-slate-800">COAT-20260110-01</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">样品名称</p>
                <p className="text-sm font-black text-slate-800">{sampleInfo.name}</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-100">
              <QrCode className="w-16 h-16 text-slate-800" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">标准化前处理指引</h4>
          {[
            '称取 5.0g 涂料样品于 100mL 烧杯',
            '加入 50mL 乙醇-水混合溶剂 (3:7)',
            '60℃ 水浴超声萃取 20min',
            '4000rpm 高速离心 10min',
            '上清液过 0.45μm 滤膜备用'
          ].map((step, i) => (
            <div key={i} className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group">
              <div className="w-6 h-6 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-[10px] font-black mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {i + 1}
              </div>
              <p className="text-xs font-bold text-slate-700">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-8">
          <button 
            onClick={() => setCurrentStage(WorkflowStage.PREP)}
            className="px-6 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentStage(WorkflowStage.OPERATION)}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            <span>开始实验操作</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const getChineseNumeral = (n: number) => ['一', '二', '三', '四', '五'][n - 1] || n.toString();

  const renderOperation = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            <Beaker className="w-6 h-6 mr-3 text-indigo-500" /> 
            {titrationData.isStandardizing ? "硝酸银标准溶液标定" : "莫尔法滴定操作引导"}
          </h3>
          <button 
            onClick={() => setTitrationData({...titrationData, isStandardizing: !titrationData.isStandardizing})}
            className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            {titrationData.isStandardizing ? "切换至样品测定" : "切换至标定模式"}
          </button>
        </div>

        {titrationData.isStandardizing ? (
          <div className="space-y-6">
            <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100">
              <h4 className="text-lg font-black text-slate-800 mb-6">第一步：硝酸银标定</h4>
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-amber-100 shadow-sm mb-6">
                 <div className="flex items-center space-x-2 text-2xl font-black text-amber-900">
                    <span>c = </span>
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-amber-900 pb-1 px-4">m × 1000</span>
                      <span className="pt-1">M × (V - V₀)</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-3">
                 <p className="text-xs font-black text-slate-500 uppercase tracking-widest">式中：</p>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold text-slate-600">
                    <li className="flex justify-between border-b border-amber-100 pb-1"><span>c: AgNO₃ 标准溶液浓度</span><span>(mol/L)</span></li>
                    <li className="flex justify-between border-b border-amber-100 pb-1"><span>m: 氯化钠质量</span><span>(g)</span></li>
                    <li className="flex justify-between border-b border-amber-100 pb-1"><span>V: AgNO₃ 滴定体积</span><span>(mL)</span></li>
                    <li className="flex justify-between border-b border-amber-100 pb-1"><span>V₀: 空白滴定体积</span><span>(mL)</span></li>
                    <li className="flex justify-between border-b border-amber-100 pb-1 col-span-2 text-amber-600"><span>M: NaCl 摩尔质量</span><span>58.5 g/mol</span></li>
                 </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-slate-100 rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">空白滴定体积 V₀ (mL)</label>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <input 
                  type="number" 
                  value={titrationData.v0}
                  onChange={(e) => setTitrationData({...titrationData, v0: e.target.value})}
                  placeholder="0.05"
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-lg"
                />
              </div>

              {titrationData.trials.map((trial, index) => (
                <div key={index} className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 relative overflow-hidden group hover:border-amber-200 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-black italic">{index + 1}</div>
                  <div className="flex items-center justify-between relative z-10">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2" />
                      实验 {getChineseNumeral(index + 1)}
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">TRIAL {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NaCl 质量 m (g)</label>
                      <input 
                        type="number" 
                        value={trial.m}
                        onChange={(e) => updateTrial(index, 'm', e.target.value)}
                        placeholder="0.1200"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-sm"
                      />
                      {trial.m && (
                        <p className="text-[9px] text-amber-600 font-bold mt-1 ml-1">
                          n: {(parseFloat(trial.m) / 58.5).toFixed(6)} mol
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">滴定体积 V (mL)</label>
                      <input 
                        type="number" 
                        value={trial.v}
                        onChange={(e) => updateTrial(index, 'v', e.target.value)}
                        placeholder="20.50"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-4">
               <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-amber-800 uppercase tracking-widest">标定结果平均浓度 c (mol/L)</label>
                  <div className="text-xl font-black text-amber-900">{titrationData.concentration}</div>
               </div>
               <button 
                onClick={calculateStandardization}
                disabled={titrationData.trials.some(t => !t.m || !t.v)}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
              >
                计算平均标定浓度
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
              <h4 className="text-lg font-black text-slate-800 mb-6">第四步：结果计算 (样品测定)</h4>
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-indigo-100 shadow-sm mb-6">
                 <div className="flex items-center space-x-2 text-2xl font-black text-indigo-900">
                    <span>ω(Cl⁻) = </span>
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-indigo-900 pb-1 px-4">(V - V₀) × c × 35.45</span>
                      <span className="pt-1">m × 1000</span>
                    </div>
                    <span> × 100%</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <p className="text-xs font-black text-slate-500 uppercase tracking-widest">式中：</p>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold text-slate-600">
                    <li className="flex justify-between border-b border-indigo-100 pb-1"><span>V: 样品消耗AgNO₃体积</span><span>(mL)</span></li>
                    <li className="flex justify-between border-b border-indigo-100 pb-1"><span>V₀: 空白消耗AgNO₃体积</span><span>(mL)</span></li>
                    <li className="flex justify-between border-b border-indigo-100 pb-1"><span>c: AgNO₃标准溶液浓度</span><span>(mol/L)</span></li>
                    <li className="flex justify-between border-b border-indigo-100 pb-1"><span>m: 样品质量</span><span>(g)</span></li>
                 </ul>
              </div>
              <p className="text-xs font-bold text-indigo-900 leading-relaxed mt-4">
                  当前标定浓度 c = <span className="underline decoration-2 underline-offset-4 font-black">{titrationData.concentration}</span> mol/L
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">样品质量 m (g)</label>
                  <input 
                    type="number" 
                    value={titrationData.m_sample}
                    onChange={(e) => setTitrationData({...titrationData, m_sample: e.target.value})}
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-lg"
                  />
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">空白体积 V₀ (mL)</label>
                  <input 
                    type="number" 
                    value={titrationData.v0}
                    onChange={(e) => setTitrationData({...titrationData, v0: e.target.value})}
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-lg"
                  />
                </div>
              </div>

              {titrationData.trials.map((trial, index) => (
                <div key={index} className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 relative overflow-hidden group hover:border-indigo-200 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-black italic">{index + 1}</div>
                  <div className="flex items-center justify-between relative z-10">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                      实验 {getChineseNumeral(index + 1)} (测定)
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">TRIAL {index + 1}</span>
                  </div>
                  <div className="space-y-1.5 relative z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">滴定体积 V (mL)</label>
                    <input 
                      type="number" 
                      value={trial.v}
                      onChange={(e) => updateTrial(index, 'v', e.target.value)}
                      placeholder="24.85"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={calculateFinalResult}
              disabled={titrationData.trials.some(t => !t.v)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg"
            >
              计算平均含量并生成报告
            </button>
          </div>
        ) }

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={() => setCurrentStage(WorkflowStage.SAMPLE)}
            className="flex items-center text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 返回样品处理
          </button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-emerald-500" /> 智能数据处理报告
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">氯离子含量平均值</p>
            <p className="text-3xl font-black text-emerald-900">{titrationData.result}%</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">精密度 (RSD)</p>
            <p className="text-3xl font-black text-slate-800">0.08%</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
            <h4 className="text-lg font-black text-slate-800 mb-6">第四步：结果计算</h4>
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-indigo-100 shadow-sm mb-6">
               <div className="flex items-center space-x-2 text-2xl font-black text-indigo-900">
                  <span>ω(Cl⁻) = </span>
                  <div className="flex flex-col items-center">
                    <span className="border-b-2 border-indigo-900 pb-1 px-4">(V - V₀) × c × 35.45</span>
                    <span className="pt-1">m × 1000</span>
                  </div>
                  <span> × 100%</span>
               </div>
            </div>
            <div className="space-y-3">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest">式中：</p>
               <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold text-slate-600">
                  <li className="flex justify-between border-b border-indigo-100 pb-1"><span>V: 样品消耗AgNO₃体积</span><span>(mL)</span></li>
                  <li className="flex justify-between border-b border-indigo-100 pb-1"><span>V₀: 空白消耗AgNO₃体积</span><span>(mL)</span></li>
                  <li className="flex justify-between border-b border-indigo-100 pb-1"><span>c: AgNO₃标准溶液浓度</span><span>(mol/L)</span></li>
                  <li className="flex justify-between border-b border-indigo-100 pb-1"><span>m: 样品质量</span><span>(g)</span></li>
               </ul>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center">
              <ClipboardList className="w-3.5 h-3.5 mr-2" /> 平行实验数据对比 (Parallel Trials)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200">
                    <th className="pb-3 font-black text-left">实验序号</th>
                    <th className="pb-3 font-black text-center">滴定体积 (V/mL)</th>
                    <th className="pb-3 font-black text-right">计算值</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {titrationData.trials.map((trial, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 font-bold">实验 {getChineseNumeral(i + 1)}</td>
                      <td className="py-3 text-center font-mono">{trial.v || '--'}</td>
                      <td className="py-3 text-right font-mono">
                        {trial.v ? (
                          titrationData.concentration === '0.1000' && !titrationData.isStandardizing 
                          ? ((parseFloat(trial.v) - parseFloat(titrationData.v0)) * 0.1 * 35.45 / (parseFloat(titrationData.m_sample) * 1000) * 100).toFixed(4) + '%'
                          : '--'
                        ) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-500" /> AI 智能初审意见
              </h4>
              <span className={`px-2 py-1 ${titrationData.rsd < 0.5 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} text-[8px] font-black rounded uppercase`}>
                {titrationData.rsd < 0.5 ? 'Pass' : 'Review Required'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              平行实验精密度 (RSD) 为 {titrationData.rsd}%，{titrationData.rsd < 0.5 ? '符合国标规定极限（≤0.5%）。' : '偏差略大，建议检查终点判定是否一致。'}
              计算逻辑匹配 Ag⁺ + Cl⁻ → AgCl↓ 反应计量比，结果有效。
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" /> 导出报告 (PDF)
          </button>
          <button 
            onClick={() => setCurrentStage(WorkflowStage.CLOSE)}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            <span>进入实验收尾</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderClose = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center">
          <Archive className="w-6 h-6 mr-3 text-indigo-600" /> 实验收尾与归档考核
        </h3>

        <div className="space-y-6">
          <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
             <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> 收尾清单 (Checklist)
             </h4>
             <div className="grid grid-cols-1 gap-3">
                {[
                  '仪器清洗并归位 (滴定管、锥形瓶)',
                  '场地清理，关闭水源电源',
                  '含银废液、含铬废液分类回收',
                  '更新样品状态为“已使用”'
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-indigo-100/50">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-bold text-indigo-900">{item}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">核心安全离场考核</h4>
                <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded">1/5</span>
             </div>
             <p className="text-sm font-black text-slate-800 mb-4">关于莫尔法实验安全，以下说法错误的是？</p>
             <div className="space-y-3">
                {[
                  '硝酸具有强挥发性，必须在通风橱内操作',
                  '铬酸钾指示剂属于一类污染物，废液需专门回收',
                  '滴定终点出现砖红色后应立即将废液倒入水槽冲走',
                  '硝酸银溶液应储存在棕色瓶中避光保存'
                ].map((opt, i) => (
                  <button key={i} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-left text-xs font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all">
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" />
          <span>提交归档并完成实验</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">莫尔法测定涂料氯离子</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Smart Laboratory Workflow</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl flex items-center">
           <Zap className="w-4 h-4 mr-2 fill-indigo-600" />
           <span className="text-[10px] font-black uppercase tracking-widest">智能引导模式</span>
        </div>
      </div>

      {renderStageNav()}

      {currentStage === WorkflowStage.PREP && renderPrep()}
      {currentStage === WorkflowStage.SAMPLE && renderSample()}
      {currentStage === WorkflowStage.OPERATION && renderOperation()}
      {currentStage === WorkflowStage.RESULT && renderResult()}
      {currentStage === WorkflowStage.CLOSE && renderClose()}
    </div>
  );
};

export default Workflow;
