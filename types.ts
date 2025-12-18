
export enum ModuleType {
  HOME = 'home',
  ELN = 'eln',
  CALCULATOR = 'calculator',
  SAFETY = 'safety',
  LIBRARY = 'library'
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
}
