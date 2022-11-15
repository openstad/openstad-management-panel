const lockApiService    = require('../services/lockApi');
const moment            = require('moment-timezone');
const cacheLifespan     = 10*60;   // set lifespan of 5 minutes;
const cache             = require('../services/cache').cache;

const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

const removeWww = (url) => {
  return url ? url.replace('www.', '') : '';
}

const defaultDomain  = removeWww(removeProtocol(process.env.FRONTEND_URL));

exports.withAll = (req, res, next) => {
  lockApiService
    .fetchAll()
    .then((locks) => {
      locks = locks.sort((a, b) => {
        if (a.type < b.type) {
          return -1;
        }
        if (b.type < a.type) {
          return 1;
        }

        return 0;
      });
      req.locks = locks;
      res.locals.locks = req.locks;
      next();
    })
    .catch((err) => {
      console.log('err')
      next(err);
    });
}

