import('./.output/server/index.mjs')
  .then(() => console.log('✅ Server bundle imports cleanly!'))
  .catch((err) => console.error('❌ Server bundle failed to import:', err));
