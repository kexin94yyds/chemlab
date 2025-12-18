import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Library, Bookmark, Book, Database, FileText, Loader2, 
  Thermometer, Droplet, Hash, ChevronRight, Plus, X, Upload, 
  File, FileType, CheckCircle2, ExternalLink, ShieldCheck, Save, Beaker, Trash2, Sparkles,
  // Fix: replaced ShieldInfo with ShieldAlert which is the correct lucide-react icon
  BookOpen, Globe, Download, Eye, Clock, ShieldAlert
} from 'lucide-react';
import { lookupChemicalProperties, searchStandards } from '../services/geminiService';
import { Reagent, Standard, SOP } from '../types';
import { reagentService, sopService, ReagentDoc, SOPDoc } from '../services/appwriteService';

// 初始预置试剂数据库 - 包含常用化学药剂
const INITIAL_REAGENTS: Reagent[] = [
  // ===== 醇类 =====
  { name: '无水乙醇', cas: '64-17-5', mw: 46.07, density: 0.789, mp: '-114.1 ℃', bp: '78.37 ℃', solubility: '与水混溶' },
  { name: '甲醇', cas: '67-56-1', mw: 32.04, density: 0.791, mp: '-97.6 ℃', bp: '64.7 ℃', solubility: '与水混溶' },
  { name: '异丙醇', cas: '67-63-0', mw: 60.10, density: 0.786, mp: '-89.5 ℃', bp: '82.4 ℃', solubility: '与水混溶' },
  { name: '正丁醇', cas: '71-36-3', mw: 74.12, density: 0.810, mp: '-89.8 ℃', bp: '117.7 ℃', solubility: '77 g/L' },
  { name: '叔丁醇', cas: '75-65-0', mw: 74.12, density: 0.786, mp: '25.5 ℃', bp: '82.4 ℃', solubility: '与水混溶' },
  { name: '乙二醇', cas: '107-21-1', mw: 62.07, density: 1.113, mp: '-12.9 ℃', bp: '197.3 ℃', solubility: '与水混溶' },
  { name: '丙三醇 (甘油)', cas: '56-81-5', mw: 92.09, density: 1.261, mp: '18.2 ℃', bp: '290 ℃', solubility: '与水混溶' },
  { name: '苯甲醇', cas: '100-51-6', mw: 108.14, density: 1.045, mp: '-15.2 ℃', bp: '205.3 ℃', solubility: '40 g/L' },
  
  // ===== 酸类 =====
  { name: '硫酸', cas: '7664-93-9', mw: 98.08, density: 1.84, mp: '10.31 ℃', bp: '337 ℃', solubility: '与水混溶' },
  { name: '盐酸', cas: '7647-01-0', mw: 36.46, density: 1.18, mp: '-27.3 ℃', bp: '110 ℃', solubility: '与水混溶' },
  { name: '硝酸', cas: '7697-37-2', mw: 63.01, density: 1.51, mp: '-42 ℃', bp: '83 ℃', solubility: '与水混溶' },
  { name: '磷酸', cas: '7664-38-2', mw: 98.00, density: 1.685, mp: '42.4 ℃', bp: '158 ℃', solubility: '与水混溶' },
  { name: '醋酸 (乙酸)', cas: '64-19-7', mw: 60.05, density: 1.049, mp: '16.6 ℃', bp: '118.1 ℃', solubility: '与水混溶' },
  { name: '甲酸', cas: '64-18-6', mw: 46.03, density: 1.220, mp: '8.4 ℃', bp: '100.8 ℃', solubility: '与水混溶' },
  { name: '三氟乙酸 (TFA)', cas: '76-05-1', mw: 114.02, density: 1.489, mp: '-15.4 ℃', bp: '72.4 ℃', solubility: '与水混溶', pKa: '0.23' },
  { name: '草酸', cas: '144-62-7', mw: 90.03, density: 1.90, mp: '189.5 ℃', bp: '分解', solubility: '143 g/L', pKa: '1.25' },
  { name: '柠檬酸', cas: '77-92-9', mw: 192.12, density: 1.665, mp: '153 ℃', bp: '分解', solubility: '730 g/L', pKa: '3.13' },
  { name: '苯甲酸', cas: '65-85-0', mw: 122.12, density: 1.266, mp: '122.4 ℃', bp: '249.2 ℃', solubility: '2.9 g/L', pKa: '4.20' },
  
  // ===== 碱类 =====
  { name: '氢氧化钠', cas: '1310-73-2', mw: 40.00, density: 2.13, mp: '318 ℃', bp: '1390 ℃', solubility: '1110 g/L' },
  { name: '氢氧化钾', cas: '1310-58-3', mw: 56.11, density: 2.044, mp: '360 ℃', bp: '1327 ℃', solubility: '1210 g/L' },
  { name: '氨水', cas: '1336-21-6', mw: 35.05, density: 0.91, mp: '-77 ℃', bp: '38 ℃', solubility: '与水混溶' },
  { name: '三乙胺 (TEA)', cas: '121-44-8', mw: 101.19, density: 0.726, mp: '-114.7 ℃', bp: '89 ℃', solubility: '133 g/L' },
  { name: '吡啶', cas: '110-86-1', mw: 79.10, density: 0.982, mp: '-41.6 ℃', bp: '115.2 ℃', solubility: '与水混溶', pKa: '5.25' },
  { name: '碳酸钠', cas: '497-19-8', mw: 105.99, density: 2.54, mp: '851 ℃', bp: '分解', solubility: '215 g/L' },
  { name: '碳酸氢钠', cas: '144-55-8', mw: 84.01, density: 2.20, mp: '50 ℃ (分解)', bp: '分解', solubility: '96 g/L' },
  { name: '二异丙基乙胺 (DIPEA)', cas: '7087-68-5', mw: 129.24, density: 0.742, mp: '-50 ℃', bp: '127 ℃', solubility: '43 g/L' },
  
  // ===== 有机溶剂 =====
  { name: '二氯甲烷 (DCM)', cas: '75-09-2', mw: 84.93, density: 1.325, mp: '-96.7 ℃', bp: '39.6 ℃', solubility: '13.2 g/L' },
  { name: '氯仿', cas: '67-66-3', mw: 119.38, density: 1.489, mp: '-63.5 ℃', bp: '61.2 ℃', solubility: '8 g/L' },
  { name: '四氯化碳', cas: '56-23-5', mw: 153.82, density: 1.594, mp: '-23 ℃', bp: '76.7 ℃', solubility: '0.8 g/L' },
  { name: '乙酸乙酯 (EA)', cas: '141-78-6', mw: 88.11, density: 0.902, mp: '-83.6 ℃', bp: '77.1 ℃', solubility: '83 g/L' },
  { name: '乙醚', cas: '60-29-7', mw: 74.12, density: 0.713, mp: '-116.3 ℃', bp: '34.6 ℃', solubility: '69 g/L' },
  { name: '四氢呋喃 (THF)', cas: '109-99-9', mw: 72.11, density: 0.889, mp: '-108.4 ℃', bp: '66 ℃', solubility: '与水混溶' },
  { name: '1,4-二氧六环', cas: '123-91-1', mw: 88.11, density: 1.033, mp: '11.8 ℃', bp: '101.1 ℃', solubility: '与水混溶' },
  { name: '丙酮', cas: '67-64-1', mw: 58.08, density: 0.791, mp: '-94.7 ℃', bp: '56.05 ℃', solubility: '与水混溶' },
  { name: '乙腈', cas: '75-05-8', mw: 41.05, density: 0.786, mp: '-45.7 ℃', bp: '81.6 ℃', solubility: '与水混溶' },
  { name: 'N,N-二甲基甲酰胺 (DMF)', cas: '68-12-2', mw: 73.09, density: 0.944, mp: '-61 ℃', bp: '153 ℃', solubility: '与水混溶' },
  { name: '二甲基亚砜 (DMSO)', cas: '67-68-5', mw: 78.13, density: 1.100, mp: '18.5 ℃', bp: '189 ℃', solubility: '与水混溶' },
  { name: 'N-甲基吡咯烷酮 (NMP)', cas: '872-50-4', mw: 99.13, density: 1.028, mp: '-24 ℃', bp: '202 ℃', solubility: '与水混溶' },
  { name: '石油醚 (PE)', cas: '8032-32-4', mw: 86.18, density: 0.64, mp: '-73 ℃', bp: '30-60 ℃', solubility: '不溶' },
  { name: '正己烷', cas: '110-54-3', mw: 86.18, density: 0.659, mp: '-95.3 ℃', bp: '68.7 ℃', solubility: '9.5 mg/L' },
  { name: '环己烷', cas: '110-82-7', mw: 84.16, density: 0.779, mp: '6.5 ℃', bp: '80.7 ℃', solubility: '55 mg/L' },
  { name: '甲苯', cas: '108-88-3', mw: 92.14, density: 0.867, mp: '-95 ℃', bp: '110.6 ℃', solubility: '0.52 g/L' },
  { name: '苯', cas: '71-43-2', mw: 78.11, density: 0.879, mp: '5.5 ℃', bp: '80.1 ℃', solubility: '1.8 g/L' },
  { name: '二甲苯', cas: '1330-20-7', mw: 106.17, density: 0.864, mp: '-47 ℃', bp: '138.4 ℃', solubility: '0.2 g/L' },
  
  // ===== 试剂/还原剂/氧化剂 =====
  { name: '硼氢化钠', cas: '16940-66-2', mw: 37.83, density: 1.074, mp: '400 ℃ (分解)', bp: '分解', solubility: '550 g/L' },
  { name: '氢化铝锂 (LAH)', cas: '16853-85-3', mw: 37.95, density: 0.917, mp: '125 ℃', bp: '分解', solubility: '反应' },
  { name: '氰基硼氢化钠', cas: '25895-60-7', mw: 62.84, density: 1.20, mp: '240 ℃ (分解)', bp: '分解', solubility: '溶于醇' },
  { name: '过氧化氢 (30%)', cas: '7722-84-1', mw: 34.01, density: 1.11, mp: '-0.43 ℃', bp: '150.2 ℃', solubility: '与水混溶' },
  { name: '高锰酸钾', cas: '7722-64-7', mw: 158.03, density: 2.703, mp: '240 ℃ (分解)', bp: '分解', solubility: '76 g/L' },
  { name: '重铬酸钾', cas: '7778-50-9', mw: 294.18, density: 2.676, mp: '398 ℃', bp: '500 ℃ (分解)', solubility: '125 g/L' },
  { name: '三氧化铬 (CrO3)', cas: '1333-82-0', mw: 99.99, density: 2.70, mp: '197 ℃', bp: '250 ℃ (分解)', solubility: '625 g/L' },
  { name: '间氯过氧苯甲酸 (mCPBA)', cas: '937-14-4', mw: 172.57, density: 1.39, mp: '92-94 ℃', bp: '分解', solubility: '微溶' },
  
  // ===== 干燥剂/脱水剂 =====
  { name: '无水硫酸镁', cas: '7487-88-9', mw: 120.37, density: 2.66, mp: '1124 ℃', bp: '分解', solubility: '355 g/L' },
  { name: '无水硫酸钠', cas: '7757-82-6', mw: 142.04, density: 2.664, mp: '884 ℃', bp: '分解', solubility: '195 g/L' },
  { name: '无水氯化钙', cas: '10043-52-4', mw: 110.98, density: 2.15, mp: '772 ℃', bp: '1935 ℃', solubility: '745 g/L' },
  { name: '分子筛 4A', cas: '70955-01-0', mw: 0, mp: '稳定', bp: '稳定', solubility: '不溶' },
  { name: '五氧化二磷', cas: '1314-56-3', mw: 141.94, density: 2.39, mp: '340 ℃', bp: '360 ℃ (升华)', solubility: '反应' },
  
  // ===== 金属催化剂 =====
  { name: '钯碳 (Pd/C 10%)', cas: '7440-05-3', mw: 106.42, density: 12.02, mp: '1554.9 ℃', bp: '2963 ℃', solubility: '不溶' },
  { name: '三苯基膦 (PPh3)', cas: '603-35-0', mw: 262.29, density: 1.194, mp: '79-81 ℃', bp: '377 ℃', solubility: '不溶于水' },
  { name: '四三苯基膦钯', cas: '14221-01-3', mw: 1155.56, density: 1.30, mp: '115 ℃ (分解)', bp: '分解', solubility: '不溶' },
  { name: '醋酸钯', cas: '3375-31-3', mw: 224.49, density: 2.194, mp: '205 ℃', bp: '分解', solubility: '微溶' },
  { name: '氯化亚铜', cas: '7758-89-6', mw: 98.99, density: 4.14, mp: '426 ℃', bp: '1490 ℃', solubility: '0.1 g/L' },
  { name: '碘化亚铜', cas: '7681-65-4', mw: 190.45, density: 5.67, mp: '606 ℃', bp: '1290 ℃', solubility: '不溶' },
  
  // ===== 偶联试剂 =====
  { name: 'EDCI', cas: '25952-53-8', mw: 191.70, density: 1.03, mp: '110-115 ℃', bp: '分解', solubility: '溶于DMF' },
  { name: 'HOBt', cas: '2592-95-2', mw: 135.12, density: 1.30, mp: '156-159 ℃', bp: '分解', solubility: '微溶' },
  { name: 'HATU', cas: '148893-10-1', mw: 380.23, density: 1.28, mp: '135-136 ℃', bp: '分解', solubility: '溶于DMF' },
  { name: 'DCC', cas: '538-75-0', mw: 206.33, density: 1.325, mp: '34-35 ℃', bp: '122-124 ℃', solubility: '微溶' },
  { name: 'CDI', cas: '530-62-1', mw: 162.15, density: 1.30, mp: '118-122 ℃', bp: '分解', solubility: '反应' },
  
  // ===== 保护基试剂 =====
  { name: 'Boc酸酐 (Boc2O)', cas: '24424-99-5', mw: 218.25, density: 0.95, mp: '22-24 ℃', bp: '56-58 ℃', solubility: '不溶于水' },
  { name: 'Fmoc-Cl', cas: '28920-43-6', mw: 258.70, density: 1.22, mp: '60-63 ℃', bp: '分解', solubility: '不溶于水' },
  { name: 'TBSCl', cas: '18162-48-6', mw: 150.72, density: 0.891, mp: '-30 ℃', bp: '125 ℃', solubility: '反应' },
  { name: 'TBDMSCl', cas: '18162-48-6', mw: 150.72, density: 0.891, mp: '-30 ℃', bp: '125 ℃', solubility: '反应' },
  { name: 'TMSCl', cas: '75-77-4', mw: 108.64, density: 0.856, mp: '-40 ℃', bp: '57 ℃', solubility: '反应' },
  
  // ===== 常用盐类 =====
  { name: '氯化钠', cas: '7647-14-5', mw: 58.44, density: 2.165, mp: '801 ℃', bp: '1413 ℃', solubility: '360 g/L' },
  { name: '氯化钾', cas: '7447-40-7', mw: 74.55, density: 1.988, mp: '770 ℃', bp: '1500 ℃', solubility: '342 g/L' },
  { name: '硫酸铜', cas: '7758-98-7', mw: 159.60, density: 3.60, mp: '110 ℃ (分解)', bp: '分解', solubility: '203 g/L' },
  { name: '氯化铁', cas: '7705-08-0', mw: 162.20, density: 2.90, mp: '306 ℃', bp: '316 ℃', solubility: '920 g/L' },
  { name: '氯化锌', cas: '7646-85-7', mw: 136.30, density: 2.907, mp: '290 ℃', bp: '732 ℃', solubility: '4320 g/L' },
  { name: '碘化钠', cas: '7681-82-5', mw: 149.89, density: 3.67, mp: '661 ℃', bp: '1304 ℃', solubility: '1790 g/L' },
  { name: '溴化钠', cas: '7647-15-6', mw: 102.89, density: 3.21, mp: '755 ℃', bp: '1390 ℃', solubility: '943 g/L' },
  { name: '硝酸银', cas: '7761-88-8', mw: 169.87, density: 4.35, mp: '212 ℃', bp: '440 ℃ (分解)', solubility: '2450 g/L' },
  
  // ===== 指示剂/染料 =====
  { name: '酚酞', cas: '77-09-8', mw: 318.32, density: 1.299, mp: '262-264 ℃', bp: '分解', solubility: '0.4 g/L' },
  { name: '溴百里酚蓝', cas: '76-59-5', mw: 624.38, density: 1.30, mp: '200-202 ℃', bp: '分解', solubility: '微溶' },
  { name: '甲基橙', cas: '547-58-0', mw: 327.33, density: 1.28, mp: '分解', bp: '分解', solubility: '5.2 g/L' },
  { name: '甲基红', cas: '493-52-7', mw: 269.30, density: 1.30, mp: '179-182 ℃', bp: '分解', solubility: '0.1 g/L' },
  
  // ===== 生化试剂 =====
  { name: 'Tris碱', cas: '77-86-1', mw: 121.14, density: 1.35, mp: '168-172 ℃', bp: '219 ℃', solubility: '550 g/L' },
  { name: 'HEPES', cas: '7365-45-9', mw: 238.30, density: 1.21, mp: '234-238 ℃', bp: '分解', solubility: '400 g/L' },
  { name: 'EDTA二钠', cas: '6381-92-6', mw: 372.24, density: 0.86, mp: '252 ℃ (分解)', bp: '分解', solubility: '500 g/L' },
  { name: 'SDS', cas: '151-21-3', mw: 288.38, density: 1.01, mp: '206 ℃', bp: '分解', solubility: '150 g/L' },
  { name: 'DTT', cas: '3483-12-3', mw: 154.25, density: 1.25, mp: '42-44 ℃', bp: '分解', solubility: '与水混溶' },
  { name: 'PMSF', cas: '329-98-6', mw: 174.19, density: 1.21, mp: '91-93 ℃', bp: '分解', solubility: '不溶于水' },
  { name: '尿素', cas: '57-13-6', mw: 60.06, density: 1.335, mp: '133-135 ℃', bp: '分解', solubility: '1080 g/L' },
  { name: '盐酸胍', cas: '50-01-1', mw: 95.53, density: 1.354, mp: '184-187 ℃', bp: '分解', solubility: '2140 g/L' },
  
  // ===== 氨基酸 =====
  { name: 'L-甘氨酸', cas: '56-40-6', mw: 75.07, density: 1.607, mp: '233 ℃ (分解)', bp: '分解', solubility: '250 g/L' },
  { name: 'L-丙氨酸', cas: '56-41-7', mw: 89.09, density: 1.432, mp: '297 ℃ (分解)', bp: '分解', solubility: '166 g/L' },
  { name: 'L-苯丙氨酸', cas: '63-91-2', mw: 165.19, density: 1.29, mp: '283 ℃ (分解)', bp: '分解', solubility: '30 g/L' },
  { name: 'L-色氨酸', cas: '73-22-3', mw: 204.23, density: 1.34, mp: '289 ℃ (分解)', bp: '分解', solubility: '11.4 g/L' },
  { name: 'L-半胱氨酸', cas: '52-90-4', mw: 121.16, density: 1.67, mp: '240 ℃ (分解)', bp: '分解', solubility: '与水混溶' },
  
  // ===== 核苷/核苷酸 =====
  { name: 'ATP二钠盐', cas: '987-65-5', mw: 551.14, density: 1.04, mp: '分解', bp: '分解', solubility: '100 g/L' },
  { name: 'NAD+', cas: '53-84-9', mw: 663.43, density: 1.28, mp: '分解', bp: '分解', solubility: '溶于水' },
  { name: 'NADH', cas: '606-68-8', mw: 709.40, density: 1.30, mp: '分解', bp: '分解', solubility: '溶于水' },
  
  // ===== 常用无机物 =====
  { name: '亚硫酸钠', cas: '7757-83-7', mw: 126.04, density: 2.633, mp: '分解', bp: '分解', solubility: '270 g/L' },
  { name: '硫代硫酸钠', cas: '7772-98-7', mw: 158.11, density: 1.667, mp: '48 ℃', bp: '分解', solubility: '700 g/L' },
  { name: '亚硝酸钠', cas: '7632-00-0', mw: 69.00, density: 2.168, mp: '271 ℃', bp: '320 ℃ (分解)', solubility: '848 g/L' },
  { name: '叠氮化钠', cas: '26628-22-8', mw: 65.01, density: 1.846, mp: '分解', bp: '分解', solubility: '417 g/L' },
  { name: '氟化钾', cas: '7789-23-3', mw: 58.10, density: 2.48, mp: '858 ℃', bp: '1505 ℃', solubility: '923 g/L' },
  { name: '氰化钾', cas: '151-50-8', mw: 65.12, density: 1.52, mp: '634 ℃', bp: '分解', solubility: '716 g/L' },
];

// 初始预置标准库 - 食品安全/化学检测/化学试剂国标行标
const INITIAL_STANDARDS: Standard[] = [
  // ===== 食品安全通用标准 =====
  { id: 'std-01', code: 'GB 2760-2024', title: '食品安全国家标准 食品添加剂使用标准', category: '食品安全', summary: '规定了食品中允许使用的添加剂品种、使用范围及最大使用量。2024版最新修订。' },
  { id: 'std-02', code: 'GB 2761-2017', title: '食品安全国家标准 食品中真菌毒素限量', category: '污染物限制', summary: '规定了食品中黄曲霉毒素、赭曲霉毒素等真菌毒素的限量要求。' },
  { id: 'std-03', code: 'GB 2762-2022', title: '食品安全国家标准 食品中污染物限量', category: '污染物限制', summary: '规定了铅、镉、汞、砷等重金属及其他污染物在各类食品中的限量。' },
  { id: 'std-04', code: 'GB 2763-2021', title: '食品安全国家标准 食品中农药最大残留限量', category: '农药残留', summary: '规定了564种农药在376种食品中10092项最大残留限量。' },
  { id: 'std-05', code: 'GB 31650-2019', title: '食品安全国家标准 食品中兽药最大残留限量', category: '兽药残留', summary: '规定了267种兽药在动物性食品中的最大残留限量。' },
  
  // ===== 理化检验方法 =====
  { id: 'std-06', code: 'GB 5009.3-2016', title: '食品安全国家标准 食品中水分的测定', category: '理化检验', summary: '规定了食品中水分测定的几种常用方法，包括直接干燥法、减压干燥法等。' },
  { id: 'std-07', code: 'GB 5009.4-2016', title: '食品安全国家标准 食品中灰分的测定', category: '理化检验', summary: '规定了食品中灰分的测定方法，适用于各类食品。' },
  { id: 'std-08', code: 'GB 5009.5-2016', title: '食品安全国家标准 食品中蛋白质的测定', category: '理化检验', summary: '规定了凯氏定氮法、燃烧法等蛋白质测定方法。' },
  { id: 'std-09', code: 'GB 5009.6-2016', title: '食品安全国家标准 食品中脂肪的测定', category: '理化检验', summary: '规定了索氏抽提法、酸水解法等脂肪测定方法。' },
  { id: 'std-10', code: 'GB 5009.7-2016', title: '食品安全国家标准 食品中还原糖的测定', category: '理化检验', summary: '规定了直接滴定法测定食品中还原糖的方法。' },
  { id: 'std-11', code: 'GB 5009.8-2016', title: '食品安全国家标准 食品中果糖、葡萄糖、蔗糖、麦芽糖、乳糖的测定', category: '理化检验', summary: '规定了高效液相色谱法测定食品中单糖和双糖的方法。' },
  { id: 'std-12', code: 'GB 5009.9-2016', title: '食品安全国家标准 食品中淀粉的测定', category: '理化检验', summary: '规定了酶水解法和酸水解法测定淀粉含量。' },
  { id: 'std-13', code: 'GB 5009.10-2014', title: '食品安全国家标准 食品中粗纤维的测定', category: '理化检验', summary: '规定了酸碱消解法测定食品中粗纤维的方法。' },
  { id: 'std-14', code: 'GB 5009.12-2017', title: '食品安全国家标准 食品中铅的测定', category: '重金属检测', summary: '规定了石墨炉原子吸收光谱法、电感耦合等离子体质谱法等测定铅的方法。' },
  { id: 'std-15', code: 'GB 5009.13-2017', title: '食品安全国家标准 食品中镉的测定', category: '重金属检测', summary: '规定了测定食品中镉的原子吸收光谱法和ICP-MS法。' },
  { id: 'std-16', code: 'GB 5009.14-2017', title: '食品安全国家标准 食品中锌的测定', category: '重金属检测', summary: '规定了火焰原子吸收光谱法测定食品中锌含量。' },
  { id: 'std-17', code: 'GB 5009.15-2014', title: '食品安全国家标准 食品中镉的测定', category: '重金属检测', summary: '规定了石墨炉原子吸收光谱法测定食品中镉。' },
  { id: 'std-18', code: 'GB 5009.17-2021', title: '食品安全国家标准 食品中总汞及有机汞的测定', category: '重金属检测', summary: '规定了原子荧光光谱法、冷原子吸收光谱法测定汞的方法。' },
  { id: 'std-19', code: 'GB 5009.11-2014', title: '食品安全国家标准 食品中总砷及无机砷的测定', category: '重金属检测', summary: '规定了氢化物原子荧光光谱法、液相色谱-电感耦合等离子体质谱法等测砷方法。' },
  { id: 'std-20', code: 'GB 5009.33-2016', title: '食品安全国家标准 食品中亚硝酸盐与硝酸盐的测定', category: '理化检验', summary: '规定了分光光度法、离子色谱法测定亚硝酸盐和硝酸盐。' },
  { id: 'std-21', code: 'GB 5009.34-2016', title: '食品安全国家标准 食品中二氧化硫的测定', category: '理化检验', summary: '规定了蒸馏法、滴定法、分光光度法测定二氧化硫的方法。' },
  { id: 'std-22', code: 'GB 5009.227-2016', title: '食品安全国家标准 食品中过氧化值的测定', category: '理化检验', summary: '规定了滴定法测定食品中过氧化值的方法。' },
  { id: 'std-23', code: 'GB 5009.229-2016', title: '食品安全国家标准 食品中酸价的测定', category: '理化检验', summary: '规定了冷溶剂指示剂滴定法、自动电位滴定法测定酸价。' },
  { id: 'std-24', code: 'GB 5009.235-2016', title: '食品安全国家标准 食品中氨基酸的测定', category: '理化检验', summary: '规定了离子交换色谱法、高效液相色谱法测定氨基酸组成。' },
  { id: 'std-25', code: 'GB 5009.236-2016', title: '食品安全国家标准 食品中维生素的测定', category: '理化检验', summary: '规定了各类维生素的测定方法，包括HPLC法、荧光法等。' },
  
  // ===== 微生物检验 =====
  { id: 'std-26', code: 'GB 4789.2-2022', title: '食品安全国家标准 食品微生物学检验 菌落总数测定', category: '微生物检验', summary: '规定了食品中需氧菌菌落总数的测定方法。' },
  { id: 'std-27', code: 'GB 4789.3-2016', title: '食品安全国家标准 食品微生物学检验 大肠菌群计数', category: '微生物检验', summary: '规定了MPN法和平板计数法测定大肠菌群。' },
  { id: 'std-28', code: 'GB 4789.4-2016', title: '食品安全国家标准 食品微生物学检验 沙门氏菌检验', category: '微生物检验', summary: '规定了食品中沙门氏菌的检验方法。' },
  { id: 'std-29', code: 'GB 4789.10-2016', title: '食品安全国家标准 食品微生物学检验 金黄色葡萄球菌检验', category: '微生物检验', summary: '规定了金黄色葡萄球菌的定性和定量检验方法。' },
  { id: 'std-30', code: 'GB 4789.15-2016', title: '食品安全国家标准 食品微生物学检验 霉菌和酵母计数', category: '微生物检验', summary: '规定了平板计数法测定霉菌和酵母数量。' },
  
  // ===== 化学试剂标准 =====
  { id: 'std-31', code: 'GB/T 603-2002', title: '化学试剂 试验方法中所用制剂及制品的制备', category: '化学试剂', summary: '规定了化学试剂检验中常用制剂和制品的制备方法。' },
  { id: 'std-32', code: 'GB/T 601-2016', title: '化学试剂 标准滴定溶液的制备', category: '化学试剂', summary: '规定了各类标准滴定溶液的配制和标定方法。' },
  { id: 'std-33', code: 'GB/T 602-2002', title: '化学试剂 杂质测定用标准溶液的制备', category: '化学试剂', summary: '规定了化学试剂杂质测定用标准溶液的配制方法。' },
  { id: 'std-34', code: 'GB/T 625-2007', title: '化学试剂 硫酸', category: '化学试剂', summary: '规定了化学试剂硫酸的技术要求、试验方法、检验规则等。' },
  { id: 'std-35', code: 'GB/T 622-2006', title: '化学试剂 盐酸', category: '化学试剂', summary: '规定了化学试剂盐酸的技术要求和检验方法。' },
  { id: 'std-36', code: 'GB/T 626-2006', title: '化学试剂 硝酸', category: '化学试剂', summary: '规定了化学试剂硝酸的技术要求和检验方法。' },
  { id: 'std-37', code: 'GB/T 678-2002', title: '化学试剂 乙醇（无水乙醇）', category: '化学试剂', summary: '规定了分析纯和化学纯乙醇的技术要求。' },
  { id: 'std-38', code: 'GB/T 683-2006', title: '化学试剂 甲醇', category: '化学试剂', summary: '规定了化学试剂甲醇的技术要求和检验方法。' },
  { id: 'std-39', code: 'GB/T 686-2008', title: '化学试剂 丙酮', category: '化学试剂', summary: '规定了化学试剂丙酮的技术要求和检验方法。' },
  { id: 'std-40', code: 'GB/T 689-2014', title: '化学试剂 乙酸乙酯', category: '化学试剂', summary: '规定了化学试剂乙酸乙酯的技术要求和检验方法。' },
  { id: 'std-41', code: 'GB/T 685-2016', title: '化学试剂 甲苯', category: '化学试剂', summary: '规定了化学试剂甲苯的技术要求和检验方法。' },
  { id: 'std-42', code: 'GB/T 682-2002', title: '化学试剂 三氯甲烷', category: '化学试剂', summary: '规定了化学试剂三氯甲烷（氯仿）的技术要求。' },
  { id: 'std-43', code: 'GB/T 4472-2011', title: '化工产品密度、相对密度的测定', category: '化工检测', summary: '规定了化工产品密度和相对密度的测定方法。' },
  { id: 'std-44', code: 'GB/T 6682-2008', title: '分析实验室用水规格和试验方法', category: '实验室通用', summary: '规定了分析实验室用水的级别、技术要求和检验方法。' },
  
  // ===== 农药残留检测 =====
  { id: 'std-45', code: 'GB 23200.8-2016', title: '食品安全国家标准 水果和蔬菜中500种农药及相关化学品残留量的测定', category: '农药残留', summary: '规定了气相色谱-质谱法和液相色谱-质谱法测定农残的方法。' },
  { id: 'std-46', code: 'GB 23200.13-2016', title: '食品安全国家标准 茶叶中448种农药及相关化学品残留量的测定', category: '农药残留', summary: '规定了液相色谱-质谱/质谱法测定茶叶农残。' },
  { id: 'std-47', code: 'GB 23200.113-2018', title: '食品安全国家标准 植物源性食品中208种农药及其代谢物残留量的测定', category: '农药残留', summary: '规定了气相色谱-质谱联用法测定农药残留。' },
  { id: 'std-48', code: 'GB 23200.121-2021', title: '食品安全国家标准 植物源性食品中331种农药及其代谢物残留量的测定', category: '农药残留', summary: '规定了液相色谱-质谱联用法测定农药残留。' },
  
  // ===== 兽药残留检测 =====
  { id: 'std-49', code: 'GB/T 21317-2007', title: '动物源性食品中四环素类兽药残留量检测方法', category: '兽药残留', summary: '规定了液相色谱-串联质谱法测定四环素类药物残留。' },
  { id: 'std-50', code: 'GB/T 20756-2006', title: '可食动物肌肉、肝脏和水产品中氯霉素残留量的测定', category: '兽药残留', summary: '规定了气相色谱-质谱法测定氯霉素残留。' },
  { id: 'std-51', code: 'GB/T 21312-2007', title: '动物源性食品中14种喹诺酮药物残留检测方法', category: '兽药残留', summary: '规定了液相色谱-串联质谱法测定喹诺酮类药物残留。' },
  { id: 'std-52', code: 'GB/T 21981-2008', title: '动物源食品中激素多残留检测方法', category: '兽药残留', summary: '规定了液相色谱-串联质谱法测定激素类药物残留。' },
  
  // ===== 食品添加剂检测 =====
  { id: 'std-53', code: 'GB 5009.28-2016', title: '食品安全国家标准 食品中苯甲酸、山梨酸和糖精钠的测定', category: '添加剂检测', summary: '规定了高效液相色谱法测定防腐剂和甜味剂。' },
  { id: 'std-54', code: 'GB 5009.35-2016', title: '食品安全国家标准 食品中合成着色剂的测定', category: '添加剂检测', summary: '规定了高效液相色谱法测定人工合成着色剂。' },
  { id: 'std-55', code: 'GB 5009.97-2016', title: '食品安全国家标准 食品中环己基氨基磺酸钠的测定', category: '添加剂检测', summary: '规定了液相色谱法测定甜蜜素含量。' },
  { id: 'std-56', code: 'GB 5009.141-2016', title: '食品安全国家标准 食品中诱惑红的测定', category: '添加剂检测', summary: '规定了高效液相色谱法测定诱惑红含量。' },
  
  // ===== 包装材料标准 =====
  { id: 'std-57', code: 'GB/T 191-2008', title: '包装储运图示标志', category: '包装运输', summary: '规定了包装储运图示标志的名称、图形、尺寸、颜色及应用方法。' },
  { id: 'std-58', code: 'GB 4806.1-2016', title: '食品安全国家标准 食品接触材料及制品通用安全要求', category: '包装材料', summary: '规定了食品接触材料的基本安全要求。' },
  { id: 'std-59', code: 'GB 9685-2016', title: '食品安全国家标准 食品接触材料及制品用添加剂使用标准', category: '包装材料', summary: '规定了允许使用的添加剂品种、使用范围和限量。' },
  { id: 'std-60', code: 'GB 4806.7-2016', title: '食品安全国家标准 食品接触用塑料材料及制品', category: '包装材料', summary: '规定了塑料食品接触材料的技术要求。' },
  
  // ===== 实验室质量控制 =====
  { id: 'std-61', code: 'GB/T 27404-2008', title: '实验室质量控制规范 食品理化检测', category: '实验室管理', summary: '规定了食品理化检测实验室的质量控制要求。' },
  { id: 'std-62', code: 'GB/T 27417-2017', title: '合格评定 化学分析方法确认和验证指南', category: '实验室管理', summary: '规定了化学分析方法确认和验证的程序和要求。' },
  { id: 'std-63', code: 'GB/T 32465-2015', title: '化学分析方法验证确认和内部质量控制要求', category: '实验室管理', summary: '规定了化学分析方法的验证确认和质量控制实施要求。' },
  { id: 'std-64', code: 'CNAS-CL01', title: '检测和校准实验室能力认可准则', category: '实验室管理', summary: '等同采用ISO/IEC 17025，规定了实验室能力的通用要求。' },
];

const LibraryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'property' | 'standard' | 'method'>('property');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [propertyResult, setPropertyResult] = useState<{data: Reagent, isAI: boolean} | null>(null);
  
  // Standards State
  const [savedStandards] = useState<Standard[]>(INITIAL_STANDARDS);
  const [standardResults, setStandardResults] = useState<{data: Standard[], source: 'local' | 'ai'} | null>(null);

  // Reagent State - 初始数据 + 用户添加的数据
  const [savedReagents, setSavedReagents] = useState<Reagent[]>(INITIAL_REAGENTS);
  const [isAddingReagent, setIsAddingReagent] = useState(false);
  const [newReagent, setNewReagent] = useState<Partial<Reagent>>({ name: '', cas: '', mw: 0 });

  // 加载用户添加的试剂
  useEffect(() => {
    const loadUserReagents = async () => {
      try {
        const docs = await reagentService.list();
        const userReagents: Reagent[] = docs.map(d => ({
          name: d.name, cas: d.cas, mw: d.mw,
          density: d.density, mp: d.mp, bp: d.bp, solubility: d.solubility, pKa: d.pKa
        }));
        setSavedReagents([...userReagents, ...INITIAL_REAGENTS]);
      } catch (error) {
        console.error('Failed to load user reagents:', error);
      }
    };
    loadUserReagents();
  }, []);

  // SOP State
  const [isAddingSOP, setIsAddingSOP] = useState(false);
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [newSOPTitle, setNewSOPTitle] = useState('');
  const [newSOPCategory, setNewSOPCategory] = useState('溶剂处理');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [methods, setMethods] = useState<SOP[]>([
    // ===== 溶剂处理 =====
    { 
      id: 'sop-01', 
      title: '无水乙醇脱水处理', 
      category: '溶剂处理', 
      fileType: 'pdf', 
      fileName: 'ethanol_drying.pdf',
      steps: ['加入活化好的分子筛 (3A/4A)', '静置 24-48 小时', '减压蒸馏取馏分', '密封保存于干燥柜'],
      precautions: '分子筛需在 300℃ 下活化 6 小时以上方可使用。'
    },
    { 
      id: 'sop-02', 
      title: 'THF 除水除过氧化物', 
      category: '溶剂处理', 
      fileType: 'pdf', 
      fileName: 'thf_purification.pdf',
      steps: ['用碘化钾淀粉试纸检测过氧化物', '加入氢氧化钠片状除水', '加入二苯甲酮和钠丝回流至深蓝色', '减压蒸馏收集馏分'],
      precautions: '过氧化物浓度高时有爆炸风险，必须先检测。钠丝遇水剧烈反应，操作时注意安全。'
    },
    { 
      id: 'sop-03', 
      title: 'DCM 纯化干燥', 
      category: '溶剂处理', 
      fileType: 'pdf', 
      fileName: 'dcm_purification.pdf',
      steps: ['用 5% 碳酸钠溶液洗涤除酸', '用水洗涤除碳酸钠', '用无水氯化钙干燥过夜', '蒸馏收集 39-40℃ 馏分'],
      precautions: 'DCM 有麻醉性，在通风橱中操作。'
    },
    
    // ===== 分离纯化 =====
    { 
      id: 'sop-04', 
      title: '柱层析装柱标准化操作', 
      category: '分离纯化', 
      fileType: 'docx', 
      fileName: 'column_chromatography.docx',
      steps: ['准备干硅胶与溶剂混悬', '湿法装柱，排除气泡', '用溶剂平衡 2-3 个柱体积', '上样并开始洗脱'],
      precautions: '装柱过程中切勿干柱，以免影响分离效果。'
    },
    { 
      id: 'sop-05', 
      title: '快速柱层析 (Flash Column)', 
      category: '分离纯化', 
      fileType: 'pdf', 
      fileName: 'flash_column.pdf',
      steps: ['选择合适的硅胶粒度 (40-63 μm)', '干法或湿法装柱', '加压使溶剂快速流动', 'TLC 监测收集馏分'],
      precautions: '压力不宜过大，避免硅胶压实影响分离效果。'
    },
    { 
      id: 'sop-06', 
      title: '重结晶通用方法', 
      category: '分离纯化', 
      fileType: 'md', 
      fileName: 'recrystallization_guide.md',
      steps: ['取少量样品置于试管', '依次滴加不同极性溶剂', '加热回流观察溶解性', '室温静置看晶体析出情况'],
      precautions: '注意易燃溶剂的加热安全，必须使用水浴或油浴。'
    },
    { 
      id: 'sop-07', 
      title: '液液萃取操作', 
      category: '分离纯化', 
      fileType: 'pdf', 
      fileName: 'liquid_extraction.pdf',
      steps: ['选择合适的萃取溶剂', '将混合物转入分液漏斗', '振摇后静置分层', '分离有机相和水相，必要时重复萃取'],
      precautions: '振摇时注意放气，避免压力过大。'
    },
    { 
      id: 'sop-08', 
      title: '减压蒸馏操作', 
      category: '分离纯化', 
      fileType: 'pdf', 
      fileName: 'vacuum_distillation.pdf',
      steps: ['检查装置气密性', '缓慢降低压力', '加热蒸馏，控制温度', '收集目标馏分'],
      precautions: '玻璃器皿应无裂纹，避免内爆。加热需缓慢均匀。'
    },
    
    // ===== 反应操作 =====
    { 
      id: 'sop-09', 
      title: '无水无氧操作 (Schlenk 技术)', 
      category: '反应操作', 
      fileType: 'pdf', 
      fileName: 'schlenk_technique.pdf',
      steps: ['检查 Schlenk 线真空和氮气', '三次抽真空-充氮气循环', '使用注射器转移试剂', '保持正压下操作'],
      precautions: '确保所有接口密封良好，防止空气和水分进入。'
    },
    { 
      id: 'sop-10', 
      title: '低温反应 (-78℃)', 
      category: '反应操作', 
      fileType: 'pdf', 
      fileName: 'low_temp_reaction.pdf',
      steps: ['准备干冰/丙酮浴', '将反应瓶置于冷浴中', '缓慢滴加试剂', '反应完成后缓慢升温'],
      precautions: '干冰会引起冻伤，操作时戴手套。丙酮易燃，远离火源。'
    },
    { 
      id: 'sop-11', 
      title: '回流反应操作', 
      category: '反应操作', 
      fileType: 'pdf', 
      fileName: 'reflux_reaction.pdf',
      steps: ['组装回流装置', '加入试剂和溶剂', '开启冷凝水后加热', 'TLC 监测反应进程'],
      precautions: '确保冷凝效果良好，防止溶剂损失。'
    },
    { 
      id: 'sop-12', 
      title: '催化氢化反应', 
      category: '反应操作', 
      fileType: 'pdf', 
      fileName: 'hydrogenation.pdf',
      steps: ['将钯碳催化剂置于反应瓶', '加入底物和溶剂', '抽换氢气三次', '室温或加热搅拌反应'],
      precautions: '钯碳干燥时易燃，必须在溶剂中操作。过滤时用硅藻土。'
    },
    { 
      id: 'sop-13', 
      title: 'Grignard 试剂制备', 
      category: '反应操作', 
      fileType: 'pdf', 
      fileName: 'grignard_reagent.pdf',
      steps: ['无水条件下活化镁屑', '缓慢滴加卤代烃', '观察反应引发', '保持回流完成反应'],
      precautions: 'Grignard 试剂对水和空气极敏感，必须严格无水无氧操作。'
    },
    
    // ===== 分析检测 =====
    { 
      id: 'sop-14', 
      title: 'TLC 薄层色谱分析', 
      category: '分析检测', 
      fileType: 'pdf', 
      fileName: 'tlc_analysis.pdf',
      steps: ['准备展开剂', '点样于 TLC 板', '展开至适当高度', 'UV 灯或显色剂显色'],
      precautions: '点样量不宜过多，避免拖尾。'
    },
    { 
      id: 'sop-15', 
      title: '熔点测定操作', 
      category: '分析检测', 
      fileType: 'pdf', 
      fileName: 'melting_point.pdf',
      steps: ['将样品研细', '装入毛细管约 2-3 mm', '放入熔点仪', '缓慢升温观察记录'],
      precautions: '升温速率在熔点附近应放慢 (1-2℃/min)。'
    },
    { 
      id: 'sop-16', 
      title: '旋光度测定', 
      category: '分析检测', 
      fileType: 'pdf', 
      fileName: 'optical_rotation.pdf',
      steps: ['配制已知浓度溶液', '清洁旋光管', '用溶剂校零', '测定样品旋光度'],
      precautions: '溶液中不能有气泡，温度需恒定。'
    },
    { 
      id: 'sop-17', 
      title: 'NMR 样品制备', 
      category: '分析检测', 
      fileType: 'pdf', 
      fileName: 'nmr_sample_prep.pdf',
      steps: ['选择合适的氘代溶剂', '称取 5-20 mg 样品', '溶解于 0.6 mL 溶剂', '转入 NMR 管'],
      precautions: '样品需完全溶解，无固体颗粒。'
    },
    { 
      id: 'sop-18', 
      title: 'HPLC 样品制备', 
      category: '分析检测', 
      fileType: 'pdf', 
      fileName: 'hplc_sample_prep.pdf',
      steps: ['选择与流动相兼容的溶剂', '配制适当浓度溶液', '用 0.22 μm 滤膜过滤', '转入进样瓶'],
      precautions: '样品浓度不宜过高，避免超载。'
    },
    
    // ===== 安全操作 =====
    { 
      id: 'sop-19', 
      title: '化学品泄漏应急处理', 
      category: '安全操作', 
      fileType: 'pdf', 
      fileName: 'chemical_spill.pdf',
      steps: ['疏散人员，通风', '穿戴防护装备', '用吸附材料覆盖', '按危废规定处理'],
      precautions: '不同化学品处理方法不同，参考 MSDS。'
    },
    { 
      id: 'sop-20', 
      title: '废液处理规范', 
      category: '安全操作', 
      fileType: 'pdf', 
      fileName: 'waste_disposal.pdf',
      steps: ['分类收集废液', '正确标识容器', '填写废液登记', '联系有资质单位处理'],
      precautions: '严禁将有机废液倒入下水道。'
    },
    
    // ===== 仪器操作 =====
    { 
      id: 'sop-21', 
      title: '旋转蒸发仪操作', 
      category: '仪器操作', 
      fileType: 'pdf', 
      fileName: 'rotary_evaporator.pdf',
      steps: ['检查水浴温度', '连接真空系统', '放入旋蒸瓶开始旋转', '缓慢降低压力蒸发溶剂'],
      precautions: '先旋转再抽真空，防止暴沸。温度不宜过高。'
    },
    { 
      id: 'sop-22', 
      title: '分析天平使用', 
      category: '仪器操作', 
      fileType: 'pdf', 
      fileName: 'analytical_balance.pdf',
      steps: ['检查水平气泡', '预热 30 分钟', '去皮后称量', '记录数据'],
      precautions: '避免振动和气流干扰，关闭侧门称量。'
    },
    { 
      id: 'sop-23', 
      title: 'pH 计校准与使用', 
      category: '仪器操作', 
      fileType: 'pdf', 
      fileName: 'ph_meter.pdf',
      steps: ['用标准缓冲液校准', '清洗电极', '测定样品 pH', '测定后清洗保存电极'],
      precautions: '电极需保存在 3M KCl 溶液中，避免干燥。'
    },
    { 
      id: 'sop-24', 
      title: '离心机操作规程', 
      category: '仪器操作', 
      fileType: 'pdf', 
      fileName: 'centrifuge.pdf',
      steps: ['对称放置离心管', '设置转速和时间', '盖好盖子启动', '停止后再打开取样'],
      precautions: '必须对称平衡，运行中不可打开盖子。'
    },
  ]);

  // 加载用户添加的 SOP
  useEffect(() => {
    const loadUserSOPs = async () => {
      try {
        const docs = await sopService.list();
        const userSOPs: SOP[] = docs.map(d => ({
          id: d.$id || '', title: d.title, category: d.category,
          steps: d.steps, precautions: d.precautions, fileName: d.fileName, fileType: d.fileType as any
        }));
        if (userSOPs.length > 0) {
          setMethods(prev => [...userSOPs, ...prev]);
        }
      } catch (error) {
        console.error('Failed to load user SOPs:', error);
      }
    };
    loadUserSOPs();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);

    if (activeTab === 'property') {
      const localMatch = savedReagents.find(r => 
        r.name.toLowerCase().includes(query.toLowerCase()) || r.cas.includes(query)
      );
      if (localMatch) {
        setPropertyResult({ data: localMatch, isAI: false });
      } else {
        const res = await lookupChemicalProperties(query);
        if (res) setPropertyResult({ data: res, isAI: true });
      }
    } else if (activeTab === 'standard') {
      const localMatches = savedStandards.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) || 
        s.code.toLowerCase().includes(query.toLowerCase())
      );
      if (localMatches.length > 0) {
        setStandardResults({ data: localMatches, source: 'local' });
      } else {
        const res = await searchStandards(query);
        setStandardResults(res.length > 0 ? { data: res, source: 'ai' } : null);
      }
    }
    setLoading(false);
  };

  const handleSaveReagent = async (reagent: Reagent) => {
    if (savedReagents.some(r => r.cas === reagent.cas)) return alert("已在库中");
    try {
      await reagentService.create({
        name: reagent.name,
        cas: reagent.cas,
        mw: reagent.mw,
        density: reagent.density,
        mp: reagent.mp,
        bp: reagent.bp,
        solubility: reagent.solubility,
        pKa: reagent.pKa,
      });
      setSavedReagents([reagent, ...savedReagents]);
    } catch (error) {
      console.error('Failed to save reagent:', error);
      alert('保存失败');
    }
  };

  const handleDownload = (sop: SOP) => {
    setLoading(true);
    
    // 生成 SOP 文档内容
    const content = `
================================================================================
                            标准操作规程 (SOP)
================================================================================

文档编号: ${sop.id.toUpperCase()}
文档名称: ${sop.title}
分类: ${sop.category}
更新日期: ${new Date().toLocaleDateString('zh-CN')}

--------------------------------------------------------------------------------
                              操作步骤
--------------------------------------------------------------------------------

${(sop.steps || []).map((step, idx) => `  ${idx + 1}. ${step}`).join('\n\n')}

--------------------------------------------------------------------------------
                            安全注意事项
--------------------------------------------------------------------------------

⚠️ ${sop.precautions || '请遵守实验室通用安全规范。'}

--------------------------------------------------------------------------------
                              附加信息
--------------------------------------------------------------------------------

本文档由 ChemLab 智囊系统生成
仅供参考，实际操作请遵循实验室具体规定

================================================================================
`;

    // 创建 Blob 并触发下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sop.id}_${sop.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setLoading(false);
  };

  const getFileIcon = (type?: string) => {
    if (type === 'pdf') return <FileType className="w-5 h-5 text-rose-500" />;
    if (type === 'docx') return <FileText className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">知识与标准库</h2>
        <Library className="w-6 h-6 text-indigo-500" />
      </div>

      <div className="flex p-1 bg-slate-200 rounded-xl">
        {(['property', 'standard', 'method'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'property' ? '物化性质' : tab === 'standard' ? '国标/行标' : '常用方法'}
          </button>
        ))}
      </div>

      {activeTab !== 'method' && (
        <div className="space-y-4">
          {activeTab === 'standard' && (
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                   <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-900 block">食品伙伴网官方库直连</span>
                  <p className="text-[9px] text-indigo-600/70 font-bold uppercase tracking-widest mt-0.5 italic">OFFLINE SYNCED | LIVE AI DUAL-MODE</p>
                </div>
              </div>
              <a href="https://db.foodmate.net/" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center hover:bg-indigo-700 transition-all shadow-md">
                前往官方库 <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            </div>
          )}

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={activeTab === 'property' ? '搜索库中试剂名或 CAS...' : '输入标准号或关键词 (如: GB 2760)...'}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center shadow-lg active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '检索'}
            </button>
          </div>
        </div>
      )}

      {/* Property Tab Content omitted for brevity but preserved */}
      {activeTab === 'property' && (
        <div className="space-y-6">
           {propertyResult && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <div className={`p-6 rounded-[2.5rem] border ${propertyResult.isAI ? 'bg-white border-indigo-100 shadow-xl' : 'bg-slate-900 text-white border-slate-800 shadow-xl'} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-6 flex items-center space-x-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${propertyResult.isAI ? 'bg-indigo-50 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20'}`}>
                    {propertyResult.isAI ? 'AI 智囊检索' : '官方库已入库'}
                  </span>
                  {propertyResult.isAI && (
                    <button onClick={() => handleSaveReagent(propertyResult.data)} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                      <Save className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mb-8">
                  <h3 className={`text-2xl font-black ${propertyResult.isAI ? 'text-slate-800' : 'text-white'}`}>{propertyResult.data.name}</h3>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] mt-2 ${propertyResult.isAI ? 'text-indigo-500' : 'text-slate-400'}`}>CAS: {propertyResult.data.cas}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '分子量', val: `${propertyResult.data.mw} g/mol`, icon: Hash },
                    { label: '密度', val: propertyResult.data.density ? `${propertyResult.data.density} g/cm³` : 'N/A', icon: Droplet },
                    { label: '熔/沸点', val: `${propertyResult.data.mp || '-'} / ${propertyResult.data.bp || '-'}`, icon: Thermometer },
                    { label: '溶解度/pKa', val: `${propertyResult.data.solubility || '-'} / ${propertyResult.data.pKa || '-'}`, icon: ShieldCheck }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-start space-x-3 p-4 rounded-3xl ${propertyResult.isAI ? 'bg-slate-50' : 'bg-white/5 border border-white/10'}`}>
                      <item.icon className={`w-4 h-4 mt-0.5 ${propertyResult.isAI ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${propertyResult.isAI ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                        <p className={`text-sm font-bold ${propertyResult.isAI ? 'text-slate-700' : 'text-slate-200'}`}>{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* ... existing reagent catalog content ... */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
              <Database className="w-4 h-4 mr-2 text-indigo-400" /> 我的数据库目录 ({savedReagents.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedReagents.map((r, i) => (
                <div key={i} onClick={() => { setQuery(r.name); handleSearch(); }} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[2rem] hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all"><Beaker className="w-5 h-5" /></div>
                    <div className="overflow-hidden"><p className="text-sm font-black text-slate-800 truncate leading-tight">{r.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">CAS: {r.cas}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Standard Tab Content preserved */}
      {activeTab === 'standard' && (
        <div className="space-y-4">
          {standardResults ? (
            <div className="space-y-4 animate-in fade-in">
              {standardResults.data.map((std, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-4 py-1.5 text-[8px] font-black uppercase tracking-tighter rounded-bl-xl border-l border-b ${standardResults.source === 'local' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {standardResults.source === 'local' ? 'Official Local DB' : 'AI Live Search'}
                  </div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${standardResults.source === 'local' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>{std.code}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{std.category}</span>
                  </div>
                  <h4 className="font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors text-lg leading-snug">{std.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{std.summary}"</p>
                  <a href={`https://db.foodmate.net/search.php?query=${encodeURIComponent(std.code)}`} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-95">全文查询 <ExternalLink className="w-3.5 h-3.5 ml-2" /></a>
                </div>
              ))}
            </div>
          ) : !loading && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                <Database className="w-4 h-4 mr-2 text-indigo-400" /> 标准库目录 ({savedStandards.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {savedStandards.map((std, i) => (
                  <div key={i} onClick={() => { setQuery(std.code); }} className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-3 py-1 text-[10px] font-black rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">{std.code}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{std.category}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">{std.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Method Tab (UPDATED with View/Download) */}
      {activeTab === 'method' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">私有 SOP 与标准化文件库</h3>
            <button onClick={() => setIsAddingSOP(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 shadow-lg active:scale-95"><Plus className="w-4 h-4 mr-2" /> 录入存证</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {methods.map((method, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedSOP(method)}
                className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[2.5rem] hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group shadow-sm border-l-4 border-l-transparent hover:border-l-indigo-600"
              >
                <div className="flex items-center space-x-5">
                  <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">{getFileIcon(method.fileType)}</div>
                  <div>
                    <p className="text-md font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{method.title}</p>
                    <div className="flex items-center mt-1.5 space-x-3">
                      <span className="text-[10px] text-indigo-500 font-black uppercase bg-indigo-50 px-2 py-0.5 rounded-md">{method.category}</span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center"><Eye className="w-3 h-3 mr-1" /> 点击预览详情</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOP Preview Modal */}
      {selectedSOP && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  {getFileIcon(selectedSOP.fileType)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{selectedSOP.title}</h3>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">ID: {selectedSOP.id}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> 2024-05-22 更新</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSOP(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* SOP Steps */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                   <BookOpen className="w-4 h-4 mr-2 text-indigo-400" /> 标准操作步骤 (SOP)
                </h4>
                <div className="space-y-3">
                  {(selectedSOP.steps || ['暂无详细步骤描述']).map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-4 group">
                      <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {idx + 1}
                      </div>
                      <p className="text-sm font-medium text-slate-700 pt-0.5 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precautions */}
              <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center mb-3">
                  {/* Fix: replaced ShieldInfo with ShieldAlert which is the correct lucide-react icon */}
                  <ShieldAlert className="w-4 h-4 mr-2" /> 安全注意事项
                </h4>
                <p className="text-sm text-rose-900 leading-relaxed font-medium">
                  {selectedSOP.precautions || '实验室通用安全守则适用。'}
                </p>
              </div>

              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <div className="flex items-center space-x-3">
                   <div className="text-slate-400 font-bold text-[10px] uppercase">原始存证名:</div>
                   <div className="text-slate-600 font-black text-xs">{selectedSOP.fileName}</div>
                </div>
                <div className="text-slate-400 font-bold text-[10px] uppercase">Size: 1.2 MB</div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex space-x-4">
              <button 
                onClick={() => setSelectedSOP(null)}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all"
              >
                关闭预览
              </button>
              <button 
                onClick={() => handleDownload(selectedSOP)}
                disabled={loading}
                className="flex-2 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                下载原始存证文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reagent & SOP Modals (Keep from previous implementation) */}
      {isAddingSOP && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
              <h3 className="text-xl font-black text-slate-800">方法录入存证</h3>
              <button onClick={() => setIsAddingSOP(false)} className="p-2 hover:bg-white rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <input type="text" placeholder="方法名称" value={newSOPTitle} onChange={e => setNewSOPTitle(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              <div onClick={() => fileInputRef.current?.click()} className={`mt-1 border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer ${selectedFile ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 hover:bg-slate-100'}`}>
                <input type="file" ref={fileInputRef} className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                {selectedFile ? <><CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" /><p className="text-sm font-black text-emerald-700">{selectedFile.name}</p></> : <><Upload className="w-10 h-10 text-slate-300 mb-3" /><p className="text-xs font-bold text-slate-400">点击上传 PDF, DOCX, MD, TXT</p></>}
              </div>
              <button onClick={async () => { 
                try {
                  const sopData = {title: newSOPTitle, category: newSOPCategory, fileName: selectedFile?.name || '', fileType: 'pdf'};
                  await sopService.create(sopData);
                  setMethods([...methods, {id: Date.now().toString(), ...sopData}]); 
                  setIsAddingSOP(false);
                } catch (error) {
                  console.error('Failed to save SOP:', error);
                  alert('保存失败');
                }
              }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">开始同步</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;