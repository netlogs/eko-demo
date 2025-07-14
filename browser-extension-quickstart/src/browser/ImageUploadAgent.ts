import { AgentContext, BaseBrowserLabelsAgent } from "@eko-ai/eko";

export default class ImageUploadAgent extends BaseBrowserLabelsAgent {
  constructor() {
    // 设置Agent描述，强调只上传文件，不做其他操作
    const restrictedDescription = `你是一个专门的图片上传代理，严格按照以下规则操作：

1. **只负责文件上传**: 你的唯一任务是将指定的图片URL上传到文件输入框
2. **不要填写表单**: 上传完成后立即停止，不要填写任何其他表单字段
3. **不要点击按钮**: 除非明确要求，不要点击提交、确认或其他按钮
4. **不要导航**: 不要导航到其他页面或网站
5. **任务完成即停**: 文件成功上传到input元素后，任务立即完成

操作步骤：
1. 找到文件上传输入框
2. 使用upload_image_from_url工具上传指定图片
3. 任务完成，停止所有操作

重要：上传完成后不要执行任何额外操作！`;

    // 调用父类构造函数，添加图片上传工具
    super(undefined, [
      {
        name: "upload_image_from_url",
        description: "从网络URL下载图片并上传到文件输入框。上传完成后任务立即结束，不要执行任何其他操作。",
        parameters: {
          type: "object",
          properties: {
            index: {
              type: "number",
              description: "文件输入框的元素索引"
            },
            imageUrl: {
              type: "string",
              description: "要上传的图片URL地址"
            },
            fileName: {
              type: "string",
              description: "自定义文件名（可选）",
              default: ""
            }
          },
          required: ["index", "imageUrl"]
        },
        execute: async (args, agentContext) => {
          return await this.callInnerTool(() =>
            this.uploadImageFromUrl(
              agentContext,
              args.index as number,
              args.imageUrl as string,
              args.fileName as string
            )
          );
        }
      }
    ]);
    
    // 重写Agent描述，覆盖父类的默认描述
    this.description = restrictedDescription;
  }

  // 从URL上传图片的核心方法
  protected async uploadImageFromUrl(
    agentContext: AgentContext,
    index: number,
    imageUrl: string,
    customFileName?: string
  ): Promise<any> {
    return await this.execute_script(
      agentContext,
      uploadImageFromUrlScript,
      [{ index, imageUrl, customFileName }]
    );
  }

  // Chrome扩展的特定实现
  protected async screenshot(
    agentContext: AgentContext
  ): Promise<{ imageBase64: string; imageType: "image/jpeg" | "image/png" }> {
    let windowId = await this.getWindowId(agentContext);
    let dataUrl;
    try {
      dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
        format: "jpeg",
        quality: 60,
      });
    } catch (e) {
      await this.sleep(1000);
      dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
        format: "jpeg",
        quality: 60,
      });
    }
    let data = dataUrl.substring(dataUrl.indexOf("base64,") + 7);
    return {
      imageBase64: data,
      imageType: "image/jpeg",
    };
  }

  protected async navigate_to(
    agentContext: AgentContext,
    url: string
  ): Promise<{
    url: string;
    title?: string;
    tabId?: number;
  }> {
    let windowId = await this.getWindowId(agentContext);
    let tab = await chrome.tabs.create({
      url: url,
      windowId: windowId,
    });
    tab = await this.waitForTabComplete(tab.id);
    await this.sleep(200);
    agentContext.variables.set("windowId", tab.windowId);
    let navigateTabIds = agentContext.variables.get("navigateTabIds") || [];
    navigateTabIds.push(tab.id);
    agentContext.variables.set("navigateTabIds", navigateTabIds);
    return {
      url: url,
      title: tab.title,
      tabId: tab.id
    };
  }

  protected async get_all_tabs(
    agentContext: AgentContext
  ): Promise<Array<{ tabId: number; url: string; title: string }>> {
    let windowId = await this.getWindowId(agentContext);
    let tabs = await chrome.tabs.query({
      windowId: windowId,
    });
    let result: Array<{ tabId: number; url: string; title: string }> = [];
    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      result.push({
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
      });
    }
    return result;
  }

  protected async switch_tab(
    agentContext: AgentContext,
    tabId: number
  ): Promise<{ tabId: number; url: string; title: string }> {
    let tab = await chrome.tabs.update(tabId, { active: true });
    if (!tab) {
      throw new Error("tabId does not exist: " + tabId);
    }
    agentContext.variables.set("windowId", tab.windowId);
    return {
      tabId: tab.id,
      url: tab.url,
      title: tab.title,
    };
  }

  protected async execute_script(
    agentContext: AgentContext,
    func: (...args: any[]) => void,
    args: any[]
  ): Promise<any> {
    let tabId = await this.getTabId(agentContext);
    let frameResults = await chrome.scripting.executeScript({
      target: { tabId: tabId as number },
      func: func,
      args: args,
    });
    return frameResults[0].result;
  }

  // 辅助方法
  private async getTabId(agentContext: AgentContext): Promise<number | null> {
    let windowId = await this.getWindowId(agentContext);
    let tabs = (await chrome.tabs.query({
      windowId,
      active: true,
      windowType: "normal",
    })) as any[];
    if (tabs.length == 0) {
      tabs = (await chrome.tabs.query({
        windowId,
        windowType: "normal",
      })) as any[];
    }
    return tabs[tabs.length - 1].id as number;
  }

  private async getWindowId(
    agentContext: AgentContext
  ): Promise<number | null> {
    let windowId = agentContext.variables.get("windowId") as number;
    if (windowId) {
      return windowId;
    }
    let window = await chrome.windows.getLastFocused({
      windowTypes: ["normal"],
    });
    if (!window) {
      window = await chrome.windows.getCurrent({
        windowTypes: ["normal"],
      });
    }
    if (window) {
      return window.id;
    }
    let tabs = (await chrome.tabs.query({
      windowType: "normal",
      currentWindow: true,
    })) as any[];
    if (tabs.length == 0) {
      tabs = (await chrome.tabs.query({
        windowType: "normal",
        lastFocusedWindow: true,
      })) as any[];
    }
    return tabs[tabs.length - 1].windowId as number;
  }

  private async waitForTabComplete(
    tabId: number,
    timeout: number = 8000
  ): Promise<chrome.tabs.Tab> {
    return new Promise(async (resolve, reject) => {
      const time = setTimeout(async () => {
        chrome.tabs.onUpdated.removeListener(listener);
        let tab = await chrome.tabs.get(tabId);
        resolve(tab);
      }, timeout);
      const listener = async (updatedTabId: any, changeInfo: any, tab: any) => {
        if (updatedTabId == tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(time);
          resolve(tab);
        }
      };
      let tab = await chrome.tabs.get(tabId);
      if (tab.status === "complete") {
        resolve(tab);
        clearTimeout(time);
        return;
      }
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  private sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
  }
}

// 这个函数会被注入到网页中执行
async function uploadImageFromUrlScript(params: {
  index: number;
  imageUrl: string;
  customFileName?: string;
}) {
  try {
    const { index, imageUrl, customFileName } = params;

    // 获取文件输入框元素
    const element = (window as any).get_highlight_element(index);
    if (!element) {
      return { success: false, error: `无法找到索引为 ${index} 的元素` };
    }

    if (element.type !== 'file') {
      return { success: false, error: "目标元素不是文件输入框" };
    }

    // 显示加载状态
    console.log(`开始从URL下载图片: ${imageUrl}`);

    // 从URL获取图片
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // 验证是否为图片
    if (!blob.type.startsWith('image/')) {
      return {
        success: false,
        error: `URL返回的不是图片文件，而是: ${blob.type}`
      };
    }

    // 生成文件名
    let fileName = customFileName;
    if (!fileName) {
      // 从URL中提取文件名
      const urlPath = new URL(imageUrl).pathname;
      fileName = urlPath.split('/').pop() || 'image';

      // 如果没有扩展名，根据MIME类型添加
      if (!fileName.includes('.')) {
        const extension = blob.type.split('/')[1] || 'jpg';
        fileName += `.${extension}`;
      }
    }

    // 创建File对象
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now()
    });

    // 创建DataTransfer对象并添加文件
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // 设置文件到input元素
    element.files = dataTransfer.files;

    // 触发相关事件
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // 返回成功结果
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      originalUrl: imageUrl,
      message: `成功上传图片: ${file.name} (${Math.round(file.size/1024)}KB)`
    };

  } catch (error) {
    console.error('图片上传失败:', error);
    return {
      success: false,
      error: `上传失败: ${error.message}`,
      originalUrl: params.imageUrl
    };
  }
}

export { ImageUploadAgent };