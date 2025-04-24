import React, { useState, KeyboardEvent } from "react";
import { Tabs, Input, Button, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import GrammarQuiz from "./GrammarQuiz";

const { TextArea } = Input;

interface GrammarFormProps {
  onSubmit: (
    data: FormData | { text: string; proper_nouns: string },
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
        <form onSubmit={handleTextSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your text
            </label>
            <TextArea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your text here for grammar checking... (Press Enter to submit)"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Terms/Proper Nouns (optional)
            </label>
            <Input
              value={properNouns}
              onChange={(e) => setProperNouns(e.target.value)}
              placeholder="Enter technical terms or proper nouns separated by commas (e.g., GraphQL, React, Python)"
              disabled={loading}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              These terms will be preserved in their original form.
            </p>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!text.trim()}
            className="w-full md:w-auto"
          >
            {loading ? "Checking..." : "Check Grammar"}
          </Button>
        </form>
      ),
    },
    {
      key: "file",
      label: "File Upload",
      children: (
        <form onSubmit={handleFileSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload a document (.txt, .docx)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".txt,.docx"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {file && (
                <span className="text-sm text-gray-600">{file.name}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Terms/Proper Nouns (optional)
            </label>
            <Input
              value={properNouns}
              onChange={(e) => setProperNouns(e.target.value)}
              placeholder="Enter technical terms or proper nouns separated by commas (e.g., GraphQL, React, Python)"
              disabled={loading}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              These terms will be preserved in their original form.
            </p>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!file}
            icon={loading ? <LoadingOutlined /> : undefined}
            className="w-full md:w-auto"
          >
            {loading ? "Uploading & Checking..." : "Check Grammar"}
          </Button>
        </form>
      ),
    },
    {
      key: "quiz",
      label: "Grammar Quiz",
      children: <GrammarQuiz />,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      items={items}
      onChange={setActiveTab}
      className="grammar-tabs"
    />
  );
};

export default GrammarForm;
