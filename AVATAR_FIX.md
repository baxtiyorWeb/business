# Avatar Yuklash Xatolikni Hal Qilish

## Xatolik

```
Storage bucket with the requested ID could not be found.
```

## Sabab

Kodda bucket **nomi** (`avatars`) ishlatilgan, lekin Appwrite da bucket **ID** (`6956bec5003a79462bbd`) kerak.

## Yechim

### Variant 1: Environment Variable (Tavsiya etiladi)

1. `.env.local` faylini yarating yoki yangilang:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6956baf00020c39352de
NEXT_PUBLIC_APPWRITE_DATABASE_ID=6956be8d00070442cadc
NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID=6956bec5003a79462bbd
```

2. Server ni qayta ishga tushiring:
```bash
npm run dev
```

### Variant 2: To'g'ridan-to'g'ri Kodda

`lib/appwrite.ts` faylida bucket ID ni to'g'ridan-to'g'ri yozing:

```typescript
export const AVATARS_BUCKET_ID = '6956bec5003a79462bbd';
```

## Bucket ID ni Qayerdan Topish

1. Appwrite Console > Storage ga kiring
2. `avatars` bucket ga kiring
3. "Settings" tab ga o'ting
4. "Bucket ID" ni copy qiling (masalan: `6956bec5003a79462bbd`)

## Tekshirish

1. Avatar yuklashni urinib ko'ring
2. Xatolik bo'lmasa - hammasi to'g'ri! ✅

## Eslatma

- Bucket **ID** va bucket **nomi** farq qiladi
- Kodda har doim **Bucket ID** ishlatilishi kerak
- Bucket nomi faqat ko'rinish uchun

