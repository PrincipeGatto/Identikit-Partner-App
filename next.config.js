// next.config.js
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Abilita la configurazione i18n definita in next-i18next.config.js
  i18n,
};

module.exports = nextConfig;
