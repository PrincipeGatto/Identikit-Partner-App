// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    localeDetection: true,
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
}
