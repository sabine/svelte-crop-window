var ghpages = require('gh-pages');

ghpages.publish(
    'build',
    {
        dotfiles: true,
        branch: 'gh-pages',
        user: {
            name: 'sabine',
            email: 'info@sabineschmaltz.de'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)
