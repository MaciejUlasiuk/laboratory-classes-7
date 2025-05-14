const { MENU_LINKS } = require("../constants/navigation");
const cartController = require("./cartController");

exports.getHomeView = async (request, response) => {
  const cartCount = await cartController.getProductsCount();

  response.render("home.ejs", {
    headTitle: "Shop - Home",
    path: "/",
    activeLinkPath: "/",
    menuLinks: MENU_LINKS,
    cartCount,
  });
};