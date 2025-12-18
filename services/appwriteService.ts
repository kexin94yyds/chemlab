import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from './appwriteConfig';

const TIMEOUT_MS = 5000;
const LS_KEYS = {
  ELN: 'chemlab_eln_entries',
  REAGENTS: 'chemlab_reagents',
  SOPS: 'chemlab_sops',
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

const getLocal = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
};

const saveLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// =============== ELN Entries ===============
export interface ELNEntryDoc {
  $id?: string;
  title: string;
  date: string;
  tags: string[];
  content?: string;
  photoUrl?: string;
}

export const elnService = {
  async list(): Promise<ELNEntryDoc[]> {
    try {
      const response = await withTimeout(
        databases.listDocuments(DATABASE_ID, COLLECTIONS.ELN_ENTRIES, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        TIMEOUT_MS
      );
      const docs = response.documents as unknown as ELNEntryDoc[];
      saveLocal(LS_KEYS.ELN, docs);
      return docs;
    } catch {
      console.warn('Appwrite unavailable, using local storage');
      return getLocal<ELNEntryDoc>(LS_KEYS.ELN);
    }
  },

  async create(entry: Omit<ELNEntryDoc, '$id'>): Promise<ELNEntryDoc> {
    try {
      const response = await withTimeout(
        databases.createDocument(DATABASE_ID, COLLECTIONS.ELN_ENTRIES, ID.unique(), entry),
        TIMEOUT_MS
      );
      return response as unknown as ELNEntryDoc;
    } catch {
      const localEntry = { ...entry, $id: `local_${Date.now()}` };
      const existing = getLocal<ELNEntryDoc>(LS_KEYS.ELN);
      saveLocal(LS_KEYS.ELN, [localEntry, ...existing]);
      return localEntry;
    }
  },

  async update(id: string, entry: Partial<ELNEntryDoc>): Promise<ELNEntryDoc> {
    try {
      const response = await withTimeout(
        databases.updateDocument(DATABASE_ID, COLLECTIONS.ELN_ENTRIES, id, entry),
        TIMEOUT_MS
      );
      return response as unknown as ELNEntryDoc;
    } catch {
      const existing = getLocal<ELNEntryDoc>(LS_KEYS.ELN);
      const updated = existing.map(e => e.$id === id ? { ...e, ...entry } : e);
      saveLocal(LS_KEYS.ELN, updated);
      return { $id: id, ...entry } as ELNEntryDoc;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await withTimeout(databases.deleteDocument(DATABASE_ID, COLLECTIONS.ELN_ENTRIES, id), TIMEOUT_MS);
    } catch {
      const existing = getLocal<ELNEntryDoc>(LS_KEYS.ELN);
      saveLocal(LS_KEYS.ELN, existing.filter(e => e.$id !== id));
    }
  },
};

// =============== Reagents ===============
export interface ReagentDoc {
  $id?: string;
  name: string;
  cas: string;
  mw: number;
  density?: number;
  mp?: string;
  bp?: string;
  solubility?: string;
  refractiveIndex?: string;
  pKa?: string;
}

export const reagentService = {
  async list(): Promise<ReagentDoc[]> {
    try {
      const response = await withTimeout(
        databases.listDocuments(DATABASE_ID, COLLECTIONS.REAGENTS, [Query.limit(500)]),
        TIMEOUT_MS
      );
      const docs = response.documents as unknown as ReagentDoc[];
      saveLocal(LS_KEYS.REAGENTS, docs);
      return docs;
    } catch {
      return getLocal<ReagentDoc>(LS_KEYS.REAGENTS);
    }
  },

  async create(reagent: Omit<ReagentDoc, '$id'>): Promise<ReagentDoc> {
    try {
      const response = await withTimeout(
        databases.createDocument(DATABASE_ID, COLLECTIONS.REAGENTS, ID.unique(), reagent),
        TIMEOUT_MS
      );
      return response as unknown as ReagentDoc;
    } catch {
      const localReagent = { ...reagent, $id: `local_${Date.now()}` };
      const existing = getLocal<ReagentDoc>(LS_KEYS.REAGENTS);
      saveLocal(LS_KEYS.REAGENTS, [localReagent, ...existing]);
      return localReagent;
    }
  },

  async update(id: string, reagent: Partial<ReagentDoc>): Promise<ReagentDoc> {
    try {
      const response = await withTimeout(
        databases.updateDocument(DATABASE_ID, COLLECTIONS.REAGENTS, id, reagent),
        TIMEOUT_MS
      );
      return response as unknown as ReagentDoc;
    } catch {
      const existing = getLocal<ReagentDoc>(LS_KEYS.REAGENTS);
      const updated = existing.map(r => r.$id === id ? { ...r, ...reagent } : r);
      saveLocal(LS_KEYS.REAGENTS, updated);
      return { $id: id, ...reagent } as ReagentDoc;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await withTimeout(databases.deleteDocument(DATABASE_ID, COLLECTIONS.REAGENTS, id), TIMEOUT_MS);
    } catch {
      const existing = getLocal<ReagentDoc>(LS_KEYS.REAGENTS);
      saveLocal(LS_KEYS.REAGENTS, existing.filter(r => r.$id !== id));
    }
  },
};

// =============== SOPs ===============
export interface SOPDoc {
  $id?: string;
  title: string;
  category: string;
  steps?: string[];
  precautions?: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
}

export const sopService = {
  async list(): Promise<SOPDoc[]> {
    try {
      const response = await withTimeout(
        databases.listDocuments(DATABASE_ID, COLLECTIONS.SOPS, [Query.limit(200)]),
        TIMEOUT_MS
      );
      const docs = response.documents as unknown as SOPDoc[];
      saveLocal(LS_KEYS.SOPS, docs);
      return docs;
    } catch {
      return getLocal<SOPDoc>(LS_KEYS.SOPS);
    }
  },

  async create(sop: Omit<SOPDoc, '$id'>): Promise<SOPDoc> {
    try {
      const response = await withTimeout(
        databases.createDocument(DATABASE_ID, COLLECTIONS.SOPS, ID.unique(), sop),
        TIMEOUT_MS
      );
      return response as unknown as SOPDoc;
    } catch {
      const localSop = { ...sop, $id: `local_${Date.now()}` };
      const existing = getLocal<SOPDoc>(LS_KEYS.SOPS);
      saveLocal(LS_KEYS.SOPS, [localSop, ...existing]);
      return localSop;
    }
  },

  async update(id: string, sop: Partial<SOPDoc>): Promise<SOPDoc> {
    try {
      const response = await withTimeout(
        databases.updateDocument(DATABASE_ID, COLLECTIONS.SOPS, id, sop),
        TIMEOUT_MS
      );
      return response as unknown as SOPDoc;
    } catch {
      const existing = getLocal<SOPDoc>(LS_KEYS.SOPS);
      const updated = existing.map(s => s.$id === id ? { ...s, ...sop } : s);
      saveLocal(LS_KEYS.SOPS, updated);
      return { $id: id, ...sop } as SOPDoc;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await withTimeout(databases.deleteDocument(DATABASE_ID, COLLECTIONS.SOPS, id), TIMEOUT_MS);
    } catch {
      const existing = getLocal<SOPDoc>(LS_KEYS.SOPS);
      saveLocal(LS_KEYS.SOPS, existing.filter(s => s.$id !== id));
    }
  },
};
