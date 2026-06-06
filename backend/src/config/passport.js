const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
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
}

module.exports = passport;
