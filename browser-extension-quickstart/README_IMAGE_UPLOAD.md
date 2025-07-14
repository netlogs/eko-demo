# 图片URL上传演示 - Eko 2.2.0

这个Chrome扩展演示了如何使用Eko 2.2.0框架实现从图片URL上传图片到网页的功能。

## 功能特点

- ✅ 基于Eko 2.2.0最新版本
- ✅ 从网络URL下载图片并上传到文件输入框
- ✅ 支持多种图片格式（JPG, PNG, GIF, WebP等）
- ✅ 自动处理文件名和MIME类型
- ✅ 完整的错误处理和日志记录
- ✅ 中文界面和日志

## 核心实现

### 1. ImageUploadAgent (src/browser/ImageUploadAgent.ts)

自定义的Browser Agent，继承自`BaseBrowserLabelsAgent`：

```typescript
export default class ImageUploadAgent extends BaseBrowserLabelsAgent {
  constructor() {
    super(undefined, [
      {
        name: "upload_image_from_url",
        description: "从网络URL下载图片并上传到文件输入框",
        parameters: {
          type: "object",
          properties: {
            index: { type: "number", description: "文件输入框的元素索引" },
            imageUrl: { type: "string", description: "要上传的图片URL地址" },
            fileName: { type: "string", description: "自定义文件名（可选）" }
          },
          required: ["index", "imageUrl"]
        },
        execute: async (args, agentContext) => {
          return await this.uploadImageFromUrl(/* ... */);
        }
      }
    ]);
  }
}
```

### 2. 核心上传逻辑

```javascript
// 注入到网页的脚本
async function uploadImageFromUrlScript(params) {
  // 1. 获取文件输入框元素
  const element = (window as any).get_highlight_element(index);
  
  // 2. 从URL获取图片
  const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
  const blob = await response.blob();
  
  // 3. 创建File对象
  const file = new File([blob], fileName, { type: blob.type });
  
  // 4. 设置到input元素
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  element.files = dataTransfer.files;
  
  // 5. 触发事件
  element.dispatchEvent(new Event('change', { bubbles: true }));
}
```

## 使用方法

### 1. 配置API密钥

在Chrome扩展的选项页面中配置你的OpenAI API密钥。

### 2. 加载扩展

1. 在Chrome中打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的`dist`文件夹

### 3. 使用演示

1. 打开任何包含文件上传框的网站
2. 点击扩展图标打开popup
3. 选择以下任一选项：
   - **完整演示**: 执行完整的图片上传流程
   - **简单测试**: 直接测试图片上传功能

## 支持的使用场景

### 自然语言任务描述

```javascript
const workflow = await eko.generate(`
  在当前网页上传图片演示：
  1. 找到页面上的文件上传框
  2. 从URL上传图片: https://picsum.photos/300/200
  3. 确认上传成功
`);
```

### 完整的社交媒体发帖流程

```javascript
const workflow = await eko.generate(`
  任务：在社交媒体网站更换头像
  1. 打开用户设置页面
  2. 找到头像上传区域
  3. 上传这张头像图片: https://example.com/new-avatar.jpg
  4. 保存更改
`);
```

## 技术架构变化 (相比1.3.5)

### Eko 2.2.0 主要改进

1. **分离式API设计**:
   ```typescript
   // 1.3.5
   await eko.execute(workflow, callback);
   
   // 2.2.0
   const workflow = await eko.generate(taskPrompt);
   await eko.execute(workflow.taskId);
   ```

2. **更灵活的Agent扩展**:
   ```typescript
   // 通过构造函数添加自定义工具
   class CustomAgent extends BaseBrowserLabelsAgent {
     constructor() {
       super(undefined, [customTool1, customTool2]);
     }
   }
   ```

3. **改进的类型系统**:
   ```typescript
   // 更严格的类型定义
   interface EkoConfig {
     llms: LLMs;
     agents?: Agent[];
     callback?: StreamCallback & HumanCallback;
   }
   ```

## 错误处理

扩展包含完善的错误处理：

- ✅ 网络错误处理
- ✅ 文件类型验证
- ✅ 元素不存在检查
- ✅ CORS跨域处理
- ✅ 文件名自动生成

## 开发说明

### 构建项目

```bash
pnpm install
pnpm build
```

### 开发模式

```bash
pnpm run build:dev
```

### 项目结构

```
src/
├── browser/
│   └── ImageUploadAgent.ts      # 自定义图片上传Agent
├── background/
│   ├── index.ts                 # 后台脚本入口
│   └── image_upload_workflow.ts # 图片上传工作流
└── popup/
    └── index.tsx                # 扩展弹出界面
```

## 注意事项

1. **CORS限制**: 某些网站可能因为CORS策略无法直接下载图片
2. **文件大小**: 注意图片文件大小，避免超出网站限制
3. **API密钥**: 确保在使用前配置正确的OpenAI API密钥
4. **网站兼容性**: 不同网站的文件上传实现可能存在差异

## 后续扩展

可以基于这个框架继续开发：

- 支持批量图片上传
- 添加图片处理功能（裁剪、压缩）
- 支持更多文件类型
- 添加进度显示
- 集成更多AI能力

这个演示展示了Eko 2.2.0框架的强大能力，通过自然语言描述就能实现复杂的浏览器自动化任务！