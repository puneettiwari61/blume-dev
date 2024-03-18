import React, { useState } from "react";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const clientId =
  "775614405027-913fiotduieu2cnckd0l6o7d4djck461.apps.googleusercontent.com"; // Your Google OAuth client ID
// const scopes = ["https://www.googleapis.com/auth/contacts.readonly"];
const api_key = "AIzaSyCI552qeu9400USrUc8_71zaur4Kv7AxKw";
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const scopes = [
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/contacts.other.readonly",
    "https://www.googleapis.com/auth/directory.readonly",
    "https://www.googleapis.com/auth/user.addresses.read",
    "https://www.googleapis.com/auth/user.birthday.read",
    "https://www.googleapis.com/auth/user.emails.read",
    "https://www.googleapis.com/auth/user.gender.read",
    "https://www.googleapis.com/auth/user.organization.read",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: scopes.join(" "),
    onSuccess: async (codeResponse) => {
      console.log(codeResponse);
      const tokens = await axios.post("/api/v1/auth/google", {
        code: codeResponse.code,
      });

      console.log(tokens.data.data.connections);
      // setContacts(formatResults(tokens.data.data.connections));
      // setContacts(parseContacts(tokens.data.data.otherContacts));
      // setContacts(parseDirectoryContacts(tokens.data.data.people));
      setLoading(false);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });
  function formatResults(arrayComingFromPeopleApi) {
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
        email,
        phone,
      };
    });
    return resources;
    // commit the resources to the store
  }

  function parseContacts(contacts) {
    return contacts.map((contact) => {
      const parsedContact = {};

      // Parse name
      if (contact.names && contact.names.length > 0) {
        parsedContact.name = {
          displayName: contact.names[0].displayName || "",
          familyName: contact.names[0].familyName || "",
          givenName: contact.names[0].givenName || "",
        };
      } else {
        parsedContact.name = {};
      }

      // Parse email
      if (contact.emailAddresses && contact.emailAddresses.length > 0) {
        parsedContact.email = contact.emailAddresses[0].value || "";
      } else {
        parsedContact.email = "";
      }

      // Parse phone number
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        parsedContact.phoneNumber = contact.phoneNumbers[0].value || "";
      } else {
        parsedContact.phoneNumber = "";
      }

      return parsedContact;
    });
  }

  function parseDirectoryContacts(contacts) {
    return contacts.map((contact) => {
      const parsedContact = {};

      // Parse name
      if (contact.names && contact.names.length > 0) {
        parsedContact.name = {
          displayName: contact.names[0]?.displayName || "",
          familyName: contact.names[0]?.familyName || "",
          givenName: contact.names[0]?.givenName || "",
        };
      } else {
        parsedContact.name = {};
      }

      // Parse email
      if (contact.emailAddresses && contact.emailAddresses.length > 0) {
        parsedContact.email = contact.emailAddresses[0]?.value || "";
      } else {
        parsedContact.email = "";
      }

      // Parse phone number (assuming it exists)
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        parsedContact.phoneNumber = contact.phoneNumbers[0]?.value || "";
      } else {
        parsedContact.phoneNumber = "";
      }

      return parsedContact;
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Google Contacts</h2>
      <p
        className="text-blue-600 cursor-pointer"
        onClick={() => {
          setLoading(true);
          googleLogin();
        }}
      >
        Login with Google
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => {
              if (!contact) {
                return;
              }
              return (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-100" : ""}
                >
                  <td className="border px-4 py-2">
                    {contact?.name?.displayName}
                    {/* {contact.first + " " + contact.last} */}
                  </td>
                  <td className="border px-4 py-2">{contact.email}</td>
                  <td className="border px-4 py-2">{contact.phone}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Contacts;
