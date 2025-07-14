import { createRoot } from "react-dom/client";
import React, { useState, useRef, useEffect } from "react";
import { Button, Input } from "antd";

interface LogMessage {
  time: string;
  log: string;
  level?: "info" | "error" | "success";
}

const AppRun = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [streamLog, setStreamLog] = useState<LogMessage | null>();
  const logsRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState(
    `分析网站 https://example.com 并提交到以下目录网站：
- https://directory1.com/submit
- https://directory2.com/submit
- https://directory3.com/submit

请按照以下步骤执行：
1. 首先访问 https://example.com 收集网站信息
2. 然后依次访问每个目录网站的提交页面
3. 智能填写表单并提交
4. 报告每个提交的结果`
  );

  useEffect(() => {
    chrome.storage.local.get(["isRunning", "prompt"], (result) => {
      if (result.isRunning !== undefined) {
        setIsRunning(result.isRunning);
      }
      if (result.prompt !== undefined) {
        setPrompt(result.prompt);
      }
    });
    const messageListener = (message: any) => {
      if (!message) {
        return;
      }
      if (message.type === "stop") {
        setIsRunning(false);
        chrome.storage.local.set({ isRunning: false });
      } else if (message.type === "log") {
        const time = new Date().toLocaleTimeString();
        const log_message = {
          time,
          log: message.log,
          level: message.level || "info",
        };
        if (message.stream) {
          setStreamLog(log_message);
        } else {
          setStreamLog(null);
          setLogs((prev) => [...prev, log_message]);
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, streamLog]);

  const handleClick = () => {
    if (isRunning) {
      setIsRunning(false);
      chrome.storage.local.set({ isRunning: false, prompt });
      chrome.runtime.sendMessage({ type: "stop" });
      return;
    }
    if (!prompt.trim()) {
      return;
    }
    setLogs([]);
    setStreamLog(null);
    setIsRunning(true);
    chrome.storage.local.set({ isRunning: true, prompt });
    chrome.runtime.sendMessage({ type: "run", prompt: prompt.trim() });
  };

  const getLogStyle = (level: string) => {
    switch (level) {
      case "error":
        return { color: "#ff4d4f" };
      case "success":
        return { color: "#52c41a" };
      default:
        return { color: "#1890ff" };
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h3>网站信息收集与批量提交</h3>
        <div style={{ marginBottom: "8px" }}>
          <div style={{ marginBottom: "8px", textAlign: "left" }}>
            <label>任务描述：</label>
          </div>
          <Input.TextArea
            rows={4}
            value={prompt}
            disabled={isRunning}
            placeholder="输入要分析的网站和目标提交网站列表..."
            onChange={(e) => setPrompt(e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <Button
            type="primary"
            onClick={handleClick}
            style={{
              width: "100%",
              background: isRunning ? "#6666" : "#1677ff",
            }}
          >
            {isRunning ? "停止" : "运行"}
          </Button>
        </div>
      </div>
      {logs.length > 0 && (
        <div
          ref={logsRef}
          style={{
            marginTop: "16px",
            textAlign: "left",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            padding: "8px",
            width: "100%",
            height: "300px",
            overflowY: "auto",
            backgroundColor: "#f5f5f5",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Logs:</div>
          {logs.map((log, index) => (
            <pre
              key={index}
              style={{
                margin: "4px 0",
                fontSize: "12px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                ...getLogStyle(log.level || "info"),
              }}
            >
              <span style={{ color: "#6666" }}>[{log.time}]&nbsp;</span>
              <span>{log.log}</span>
            </pre>
          ))}
          {streamLog && (
            <pre
              style={{
                margin: "4px 0",
                fontSize: "12px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                ...getLogStyle(streamLog.level || "info"),
              }}
            >
              <span style={{ color: "#6666" }}>[{streamLog.time}]&nbsp;</span>
              <span>{streamLog.log}</span>
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AppRun />
  </React.StrictMode>
);
