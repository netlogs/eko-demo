import { Eko, EkoConfig } from "@eko-ai/eko";
import ImageUploadAgent from "../browser/ImageUploadAgent";

export async function imageUploadDemo() {
  // 配置eko 2.2.0
  const config: EkoConfig = {
    llms: {
      default: {
        provider: "openai",
        model: "gpt-4o",
        apiKey: await getApiKey(),
        config: {
          baseURL: "https://api.openai.com/v1",
        }
      }
    },
    agents: [new ImageUploadAgent()], // 使用我们的自定义Agent
    callback: {
      onMessage: async (message) => {
        printLog(`Agent: ${message.agentName} - ${message.type}`);
        if (message.type === 'text') {
          printLog(message.text);
        }
      }
    }
  };

  // 初始化eko
  let eko = new Eko(config);

  try {
    // 生成工作流
    const workflow = await eko.generate(`
      从图片URL上传图片到网页的演示任务：
      1. 导航到图片上传测试网站 https://httpbin.org/forms/post
      2. 找到文件上传输入框
      3. 从这个URL上传一张图片: https://picsum.photos/400/300
      4. 填写其他必要的表单字段
      5. 提交表单
    `);

    printLog("工作流生成完成，开始执行...");

    // 执行工作流
    const result = await eko.execute(workflow.taskId);

    if (result.success) {
      printLog("图片上传演示完成！", "success");
    } else {
      printLog(`执行失败: ${result.result}`, "error");
    }

  } catch (error) {
    printLog(`错误: ${error.message}`, "error");
  }
}

// 简化版本的演示，直接测试图片上传功能
export async function simpleImageUploadDemo() {
  const config: EkoConfig = {
    llms: {
      default: {
        provider: "openai",
        model: "gpt-4o",
        apiKey: await getApiKey(),
        config: {
          baseURL: "https://api.openai.com/v1",
        }
      }
    },
    agents: [new ImageUploadAgent()],
  };

  let eko = new Eko(config);

  const workflow = await eko.generate(`
    在当前网页上传图片演示：
    1. 找到页面上的文件上传框
    2. 从URL上传图片: https://picsum.photos/300/200
    3. 确认上传成功
  `);

  await eko.execute(workflow.taskId);
}

// 获取API密钥的辅助函数
async function getApiKey(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openai_api_key'], (result) => {
      resolve(result.openai_api_key || 'your-api-key-here');
    });
  });
}

function printLog(log: string, level?: "info" | "success" | "error") {
  console.log(`[${level || 'info'}] ${log}`);
  chrome.runtime.sendMessage({ type: "log", log, level: level || "info" });
}