/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const appJson = require('./app.json');

module.exports = ({ config }) => {
  const baseConfig = config ?? appJson.expo;
  const androidMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const plugins = (baseConfig.plugins ?? []).filter(
    (plugin) => !(Array.isArray(plugin) && plugin[0] === 'react-native-maps'),
  );

  return {
    ...baseConfig,
    plugins: [
      ...plugins,
      [
        'react-native-maps',
        ...(androidMapsApiKey ? [{ androidGoogleMapsApiKey: androidMapsApiKey }] : []),
      ],
    ],
  };
};
