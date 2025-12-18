
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, FileText, Camera, Tag, Calendar, MoreVertical, X, Check, Loader2, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { elnService, ELNEntryDoc } from '../services/appwriteService';

interface ELNEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  author: string;
  content?: string;
  photoUrl?: string;
}

const mapDocToEntry = (doc: ELNEntryDoc): ELNEntry => ({
  id: doc.$id || '',
  title: doc.title,
  date: doc.date,
  tags: doc.tags || [],
  author: 'Researcher A',
  content: doc.content,
  photoUrl: doc.photoUrl,
});

const ELN: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<ELNEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [entries, setEntries] = useState<ELNEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const docs = await elnService.list();
      setEntries(docs.map(mapDocToEntry));
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New Entry Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      // 强制使用后置摄像头
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { exact: 'environment' }, // 强制后置摄像头
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      // 如果强制后置失败，尝试普通后置模式
      console.warn("Exact environment mode failed, trying preferred mode:", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (fallbackErr) {
        console.error("Error accessing camera:", fallbackErr);
        alert("无法访问后置摄像头，请检查权限或设备。");
        setIsScanning(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScanning]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  const handleAddEntry = async () => {
    if (!newTitle.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const entryData = {
        title: newTitle,
        date: new Date().toISOString().split('T')[0],
        tags: newTags.split(/[,，]/).map(t => t.trim()).filter(t => t !== ''),
        content: newContent || '',
        photoUrl: capturedImage || ''
      };
      const doc = await elnService.create(entryData);
      setEntries([mapDocToEntry(doc), ...entries]);
      setIsAdding(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewTags('');
    setNewContent('');
    setCapturedImage(null);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await elnService.delete(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('删除失败，请重试');
    }
    setActiveMenu(null);
  };

  const handleEditEntry = (entry: ELNEntry) => {
    setEditingEntry(entry);
    setNewTitle(entry.title);
    setNewTags(entry.tags.join(', '));
    setNewContent(entry.content || '');
    setCapturedImage(entry.photoUrl || null);
    setActiveMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !newTitle.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const updateData = {
        title: newTitle,
        tags: newTags.split(/[,，]/).map(t => t.trim()).filter(t => t !== ''),
        content: newContent,
        photoUrl: capturedImage || undefined
      };
      await elnService.update(editingEntry.id, updateData);
      setEntries(entries.map(e => 
        e.id === editingEntry.id ? { ...e, ...updateData } : e
      ));
      setEditingEntry(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(dataUrl);
        setIsProcessing(true);
        
        // 模拟 AI 识别逻辑
        setTimeout(() => {
          const aiEntry: ELNEntry = {
            id: Date.now().toString(),
            title: 'AI 自动记录：实验操作台快照 (' + new Date().toLocaleTimeString() + ')',
            date: new Date().toISOString().split('T')[0],
            tags: ['AI 识别', '现场记录'],
            author: 'AI Assistant',
            content: '检测到实验台上有 3 个反应瓶。左侧瓶内液体呈现深棕色，疑似反应已完成。右侧正在进行磁力搅拌。记录已自动分类至“合成监控”。',
            photoUrl: dataUrl
          };
          setEntries([aiEntry, ...entries]);
          setIsProcessing(false);
          setIsScanning(false);
          setCapturedImage(null);
        }, 2000);
      }
    }
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">实验记录本 (ELN)</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(79,70,229,0.4)] hover:bg-indigo-700 transition-all active:scale-90"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索项目、标签、CAS..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* 记录列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="ml-3 text-slate-500">加载中...</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group relative">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors ${entry.photoUrl ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                  {entry.photoUrl ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{entry.title}</h3>
                  <div className="flex items-center text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    <Calendar className="w-3 h-3 mr-1" /> {entry.date}
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === entry.id ? null : entry.id); }}
                  className="text-slate-300 hover:text-slate-500 p-1"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {activeMenu === entry.id && (
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 min-w-[120px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>编辑</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>删除</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <span key={tag} className="flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100/30">
                  <Tag className="w-2.5 h-2.5 mr-1" /> {tag}
                </span>
              ))}
            </div>

            {entry.photoUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 h-24 w-full">
                <img src={entry.photoUrl} alt="实验记录附件" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* 底部一键模版录入卡片 */}
      <button 
        onClick={() => setIsScanning(true)}
        className="w-full bg-white rounded-3xl p-8 border-2 border-dashed border-indigo-200 flex flex-col items-center text-center group hover:bg-indigo-50/50 hover:border-indigo-400 transition-all duration-300 shadow-sm"
      >
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Camera className="w-6 h-6 text-indigo-600" />
        </div>
        <h4 className="font-black text-indigo-900 text-lg mb-1">一键模版化记录</h4>
        <p className="text-xs text-indigo-800/60 max-w-[240px]">
          支持拍摄 TLC 板、显色结果，AI 自动整理为结构化报告。
        </p>
      </button>

      {/* 手动添加模态框 */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
              <h3 className="text-lg font-black text-slate-800">新建实验记录</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">实验标题</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：催化剂活性测试"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">标签</label>
                <input 
                  type="text" 
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="合成, 催化..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">关联图片</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setIsAdding(false); setIsScanning(true); }}
                    className="h-[50px] flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-bold">拍摄</span>
                  </button>
                  <label className="h-[50px] flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">相册</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageData = event.target?.result as string;
                            setCapturedImage(imageData);
                            setIsAdding(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">实验备注</label>
                <textarea 
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="输入实验的关键数据或观察现象..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <button 
                onClick={handleAddEntry}
                disabled={!newTitle.trim()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98] text-sm"
              >
                保存实验记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑模态框 */}
      {editingEntry && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => { setEditingEntry(null); resetForm(); }}>
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
              <h3 className="text-lg font-black text-slate-800">编辑实验记录</h3>
              <button onClick={() => { setEditingEntry(null); resetForm(); }} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">实验标题</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：催化剂活性测试"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">标签</label>
                <input 
                  type="text" 
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="合成, 催化..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              {capturedImage && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">当前图片</label>
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32">
                    <img src={capturedImage} alt="实验图片" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">实验备注</label>
                <textarea 
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="输入实验的关键数据或观察现象..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>
              <button 
                onClick={handleSaveEdit}
                disabled={!newTitle.trim()}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-100 hover:bg-amber-600 disabled:opacity-50 transition-all active:scale-[0.98] text-sm"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 相机/扫描覆盖层 */}
      {isScanning && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-6 text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={() => setIsScanning(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <span className="font-black text-xs tracking-[0.2em] uppercase">AI Vision Lab</span>
              <div className="flex space-x-1 mt-1">
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900">
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-6 text-indigo-400 z-20">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-500/30 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-black text-white animate-pulse">Gemini 正在结构化数据...</p>
                  <p className="text-[10px] text-indigo-200/50 uppercase tracking-widest font-bold">分析 TLC Rf / 识别化学文本 / 提取数值</p>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover opacity-80"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* 扫描框 UI */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
                  <div className="w-full max-w-sm aspect-[4/5] border border-white/20 rounded-[3rem] relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-indigo-500 rounded-tl-[3rem]"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-500 rounded-tr-[3rem]"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-500 rounded-bl-[3rem]"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-indigo-500 rounded-br-[3rem]"></div>
                    
                    {/* 扫描动画线 */}
                    <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-scan-line"></div>
                  </div>
                </div>

                <div className="absolute bottom-32 left-0 right-0 text-center text-white/40 text-[10px] uppercase font-black tracking-widest">
                  Ready to capture
                </div>
              </>
            )}
          </div>

          {!isProcessing && (
            <div className="p-10 bg-black flex flex-col items-center justify-center">
              <button 
                onClick={handleCapture}
                className="group relative w-20 h-20 flex items-center justify-center transition-transform active:scale-90"
              >
                <div className="absolute inset-0 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors"></div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-black group-hover:scale-95 transition-transform">
                   <div className="w-14 h-14 border-2 border-slate-200 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full"></div>
                   </div>
                </div>
              </button>
              <p className="mt-4 text-white/50 text-[10px] font-bold">点击拍摄即刻生成实验报告</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { top: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        .animate-scan-line {
          position: absolute;
          animation: scan-line 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ELN;
