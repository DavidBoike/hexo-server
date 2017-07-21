'use strict';

var pathFn = require('path');
var mime = require('mime');

module.exports = function(app) {
  var config = this.config;
  var args = this.env.args || {};
  var root = config.root;
  var route = this.route;

  if (args.s || args.static) return;

  app.use(root, function(req, res, next) {
    var method = req.method;
    if (method !== 'GET' && method !== 'HEAD') return next();

    var url = route.format(decodeURIComponent(req.url));

    var desiredUrl = url.replace(/\/(index.html)?$/i, "");
    if (desiredUrl !== url) {
      url = encodeURI(desiredUrl);
      res.statusCode = 302;
      res.setHeader('Location', root + url);
      res.end('Redirecting');
      return;
    }
    
    var data = route.get(url);
    var extname = pathFn.extname(url);
    if(!data){
      data = route.get(url + '/index.html');
      extname = pathFn.extname(url + '/index.html');
    }

    if (!data) {
      if (extname) return next();
    }

    //   url = encodeURI(url);
    //   res.statusCode = 302;
    //   res.setHeader('Location', root + url + '/');
    //   res.end('Redirecting');
    //   return;

    res.setHeader('Content-Type', extname ? mime.lookup(extname) : config.extensionless_mime_type || 'application/octet-stream');

    if (method === 'GET') {
      data.pipe(res).on('error', next);
    } else {
      res.end();
    }
  });
};
