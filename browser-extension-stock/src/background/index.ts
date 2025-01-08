import Eko from "@eko-ai/eko";
import { loadTools, utils } from "@eko-ai/eko/extension";
import { main } from "./first_workflow";

chrome.storage.local.set({ isRunning: false });

// Register tools
Eko.tools = loadTools();

// Listen to messages from the browser extension
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type == "run") {
    try {
      // Click the RUN button to execute the main function (workflow)
      chrome.runtime.sendMessage({ type: "log", log: "Run..." });
      await main();
    } finally {
      chrome.storage.local.set({ isRunning: false });
      chrome.runtime.sendMessage({ type: "stop" });
    }
  }
});
