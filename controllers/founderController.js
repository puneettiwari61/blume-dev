const {
  BlumePortfolioCompany,
  BlumeEmployee,
  BlumeConnection,
  AllContacts,
  ConnectionRequest,
} = require("../models/blumeEmployee");
const auth = require("../modules/auth");
const { mailSenderToConnect } = require("../modules/mailSender");

module.exports = {
  sendOTP: async (req, res) => {
    try {
      const founder = await BlumePortfolioCompany.findOne({
        email: req.body.email,
      });

      if (!founder) {
        return res.json({
          success: false,
          message: "Email not registered with us",
        });
      }
      // const sendMail = await mailSender(req.body.email);
      await founder.updateOne({ otp: 54321 });
      const { firstName, lastName, company, email } = founder;
      const user = { firstName, lastName, company, email };
      res.json({
        success: true,
        message: "OTP sent Successfully",
        // messageID: sendMail?.messageId,
        user,
      });
    } catch (e) {
      console.log(e, "error");
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  verifyOTP: async (req, res) => {
    const { otp } = req.body;
    try {
      const founder = await BlumePortfolioCompany.findOne({
        email: req.body.email,
      });
      const isOtpValid = founder.otp == otp;
      const { firstName, lastName, company, email } = founder;

      const user = { firstName, lastName, company, email };

      if (isOtpValid && founder) {
        var token = await auth.generateJWT(founder);
        return res.status(200).json({
          success: true,
          message: "OTP verified successfully",
          token,
          user: { ...user, role: "founder" },
        });
      }
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    } catch (error) {
      console.error("Error verifying OTP", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      const user = await BlumePortfolioCompany.findById(req.user.userId)
        .select("-otp")
        .lean();
      if (user) {
        res.json({ success: true, user: { ...user, role: "founder" } });
      } else {
        const user = await BlumeEmployee.findById(req.user.userId).lean();
        console.log(user, "user", req.user.userId);
        const hasLinkedInContacts = await AllContacts.find({
          $and: [{ contactsSource: user._id }, { source: "linkedIn" }],
        });
        if (user) {
          return res.json({
            success: true,
            user: {
              ...user,
              role: "admin",
              hasLinkedInContacts: hasLinkedInContacts.length > 0,
            },
          });
        } else {
          res.json({ success: false, message: "No user found" });
        }
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  connectMessage: async (req, res) => {
    const { context, companyBlurb, employeeID } = req.body;
    try {
      const connection = await BlumeConnection.findById(employeeID);
      const founder = await BlumePortfolioCompany.findById(req.user.userId);
      if (connection) {
        const blumeReference = await BlumeEmployee.findById(
          connection?.whoseConnection
        );
        // Create a new connection request document
        const newConnectionRequest = new ConnectionRequest({
          blumeConnectionID: connection._id,
          founderID: founder._id,
          assignedBlumeReferenceID: blumeReference._id,
          context,
          companyBlurb,
          status: "pending",
        });

        // Save the connection request to the database
        await newConnectionRequest.save();
        await mailSenderToConnect(
          blumeReference,
          founder,
          connection,
          context,
          companyBlurb,
          newConnectionRequest._id
        );
        return res.json({ success: true, message: "Successfuly sent" });
      }
    } catch (error) {
      console.error("Error submitting connect request", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  searchConnections: async (req, res) => {
    try {
      const { displayName, position, company } = req.query;

      const query = {};
      if (displayName) query.displayName = new RegExp(displayName, "i"); // Case-insensitive search for name
      // if (name) query.lastName = new RegExp(name, "i"); // Case-insensitive search for name

      if (position) query.position = new RegExp(position, "i"); // Case-insensitive search for designation
      if (company) query.company = new RegExp(company, "i"); // Case-insensitive search for company name

      const projection = { email: 0 };

      const employees = await BlumeConnection.find(query, projection).lean();

      const founderID = req.user.userId;

      const requests = await ConnectionRequest.find({
        founderID,
        blumeConnectionID: { $in: employees.map((emp) => emp._id) },
      }).lean();

      const requestedConnections = new Set(
        requests.map((req) => req.blumeConnectionID.toString())
      );

      const updatedEmployees = employees.map((emp) => {
        if (requestedConnections.has(emp._id.toString())) {
          return { ...emp, alreadyMade: true };
        }
        return emp;
      });

      res.json({ results: updatedEmployees });
    } catch (err) {
      console.error("Error searching Blume employees:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
  requestsMade: async (req, res) => {
    try {
      const requests = await ConnectionRequest.find({
        founderID: req.user.userId,
      }).populate({
        path: "blumeConnectionID",
        select: "company displayName position", // Add the fields you want to select
      });
      res.json({ requests });
    } catch (err) {
      console.error("Error getting requests", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};
