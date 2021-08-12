const User = require("../models/db");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID:process.env.AUTH_ID,
			clientSecret: process.env.AUTH_SECRET,
			callbackURL: process.env.AUTH_URL
		},
		function(accessToken, refreshToken, profile, cb) {
			const email = profile.emails[0].value.split("@");
			const kadence = email[1];
			User.query(
				"SELECT * FROM user WHERE GoogleID=?",
				[profile.id],
				(err, result, fields) => {
					
					if (err) {
						throw err;
					}
					if (result.length > 0) {
						return cb(err, result);
					} else {
						//console.log(result);
						if (kadence != "kadence.com") {
							User.query(
								"INSERT INTO user (Email, GoogleID, displayName, Verify) VALUES (?,?,?,?)",
								[profile.emails[0].value, profile.id, profile.displayName, '0'],
								function(errs, results) {
									if (errs) {
										throw errs;
									} else {
										return cb(errs, results);
									}
								}
							);
						} else {
							User.query(
								"INSERT INTO user (Email, GoogleID, displayName,Verify) VALUES (?,?,?,?)",
								[profile.emails[0].value, profile.id, profile.displayName,'1'],
								function(errs, results) {
									if (errs) {
										throw errs;
									} else {
										return cb(errs, results);
									}
								}
							);
						}
					}
				}
			);
		}
	)
);
