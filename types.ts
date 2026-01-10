
export enum ModuleType {
  HOME = 'home',
  ELN = 'eln',
  CALCULATOR = 'calculator',
  SAFETY = 'safety',
  LIBRARY = 'library',
  WORKFLOW = 'workflow'
}

export interface Reagent extends ChemicalProperties {
  cas: string;
  name: string;
}

export interface ChemicalProperties {
  mw: number;
  density?: number;
  mp?: string; // Melting point
  bp?: string; // Boiling point
  solubility?: string;
  refractiveIndex?: string;
  pKa?: string;
}

export interface Standard {
  id: string;
  code: string; // e.g., GB/T 1234
  title: string;
  category: string;
  summary: string;
}

export interface SOP {
  id: string;
  title: string;
  category: string;
  steps?: string[];
  precautions?: string;
  fileName?: string;
  fileType?: 'pdf' | 'md' | 'docx' | 'doc' | 'text';
  fileUrl?: string;
}

export interface SafetyInfo {
  name: string;
  ghsSignals: string[];
  hazards: string[];
  precautions: string;
  environmentalImpact?: string; // 环境污染
  personnelSafety?: string;    // 人员防护
  equipmentSafety?: string;    // 仪器设备注意事项
}

export interface SafetySummary {
  environmental: string;
  personnel: string;
  equipment: string;
}
