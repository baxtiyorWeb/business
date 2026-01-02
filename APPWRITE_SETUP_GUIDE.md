# Appwrite Collections va Database Sozlash - Batafsil Qo'llanma

## 🔍 Xatolik Tushuntirish

Sizning xatolik:
```
Database with the requested ID 'buisness_app' could not be found.
```

Bu shuni anglatadiki:
- Database Appwrite Console da yaratilmagan YOKI
- Database ID noto'g'ri

## 📚 Appwrite Tushunchalari

### 1. **Database (Ma'lumotlar Bazasi)**
Database - bu ma'lumotlarni saqlash uchun asosiy konteyner.

**Qanday yaratiladi:**
1. [Appwrite Console](https://cloud.appwrite.io/) ga kiring
2. "Databases" bo'limiga o'ting
3. "Create Database" tugmasini bosing
4. Database nomini kiriting (masalan: "Business App Database")
5. **Database ID** avtomatik yaratiladi yoki siz o'zingiz kiritasiz

**Muhim:** Database ID ni eslab qoling yoki copy qiling!

### 2. **Collection (To'plam)**
Collection - Database ichidagi jadval. Har bir collection ma'lum bir turdagi ma'lumotlarni saqlaydi.

**Misol:**
- `businesses` collection - bizneslar ro'yxati
- `transactions` collection - tranzaksiyalar ro'yxati

### 3. **Document (Hujjat)**
Document - Collection ichidagi bitta yozuv.

**Misol:**
```json
{
  "$id": "63f7a3b2a5678",
  "name": "Mening Do'konim",
  "type": "store",
  "userId": "6956c11a512ac7d6f374"
}
```

### 4. **Attributes (Atributlar)**
Attributes - Document ichidagi maydonlar (ustunlar).

**Misol:**
- `name` - String, 255 belgi
- `type` - String, 50 belgi
- `userId` - String, 255 belgi

### 5. **Indexes (Indekslar)**
Indexes - tez qidirish uchun. Masalan, `userId` bo'yicha qidirish tezroq bo'lishi uchun.

### 6. **Permissions (Ruxsatlar)**
Permissions - kim nima qila olishini belgilaydi.

**Misol:**
- Create: `users` - har qanday foydalanuvchi yarata oladi
- Read: `users` (own documents) - faqat o'z hujjatlarini o'qiy oladi
- Update: `users` (own documents) - faqat o'z hujjatlarini yangilay oladi
- Delete: `users` (own documents) - faqat o'z hujjatlarini o'chira oladi

## 🛠️ Qadam-baqadam Sozlash

### Qadam 1: Database Yaratish

1. [Appwrite Console](https://cloud.appwrite.io/) ga kiring
2. "Databases" bo'limiga o'ting
3. "Create Database" tugmasini bosing
4. Quyidagilarni to'ldiring:
   - **Name:** `Business App Database` (yoki istalgan nom)
   - **Database ID:** `business_db` (yoki istalgan ID, lekin eslab qoling!)
5. "Create" tugmasini bosing

**⚠️ Muhim:** Database ID ni copy qiling! (masalan: `business_db`)

### Qadam 2: Collection 1 - `businesses` Yaratish

1. Yaratilgan Database ga kiring
2. "Create Collection" tugmasini bosing
3. Quyidagilarni to'ldiring:
   - **Collection ID:** `businesses`
   - **Name:** `Businesses`
4. "Create" tugmasini bosing

**Attributes Qo'shish:**

Har bir attribute uchun "Create Attribute" tugmasini bosing:

1. **name**
   - Type: `String`
   - Size: `255`
   - Required: ✅ (belgilang)
   - Default: (bo'sh qoldiring)

2. **type**
   - Type: `String`
   - Size: `50`
   - Required: ✅
   - Default: `store`

3. **address**
   - Type: `String`
   - Size: `500`
   - Required: ❌

4. **phone**
   - Type: `String`
   - Size: `50`
   - Required: ❌

5. **email**
   - Type: `String`
   - Size: `255`
   - Required: ❌

6. **description**
   - Type: `String`
   - Size: `1000`
   - Required: ❌

7. **userId**
   - Type: `String`
   - Size: `255`
   - Required: ✅

**Index Yaratish:**

1. "Indexes" bo'limiga o'ting
2. "Create Index" tugmasini bosing
3. Quyidagilarni to'ldiring:
   - **Key:** `userId`
   - **Type:** `ASC`
   - **Attributes:** `userId` ni tanlang
4. "Create" tugmasini bosing

**Permissions Sozlash:**

1. "Settings" bo'limiga o'ting
2. "Permissions" bo'limida:
   - **Create:** `users` (Any user) - tanlang
   - **Read:** `users` (Only own documents) - tanlang
   - **Update:** `users` (Only own documents) - tanlang
   - **Delete:** `users` (Only own documents) - tanlang

**⚠️ Muhim:** Collection ID ni copy qiling! (bu `businesses` bo'lishi kerak)

### Qadam 3: Collection 2 - `transactions` Yaratish

1. Xuddi shu Database ichida "Create Collection" tugmasini bosing
2. Quyidagilarni to'ldiring:
   - **Collection ID:** `transactions`
   - **Name:** `Transactions`
3. "Create" tugmasini bosing

**Attributes Qo'shish:**

1. **businessId**
   - Type: `String`
   - Size: `255`
   - Required: ✅

2. **amount**
   - Type: `String`
   - Size: `50`
   - Required: ✅

3. **type**
   - Type: `String`
   - Size: `20`
   - Required: ✅
   - Default: `income`

4. **description**
   - Type: `String`
   - Size: `500`
   - Required: ❌

5. **customerName**
   - Type: `String`
   - Size: `255`
   - Required: ❌

6. **date**
   - Type: `String`
   - Size: `50`
   - Required: ✅

7. **userId**
   - Type: `String`
   - Size: `255`
   - Required: ✅

**Indexes Yaratish:**

1. `userId` (ASC)
2. `businessId` (ASC)
3. `date` (ASC)

**Permissions:** Xuddi `businesses` collection kabi sozlang

### Qadam 4: Environment Variables Sozlash

Loyiha ildizida `.env.local` faylini yarating:

```env
# Appwrite Endpoint (odatda o'zgarmaydi)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

# Project ID (Appwrite Console > Settings > General dan oling)
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here

# Database ID (Qadam 1 da yaratgan Database ID)
NEXT_PUBLIC_APPWRITE_DATABASE_ID=business_db
```

**⚠️ Muhim:** 
- `.env.local` faylini `.gitignore` ga qo'shing (xavfsizlik uchun)
- Project ID ni Appwrite Console > Settings > General dan toping

### Qadam 5: Kodni Yangilash

`lib/appwrite.ts` faylini yangilang:

```typescript
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'business_db';
export const BUSINESSES_COLLECTION_ID = 'businesses';
export const TRANSACTIONS_COLLECTION_ID = 'transactions';
```

## ✅ Tekshirish

1. Development serverni qayta ishga tushiring:
   ```bash
   npm run dev
   ```

2. Brauzerda `/businesses` sahifasiga kiring

3. Console da xatolik bo'lmasa - hammasi to'g'ri!

## 🐛 Muammolarni Hal Qilish

### "Database not found" xatosi
- ✅ Database yaratilganligini tekshiring
- ✅ Database ID to'g'ri ekanligini tekshiring
- ✅ `.env.local` faylida `NEXT_PUBLIC_APPWRITE_DATABASE_ID` to'g'ri ekanligini tekshiring

### "Collection not found" xatosi
- ✅ Collection yaratilganligini tekshiring
- ✅ Collection ID to'g'ri ekanligini tekshiring
- ✅ Collection shu Database ichida ekanligini tekshiring

### "Permission denied" xatosi
- ✅ Permissions to'g'ri sozlanganligini tekshiring
- ✅ "Read: users (Only own documents)" sozlanganligini tekshiring

### "Attribute not found" xatosi
- ✅ Barcha kerakli attributes yaratilganligini tekshiring
- ✅ Attribute nomlari to'g'ri ekanligini tekshiring

## 📝 Qisqacha Xotira

1. **Database** yaratish → Database ID ni eslab qolish
2. **Collection** yaratish → Collection ID ni eslab qolish
3. **Attributes** qo'shish → Barcha maydonlarni yaratish
4. **Indexes** yaratish → Tez qidirish uchun
5. **Permissions** sozlash → Xavfsizlik uchun
6. **Environment Variables** → `.env.local` faylida
7. **Kodni yangilash** → `lib/appwrite.ts` faylida

## 🎯 Tezkor Sozlash

Agar hammasini tez yaratmoqchi bo'lsangiz:

1. Database yarating: `business_db`
2. Collection 1: `businesses` (7 ta attribute)
3. Collection 2: `transactions` (7 ta attribute)
4. `.env.local` faylini to'ldiring
5. `lib/appwrite.ts` ni yangilang
6. Server ni qayta ishga tushiring

Hammasi tayyor! 🎉

