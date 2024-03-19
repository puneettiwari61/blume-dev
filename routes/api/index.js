var express = require("express");
const {
  BlumeEmployee,
  BlumeConnection,
  AllContacts,
} = require("../../models/blumeEmployee");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const csv = require("csv-parser");
const {
  parseDirectoryContacts,
  parseContacts,
  formatResults,
  formatCSV,
  mapContactsForEmail,
} = require("../../modules/uitls");
const { Readable } = require("stream");
const auth = require("../../modules/auth");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ success: true, message: "Welcome to Node APIs" });
});

router.post("/callback", async (req, res) => {
  try {
    console.log(req.body, "body");
    const people = google.people({
      version: "v1",
      auth: accessToken,
    });
    const { data } = await people.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses",
    });

    setContacts(data.connections);
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
});

router.post("/auth/google", async (req, res) => {
  try {
    const clientId =
      "775614405027-913fiotduieu2cnckd0l6o7d4djck461.apps.googleusercontent.com";
    const client_secret = "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";
    const oAuth2Client = new OAuth2Client(
      clientId,
      client_secret,
      "postmessage"
    );
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
    const info = await oAuth2Client.getTokenInfo(tokens.access_token);
    let admin;
    admin = await BlumeEmployee.findOne(
      { email: info?.email } // Query criteria,
    );
    if (!admin) {
      admin = await BlumeEmployee.create(
        { email: info?.email } // Query criteria,
      );
    }
    var adminToken = await auth.generateJWT(admin);

    const count = await AllContacts.countDocuments({
      contactsSource: admin._id,
    });

    console.log(count, "count");
    if (count <= 0) {
      oAuth2Client.setCredentials(tokens);

      const people = google.people({
        version: "v1",
        auth: oAuth2Client,
      });

      const fetchAllContacts = async () => {
        const allContacts = {
          phoneContacts: [],
          otherContacts: [],
          directoryContacts: [],
        };

        await Promise.all([
          fetchPhoneContacts(allContacts),
          fetchOtherContacts(allContacts),
          fetchDirectoryContacts(allContacts),
        ]);

        return allContacts;
      };

      const fetchPhoneContacts = async (allContacts) => {
        let nextPageToken = null;

        do {
          const response = await fetchPhoneContactsPage(nextPageToken);
          const { connections, nextPageToken: nextToken } = response.data;
          if(connections){
            allContacts.phoneContacts =
              allContacts.phoneContacts.concat(connections);
          }
          nextPageToken = nextToken;
        } while (nextPageToken);
      };

      const fetchPhoneContactsPage = async (nextPageToken) => {
        const params = {
          resourceName: "people/me",
          personFields: "names,emailAddresses,phoneNumbers,organizations",
          pageSize: 1000,
        };

        if (nextPageToken) {
          params.pageToken = nextPageToken;
        }

        try {
          const response = await people.people.connections.list(params);
          return response;
        } catch (error) {
          console.error("Error fetching phone contacts:", error);
          throw error;
        }
      };

      const fetchOtherContacts = async (allContacts) => {
        let nextPageToken = null;

        do {
          const response = await fetchOtherContactsPage(nextPageToken);
          const { otherContacts, nextPageToken: nextToken } = response.data;

          allContacts.otherContacts =
            allContacts.otherContacts.concat(otherContacts);
          nextPageToken = nextToken;
        } while (nextPageToken);
      };

      const fetchOtherContactsPage = async (nextPageToken) => {
        const params = {
          pageSize: 1000,
          readMask: "names,emailAddresses,phoneNumbers",
        };

        if (nextPageToken) {
          params.pageToken = nextPageToken;
        }

        try {
          const response = await people.otherContacts.list(params);
          return response;
        } catch (error) {
          console.error("Error fetching other contacts:", error);
          throw error;
        }
      };

      const fetchDirectoryContacts = async (allContacts) => {
        if (info.email.includes("gmail.com")) {
          return; // No directory contacts for Gmail accounts
        }

        let nextPageToken = null;

        do {
          const response = await fetchDirectoryContactsPage(nextPageToken);
          const { people, nextPageToken: nextToken } = response.data;

          allContacts.directoryContacts =
            allContacts.directoryContacts.concat(people);
          nextPageToken = nextToken;
        } while (nextPageToken);
      };

      const fetchDirectoryContactsPage = async (nextPageToken) => {
        const params = {
          readMask: "names,emailAddresses,organizations",
          sources: ["DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"],
          pageSize: 1000,
        };

        if (nextPageToken) {
          params.pageToken = nextPageToken;
        }

        try {
          const response = await people.people.listDirectoryPeople(params);
          return response;
        } catch (error) {
          console.error("Error fetching directory contacts:", error);
          throw error;
        }
      };

      // Usage
      const test = async () => {
        try {
          const allContacts = await fetchAllContacts();
          const parsedPhoneContacts = formatResults(allContacts?.phoneContacts);
          const parsedOtherContacts = parseContacts(allContacts?.otherContacts);
          const parsedDirectoryContacts = info.email.includes("gmail.com")
            ? []
            : parseDirectoryContacts(allContacts?.directoryContacts);

          const allParsedContacts = [
            ...parsedPhoneContacts,
            ...parsedDirectoryContacts,
            ...parsedOtherContacts,
          ].map((contact) => {
            return { ...contact, contactsSource: admin._id };
          });
          const savedContacts = await AllContacts.insertMany(allParsedContacts);
          await admin.updateOne({
            allContacts: savedContacts.map((contact) => contact._id),
          });
          const hasLinkedInContacts = await AllContacts.find({
            $and: [{ contactsSource: admin._id }, { source: "linkedIn" }],
          });

          console.log(" updated contacts");
          res.json({
            success: true,
            info,
            parsedPhoneContacts,
            parsedDirectoryContacts,
            parsedOtherContacts,
            token: adminToken,
            admin: {
              ...admin.toObject(),
              hasLinkedInContacts: hasLinkedInContacts.length > 0,
            },
          });
          // return allContacts;
        } catch (error) {
          console.error("Error fetching all contacts:", error);
        }
      };

      test();
    } else {
      console.log("already updated contacts");
      const hasLinkedInContacts = await AllContacts.find({
        $and: [{ contactsSource: admin._id }, { source: "linkedIn" }],
      });
      res.json({
        success: true,
        info,
        token: adminToken,
        admin: {
          ...admin.toObject(),
          hasLinkedInContacts: hasLinkedInContacts.length > 0,
        },
      });
    }
  } catch (e) {
    console.log(e, "e");
    res.json({ success: false, error: JSON.stringify(e) });
  }
});

router.get("/organiseContacts", auth.verifyToken, async (req, res) => {
  const admin = await BlumeEmployee.findById(req.user.userId);

  const allContacts = await AllContacts.find({
    contactsSource: admin._id,
  })
    .select("-_id -__v -createdAt -updatedAt")
    .lean();

  const parsedPhoneContacts = allContacts.filter(
    (c) => c.source == "phoneContact"
  );

  const parsedOtherContacts = allContacts.filter(
    (c) => c.source == "otherContact"
  );

  const parsedDirectoryContacts = allContacts.filter(
    (c) => c.source == "directoryContact"
  );

  const formattedCSV = allContacts.filter((c) => c.source == "linkedIn");

  const contactsWithEmail = mapContactsForEmail(
    formattedCSV,
    parsedDirectoryContacts,
    parsedOtherContacts
  );

  const newConnections = contactsWithEmail.map((c) => {
    return { ...c, whoseConnection: admin._id };
  });

  const savedConnections = await BlumeConnection.insertMany(newConnections);
  const ids = savedConnections.map((connection) => {
    return connection._id;
  });

  await admin
    .updateOne({
      $push: { connections: { $each: ids } },
    })
    .lean();

  res.json({
    parsedPhoneContacts,
    parsedOtherContacts,
    parsedDirectoryContacts,
    formattedCSV,
    contactsWithEmail,
  });
});

router.post(
  "/upload-linkendInCSV",
  auth.verifyToken,
  async (req, res, next) => {
    try {
      const { csvData } = req.body;

      const admin = await BlumeEmployee.findById(req.user.userId);

      const user_id = admin._id;
      // Check if user_id and csv_data are provided
      if (!user_id || !csvData) {
        return res
          .status(400)
          .json({ success: false, message: "Missing user_id or csv_data" });
      }

      const readableStream = Readable.from(csvData);

      const csvResults = [];
      const readCsv = new Promise((resolve, reject) => {
        readableStream
          .pipe(csv())
          .on("data", (row) => {
            csvResults.push(row);
          })
          .on("end", () => {
            console.log("CSV file successfully processed.");
            resolve(csvResults);
          })
          .on("error", (error) => {
            reject("Error processing CSV file: " + error);
          });
      });

      const checkCSV = await readCsv;
      const [removed, ...parsedCsv] = checkCSV;
      const formattedCSV = formatCSV(parsedCsv).map((contact) => {
        return { ...contact, source: "linkedIn", contactsSource: admin._id };
      });

      const savedContacts = await AllContacts.insertMany(formattedCSV);
      await admin.updateOne({
        allContacts: savedContacts.map((contact) => contact._id),
      });
      res.json({
        success: true,
        message: "CSV file uploaded successfully",
        formattedCSV,
        admin: {
          ...admin.toObject(),
          hasLinkedInContacts: true,
        },
      });
    } catch (e) {
      console.error("Error converting CSV to JSON:", e);
      res.json({ success: false, message: "CSV file upload fail" });
    }
  }
);

module.exports = router;
