# DhanSetu Mobile (Expo / React Native)

## Setup

```bash
cd mobile
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web) — or scan the QR code with Expo Go.

## Stack

- **Routing**: [expo-router](https://docs.expo.dev/router/introduction/) — file-based routes live in `app/`
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native) — config in `tailwind.config.js`, global styles in `global.css`
- **State**: [Redux Toolkit](https://redux-toolkit.js.org/) + [redux-persist](https://github.com/rt2zz/redux-persist) (AsyncStorage) — store in `store/`
- **Server state**: [TanStack Query](https://tanstack.com/query) — client in `lib/queryClient.ts`
- **HTTP**: [axios](https://axios-http.com/) — instance in `lib/api.ts`, base URL from `app.json` (`expo.extra.apiUrl`)
- **Forms**: [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) via `@hookform/resolvers`
- **Icons**: [lucide-react-native](https://lucide.dev/)
- **Utils**: `dayjs`, `clsx` + `tailwind-merge` (see `lib/cn.ts`)

## Pointing at the backend

`app.json` sets `expo.extra.apiUrl` to the live backend on the GCP VM
(`http://34.100.152.235:8000/api/v1`, up 9AM–9PM daily) — works from any
device (simulator, physical phone, emulator) with no LAN setup needed. Full
endpoint docs: [`../API.md`](../API.md).

To point at a backend running on your own machine instead (`backend/README.md`),
change `apiUrl` to your machine's LAN IP (`localhost` only resolves to your
machine from the iOS simulator and web; use `10.0.2.2` for the Android
emulator, or your LAN IP for a physical device).
