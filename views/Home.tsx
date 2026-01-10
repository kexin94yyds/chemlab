
import React from 'react';
import { ModuleType } from '../types';
import { Library, Calculator, BookOpen, ShieldAlert, ChevronRight, Zap } from 'lucide-react';

interface HomeProps {
  onNavigate: (module: ModuleType) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const tools = [
    {
      type: ModuleType.LIBRARY,
      title: '知识与标准库',
      desc: '查询 GB/T 国家标准、物理常数、SOP 常用方法。',
      icon: Library,
      color: 'bg-indigo-500',
      label: '核心'
    },
    {
      type: ModuleType.CALCULATOR,
      title: '智能计算工具',
      desc: '联动性质库数据，自动换算浓度与摩尔比。',
      icon: Calculator,
      color: 'bg-emerald-500',
    },
    {
      type: ModuleType.ELN,
      title: '结构化记录',
      desc: '快速录入实验，支持引用库中 SOP 方法模版。',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      type: ModuleType.SAFETY,
      title: '智能实验评估',
      desc: '实验前安全自评与禁忌预警，确保操作合规。',
      icon: ShieldAlert,
      color: 'bg-rose-500',
    },
    {
      type: ModuleType.WORKFLOW,
      title: '智能实验流程',
      desc: '莫尔法测定涂料氯离子，全流程数字化引导。',
      icon: Zap,
      color: 'bg-amber-500',
      label: 'New'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <Zap className="absolute top-[-20px] right-[-20px] w-48 h-48 text-white/5 rotate-12" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2">化繁为简，智在实验</h2>
          <p className="text-indigo-100/80 text-sm leading-relaxed max-w-sm">
            集成标准库查询、物化常数检索与智能计算，打造化学研究员的数字化第二大脑。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onNavigate(tool.type)}
            className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left flex items-start space-x-4"
          >
            <div className={`${tool.color} p-3 rounded-xl text-white shadow-lg shadow-inner flex-shrink-0`}>
              <tool.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                {tool.label && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black rounded uppercase tracking-tighter">
                    {tool.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                {tool.desc}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 self-center group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-2 mb-2 text-slate-600">
          <Library className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">最新行业动态</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          “食品安全国家标准 GB 2760-2024《食品安全国家标准 食品添加剂使用标准》已发布并于近期实施，建议更新实验室 SOP。”
        </p>
      </div>
    </div>
  );
};

export default Home;
