import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client, ID, Query };

// Environment variables dan o'qiladi, agar bo'lmasa default qiymatlar ishlatiladi
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'buisness-bucket';
export const BUSINESSES_COLLECTION_ID = 'businesses'; // Collection ID (Appwrite Console da yaratganingizda shu nom bilan yarating)
export const TRANSACTIONS_COLLECTION_ID = 'transactions'; // Collection ID
export const STATS_COLLECTION_ID = 'stats'; // Collection ID (ixtiyoriy)

// Storage Bucket IDs
// ⚠️ MUHIM: Bu bucket ID bo'lishi kerak, nomi emas!
// Appwrite Console > Storage > Bucket Settings dan Bucket ID ni copy qiling
export const AVATARS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID || '6956bec5003a79462bbd'; // Bucket ID (screenshotdan ko'rinib turibdiki)
