module.exports = {
  siteUrl: 'https://tailoresume.com',
  generateRobotsTxt: true,
  additionalPaths: async (config) => [
    { loc: '/' },
    { loc: '/pricing' },
  ],
}