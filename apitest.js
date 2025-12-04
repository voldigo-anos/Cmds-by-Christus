const axios = require("axios");

module.exports = {
  config: {
    name: "apitest",
    aliases: ["api", "apicall"],
    version: "1.0",
    author: "Christus",
    countDown: 10,
    role: 0,
    description: "Tests a given API endpoint with various HTTP methods and data.",
    category: "utility",
    guide: {
      en: "{pn} <method> <url> [headers] [body]\n\nExample for GET: {pn} get https://api.example.com/data?id=123\n\nExample for POST: {pn} post https://api.example.com/users {\"name\":\"John\"} {\"Content-Type\":\"application/json\"}\n\nNote: Headers and body must be valid JSON strings."
    }
  },

  onStart: async function ({ api, event, args }) {
    const [method, url, headersString, bodyString] = args;

    if (!method || !url) {
      return api.sendMessage(this.config.guide.en, event.threadID, event.messageID);
    }

    const httpMethod = method.toUpperCase();
    let requestHeaders = {};
    let requestBody = {};
    
    // Parse headers if provided
    if (headersString) {
      try {
        requestHeaders = JSON.parse(headersString);
      } catch (e) {
        return api.sendMessage("❌ Invalid headers. Please use valid JSON format for headers.", event.threadID, event.messageID);
      }
    }
    
    // Parse body if provided
    if (bodyString) {
      try {
        requestBody = JSON.parse(bodyString);
      } catch (e) {
        return api.sendMessage("❌ Invalid body. Please use valid JSON format for the request body.", event.threadID, event.messageID);
      }
    }

    try {
      let response;
      const config = { headers: requestHeaders };

      switch (httpMethod) {
        case "GET":
          response = await axios.get(url, config);
          break;
        case "POST":
          response = await axios.post(url, requestBody, config);
          break;
        case "PUT":
          response = await axios.put(url, requestBody, config);
          break;
        case "DELETE":
          response = await axios.delete(url, { ...config, data: requestBody });
          break;
        default:
          return api.sendMessage("❌ Invalid HTTP method. Supported methods: GET, POST, PUT, DELETE.", event.threadID, event.messageID);
      }

      const responseBody = JSON.stringify(response.data, null, 2);
      const statusCode = response.status;
      const statusText = response.statusText;

      const replyMessage = `✅ API Test Result\n\n` +
                           `URL: ${url}\n` +
                           `Method: ${httpMethod}\n` +
                           `Status Code: ${statusCode} ${statusText}\n\n` +
                           `Response Body:\n` +
                           `\`\`\`json\n${responseBody}\n\`\`\``;

      api.sendMessage(replyMessage, event.threadID, event.messageID);

    } catch (e) {
      const errorMessage = e.response ? `Status: ${e.response.status}\nMessage: ${e.response.statusText}` : e.message;
      api.sendMessage(`❌ API request failed.\n\nError: ${errorMessage}`, event.threadID, event.messageID);
    }
  }
};