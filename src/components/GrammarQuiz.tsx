import React, { useState, useRef } from 'react';
import { Button, message, Typography, Radio, Space, Table } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { grammarApi } from '../services/api';
import * as XLSX from 'xlsx';

const { Title, Paragraph } = Typography;

interface QuizRecord {
  'Training content': string | null;
  'No.': number;
  Question: string;
  Answer: string;
  'Answer Option A': string | null;
  'Answer Option B': string | null;
  'Answer Option C': string | null;
  'Answer Option D': string | null;
  wrong_locations: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const GrammarQuiz: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [processedRecords, setProcessedRecords] = useState<QuizRecord[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const columns = [
    {
      title: 'No.',
      dataIndex: 'No.',
      key: 'no',
      width: 60,
    },
    {
      title: 'Training Content',
      dataIndex: 'Training content',
      key: 'trainingContent',
      width: 120,
    },
    {
      title: 'Question',
      dataIndex: 'Question',
      key: 'question',
      width: 300,
    },
    {
      title: 'Answer',
      dataIndex: 'Answer',
      key: 'answer',
      width: 80,
    },
    {
      title: 'Option A',
      dataIndex: 'Answer Option A',
      key: 'optionA',
      width: 200,
    },
    {
      title: 'Option B',
      dataIndex: 'Answer Option B',
      key: 'optionB',
      width: 200,
    },
    {
      title: 'Option C',
      dataIndex: 'Answer Option C',
      key: 'optionC',
      width: 200,
    },
    {
      title: 'Option D',
      dataIndex: 'Answer Option D',
      key: 'optionD',
      width: 200,
    },
    {
      title: 'Grammar Changes',
      dataIndex: 'wrong_locations',
      key: 'grammarChanges',
      width: 200,
    },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      message.success(`${selectedFile.name} file selected successfully`);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      message.warning('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await grammarApi.checkQuiz(formData);
      setProcessedRecords(response.records);
      
      // Transform the records into questions
      const processedQuestions = response.records.map((record: QuizRecord) => {
        const options = [
          record['Answer Option A'],
          record['Answer Option B'],
          record['Answer Option C'],
          record['Answer Option D']
        ].filter(Boolean) as string[];

        return {
          id: record['No.'],
          question: record.Question,
          options,
          correctAnswer: record.Answer,
          explanation: record.wrong_locations || 'No explanation provided.'
        };
      });
      
      setQuestions(processedQuestions);
      message.success('Quiz questions processed successfully');
    } catch (error) {
      console.error('Error processing quiz file:', error);
      message.error('Failed to process quiz file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXLSX = () => {
    if (!processedRecords.length) {
      message.warning('No processed data available');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(processedRecords);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Processed Quiz');
      
      // Auto-size columns
      const maxWidths: { [key: string]: number } = {};
      processedRecords.forEach(record => {
        Object.entries(record).forEach(([key, value]) => {
          const valueLength = value ? String(value).length : 0;
          maxWidths[key] = Math.max(maxWidths[key] || 0, valueLength, key.length);
        });
      });
      
      worksheet['!cols'] = Object.values(maxWidths).map(width => ({ width: Math.min(width + 2, 60) }));

      XLSX.writeFile(workbook, 'processed_quiz.xlsx');
      message.success('Quiz data downloaded successfully');
    } catch (error) {
      console.error('Error downloading XLSX:', error);
      message.error('Failed to download quiz data');
    }
  };

  const downloadTemplate = () => {
    try {
      // Create template data
      const templateData = [
        {
          'No.': 1,
          'Training content': 'Grammar',
          'Question': 'What is the correct sentence?',
          'Answer': 'A',
          'Answer Option A': 'This is a correct sentence.',
          'Answer Option B': 'This are a correct sentence.',
          'Answer Option C': 'This is an correct sentence.',
          'Answer Option D': 'This is correct sentence.'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Template');
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 5 },  // No.
        { width: 15 }, // Training content
        { width: 30 }, // Question
        { width: 8 },  // Answer
        { width: 25 }, // Option A
        { width: 25 }, // Option B
        { width: 25 }, // Option C
        { width: 25 }  // Option D
      ];
      
      XLSX.writeFile(workbook, 'quiz_template.xlsx');
      message.success('Quiz template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('Failed to download quiz template');
    }
  };

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const handleAnswerSelect = (e: RadioChangeEvent) => {
    setSelectedAnswer(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      message.warning('Please select an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(
      (_, index) => String.fromCharCode(65 + index) === currentQuestion.correctAnswer
    );

    if (selectedAnswer === correctAnswerIndex) {
      setScore(score + 1);
      message.success('Correct!');
    } else {
      message.error('Incorrect. Try again!');
    }

    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      message.success(`Quiz completed! Your score: ${score + (selectedAnswer === questions[currentQuestionIndex].options.findIndex(
        (_, index) => String.fromCharCode(65 + index) === questions[currentQuestionIndex].correctAnswer
      ) ? 1 : 0)}/${questions.length}`);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {!processedRecords.length ? (
        <div className="text-center">
          <Title level={4}>Upload Quiz Questions</Title>
          <Paragraph className="text-gray-600 mb-4">
            Please download and use the template below to create your quiz questions.
            <br />
            The template includes columns for: No., Training Content, Question, Answer, Option A, Option B, Option C, Option D
          </Paragraph>
          <Space direction="vertical" className="w-full" size="large">
            <Button 
              icon={<FileExcelOutlined />}
              onClick={downloadTemplate}
              className="mb-4"
            >
              Download Quiz Template
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <Button 
              icon={<UploadOutlined />}
              onClick={triggerFileInput}
              disabled={loading}
            >
              Select Excel File
            </Button>
            {file && (
              <Button 
                type="primary"
                onClick={handleProcessFile}
                loading={loading}
                className="mt-4"
              >
                {loading ? 'Processing Quiz...' : 'Process Quiz'}
              </Button>
            )}
          </Space>
        </div>
      ) : !showQuiz ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <Title level={4}>Processed Quiz Questions</Title>
            <Space>
              <Button 
                type="primary"
                onClick={startQuiz}
              >
                Start Quiz
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleDownloadXLSX}
              >
                Download XLSX
              </Button>
            </Space>
          </div>
          <Table 
            dataSource={processedRecords} 
            columns={columns}
            rowKey="No."
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 5 }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Title level={3}>Question {currentQuestionIndex + 1} of {questions.length}</Title>
            <Button 
              type="default" 
              icon={<DownloadOutlined />}
              onClick={handleDownloadXLSX}
            >
              Download XLSX
            </Button>
          </div>

          <Paragraph className="text-lg font-medium">{currentQuestion.question}</Paragraph>

          <Radio.Group onChange={handleAnswerSelect} value={selectedAnswer}>
            <Space direction="vertical" className="w-full">
              {currentQuestion.options.map((option, index) => (
                <Radio key={index} value={index} disabled={showExplanation}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          {!showExplanation ? (
            <Button type="primary" onClick={handleSubmit} disabled={selectedAnswer === null}>
              Submit Answer
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Paragraph className="font-medium">Explanation:</Paragraph>
                <Paragraph>{currentQuestion.explanation}</Paragraph>
              </div>
              <Button type="primary" onClick={handleNext}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarQuiz; 