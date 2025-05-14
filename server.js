const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const { PORT } = require("./config");
const logger = require("./utils/logger");
const productsRoutes = require("./routing/products");
const logoutRoutes = require("./routing/logout");
const killRoutes = require("./routing/kill");
const homeRoutes = require("./routing/home");
const { STATUS_CODE } = require("./constants/statusCode");
const { MENU_LINKS } = require("./constants/navigation");
const cartController = require("./controllers/cartController");
const { mongoConnect } = require('./database');

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(async (request, _response, next) => {
  const { url, method } = request;
  logger.getInfoLog(url, method);
  next();
});

app.use("/products", productsRoutes);
app.use("/logout", logoutRoutes);
app.use("/kill", killRoutes);
app.use(homeRoutes);

app.use(async (request, response) => {
  const { url } = request;
  const cartCount = await cartController.getProductsCount();

  response.status(STATUS_CODE.NOT_FOUND).render("404", {
    headTitle: "404",
    menuLinks: MENU_LINKS,
    activeLinkPath: "",
    cartCount,
  });
  logger.getErrorLog(url);
});

mongoConnect(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});