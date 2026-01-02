# Appwrite Database Setup Guide

## Database va Collection Yaratish

### 1. Database Yaratish
1. Appwrite Console ga kiring
2. "Databases" bo'limiga o'ting
3. "Create Database" tugmasini bosing
4. Database nomini kiriting: `business_db` (yoki istalgan nom)
5. Database ID ni eslab qoling

### 2. Collection: `businesses`

**Yaratish:**
1. Database ichida "Create Collection" tugmasini bosing
2. Collection ID: `businesses`
3. Collection nomi: `Businesses`

**Attributes qo'shish:**
```
1. name
   - Type: String
   - Size: 255
   - Required: true

2. type
   - Type: String
   - Size: 50
   - Required: true
   - Default: store
   - Array: false

3. address
   - Type: String
   - Size: 500
   - Required: false

4. phone
   - Type: String
   - Size: 50
   - Required: false

5. email
   - Type: String
   - Size: 255
   - Required: false

6. description
   - Type: String
   - Size: 1000
   - Required: false

7. userId
   - Type: String
   - Size: 255
   - Required: true
```

**Indexes:**
- `userId` (ASC)

**Permissions:**
- Create: `users` (Any user)
- Read: `users` (Only own documents)
- Update: `users` (Only own documents)
- Delete: `users` (Only own documents)

### 3. Collection: `transactions`

**Yaratish:**
1. Database ichida "Create Collection" tugmasini bosing
2. Collection ID: `transactions`
3. Collection nomi: `Transactions`

**Attributes qo'shish:**
```
1. businessId
   - Type: String
   - Size: 255
   - Required: true

2. amount
   - Type: String
   - Size: 50
   - Required: true

3. type
   - Type: String
   - Size: 20
   - Required: true
   - Default: income
   - Array: false

4. description
   - Type: String
   - Size: 500
   - Required: false

5. customerName
   - Type: String
   - Size: 255
   - Required: false

6. date
   - Type: String
   - Size: 50
   - Required: true

7. userId
   - Type: String
   - Size: 255
   - Required: true
```

**Indexes:**
- `userId` (ASC)
- `businessId` (ASC)
- `date` (ASC)

**Permissions:**
- Create: `users` (Any user)
- Read: `users` (Only own documents)
- Update: `users` (Only own documents)
- Delete: `users` (Only own documents)

## Environment Variables

`.env.local` faylini yarating va quyidagilarni to'ldiring:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=business_db
```

## Tekshirish

1. Database va collectionlar yaratilganligini tekshiring
2. Barcha attributes to'g'ri yaratilganligini tekshiring
3. Permissions to'g'ri sozlanganligini tekshiring
4. Indexes yaratilganligini tekshiring

## Muammolarni Hal Qilish

### "Collection not found" xatosi
- Collection ID larni tekshiring
- `lib/appwrite.ts` faylida to'g'ri ID lar ekanligini tekshiring

### "Permission denied" xatosi
- Permissions sozlamalarini tekshiring
- Users o'z hujjatlarini o'qiy olishi kerak

### "Attribute not found" xatosi
- Barcha kerakli attributes yaratilganligini tekshiring
- Attribute nomlari to'g'ri ekanligini tekshiring

