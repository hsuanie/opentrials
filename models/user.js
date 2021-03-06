'use strict';

const bookshelf = require('../config').bookshelf;
const BaseModel = require('./base');
const OAuthCredential = require('./oauth-credential');

const User = BaseModel.extend({
  tableName: 'users',
  hasTimestamps: true,
  oauthCredentials: function oauthCredentials() {
    return this.hasMany('OAuthCredential');
  },
  virtuals: {
    scope: function scope() {
      return this.attributes.role;
    },
  },
  findByEmailOrOAuth: (email, oauthProvider, oauthId) => (
    new User().query((qb) => {
      qb.leftJoin('oauth_credentials', 'oauth_credentials.user_id', '=', 'users.id');
      const whereClause = qb.where(function userOAuthWhereClauses() {
        const clauses = {};

        if (oauthProvider) {
          clauses['oauth_credentials.provider'] = oauthProvider;
        }

        if (oauthId) {
          clauses['oauth_credentials.id'] = oauthId;
        }

        this.where(clauses);
      });

      if (email) {
        whereClause.orWhere({
          'users.email': email,
        });
      }
    })
  ),
  findOrCreateByEmail: (userAttrs, oauthProvider, oauthId) => (
    new User().findByEmailOrOAuth(userAttrs.email, oauthProvider, oauthId)
      .fetch({ require: false })
      .then((user) => {
        let _user = user;

        if (_user === null) {
          _user = new User(userAttrs).save(null, { method: 'insert' });
        }

        return _user;
      })
      .then((user) => {
        const oauthAttrs = {
          provider: oauthProvider,
          id: oauthId,
          user_id: user.attributes.id,
        };

        return new OAuthCredential().createIfInexistent(oauthAttrs)
          .then(() => user);
      })
  ),
});

module.exports = bookshelf.model('User', User);
