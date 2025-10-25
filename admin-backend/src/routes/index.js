const login = require("./login");
const post = require("./post");
const satellite = require("./satellite");
function routes(app) {
  app.use('/api/auth/login', login)
  app.use("/api/post", post);
  app.use("/api/satellite", satellite);
}

module.exports = routes;
