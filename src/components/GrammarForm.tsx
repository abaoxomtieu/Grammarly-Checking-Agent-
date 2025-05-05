import React, { useState, KeyboardEvent } from "react";
import { Tabs, Input, Button, message, Tooltip, Select } from "antd";
import { LoadingOutlined, ClearOutlined, CopyOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import GrammarQuiz from "./GrammarQuiz";

const { TextArea } = Input;
const { Option } = Select;

interface GrammarFormProps {
  onSubmit: (
    data: FormData | { text: string; proper_nouns: string } | { text: string; requirement?: string; english_level?: string },
    tab: string
  ) => Promise<void>;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GrammarForm: React.FC<GrammarFormProps> = ({
  onSubmit,
  loading,
  activeTab,
  setActiveTab,
}) => {
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [properNouns, setProperNouns] = useState<string>("");
  const [rewriteText, setRewriteText] = useState<string>("");
  const [requirement, setRequirement] = useState<string>("");
  const [englishLevel, setEnglishLevel] = useState<string>("");

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      message.warning("Please enter some text to check.");
      return;
    }

    const payload = {
      text: text.trim(),
      proper_nouns: properNouns.trim(),
    };
    onSubmit(payload, "text");
  };

  const handleClearText = () => {
    setText("");
    message.info("Text cleared");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    message.success("Text copied to clipboard");
  };

  const handleRewriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewriteText.trim()) {
      message.warning("Please enter some text to rewrite.");
      return;
    }

    const payload = {
      text: rewriteText.trim(),
      requirement: requirement.trim() || undefined,
      english_level: englishLevel || undefined,
    };
    onSubmit(payload, "rewrite");
  };

  const handleClearRewriteText = () => {
    setRewriteText("");
    message.info("Text cleared");
  };

  const handleCopyRewriteText = () => {
    navigator.clipboard.writeText(rewriteText);
    message.success("Text copied to clipboard");
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      message.warning("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    // Convert comma-separated string to array and remove empty values
    const properNounsArray = properNouns
      .split(",")
      .map((noun) => noun.trim())
      .filter(Boolean);
    formData.append("proper_nouns", JSON.stringify(properNounsArray));
    onSubmit(formData, "file");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (text.trim()) {
        const payload = {
          text: text.trim(),
          proper_nouns: properNouns.trim(),
        };
        onSubmit(payload, "text");
      } else {
        message.warning("Please enter some text to check.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      message.success(`${selectedFile.name} file selected successfully`);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "text",
      label: "Text Input",
      children: (
        <form onSubmit={handleTextSubmit} className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter your text
              </label>
              <div className="flex space-x-2">
                <Tooltip title="Copy text">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyText} 
                    disabled={!text}
                    className="text-gray-500 hover:text-primary-600"
                  />
                </Tooltip>
                <Tooltip title="Clear text">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<ClearOutlined />} 
                    onClick={handleClearText} 
                    disabled={!text}
                    className="text-gray-500 hover:text-primary-600"
                  />
                </Tooltip>
              </div>
            </div>
            <TextArea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter or paste your text here..."
              disabled={loading}
              className="w-full rounded-xl border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
              autoSize={{ minRows: 8, maxRows: 12 }}
            />
            <p className="mt-1 text-sm text-gray-500">
              Press Enter to submit
            </p>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Technical Terms/Proper Nouns
                <Tooltip title="Terms entered here will be preserved in their original form during checking">
                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                </Tooltip>
              </label>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <Input
              value={properNouns}
              onChange={(e) => setProperNouns(e.target.value)}
              placeholder="Enter technical terms or proper nouns separated by commas (e.g., GraphQL, React, Python)"
              disabled={loading}
              className="w-full rounded-xl border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
            />
            <p className="mt-1 text-sm text-gray-500">
              These terms will be preserved in their original form.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!text.trim()}
              className="h-12 px-8 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto"
              icon={loading ? <LoadingOutlined /> : undefined}
            >
              {loading ? "Checking..." : "Check Grammar"}
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: "rewrite",
      label: "Text Rewrite",
      children: (
        <form onSubmit={handleRewriteSubmit} className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter text to rewrite
              </label>
              <div className="flex space-x-2">
                <Tooltip title="Copy text">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyRewriteText} 
                    disabled={!rewriteText}
                    className="text-gray-500 hover:text-primary-600"
                  />
                </Tooltip>
                <Tooltip title="Clear text">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<ClearOutlined />} 
                    onClick={handleClearRewriteText} 
                    disabled={!rewriteText}
                    className="text-gray-500 hover:text-primary-600"
                  />
                </Tooltip>
              </div>
            </div>
            <TextArea
              rows={8}
              value={rewriteText}
              onChange={(e) => setRewriteText(e.target.value)}
              placeholder="Enter or paste your text to rewrite and enhance..."
              disabled={loading}
              className="w-full rounded-xl border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
              autoSize={{ minRows: 8, maxRows: 12 }}
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Specific Requirements
                <Tooltip title="Add any specific requirements for how the text should be rewritten">
                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                </Tooltip>
              </label>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <Input
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Enter specific requirements (e.g., make more formal, simplify, be more concise)"
              disabled={loading}
              className="w-full rounded-xl border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
            />
            <p className="mt-1 text-sm text-gray-500">
              If empty, the system will determine the best way to enhance the text.
            </p>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                English Level
                <Tooltip title="Select your English proficiency level">
                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                </Tooltip>
              </label>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <Select
              value={englishLevel}
              onChange={(value) => setEnglishLevel(value)}
              placeholder="Select your English level"
              style={{ width: '100%' }}
              disabled={loading}
              className="w-full rounded-xl border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
            >
              <Option value="">Auto-detect</Option>
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
              <Option value="native">Native</Option>
            </Select>
            <p className="mt-1 text-sm text-gray-500">
              If not selected, the system will auto-detect your level.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!rewriteText.trim()}
              className="h-12 px-8 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto"
              icon={loading ? <LoadingOutlined /> : undefined}
            >
              {loading ? "Rewriting..." : "Rewrite Text"}
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: "file",
      label: "File Upload",
      children: (
        <form onSubmit={handleFileSubmit} className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload a document (.txt, .docx)
              </label>
            </div>
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:bg-gray-100 transition-colors duration-200">
              <input
                type="file"
                accept=".txt,.docx"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-100 file:text-primary-700
                  hover:file:bg-primary-200 transition-colors"
              />
              {file && (
                <span className="text-sm text-gray-600 font-medium">{file.name}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Technical Terms/Proper Nouns
                <Tooltip title="Terms entered here will be preserved in their original form during checking">
                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                </Tooltip>
              </label>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <Input
              value={properNouns}
              onChange={(e) => setProperNouns(e.target.value)}
              placeholder="Enter technical terms or proper nouns separated by commas (e.g., GraphQL, React, Python)"
              disabled={loading}
              className="w-full rounded-xl border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
            />
            <p className="mt-1 text-sm text-gray-500">
              These terms will be preserved in their original form.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!file}
              icon={loading ? <LoadingOutlined /> : undefined}
              className="h-12 px-8 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto"
            >
              {loading ? "Uploading & Checking..." : "Check Grammar"}
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: "quiz",
      label: "Quiz Mode",
      children: <GrammarQuiz />,
    },
    {
      key: "result",
      label: "Results",
      disabled: true,
      children: <div>Results will be displayed here after checking.</div>,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      items={items}
      onChange={setActiveTab}
      className="grammar-tabs"
      type="card"
      size="large"
      tabBarStyle={{
        marginBottom: 24,
        borderBottom: "1px solid #e5e7eb",
      }}
    />
  );
};

export default GrammarForm;
