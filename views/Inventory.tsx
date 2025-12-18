
import React, { useState } from 'react';
import { Package, Scan, Search, MapPin, Thermometer, AlertCircle, CheckCircle2 } from 'lucide-react';

const Inventory: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const mockInventory = [
    { id: '1', name: '无水乙醚', cas: '60-29-7', stock: '2.5 L', location: '1号溶剂柜 A-02', expiry: '2025-12', status: 'normal' },
    { id: '2', name: '氢化钠 (60%)', cas: '7646-69-7', stock: '450 g', location: '干燥柜 D-05', expiry: '2024-08', status: 'warning' },
    { id: '3', name: 'Boc-L-丙氨酸', cas: '15761-39-4', stock: '25 g', location: '3号冰箱 2层', expiry: '2026-01', status: 'normal' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">实验室资源管理</h2>
        <button 
          onClick={() => setIsScanning(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Scan className="w-4 h-4" />
          <span className="font-bold text-sm">扫码查库</span>
        </button>
      </div>

      {isScanning && (
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden animate-in fade-in">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
            <div className="w-48 h-48 border-2 border-white/20 rounded-2xl relative">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
               <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/50 animate-pulse"></div>
            </div>
            <p className="mt-4 text-xs">正在调用相机扫描瓶身二维码...</p>
            <button 
              onClick={() => setIsScanning(false)}
              className="mt-6 px-4 py-1 text-xs border border-white/20 rounded-full hover:bg-white/10"
            >
              取消扫描
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="按名称、位置、CAS 查询..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <div className="space-y-3">
        {mockInventory.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${item.status === 'warning' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Package className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.status === 'warning' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {item.status === 'warning' ? '库存不足' : '充足'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">CAS: {item.cas}</p>
              
              <div className="grid grid-cols-2 gap-y-2 mt-3">
                <div className="flex items-center text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3 mr-1" /> {item.location}
                </div>
                <div className="flex items-center text-[10px] text-slate-500">
                  <Thermometer className="w-3 h-3 mr-1" /> {item.stock}
                </div>
                <div className={`flex items-center text-[10px] ${item.status === 'warning' ? 'text-rose-500' : 'text-slate-400'}`}>
                  <AlertCircle className="w-3 h-3 mr-1" /> 有效期: {item.expiry}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">领用登记模式</span>
        </div>
        <button className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4">
          查看流水
        </button>
      </div>
    </div>
  );
};

export default Inventory;
