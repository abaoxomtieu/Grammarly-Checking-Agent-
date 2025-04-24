import React, { useState } from "react";
import { Layout, Typography, Alert } from "antd";
import GrammarForm from "./components/GrammarForm";
import GrammarResults from "./components/GrammarResults";
import { Grammar } from "./types";
import { grammarApi } from "./services/api";
import { AxiosError } from "axios";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Grammar | null>(null);
  const [activeTab, setActiveTab] = useState<string>("text");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData | { text: string; proper_nouns: string }, tab: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (tab === 'text') {
        const textData = data as { text: string; proper_nouns: string };
        const response = await grammarApi.checkText(textData);
        setResults(response);
      } else {
        const formData = data as FormData;
        const response = await grammarApi.checkFile(formData);
        setResults(response);
      }
      setActiveTab('result');
    } catch (error) {
      console.error('Error:', error);
      
      // Handle Axios errors
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || error.message;
        setError(errorMessage);
      } else {
        setError("An error occurred while checking grammar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Title level={1} className="text-3xl font-bold">
            AI Grammar Checker
          </Title>
          <Paragraph className="text-gray-600 mt-2">
            An advanced AI-powered grammar checking tool specifically designed for
            technical writing and code documentation.
          </Paragraph>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <GrammarForm
            onSubmit={handleSubmit}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GrammarResults results={results} />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default App;
