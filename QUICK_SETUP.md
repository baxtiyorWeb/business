# Tezkor Sozlash - Appwrite Collections

## ✅ Sizning Holatingiz

Sizning Appwrite Console da:
- ✅ Database yaratilgan: `buisness_app` (ID: `6956be8d00070442cadc`)
- ❌ `businesses` collection yo'q
- ❌ `transactions` collection yo'q
- ⚠️ `documents` collection bor (bu bizning loyihamiz uchun emas)

## 🎯 Qilish Kerak Bo'lgan Ishlar

### 1. Database ID ni `.env.local` ga qo'shing

Loyiha ildizida `.env.local` faylini yarating yoki yangilang:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6956baf00020c39352de
NEXT_PUBLIC_APPWRITE_DATABASE_ID=6956be8d00070442cadc
```

**Yoki** agar Database nomi `buisness_app` bo'lsa:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6956baf00020c39352de
NEXT_PUBLIC_APPWRITE_DATABASE_ID=buisness_app
```

### 2. `businesses` Collection Yaratish

1. Appwrite Console da `buisness_app` database ga kiring
2. "Create table" yoki "Create collection" tugmasini bosing
3. Quyidagilarni to'ldiring:
   - **Table ID:** `businesses`
   - **Name:** `Businesses`
4. "Create" tugmasini bosing

**Columns (Ustunlar) Qo'shish:**

Har bir column uchun "+ Add column" tugmasini bosing:

1. **name**
   - Type: `String`
   - Size: `255`
   - Required: ✅

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

**Indexes Yaratish:**

1. "Indexes" tab ga o'ting
2. "+ Create index" tugmasini bosing
3. **Key:** `userId`
4. **Type:** `ASC`
5. **Attributes:** `userId` ni tanlang
6. "Create" tugmasini bosing

**Permissions Sozlash:**

1. "Settings" tab ga o'ting
2. "Permissions" bo'limida:
   - **Create:** `users` (Any user)
   - **Read:** `users` (Only own documents)
   - **Update:** `users` (Only own documents)
   - **Delete:** `users` (Only own documents)

### 3. `transactions` Collection Yaratish

Xuddi shu database ichida:

1. "Create table" tugmasini bosing
2. Quyidagilarni to'ldiring:
   - **Table ID:** `transactions`
   - **Name:** `Transactions`
3. "Create" tugmasini bosing

**Columns Qo'shish:**

1. **businessId** - String, 255, Required ✅
2. **amount** - String, 50, Required ✅
3. **type** - String, 20, Required ✅, Default: `income`
4. **description** - String, 500, Required ❌
5. **customerName** - String, 255, Required ❌
6. **date** - String, 50, Required ✅
7. **userId** - String, 255, Required ✅

**Indexes Yaratish:**

1. `userId` (ASC)
2. `businessId` (ASC)
3. `date` (ASC)

**Permissions:** Xuddi `businesses` kabi sozlang

### 4. Kodni Tekshirish

`lib/appwrite.ts` fayli allaqachon yangilangan va environment variables dan o'qiydi.

### 5. Server ni Qayta Ishga Tushirish

```bash
npm run dev
```

## ⚠️ Muhim Eslatmalar

1. **Database ID:** Sizning holatingizda Database ID `6956be8d00070442cadc` yoki nomi `buisness_app` bo'lishi mumkin. `.env.local` faylida to'g'ri ID ni qo'ying.

2. **Collection ID:** Collection ID lar aniq `businesses` va `transactions` bo'lishi kerak (katta-kichik harflarga e'tibor bering).

3. **Permissions:** Har doim "Only own documents" ni tanlang, aks holda boshqa foydalanuvchilar ma'lumotlaringizni ko'ra oladi.

4. **Attributes:** Barcha kerakli attributes yaratilganligini tekshiring.

## ✅ Tekshirish

Collectionlar yaratilgandan keyin:

1. `businesses` collection da test row yarating
2. `transactions` collection da test row yarating
3. Brauzerda `/businesses` sahifasiga kiring
4. Xatolik bo'lmasa - hammasi to'g'ri! 🎉

