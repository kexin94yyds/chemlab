import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from './appwriteConfig';

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
  async list() {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ELN_ENTRIES,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents as unknown as ELNEntryDoc[];
  },

  async create(entry: Omit<ELNEntryDoc, '$id'>) {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ELN_ENTRIES,
      ID.unique(),
      entry
    );
    return response as unknown as ELNEntryDoc;
  },

  async update(id: string, entry: Partial<ELNEntryDoc>) {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ELN_ENTRIES,
      id,
      entry
    );
    return response as unknown as ELNEntryDoc;
  },

  async delete(id: string) {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ELN_ENTRIES, id);
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
  async list() {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REAGENTS,
      [Query.limit(500)]
    );
    return response.documents as unknown as ReagentDoc[];
  },

  async create(reagent: Omit<ReagentDoc, '$id'>) {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REAGENTS,
      ID.unique(),
      reagent
    );
    return response as unknown as ReagentDoc;
  },

  async update(id: string, reagent: Partial<ReagentDoc>) {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.REAGENTS,
      id,
      reagent
    );
    return response as unknown as ReagentDoc;
  },

  async delete(id: string) {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.REAGENTS, id);
  },

  async bulkCreate(reagents: Omit<ReagentDoc, '$id'>[]) {
    const results = await Promise.all(
      reagents.map(r => this.create(r))
    );
    return results;
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
  async list() {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SOPS,
      [Query.limit(200)]
    );
    return response.documents as unknown as SOPDoc[];
  },

  async create(sop: Omit<SOPDoc, '$id'>) {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SOPS,
      ID.unique(),
      sop
    );
    return response as unknown as SOPDoc;
  },

  async update(id: string, sop: Partial<SOPDoc>) {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SOPS,
      id,
      sop
    );
    return response as unknown as SOPDoc;
  },

  async delete(id: string) {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SOPS, id);
  },
};
