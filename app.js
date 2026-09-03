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
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

// FORMAT NUMBER FUNCTION
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

// SEARCH QUERY ROUTE
app.get("/search", async (req, res) => {
  try {
    let pricingFilter = {};
    let userQuery;
    let searchByName = false;
    let q = req.query.q;

    await SearchQuery.findOneAndUpdate(
      { query: q },
      { $inc: { count: 1 }, $set: { lastSearchedAt: Date.now() } },
      { upsert: true },
    );

    let aiResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `
      Analyze this user's request for finding an AI tool.

      user request: 
      ${q}

      Extract the following information:
      - name 
      - category
      - pricing
      - maximum budget
      - use case
      - required features

      Rules:
      - if user search an individual tool name like "chatgpt", "midjourney" etc. then skip the other information use only name and return it in json format
      - MOST IMPORTANT = if user search individual tool name something in different ways like the user search "chat gpt" instead of "chtgpt" and "mid journey" instead of "midjourney" than correct it 
      - category should be "coding", "image", "video", "writing".
      - pricing should be "free", "paid", "freemium" or "any"
      - maxPrice should be the maximum price mentioned by the user
      - if the user does not mention a maximum price , maxPrice should be null
      - useCase should describe what the user wants to do
      - features should contain the specific features the user requires
      - if something is not mentioned, use "any" or an empty array as appropriate
      
      Return only JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            category: {
              type: "string",
            },
            pricing: {
              type: "string",
            },
            maxPrice: {
              type: "number",
              nullable: true,
            },
            useCase: {
              type: "string",
            },
            features: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: [
            "name",
            "category",
            "pricing",
            "maxPrice",
            "useCase",
            "features",
          ],
        },
      },
    });
    let response = JSON.parse(aiResponse.text);

    if (response.pricing === "free") {
      pricingFilter = {
        "pricing.pricingType": {
          $in: ["Free", "Freemium"],
        },
      };
    }
    if (response.pricing === "paid") {
      pricingFilter = {
        "pricing.pricingType": {
          $in: ["Paid", "Freemium"],
        },
      };
    }

    console.log(response);

    userQuery = await Tool.findOne({
      name: { $regex: `^${response.name}$`, $options: "i" },
    });

    if (userQuery) {
      searchByName = true;
    }

    console.log(searchByName);

    if (!userQuery) {
      userQuery = await Tool.find({
        category: { $regex: `^${response.category}$`, $options: "i" },
        ...pricingFilter,
      });
    }

    if (userQuery.length === 0) {
      return res.status(404).render("404");
    }

    if (searchByName) {
      return res.render("view", { tool: userQuery });
    }

    return res.render("category", { allTools: userQuery });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
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
