const login = require("./login");
const post = require("./post");
function routes(app) {
  app.use('/api/auth/login', login)
  app.use("/api/post", post);
}

module.exports = routes;
