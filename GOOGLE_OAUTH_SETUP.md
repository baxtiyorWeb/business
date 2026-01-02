# Google OAuth va Avatar Storage Sozlash

## Google OAuth Sozlash

### 1. Appwrite Console da Google OAuth Provider qo'shish

1. [Appwrite Console](https://cloud.appwrite.io/) ga kiring
2. "Auth" bo'limiga o'ting
3. "Providers" tab ga o'ting
4. "Google" provider ni toping va "Enable" qiling
5. Quyidagilarni to'ldiring:
   - **App ID:** Google Cloud Console dan oling
   - **App Secret:** Google Cloud Console dan oling

### 2. Google Cloud Console da OAuth Credentials Yaratish

1. [Google Cloud Console](https://console.cloud.google.com/) ga kiring
2. Yangi loyiha yarating yoki mavjud loyihani tanlang
3. "APIs & Services" > "Credentials" ga o'ting
4. "Create Credentials" > "OAuth client ID" ni tanlang
5. Application type: "Web application" ni tanlang
6. **Authorized redirect URIs** ga quyidagilarni qo'shing:
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google
   ```
   Yoki agar self-hosted Appwrite ishlatayotgan bo'lsangiz:
   ```
   https://your-appwrite-endpoint/v1/account/sessions/oauth2/callback/google
   ```
7. "Create" tugmasini bosing
8. **Client ID** va **Client Secret** ni copy qiling
9. Appwrite Console ga qaytib, Google provider sozlamalariga qo'shing

### 3. Tekshirish

1. Auth page ga kiring
2. "Google bilan Kirish" tugmasini bosing
3. Google login sahifasi ochilishi kerak
4. Login qilgandan keyin avtomatik redirect bo'lishi kerak

## Avatar Storage Sozlash

### 1. Storage Bucket Yaratish

1. Appwrite Console da "Storage" bo'limiga o'ting
2. "Create Bucket" tugmasini bosing
3. Quyidagilarni to'ldiring:
   - **Bucket ID:** `avatars`
   - **Name:** `Avatars`
   - **File size limit:** 5 MB (yoki istalgan)
   - **Allowed file extensions:** `jpg,jpeg,png,gif,webp`
   - **Encryption:** (ixtiyoriy)
   - **Compression:** (ixtiyoriy)

### 2. Permissions Sozlash

1. Yaratilgan bucket ga kiring
2. "Settings" > "Permissions" ga o'ting
3. Quyidagi permissions qo'shing:
   - **Create:** `users` (Any user)
   - **Read:** `users` (Any user) - yoki `users` (Only own files)
   - **Update:** `users` (Only own files)
   - **Delete:** `users` (Only own files)

### 3. Tekshirish

1. Profile page ga kiring
2. Avatar ustiga hover qiling (desktop) yoki "Avatar Yuklash" tugmasini bosing (mobile)
3. Rasm tanlang va yuklang
4. Avatar ko'rinishi kerak

## Muammolarni Hal Qilish

### Google OAuth ishlamayapti

- ✅ Google Cloud Console da redirect URI to'g'ri ekanligini tekshiring
- ✅ Appwrite Console da Google provider enabled ekanligini tekshiring
- ✅ Client ID va Secret to'g'ri ekanligini tekshiring
- ✅ Browser console da xatoliklar bor-yo'qligini tekshiring

### Avatar yuklanmayapti

- ✅ Storage bucket `avatars` nomi bilan yaratilganligini tekshiring
- ✅ Permissions to'g'ri sozlanganligini tekshiring
- ✅ File size limit 5MB dan kichik ekanligini tekshiring
- ✅ File type rasm ekanligini tekshiring

### Avatar ko'rinmayapti

- ✅ Browser console da xatoliklar bor-yo'qligini tekshiring
- ✅ Storage bucket permissions da Read ruxsati borligini tekshiring
- ✅ Avatar ID user prefs da saqlanganligini tekshiring

## Qisqacha Xotira

1. **Google OAuth:**
   - Google Cloud Console da OAuth credentials yaratish
   - Redirect URI qo'shish
   - Appwrite Console da Google provider ni enable qilish
   - Credentials ni qo'shish

2. **Avatar Storage:**
   - Storage bucket `avatars` yaratish
   - Permissions sozlash
   - Profile page da yuklash funksiyasi ishlaydi

Hammasi tayyor! 🎉

