const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('../config/keys');
const mongose = require('mongoose');

const User = mongose.model('users');
const Survey = mongose.model('surveys');

passport.serializeUser((user, done) => {
  done(null, user.id); // user.id is the unique udentifier of the profile.id record in db
});

passport.deserializeUser((id, done) => {
  // search db to for User model
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => console.log(err));
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,

      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        } else {
          // const newUser = await new User({
          //   googleId: profile.id,
          //   displayName: profile.displayName
          // }).save();
          // createSampleSurvey(newUser.id);
          // return done(null, newUser);
          // create a new record
          console.log(keys.googleClientID);
          const user = await new User({ googleId: profile.id }).save();
          done(null, user);
        }
      } catch (err) {
        console.log(err);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebookAppID,
      clientSecret: keys.facebookAppSecret,
      callbackURL: '/auth/facebook/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ facebookId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        } else {
          const newUser = await new User({
            facebookId: profile.id,
            displayName: profile.displayName
          }).save();
          createSampleSurvey(newUser.id);
          return done(null, newUser);
        }
      } catch (err) {
        console.log(err);
      }
    }
  )
);

async function createSampleSurvey(id) {
  const sampleSurvey = await new Survey({
    yes: 140,
    no: 42,
    title: 'Sample Survey',
    body:
      'This is a sample survey. Let me know if you like our product. We would love to know about our product. Your feedback is valuable to us.',
    subject: 'We would love your feedback',
    recipients: [{ responded: false, email: 'sampleEmail@mail.com' }],
    _user: id,
    dateSent: Date.now()
  });
  sampleSurvey.save();
}
