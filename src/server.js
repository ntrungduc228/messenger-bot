const express = require("express");
const viewEngine = require("./config/viewEngine");
const route = require("./routes");
require("dotenv").config();

const app = express();

// parse request to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// view engine
viewEngine(app);

// init route
route(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});
