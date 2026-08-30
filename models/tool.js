const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    about: [
      {
        type: String,
        required: true,
      },
    ],
    logo: {
      type: String,
      required: true,
      unique: true,
    },
    website: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Coding", "Image", "Video", "Writing"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    pricing: {
      pricingType: {
        type: String,
        required: true,
      },
      pricingUrl: {
        type: String,
      },
    },
    ads: {
      type: Boolean,
      default: null,
    },
    signupRequired: {
      type: Boolean,
      default: null,
    },
    communityRatings: [
      {
        platform: {
          type: String,
        },
        rating: {
          type: Number,
        },
        scale: {
          type: Number,
        },
        reviewCount: {
          type: Number,
        },
        sourceUrl: {
          type: String,
        },
      },
    ],
    pros: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    cons: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    testing: {
      lastTested: {
        type: Date,
        default: null,
      },
      notes: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

const Tool = mongoose.model("Tool", toolSchema);

module.exports = Tool;
