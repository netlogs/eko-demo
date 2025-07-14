import { Eko } from "@eko-ai/eko";
import { main } from "./main";

var eko: Eko;

chrome.storage.local.set({ isRunning: false });

// Listen to messages from the browser extension
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type == "run") {
    try {
      // Click the RUN button to execute the main function (workflow)
      chrome.runtime.sendMessage({ type: "log", log: "开始运行..." });
      // Run workflow with user's custom prompt
      eko = await main(request.prompt);
    } catch (e) {
      console.error(e);
      chrome.runtime.sendMessage({
        type: "log",
        log: e + "",
        level: "error",
      });
    }
  } else if (request.type == "stop") {
    eko && eko.getAllTaskId().forEach(taskId => {
      eko.abortTask(taskId);
      chrome.runtime.sendMessage({ type: "log", log: "中止任务: " + taskId });
    });
    chrome.runtime.sendMessage({ type: "log", log: "停止" });
  }
});
