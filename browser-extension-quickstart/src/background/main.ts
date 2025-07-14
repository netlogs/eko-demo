import { Eko, LLMs, StreamCallbackMessage } from "@eko-ai/eko";
import { StreamCallback, HumanCallback } from "@eko-ai/eko/types";
import WebsiteSubmissionAgent from "../browser/WebsiteSubmissionAgent";

export async function getLLMConfig(name: string = "llmConfig"): Promise<any> {
  let result = await chrome.storage.sync.get([name]);
  return result[name];
}

export async function main(prompt: string): Promise<Eko> {
  let config = await getLLMConfig();
  if (!config || !config.apiKey) {
    printLog("请配置API密钥，请在浏览器扩展的选项页面中配置LLM参数。", "error");
    chrome.runtime.openOptionsPage();
    chrome.storage.local.set({ isRunning: false });
    chrome.runtime.sendMessage({ type: "stop" });
    return;
  }

  const llms: LLMs = {
    default: {
      provider: config.llm as any,
      model: config.modelName,
      apiKey: config.apiKey,
      config: {
        baseURL: config.options.baseURL,
      },
    },
  };

  let callback: StreamCallback & HumanCallback = {
    onMessage: async (message: StreamCallbackMessage) => {
      try {
        if (message.type == "workflow") {
          printLog("计划生成完成", "info", !message.streamDone);
          // 不直接打印XML，避免解析错误
        } else if (message.type == "text") {
          printLog(message.text, "info", !message.streamDone);
        } else if (message.type == "tool_streaming") {
          printLog(`${message.agentName} > ${message.toolName}`, "info", true);
        } else if (message.type == "tool_use") {
          printLog(`${message.agentName} > ${message.toolName}`, "info");
        }
      } catch (error) {
        console.error("消息处理错误:", error);
        printLog("处理消息时出现错误", "error");
      }
    },
    onHumanConfirm: async (context, prompt) => {
      return doConfirm(prompt);
    },
  };

  // 使用我们的自定义WebsiteSubmissionAgent
  let agents = [new WebsiteSubmissionAgent()];
  let eko = new Eko({ llms, agents, callback });
  eko
    .run(prompt)
    .then((res) => {
      printLog(res.result, res.success ? "success" : "error");
    })
    .catch((error) => {
      printLog(error, "error");
    })
    .finally(() => {
      chrome.storage.local.set({ isRunning: false });
      chrome.runtime.sendMessage({ type: "stop" });
    });
  return eko;
}

async function doConfirm(prompt: string) {
  let tabs = (await chrome.tabs.query({
    active: true,
    windowType: "normal",
  })) as any[];
  let frameResults = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: (prompt) => {
      return window.confirm(prompt);
    },
    args: [prompt],
  });
  return frameResults[0].result;
}

function printLog(
  message: string,
  level?: "info" | "success" | "error",
  stream?: boolean
) {
  chrome.runtime.sendMessage({
    type: "log",
    log: message + "",
    level: level || "info",
    stream,
  });
}