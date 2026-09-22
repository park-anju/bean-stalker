# Bean Stalker mobile

Android-first React Native/Expo application for Bean Stalker. The current milestone is
M1: a native application shell for the Samsung Galaxy A24 development device.

The web implementation remains the temporary behavioral reference during migration.
The mobile shell does not yet call the API, request location, load maps, or persist
favourites.

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside `src/app`. This project uses
[file-based routing](https://docs.expo.dev/router/introduction) with native Android tabs
for Discover and Favorites.

## M1 migration inventory

The mobile shell intentionally does not port browser UI. Later milestones must replace
these web-specific assumptions when the corresponding native feature is migrated:

- `navigator.geolocation` / `GeolocationPosition`: browser location flow in `apps/web/src/location`.
- `window`, `document`, `DOMException`, and `HTMLDivElement`: browser runtime and test seams.
- `localStorage`: browser-local favourites persistence in `apps/web/src/favorites`.
- `google.maps` and the Maps JavaScript loader: browser map rendering in `apps/web/src/map`.
- React Router DOM and Vite `import.meta.env` configuration: web routing and environment loading.

The Fastify API remains authoritative for provider access. The mobile client must not
call Google Places directly.

Current product target: Android-first React Native application.

Migration state: web implementation remains temporary reference.

Current milestone: M1 native shell.

Primary development device: Samsung Galaxy A24.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Expo Router](https://docs.expo.dev/router/introduction): Learn more about file-based navigation.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
