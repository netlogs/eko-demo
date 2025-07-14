import { AgentContext, BaseBrowserLabelsAgent } from "@eko-ai/eko";

export default class WebsiteSubmissionAgent extends BaseBrowserLabelsAgent {
  constructor() {
    // 设置专门的网站信息收集与提交Agent描述
    const agentDescription = `# 网站信息收集与多平台提交专家 Agent

你是一个专业的网站信息收集与多平台提交专家，擅长从目标网站提取关键信息并智能匹配到不同平台的提交表单中。

## 🔍 核心任务流程

### 阶段1：信息收集与分析
1. **深度分析目标网站**
   - 导航到用户提供的A网站
   - 提取页面的所有关键信息，包括：
     - 网站标题和描述
     - 主要内容/产品描述
     - 关键字和标签
     - 联系信息（邮箱、电话、地址）
     - 网站分类/行业类型
     - 网站图片和logo URL
     - 技术特征和特色功能

2. **结构化信息存储**
   - 将收集到的信息按以下格式整理：
   \`\`\`
   网站信息档案：
   - 网站名称: [提取的标题]
   - 网站URL: [原始链接]
   - 网站描述: [简介，长短两个版本]
   - 关键词: [相关标签，用逗号分隔]
   - 分类: [行业/类型]
   - 联系邮箱: [如果有]
   - 主要图片: [logo或代表性图片URL]
   - 特色功能: [核心卖点]
   \`\`\`

### 阶段2：智能表单识别与填充
对于每个目标提交网站，执行以下步骤：

1. **表单结构分析**
   - 仔细分析页面上的所有表单字段
   - 识别字段类型：文本框、下拉选择、多选框、文件上传等
   - 记录每个字段的标签、占位符文本、是否必填

2. **智能信息匹配**
   - 根据字段标签和上下文，从信息档案中匹配最合适的内容
   - 常见匹配规则：
     - 网站名称/标题 → "网站名称"、"公司名称"、"标题"字段
     - 网站URL → "网站链接"、"网址"、"URL"字段
     - 描述信息 → "描述"、"简介"、"详细信息"字段
     - 关键词 → "标签"、"关键词"、"分类"字段
     - 联系信息 → "邮箱"、"联系方式"字段
     - 图片 → 文件上传字段

3. **容错处理机制**
   - 如果字段标签不清晰，优先选择最相关的信息
   - 对于下拉选择，选择最接近的选项
   - 对于必填字段，确保不留空
   - 对于可选字段，优先填充重要信息

## 🛠️ 具体操作规范

### 信息提取技巧
- 使用 \`extract_page_content\` 获取页面完整内容
- 重点关注 \`<title>\`、\`<meta description>\`、\`<h1>\` 等关键标签
- 查找 FAQ、About Us、Contact 等信息丰富的页面
- 识别并提取图片资源URL

### 表单填写策略
- 优先填写必填字段（通常带有*号或红色标识）
- 对于文本字段，根据长度限制调整内容
- 对于选择字段，选择最匹配的选项
- 对于文件上传，使用 \`upload_image_from_url\` 工具

### 质量控制
- 每次填写前确认信息的准确性和相关性
- 避免填写明显不相关的信息
- 对于不确定的字段，可以留空或使用通用信息

## 🎯 执行示例

当接收到任务："将网站 https://example.com 提交到 directory1.com 和 directory2.com"

1. 分析 example.com，提取信息档案
2. 访问 directory1.com 的提交页面
3. 识别表单字段并智能匹配信息
4. 填写表单并提交
5. 重复步骤2-4处理 directory2.com
6. 报告每个网站的提交状态

## ⚠️ 注意事项

- **准确性优先**: 宁可少填也不要填错
- **适应性强**: 不同网站的表单结构差异很大，要灵活应对
- **效率平衡**: 在信息收集的完整性和执行效率之间找到平衡
- **错误处理**: 遇到识别困难的表单，记录具体问题并继续处理其他网站

## 🔧 技术能力要求

- 熟练使用所有 Browser Agent 工具
- 具备强大的信息提取和模式识别能力
- 能够处理各种复杂的表单结构
- 支持文件上传和图片处理

执行时请按照此流程严格操作，确保每个步骤都有明确的输出结果。`;

    // 调用父类构造函数，添加专门的工具
    super(undefined, [
      {
        name: "collect_website_info",
        description: "从目标网站深度收集结构化信息，包括标题、描述、关键词、联系信息等",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "要分析的网站URL"
            }
          },
          required: ["url"]
        },
        execute: async (args, agentContext) => {
          return await this.callInnerTool(() =>
            this.collectWebsiteInfo(agentContext, args.url as string)
          );
        }
      },
      {
        name: "analyze_form_structure",
        description: "分析当前页面的表单结构，识别所有输入字段、类型和要求",
        parameters: {
          type: "object",
          properties: {},
          required: []
        },
        execute: async (args, agentContext) => {
          return await this.callInnerTool(() =>
            this.analyzeFormStructure(agentContext)
          );
        }
      },
      {
        name: "smart_form_fill",
        description: "智能填充表单，根据收集的网站信息匹配到合适的表单字段",
        parameters: {
          type: "object",
          properties: {
            websiteInfo: {
              type: "object",
              description: "之前收集的网站信息档案"
            },
            formStructure: {
              type: "object", 
              description: "表单结构分析结果"
            }
          },
          required: ["websiteInfo", "formStructure"]
        },
        execute: async (args, agentContext) => {
          return await this.callInnerTool(() =>
            this.smartFormFill(
              agentContext, 
              args.websiteInfo as any, 
              args.formStructure as any
            )
          );
        }
      },
      {
        name: "upload_image_from_url",
        description: "从网络URL下载图片并上传到文件输入框",
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
    
    // 设置Agent描述
    this.description = agentDescription;
  }

  // 深度收集网站信息
  protected async collectWebsiteInfo(
    agentContext: AgentContext,
    url: string
  ): Promise<any> {
    return await this.execute_script(
      agentContext,
      collectWebsiteInfoScript,
      [{ url }]
    );
  }

  // 分析表单结构
  protected async analyzeFormStructure(
    agentContext: AgentContext
  ): Promise<any> {
    return await this.execute_script(
      agentContext,
      analyzeFormStructureScript,
      []
    );
  }

  // 智能填充表单
  protected async smartFormFill(
    agentContext: AgentContext,
    websiteInfo: any,
    formStructure: any
  ): Promise<any> {
    return await this.execute_script(
      agentContext,
      smartFormFillScript,
      [{ websiteInfo, formStructure }]
    );
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

// 深度收集网站信息的脚本
async function collectWebsiteInfoScript(params: { url: string }) {
  try {
    const websiteInfo = {
      url: params.url,
      title: "",
      descriptions: { short: "", long: "" },
      keywords: [],
      category: "",
      contactEmail: "",
      images: { logo: "", featured: [] },
      features: [],
      metadata: {}
    };

    // 提取标题
    websiteInfo.title = document.title || 
      document.querySelector('h1')?.textContent?.trim() || 
      "";

    // 提取描述信息
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (metaDesc) {
      websiteInfo.descriptions.short = metaDesc.substring(0, 150);
      websiteInfo.descriptions.long = metaDesc;
    }

    // 从页面内容提取描述
    const aboutSection = document.querySelector('[class*="about"], [id*="about"], [class*="intro"], [id*="intro"]');
    if (aboutSection && !websiteInfo.descriptions.long) {
      websiteInfo.descriptions.long = aboutSection.textContent?.trim().substring(0, 500) || "";
    }

    // 提取关键词
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    if (metaKeywords) {
      websiteInfo.keywords = metaKeywords.split(',').map(k => k.trim());
    }

    // 从标题和内容推断关键词
    const titleWords = websiteInfo.title.toLowerCase().split(/\s+/);
    websiteInfo.keywords = [...new Set([...websiteInfo.keywords, ...titleWords])];

    // 提取邮箱
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const bodyText = document.body.textContent || "";
    const emails = bodyText.match(emailRegex);
    if (emails && emails.length > 0) {
      websiteInfo.contactEmail = emails[0];
    }

    // 提取图片
    const logo = document.querySelector('img[class*="logo"], img[id*="logo"], .logo img');
    if (logo) {
      websiteInfo.images.logo = (logo as HTMLImageElement).src;
    }

    // 提取特色图片
    const featuredImages = document.querySelectorAll('img[class*="hero"], img[class*="featured"], img[class*="banner"]');
    featuredImages.forEach((img, index) => {
      if (index < 3) {
        websiteInfo.images.featured.push((img as HTMLImageElement).src);
      }
    });

    // 提取其他元数据
    websiteInfo.metadata = {
      language: document.documentElement.lang || 'en',
      charset: document.characterSet,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    };

    return {
      success: true,
      websiteInfo,
      message: `成功收集网站信息: ${websiteInfo.title}`
    };

  } catch (error) {
    return {
      success: false,
      error: `信息收集失败: ${error.message}`
    };
  }
}

// 分析表单结构的脚本
function analyzeFormStructureScript() {
  try {
    const forms = document.querySelectorAll('form');
    const formStructure = {
      formsCount: forms.length,
      fields: []
    };

    forms.forEach((form, formIndex) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach((input, inputIndex) => {
        const inputElement = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const field = {
          formIndex,
          elementIndex: inputIndex,
          type: (inputElement as any).type || input.tagName.toLowerCase(),
          name: (inputElement as any).name || "",
          id: (inputElement as any).id || "",
          placeholder: (inputElement as any).placeholder || "",
          required: input.hasAttribute('required'),
          label: "",
          options: []
        };

        // 查找关联的label
        const label = form.querySelector(`label[for="${input.id}"]`) || 
                     input.closest('label') ||
                     input.previousElementSibling?.tagName === 'LABEL' ? input.previousElementSibling : null;
        
        if (label) {
          field.label = label.textContent?.trim() || "";
        }

        // 如果是select，提取选项
        if (input.tagName.toLowerCase() === 'select') {
          const options = input.querySelectorAll('option');
          options.forEach(option => {
            field.options.push({
              value: option.value,
              text: option.textContent?.trim()
            });
          });
        }

        formStructure.fields.push(field);
      });
    });

    return {
      success: true,
      formStructure,
      message: `分析了 ${forms.length} 个表单，共 ${formStructure.fields.length} 个字段`
    };

  } catch (error) {
    return {
      success: false,
      error: `表单分析失败: ${error.message}`
    };
  }
}

// 智能填充表单的脚本
function smartFormFillScript(params: { websiteInfo: any; formStructure: any }) {
  try {
    const { websiteInfo, formStructure } = params;
    const fillResults = [];

    formStructure.fields.forEach((field, index) => {
      const element = document.querySelector(`input:nth-of-type(${index + 1}), textarea:nth-of-type(${index + 1}), select:nth-of-type(${index + 1})`);
      
      if (!element) return;

      let valueToFill = "";
      const fieldIdentifier = (field.label + field.placeholder + field.name + field.id).toLowerCase();

      // 智能匹配逻辑
      if (fieldIdentifier.includes('title') || fieldIdentifier.includes('name') || fieldIdentifier.includes('site')) {
        valueToFill = websiteInfo.title;
      } else if (fieldIdentifier.includes('url') || fieldIdentifier.includes('website') || fieldIdentifier.includes('link')) {
        valueToFill = websiteInfo.url;
      } else if (fieldIdentifier.includes('description') || fieldIdentifier.includes('about') || fieldIdentifier.includes('summary')) {
        valueToFill = field.type === 'textarea' ? websiteInfo.descriptions.long : websiteInfo.descriptions.short;
      } else if (fieldIdentifier.includes('email') || fieldIdentifier.includes('contact')) {
        valueToFill = websiteInfo.contactEmail;
      } else if (fieldIdentifier.includes('keyword') || fieldIdentifier.includes('tag')) {
        valueToFill = websiteInfo.keywords.join(', ');
      } else if (fieldIdentifier.includes('category') || fieldIdentifier.includes('type')) {
        // 对于select，尝试选择最匹配的选项
        if (field.type === 'select' && field.options.length > 0) {
          // 选择第一个非空选项作为默认
          const firstOption = field.options.find(opt => opt.value && opt.value !== '');
          if (firstOption) {
            valueToFill = firstOption.value;
          }
        }
      }

      // 填充字段
      if (valueToFill && element) {
        if (field.type === 'select') {
          (element as HTMLSelectElement).value = valueToFill;
        } else {
          (element as HTMLInputElement | HTMLTextAreaElement).value = valueToFill;
        }
        
        // 触发事件
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        fillResults.push({
          field: field.label || field.name || field.id,
          value: valueToFill,
          success: true
        });
      }
    });

    return {
      success: true,
      fillResults,
      message: `成功填充 ${fillResults.length} 个字段`
    };

  } catch (error) {
    return {
      success: false,
      error: `表单填充失败: ${error.message}`
    };
  }
}

// 图片上传脚本（复用之前的）
async function uploadImageFromUrlScript(params: {
  index: number;
  imageUrl: string;
  customFileName?: string;
}) {
  try {
    const { index, imageUrl, customFileName } = params;

    const element = (window as any).get_highlight_element(index);
    if (!element) {
      return { success: false, error: `无法找到索引为 ${index} 的元素` };
    }

    if (element.type !== 'file') {
      return { success: false, error: "目标元素不是文件输入框" };
    }

    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    if (!blob.type.startsWith('image/')) {
      return {
        success: false,
        error: `URL返回的不是图片文件，而是: ${blob.type}`
      };
    }

    let fileName = customFileName;
    if (!fileName) {
      const urlPath = new URL(imageUrl).pathname;
      fileName = urlPath.split('/').pop() || 'image';

      if (!fileName.includes('.')) {
        const extension = blob.type.split('/')[1] || 'jpg';
        fileName += `.${extension}`;
      }
    }

    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now()
    });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    element.files = dataTransfer.files;

    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));

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

export { WebsiteSubmissionAgent };