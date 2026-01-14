import { Client, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6943ecd3000728029c66');

export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = '6943ed5f0008592ad9bc';
export const BUCKET_ID = '6966e218001502f05987';

// Collection IDs - 稍后创建
export const COLLECTIONS = {
  ELN_ENTRIES: 'eln_entries',
  REAGENTS: 'reagents', 
  SOPS: 'sops',
};

export { ID, Query };
