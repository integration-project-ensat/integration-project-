const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

function hasOAuthCredentials(clientId, clientSecret, callbackUrl) {
  return Boolean(
    clientId &&
    clientSecret &&
    callbackUrl &&
    !clientId.startsWith('ton_') &&
    !clientSecret.startsWith('ton_') &&
    !clientId.startsWith('REMPLACE_MOI') &&
    !clientSecret.startsWith('REMPLACE_MOI')
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          prenom: profile.name?.givenName,
          nom: profile.name?.familyName,
        };

        return done(null, userData);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

if (
  hasOAuthCredentials(
    process.env.GITHUB_CLIENT_ID,
    process.env.GITHUB_CLIENT_SECRET,
    process.env.GITHUB_CALLBACK_URL
  )
) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],

      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const displayName = profile.displayName || profile.username || '';
          const [prenom, ...nomParts] = displayName.split(' ').filter(Boolean);

          const userData = {
            githubId: profile.id,
            email: profile.emails?.[0]?.value,
            prenom: prenom || profile.username,
            nom: nomParts.join(' ') || profile.username,
          };

          return done(null, userData);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
