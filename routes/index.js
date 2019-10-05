const db = require("../models");
const cheerio = require("cheerio");
const axios = require("axios").default;
const path = require("path");
const baseURL = "https://www.rt.com/";
const newsPath = "https://www.rt.com/news/";

module.exports = function(app) {
  app.get("/", async (req, res) => {
    const articles = await db.Article.find({}).populate("comments");
    res.render("home", { articles });
  });

  app.get("/saved", async (req, res) => {
    const articles = await db.Article.find({ saved: true }).populate("comments");
    res.render("home", { articles });
  });

  app.get("/clear", async (req, res) => {
    await db.Article.deleteMany({});
    await db.Comment.deleteMany({});
    res.redirect("/");
  });

  app.delete("/api/comments/:id", async (req, res) => {
    const comment = await db.Comment.findById(req.params.id);
    await db.Article.findOneAndUpdate(
      { _id: comment.article },
      { $pull: { comments: comment.id } }
    );
    await db.Comment.deleteOne({ _id: comment.id });
    res.status(200).send({ success: true });
  });

  app.post("/api/articles/:id/saved", async (req, res) => {
    const article = await db.Article.findByIdAndUpdate(req.params.id, { saved: req.body.saved });
    res.json(article);
  });

  app.post("/api/articles/:id/comments", async (req, res) => {
    const data = {
      body: req.body.comment.trim(),
      article: req.params.id
    };
    const comment = await db.Comment.create(data);
    const article = await db.Article.findByIdAndUpdate(data.article, {
      $push: { comments: comment.id }
    });
    res.json(comment);
  });

  app.get("/scrape", async (req, res) => {
    const axiosResponse = await axios.get(newsPath);
    const $ = cheerio.load(axiosResponse.data);
    const articles = [];

    $(".card__header > a").each(async (i, el) => {
      const title = $(el)
        .text()
        .trim();
      const link = path.join(baseURL, $(el).attr("href")).trim();
      const body = $(el.parent.parent)
        .find(".card__summary")
        .text()
        .trim();

      if (!link.match("/shows") && body) {
        const article = { title, body, link, saved: false };
        const response = await db.Article.find({ link: link });
        if (response.length === 0) {
          articles.push(article);
          db.Article.create(article);
        }
      }
    });
    res.redirect("/");
  });
};
