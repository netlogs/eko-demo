import { createRoot } from "react-dom/client";
import React from "react";
import { Button } from "antd";

const AppRun = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ type: 'run' });
  };

  return (
    <div
      style={{
        width: "200px",
        height: "80px",
        textAlign: "center",
      }}
    >
      <h3>Click to test</h3>
      <Button
        type="primary"
        onClick={handleClick}
        className="flex items-center justify-center"
      >
        Run
      </Button>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AppRun />
  </React.StrictMode>
);
