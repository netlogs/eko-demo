import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Form, Input, Button, message, Card, Select, AutoComplete } from "antd";

const { Option } = Select;

const OptionsPage = () => {
  const [form] = Form.useForm();

  const [config, setConfig] = useState({
    llm: "openai",
    apiKey: "",
    modelName: "gpt-4o",
    options: {
      baseURL: "https://api.openai.com/v1",
    },
  });

  useEffect(() => {
    chrome.storage.sync.get(["llmConfig"], (result) => {
      if (result.llmConfig) {
        if (result.llmConfig.llm === "") {
          result.llmConfig.llm = "openai";
        }
        setConfig(result.llmConfig);
        form.setFieldsValue(result.llmConfig);
      }
    });
  }, []);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        setConfig(values);
        chrome.storage.sync.set(
          {
            llmConfig: values,
          },
          () => {
            message.success("保存成功！");
          }
        );
      })
      .catch(() => {
        message.error("请检查表单字段");
      });
  };

  const modelLLMs = [
    { value: "openai", label: "OpenAI (推荐)" },
    { value: "anthropic", label: "Claude" },
    { value: "openrouter", label: "OpenRouter" },
  ];

  const modelOptions = {
    openai: [
      { value: "gpt-4o", label: "gpt-4o (推荐)" },
      { value: "gpt-4o-mini", label: "gpt-4o-mini" },
      { value: "gpt-4-turbo", label: "gpt-4-turbo" },
    ],
    anthropic: [
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    ],
    openrouter: [
      { value: "openai/gpt-4o", label: "gpt-4o" },
      { value: "anthropic/claude-3.5-sonnet", label: "claude-3.5-sonnet" },
      { value: "google/gemini-pro", label: "gemini-pro" },
    ],
  };

  const handleLLMChange = (value: string) => {
    const baseURLMap = {
      openai: "https://api.openai.com/v1",
      anthropic: "https://api.anthropic.com/v1",
      openrouter: "https://openrouter.ai/api/v1"
    };
    const newConfig = {
      llm: value,
      apiKey: "",
      modelName: modelOptions[value][0].value,
      options: {
        baseURL: baseURLMap[value]
      },
    };
    setConfig(newConfig);
    form.setFieldsValue(newConfig);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <Card title="网站信息收集与批量提交 - LLM配置" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Form form={form} layout="vertical" initialValues={config}>
          <Form.Item
            name="llm"
            label="LLM提供商"
            rules={[
              {
                required: true,
                message: "请选择LLM提供商",
              },
            ]}
          >
            <Select placeholder="选择LLM提供商" onChange={handleLLMChange}>
              {modelLLMs.map((llm) => (
                <Option key={llm.value} value={llm.value}>
                  {llm.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name={["options", "baseURL"]}
            label="API基础URL"
            rules={[
              {
                required: true,
                message: "请输入API基础URL",
              },
            ]}
          >
            <Input placeholder="请输入API基础URL" />
          </Form.Item>

          <Form.Item
            name="modelName"
            label="模型名称"
            rules={[
              {
                required: true,
                message: "请选择模型",
              },
            ]}
          >
            <AutoComplete
              placeholder="模型名称"
              options={modelOptions[config.llm]}
              filterOption={(inputValue, option) =>
                (option.value as string).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[
              {
                required: true,
                message: "请输入API密钥",
              },
            ]}
          >
            <Input.Password placeholder="请输入API密钥" allowClear />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleSave} block size="large">
              保存配置
            </Button>
          </Form.Item>
        </Form>

        <Card size="small" style={{ marginTop: "16px", backgroundColor: "#f9f9f9" }}>
          <h4>使用说明：</h4>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>配置好API密钥后，就可以在popup中输入网站批量提交任务了</li>
            <li>支持从目标网站收集信息并智能提交到多个目录网站</li>
            <li>例如："分析网站 https://mysite.com 并提交到 directory1.com 和 directory2.com"</li>
            <li>Agent会自动收集网站信息，识别表单结构并智能填写</li>
            <li>支持处理复杂的表单字段匹配和文件上传</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
);