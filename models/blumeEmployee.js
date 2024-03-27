const mongoose = require("mongoose");

// Define BlumeEmployee schema
const BlumeEmployeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    linkedInUrl: { type: String, required: false },
    company: { type: String },
    phoneNo: { type: String, required: false },
    email: { type: String, required: true },
    connections: [
      { type: mongoose.Schema.Types.ObjectId, ref: "BlumeConnection" },
    ],
    allContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllContacts" }],
  },
  { timestamps: true, strict: false }
);

// Define BlumeConnection schema
const BlumeConnectionSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    linkedInUrl: { type: String },
    company: { type: String },
    phoneNo: { type: String, required: false },
    email: { type: String, required: true },
    source: {
      type: String,
      enum: [
        "Gmail",
        "linkedIn",
        "Affinity",
        "otherContact",
        "phoneContact",
        "directoryContact",
      ],
      required: false,
    },
    whoseConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlumeEmployee",
    },
  },
  { timestamps: false, strict: false }
);

const BlumePortfolioCompanySchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    email: { type: String, required: true },
    otp: { type: String, required: false },
  },
  { timestamps: true, strict: false }
);

const AllContactsSchema = new mongoose.Schema(
  {
    firstName: {},
    lastName: {},
    company: {},
    email: {},
    contactsSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlumeEmployee",
    },
  },
  { timestamps: true, strict: false }
);

const ConnectionRequestSchema = new mongoose.Schema(
  {
    blumeConnectionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlumeConnection", // Reference to the BlumeConnection model
      required: true,
    },
    founderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlumePortfolioCompany", // Reference to the BlumePortfolioCompany model
      required: true,
    },
    assignedBlumeReferenceID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlumeEmployee", // Reference to the BlumeEmployee model
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
    companyBlurb: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "inReview"],
    },
  },
  { timestamps: true, strict: false }
);

// Define models
const BlumeEmployee = mongoose.model("BlumeEmployee", BlumeEmployeeSchema);
const BlumeConnection = mongoose.model(
  "BlumeConnection",
  BlumeConnectionSchema
);
const BlumePortfolioCompany = mongoose.model(
  "BlumePortfolioCompany",
  BlumePortfolioCompanySchema
);
const AllContacts = mongoose.model("AllContacts", AllContactsSchema);
const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

module.exports = {
  BlumeEmployee,
  BlumeConnection,
  BlumePortfolioCompany,
  AllContacts,
  ConnectionRequest,
};
