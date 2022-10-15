var ghpages = require('gh-pages');

ghpages.publish(
    'build',
    {
        branch: 'gh-pages',
        repo: 'https://github.com/sabine/svelte-crop-window.git',
        user: {
            name: 'sabine',
            email: 'info@sabineschmaltz.de'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)
