function extractCompanyName(email) {
  if (email.includes("gmail.com")) {
    return "gmail";
  }
  const atIndex = email.indexOf("@");
  if (atIndex !== -1) {
    const domain = email.slice(atIndex + 1); // Extract domain part of email
    const dotIndex = domain.indexOf("."); // Find the first dot after the @ sign
    if (dotIndex !== -1) {
      const companyName = domain.slice(0, dotIndex); // Extract the company name
      const capitalizedCompanyName = companyName
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" ");
      return capitalizedCompanyName;
    }
  }
  return null; // Return null if the company name cannot be extracted
}
function formatResults(arrayComingFromPeopleApi) {
  if (!Array.isArray(arrayComingFromPeopleApi)) {
    return [];
  }
  const resources = arrayComingFromPeopleApi.map((resource) => {
    // get multiple email addresses and phone numbers if applicable
    const { emailAddresses = [], names = [], phoneNumbers = [] } = resource;
    const email = emailAddresses.map((email = {}) => email.value || "");
    const phone = phoneNumbers.map((phone = {}) => phone.value || "");
    const lastName = names.map((name = {}) => name.familyName || "");
    const firstName = names.map((name = {}) => name.givenName || "");

    return {
      first: firstName[0],
      last: lastName[0],
      email: Array.isArray(email) ? email.join() : "",
      phone,
      source: "phoneContact",
      displayName: firstName[0] + " " + lastName[0],
    };
  });
  return resources;
  // commit the resources to the store
}

function parseContacts(contacts) {
  return contacts
    .map((contact) => {
      if (contact.emailAddresses[0].value.includes("blume")) {
        return [];
      }
      let parsedContact = {};

      // Parse name
      if (contact.names && contact.names.length > 0) {
        parsedContact = {
          displayName: contact.names[0].displayName || "",
          lastName: contact.names[0]?.familyName || "",
          firstName: contact.names[0]?.givenName || "",
        };
      }

      // Parse email
      if (contact.emailAddresses && contact.emailAddresses.length > 0) {
        parsedContact.email = contact.emailAddresses[0].value || "";
        parsedContact.company = extractCompanyName(parsedContact.email);
      } else {
        parsedContact.email = "";
      }

      // Parse phone number
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        parsedContact.phoneNumber = contact.phoneNumbers[0].value || "";
      } else {
        parsedContact.phoneNumber = "";
      }

      return {
        ...parsedContact,
        source: "otherContact",
      };
    })
    .filter((c) => Object.keys(c).length !== 0);
}

//ask this question about extracting company name from email

function parseDirectoryContacts(contacts) {
  if (contacts?.length === 0) {
    return [];
  }
  return contacts
    .map((contact) => {
      if (contact.emailAddresses[0].value.includes("blume")) {
        return {};
      }
      let parsedContact = {};

      // Parse name
      if (contact.names && contact.names.length > 0) {
        parsedContact = {
          displayName: contact.names[0]?.displayName || "",
          lastName: contact.names[0]?.familyName || "",
          firstName: contact.names[0]?.givenName || "",
        };
      }

      // Parse email
      if (contact.emailAddresses && contact.emailAddresses.length > 0) {
        parsedContact.email = contact.emailAddresses[0]?.value || "";
        parsedContact.company = extractCompanyName(parsedContact.email);
      } else {
        parsedContact.email = "";
      }

      // Parse phone number (assuming it exists)
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        parsedContact.phoneNumber = contact.phoneNumbers[0]?.value || "";
      } else {
        parsedContact.phoneNumber = "";
      }

      return { ...parsedContact, source: "directoryContact" };
    })
    .filter((c) => Object.keys(c).length !== 0);
}

function formatCSV(parsedCsv) {
  parsedCsv.shift();

  const headers = Object.values(parsedCsv[0]);

  const keysOBJ = [
    "firstName",
    "lastName",
    "linkedInUrl",
    "email",
    "company",
    "position",
    "connectedOn",
  ];

  // Remove the first element (header row) from the array
  const dataArray = parsedCsv.slice(1);

  // Map each object in dataArray to a new object with keys from headers
  return dataArray.map((obj) => {
    const newObj = {};
    headers.forEach((header, index) => {
      // Remove any colon (:) from the key names and trim them
      if (index === 0) {
        newObj[keysOBJ[index]] = obj[`Notes:`];
      } else {
        key = header.replace(":", "").trim();

        // Assign values to keys based on index
        newObj[keysOBJ[index]] = obj[`_${index}`];
      }
    });
    return newObj;
  });
}

//secondary email
// First name + company (google contact) - check with linkedin first name and company name
// if there are more than one matches then check for last name.
// if company name is gmail because of email id then first name and last name

function mapContactsForEmail(
  linkedInContacts,
  directoryContacts,
  otherContacts
) {
  // Create a map of directory contacts and other contacts for quick access
  const directoryMap = new Map();
  const otherMap = new Map();
  const linkedInMap = new Map();

  directoryContacts.forEach((contact) => {
    const key = `${contact.firstName?.toLowerCase()} ${contact.lastName?.toLowerCase()}`;
    // const key = `${contact.firstName?.toLowerCase()}}`;

    directoryMap.set(key, contact);
  });

  otherContacts.forEach((contact) => {
    // const key = `${contact.firstName?.toLowerCase()}}`;

    const key = `${contact.firstName?.toLowerCase()} ${contact.lastName?.toLowerCase()}`;
    otherMap.set(key, contact);
  });

  linkedInContacts.forEach((contact) => {
    const key = `${contact.firstName?.toLowerCase()} ${contact.lastName?.toLowerCase()}`;
    // const key = `${contact.firstName?.toLowerCase()}}`;

    linkedInMap.set(key, contact);
  });

  const contactsWithEmail = [];
  const addedKeys = new Set();

  for (const otherContactElement of otherContacts) {
    const key = `${otherContactElement.firstName?.toLowerCase()} ${otherContactElement.lastName?.toLowerCase()}`;
    const directoryContact = directoryMap.get(key);
    const linkedInContact = linkedInMap.get(key);

    if (
      linkedInContact?.linkedInUrl === "https://www.linkedin.com/in/amnigos"
    ) {
      console.log(linkedInContact, otherContactElement, key, "ghost");
    }

    if (
      linkedInContact?.firstName &&
      includesSequentialLetters(
        linkedInContact?.company,
        otherContactElement?.company,
        3
      )
    ) {
      linkedInContact.email = otherContactElement?.email;
      // Check if the key already exists in the Set
      if (!addedKeys.has(linkedInContact?.linkedInUrl)) {
        contactsWithEmail.push({ ...otherContactElement, ...linkedInContact });
        // Add the key to the Set to mark it as added
        addedKeys.add(linkedInContact?.linkedInUrl);
      }
    }
  }

  return contactsWithEmail;
}

function includesSequentialLetters(string, substring, threshold) {
  if (substring === "Gmail" || substring === "gmail") {
    return true;
  }
  if (!string || !substring) {
    return false;
  }
  const isStringLongerThanSub = string?.length > substring?.length;

  if (isStringLongerThanSub) {
    string = string.toLowerCase();
    substring = substring.toLowerCase();

    let count = 0;
    for (let i = 0; i < string.length; i++) {
      if (string[i] === substring[count]) {
        count++;
        if (count === threshold) {
          return true;
        }
      } else {
        count = 0;
      }
    }
    return false;
  } else {
    string = string.toLowerCase();
    substring = substring.toLowerCase();

    let count = 0;
    for (let i = 0; i < substring.length; i++) {
      if (substring[i] === string[count]) {
        count++;
        if (count === threshold) {
          return true;
        }
      } else {
        count = 0;
      }
    }
    return false;
  }
}

const addToMap = (map, contact) => {
  const key = `${contact.firstName?.toLowerCase()}`;
  if (!map[key]) {
    map[key] = [];
  }
  map[key].push(contact);
};

function convertToValidCollectionName(name) {
  // Define regular expression to match special characters
  const specialCharsRegex = /[^a-zA-Z0-9]/g;

  // Replace special characters with underscore
  const validName = name.replace(specialCharsRegex, "_");

  return "blume_" + validName;
}

module.exports = {
  formatResults,
  parseContacts,
  parseDirectoryContacts,
  formatCSV,
  mapContactsForEmail,
  convertToValidCollectionName,
};
