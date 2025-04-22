const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const knex = require('./db');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://blackjack-backend.herokuapp.com/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await knex('users').where('google_id', profile.id).first();
        if (!user) {
          user = await knex('users').insert({
            google_id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          }).returning('*').then(rows => rows[0]);
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;