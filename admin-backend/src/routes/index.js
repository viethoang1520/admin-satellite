const login = require("./login");
const post = require("./post");
const satellite = require("./satellite");
const image = require("./image");
function routes(app) {
  app.use('/api/auth/login', login)
  app.use("/api/post", post);
  app.use("/api/satellite", satellite);
  app.use("/api/image", image);
}

module.exports = routes;
