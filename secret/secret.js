// PUTTING IMPORTANT KEYS AND VALUES THAT SHOULD NOT BE PUBLIC
module.exports = {
    auth: {
        user: 'quimaudongwo@gmail.com',
        pass: 'etidojohnson1'
    },

    facebook: {
        clientID: '211590866962748', // facebook login app id
        clientSecret: 'e6db1681b45a457e9e39ceeea153a5ef',//facebook login secret key
        profileFields: ['email', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    }
}