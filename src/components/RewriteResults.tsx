import React from 'react';
import { Typography, Button, message } from 'antd';
import { RewriteResponse } from '../types';

const { Title, Text } = Typography;

interface RewriteResultsProps {
  results: RewriteResponse;
}

const RewriteResults: React.FC<RewriteResultsProps> = ({ results }) => {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(results.rewritten_text);
    message.success('Rewritten text copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={3} className="text-xl font-semibold text-primary-800 mb-4">
          Rewritten Text
        </Title>
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 whitespace-pre-wrap">
          <Text>{results.rewritten_text}</Text>
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          type="primary" 
          onClick={handleCopyToClipboard}
          className="rounded-xl"
        >
          Copy to Clipboard
        </Button>
      </div>
    </div>
  );
};

export default RewriteResults; 