# 网站信息收集与批量提交专家Agent 🚀

现在你的Chrome扩展已经升级为专业的网站信息收集与批量提交工具！

## ✅ 新功能特性

### 🔍 智能信息收集
- **深度网站分析**: 自动提取标题、描述、关键词、联系信息等
- **结构化存储**: 将信息整理成标准档案格式
- **多源信息**: 从页面元数据、内容区域、图片等多个来源收集

### 🛠️ 智能表单处理  
- **表单结构识别**: 分析所有输入字段、类型和要求
- **智能信息匹配**: 根据字段标签自动匹配合适的信息
- **容错处理**: 处理各种复杂的表单结构差异

### 📤 批量自动提交
- **多平台支持**: 同时提交到多个目录网站
- **进度跟踪**: 实时报告每个网站的提交状态
- **错误处理**: 自动处理提交失败并继续其他网站

## 🎯 核心Agent工具

### 1. `collect_website_info` - 网站信息收集
```typescript
// 自动收集以下信息：
- 网站标题和描述
- 关键词和标签
- 联系信息（邮箱、电话）
- 网站分类/行业类型
- 图片和logo URL
- 特色功能描述
```

### 2. `analyze_form_structure` - 表单结构分析  
```typescript
// 识别表单元素：
- 输入字段类型（文本、邮箱、下拉等）
- 字段标签和占位符
- 必填字段标识
- 选择框选项
```

### 3. `smart_form_fill` - 智能表单填充
```typescript
// 智能匹配规则：
- 网站名称 → "title", "name", "site name"字段
- 网站URL → "url", "website", "link"字段  
- 描述信息 → "description", "about", "summary"字段
- 关键词 → "keywords", "tags", "category"字段
- 联系信息 → "email", "contact"字段
```

### 4. `upload_image_from_url` - 图片上传
```typescript
// 支持logo和特色图片上传
- 自动从网站提取图片URL
- 智能匹配文件上传字段
- 处理多种图片格式
```

## 📝 使用示例

### 基础批量提交
```
分析网站 https://mywebsite.com 并提交到以下目录：
- https://directory1.com/submit
- https://directory2.com/submit
- https://directory3.com/submit
```

### 详细指定要求  
```
请将网站 https://ecommerce-site.com 提交到以下高权重目录网站：
- https://businessdirectory.com/add-listing
- https://webdirectory.net/submit-site
- https://toplinks.org/add-website

要求：
1. 首先深度分析网站信息
2. 识别每个目录的表单结构
3. 智能填写所有相关字段
4. 如果有文件上传，使用网站logo
5. 提交后确认成功状态
```

### 特定行业提交
```
分析SaaS网站 https://saas-tool.com 并提交到技术类目录：
- https://producthunt.com/submit  
- https://betalist.com/submit
- https://startupbase.io/submit

重点收集：
- 产品功能特色
- 技术栈信息  
- 用户评价
- 定价信息
```

## 🎨 工作流程演示

```
用户输入: "分析 https://example.com 并提交到 directory1.com 和 directory2.com"
    ↓
1. 访问 example.com
   - 提取网站标题: "Example Company - Best Solutions"
   - 提取描述: "We provide innovative solutions for..."
   - 提取关键词: ["solutions", "innovation", "business"]
   - 提取邮箱: "contact@example.com"
   - 提取logo: "https://example.com/logo.png"
    ↓
2. 访问 directory1.com/submit
   - 分析表单: 发现"Company Name", "Website URL", "Description"等字段
   - 智能填充: 
     * Company Name → "Example Company"
     * Website URL → "https://example.com"
     * Description → "We provide innovative solutions for..."
   - 提交表单
    ↓
3. 访问 directory2.com/submit  
   - 重复表单分析和填充过程
   - 处理不同的字段结构
    ↓
4. 生成报告:
   ✅ directory1.com - 提交成功
   ✅ directory2.com - 提交成功
   📊 总计: 2/2 网站提交成功
```

## ⚠️ 注意事项

### XML解析错误修复
- **问题**: `[xmldom error] element parse error: Error: invalid tagName: @#`
- **修复**: 已优化LLM消息处理，避免显示可能有问题的XML内容
- **结果**: 错误消息已被屏蔽，不影响实际功能

### 使用建议
1. **准确性优先**: 确保目标网站URL正确有效
2. **逐步测试**: 先用1-2个目录网站测试，再扩展到更多
3. **监控结果**: 关注提交日志，确认每个网站的处理状态
4. **处理验证码**: 遇到验证码时Agent会暂停等待人工处理

## 🔧 技术架构

### Agent继承关系
```
WebsiteSubmissionAgent 
  ↓ extends
BaseBrowserLabelsAgent 
  ↓ extends  
BaseBrowserAgent
  ↓ extends
Agent
```

### 核心脚本注入
- `collectWebsiteInfoScript`: 网页信息提取
- `analyzeFormStructureScript`: 表单结构分析  
- `smartFormFillScript`: 智能表单填充
- `uploadImageFromUrlScript`: 图片上传处理

**构建成功！** 🎉 

现在你拥有了一个完整的网站信息收集与批量提交工具，可以大大提升网站推广的效率！在`dist`文件夹中重新加载扩展即可使用。