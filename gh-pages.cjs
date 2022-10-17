var ghpages = require('gh-pages');

ghpages.publish(
    'build',
    {
        dotfiles: true,
        branch: 'gh-pages',
        user: {
            name: 'sabine',
            email: 'sabineschmaltz@gmail.com'
        }
    },
    () => {
        console.log('Deploy Complete!');
    }
);
