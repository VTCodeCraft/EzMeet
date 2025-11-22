import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { config } from '../config/app.config';
import { findByIDuserService } from '../services/user.service';

interface JwtPayload {
  userID: string;
  iat?: number;
  exp?: number;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
  audience: ['user'],
  algorithms: ['HS256'],
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      const user = await findByIDuserService(payload.userID);
      if (!user) {
        return done(null, false);
      }
      // Return the user if found
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export const passportAuthenticateJwt = passport.authenticate('jwt', {
  session: false,
});

export default passport;