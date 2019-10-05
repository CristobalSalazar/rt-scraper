const express = require("express");
const mongoose = require("mongoose");
const ehb = require("express-handlebars");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const routes = require("./routes")(app);
app.engine(
  "handlebars",
  ehb({
    extname: "handlebars",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/"
  })
);

app.set("view engine", "handlebars");
app.listen(PORT, () => {
  console.log("server listening on port " + PORT);
});
