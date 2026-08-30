require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const port = process.env.PORT || 3000;
const Tool = require("./models/tool.js");
const Feedback = require("./models/feedback.js");
const SearchQuery = require("./models/search_query.js");

main()
  .then((res) => {
    console.log("Successfully connected to database.");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

// --------------------------------
// FORMAT NUMBER FUNCTION
// --------------------------------

function formatNumber(num) {
  if (num >= 10000000000) {
    return (num / 10000000000).toFixed(1).replace(".0", "") + "B";
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "K";
  }

  return num;
}

app.locals.formatNumber = formatNumber;

// INDEX ROUTE
app.get("/", async (req, res) => {
  try {
    let allTools = await Tool.find().limit(6);
    res.render("home", { allTools });
  } catch (error) {
    console.log(error);
  }
});

// SEARCH ROUTE
app.get("/search", async (req, res) => {
  try {
    let q = req.query.q.trim().toLowerCase();
    try {
      await SearchQuery.findOneAndUpdate(
        { query: q },
        { $inc: { count: 1 }, $set: { lastSearchedAt: Date.now() } },
        { upsert: true },
      );
    } catch (error) {
      console.log(error);
    }
    let indTool = await Tool.findOne({ name: { $regex: q, $options: "i" } });
    let categoryTools = await Tool.find({
      category: { $regex: q, $options: "i" },
    });
    if (indTool) {
      return res.render("view", { tool: indTool });
    } else if (categoryTools.length > 0) {
      return res.render("category", { allTools: categoryTools });
    } else {
      return res.status(404).render("404");
    }
  } catch (error) {
    console.log(error);
  }
});

// CATEGORY ROUTE
app.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const formatedCategory =
      category.charAt(0).toUpperCase() + category.slice(1);
    let categoryTools = await Tool.find({ category: formatedCategory });

    if (categoryTools.length === 0) {
      return res.status(404).render("404");
    }

    res.render("category", { allTools: categoryTools });
  } catch (error) {
    console.log(error);
  }
});

// VIEW ROUTE
app.get("/tools/:slug", async (req, res) => {
  try {
    let tool = await Tool.findOne({ slug: req.params.slug });
    if (!tool) {
      return res.status(404).render("404");
    }
    res.render("view", { tool });
  } catch (error) {
    console.log(error);
  }
});

// PRIVACY POLICY ROUTE
app.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy");
});

// TERMS AND CONDITIONS ROUTE
app.get("/terms-and-conditions", (req, res) => {
  res.render("terms-and-conditions");
});

// FEEDBACK POST ROUTE
app.post("/feedback", async (req, res) => {
  try {
    let userFeedback = {
      type: req.body.feedbackType,
      message: req.body.message,
    };
    await Feedback.insertOne(userFeedback);
    res.send("Feedback submitted successfully.");
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong. Please try again later.");
  }
});

// ERROR HANDELING MIDDLEWERE
app.use((req, res) => {
  res.status(404).render("404");
});

// LISTENING PORT
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
