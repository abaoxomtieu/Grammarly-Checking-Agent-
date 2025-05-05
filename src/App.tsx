import React, { useState } from "react";
import { Layout, Typography, Alert, ConfigProvider, Card } from "antd";
import GrammarForm from "./components/GrammarForm";
import GrammarResults from "./components/GrammarResults";
import RewriteResults from "./components/RewriteResults";
import { Grammar, RewriteResponse } from "./types";
import { grammarApi } from "./services/api";
import { AxiosError } from "axios";
import theme from "./theme";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Grammar | null>(null);
  const [rewriteResults, setRewriteResults] = useState<RewriteResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("text");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    data: FormData | { text: string; proper_nouns: string } | { text: string; requirement?: string; english_level?: string }, 
    tab: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      if (tab === 'text') {
        const textData = data as { text: string; proper_nouns: string };
        const response = await grammarApi.checkText(textData);
        setResults(response);
        setRewriteResults(null);
        setActiveTab('result');
      } else if (tab === 'rewrite') {
        const rewriteData = data as { text: string; requirement?: string; english_level?: string };
        const response = await grammarApi.rewriteText(rewriteData);
        setRewriteResults(response);
        setResults(null);
        setActiveTab('result');
      } else {
        const formData = data as FormData;
        const response = await grammarApi.checkFile(formData);
        setResults(response);
        setRewriteResults(null);
        setActiveTab('result');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Handle Axios errors
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || error.message;
        setError(errorMessage);
      } else {
        setError("An error occurred while processing the request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={theme}>
      <Layout className="min-h-screen bg-secondary-50">
        <Content className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Title level={1} className="text-4xl font-bold text-primary-800">
              AI Grammar Checker
            </Title>
            <Paragraph className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
              An advanced AI-powered grammar checking tool specifically designed for
              technical writing and code documentation.
            </Paragraph>
          </div>

          <Card 
            className="mb-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 rounded-xl overflow-hidden"
            bodyStyle={{ padding: '28px' }}
          >
            <GrammarForm
              onSubmit={handleSubmit}
              loading={loading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Card>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              className="mb-8 rounded-xl"
            />
          )}

          {results && (
            <Card 
              className="shadow-card hover:shadow-card-hover transition-shadow duration-300 rounded-xl overflow-hidden"
              bodyStyle={{ padding: '28px' }}
            >
              <GrammarResults results={results} />
            </Card>
          )}

          {rewriteResults && (
            <Card 
              className="shadow-card hover:shadow-card-hover transition-shadow duration-300 rounded-xl overflow-hidden"
              bodyStyle={{ padding: '28px' }}
            >
              <RewriteResults results={rewriteResults} />
            </Card>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
