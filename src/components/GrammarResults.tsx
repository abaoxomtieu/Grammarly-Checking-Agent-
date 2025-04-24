import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { Typography, Card, Tooltip as AntTooltip } from "antd";
import type { Grammar, Error as GrammarError, Correction } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

interface GrammarResultsProps {
  results: Grammar;
}

// Function to process the corrected text and highlight corrections
const processHighlightedText = (results: Grammar) => {
  // Get all errors to find in corrected text
  const allErrors = [
    ...results.spelling,
    ...results.punctuation,
    ...results.grammar,
  ];

  if (!results.corrected_text || allErrors.length === 0) {
    return <pre className="whitespace-pre-wrap text-gray-800">{results.corrected_text}</pre>;
  }

  // Create a map of corrected text segments and their original errors
  const segments: React.ReactNode[] = [];
  let remainingText = results.corrected_text;

  // Sort errors by their corrected text length (longer first to avoid overlap issues)
  const sortedErrors = [...allErrors].sort(
    (a, b) => b.after.length - a.after.length
  );

  // Process each error and create highlighted segments
  sortedErrors.forEach((error) => {
    const correctedParts = remainingText.split(error.after);

    // If we found the correction in the text
    if (correctedParts.length > 1) {
      for (let i = 0; i < correctedParts.length; i++) {
        // Add the text before the correction
        if (correctedParts[i].length > 0) {
          segments.push(
            <span key={`text-${segments.length}`} className="text-gray-800">{correctedParts[i]}</span>
          );
        }

        // Add the highlighted correction (except after the last part)
        if (i < correctedParts.length - 1) {
          segments.push(
            <div
              key={`correction-${segments.length}`}
              className="group relative inline-block"
            >
              <span className="bg-green-100 text-green-800 rounded px-1 cursor-help highlight-animation">
                {error.after}
              </span>
              <div className="tooltip-custom absolute bottom-full left-0 mb-2 w-64 p-2 bg-white text-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10 border border-gray-200">
                <div className="text-left">
                  <strong>Original:</strong> {error.before}
                  <br />
                  <strong>Explanation:</strong> {error.explanation}
                </div>
              </div>
            </div>
          );
        }
      }

      // Update the remaining text to be the last part to avoid re-processing
      remainingText = correctedParts[correctedParts.length - 1];
    }
  });

  // Add any remaining text
  if (remainingText.length > 0) {
    segments.push(<span key={`text-${segments.length}`} className="text-gray-800">{remainingText}</span>);
  }

  return <pre className="whitespace-pre-wrap bg-white p-4 rounded">{segments}</pre>;
};

const GrammarResults: React.FC<GrammarResultsProps> = ({ results }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("errors");

  useEffect(() => {
    // Scroll to results when they load
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  const totalErrors =
    results.spelling.length +
    results.punctuation.length +
    results.grammar.length;

  const chartData = {
    labels: ["Spelling", "Punctuation", "Grammar"],
    datasets: [
      {
        data: [
          results.spelling.length,
          results.punctuation.length,
          results.grammar.length,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleDownload = () => {
    const fileName = results.file_path
      ? `grammar_report_${results.file_path.split("/").pop()}`
      : "grammar_report.txt";

    let content = "===== GRAMMAR CHECK REPORT =====\n\n";

    if (results.file_path) {
      content += `File: ${results.file_path}\n\n`;
    }

    content += `Total Errors Found: ${totalErrors}\n`;
    content += `- Spelling Errors: ${results.spelling.length}\n`;
    content += `- Punctuation Errors: ${results.punctuation.length}\n`;
    content += `- Grammar Errors: ${results.grammar.length}\n\n`;

    if (results.spelling.length > 0) {
      content += "===== SPELLING ERRORS =====\n\n";
      results.spelling.forEach((error, index) => {
        content += `${index + 1}. Before: "${error.before}"\n`;
        content += `   After: "${error.after}"\n`;
        content += `   Explanation: ${error.explanation}\n\n`;
      });
    }

    if (results.punctuation.length > 0) {
      content += "===== PUNCTUATION ERRORS =====\n\n";
      results.punctuation.forEach((error, index) => {
        content += `${index + 1}. Before: "${error.before}"\n`;
        content += `   After: "${error.after}"\n`;
        content += `   Explanation: ${error.explanation}\n\n`;
      });
    }

    if (results.grammar.length > 0) {
      content += "===== GRAMMAR ERRORS =====\n\n";
      results.grammar.forEach((error, index) => {
        content += `${index + 1}. Before: "${error.before}"\n`;
        content += `   After: "${error.after}"\n`;
        content += `   Explanation: ${error.explanation}\n\n`;
      });
    }

    if (results.corrected_text) {
      content += "===== CORRECTED TEXT =====\n\n";
      content += results.corrected_text;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderErrorCategory = (
    errors: GrammarError[],
    title: string,
    bgColorClass: string
  ) => {
    if (errors.length === 0) {
      return (
        <div className="mb-3 rounded-lg overflow-hidden shadow-md error-card">
          <div className={`${bgColorClass} p-3`}>
            <h5 className="mb-0 flex items-center">
              {title}{" "}
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-white text-gray-800 rounded-full">
                {errors.length}
              </span>
            </h5>
          </div>
          <div className="p-4 bg-white">
            <p className="text-gray-500">
              No {title.toLowerCase()} errors detected.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3 rounded-lg overflow-hidden shadow-md error-card">
        <div className={`${bgColorClass} p-3`}>
          <h5 className="mb-0 flex items-center">
            {title}{" "}
            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-white text-gray-800 rounded-full">
              {errors.length}
            </span>
          </h5>
        </div>
        <div className="p-4 bg-white">
          {errors.map((error, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                  Before
                </span>
                <div className="border border-red-300 rounded px-2 py-1 flex-grow">
                  {error.before}
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                  After
                </span>
                <div className="group relative">
                  <div className="border border-green-300 rounded px-2 py-1 flex-grow hover:bg-green-50 cursor-help highlight-animation">
                    {error.after}
                  </div>
                  <div className="tooltip-custom absolute bottom-full left-0 mb-2 w-64 p-2 bg-white text-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10 border border-gray-200">
                    <div className="text-left">
                      <strong>Error:</strong> {error.before}
                      <br />
                      <strong>Explanation:</strong> {error.explanation}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                <strong>Explanation:</strong> {error.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={chartRef} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={3} className="!mb-0">
          Results
        </Title>
        <button
          className="download-button px-3 py-1 text-sm border border-gray-300 rounded hover:bg-blue-700 hover:text-white transition-colors"
          onClick={handleDownload}
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download Report
        </button>
      </div>

      {totalErrors > 0 && (
        <div className="w-64 h-64 mx-auto mb-6">
          <Pie data={chartData} />
        </div>
      )}

      {(results as any).corrections &&
        (results as any).corrections.length > 0 && (
          <Card className="mb-6">
            <div className="mb-4">
              <Title level={4}>Corrected Text</Title>
              <Text type="secondary" className="block mb-2">
                Hover over highlighted text to see the original errors and
                explanations
              </Text>
            </div>

            <div className="whitespace-pre-wrap font-mono bg-white text-gray-800 p-4 rounded-lg border border-gray-200">
              {(results as any).corrections.map(
                (correction: Correction, index: number) => {
                  if (correction.type === "error" && correction.corrected) {
                    return (
                      <AntTooltip
                        key={index}
                        title={
                          <div>
                            <div>
                              <strong>Original:</strong> {correction.original}
                            </div>
                            <div>
                              <strong>Error:</strong> {correction.explanation}
                            </div>
                          </div>
                        }
                        color="#ffffff"
                        overlayInnerStyle={{ color: '#1f2937' }}
                      >
                        <span className="bg-green-100 text-green-800 px-1 rounded cursor-help">
                          {correction.corrected}
                        </span>
                      </AntTooltip>
                    );
                  }
                  return <span key={index}>{correction.text}</span>;
                }
              )}
            </div>
          </Card>
        )}

      {(results as any).summary && (results as any).summary.length > 0 && (
        <Card>
          <Title level={4}>Summary</Title>
          <ul className="list-disc pl-6">
            {(results as any).summary.map((item: string, index: number) => (
              <li key={index} className="mb-2">
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mb-3">
        <div className="border-b border-gray-200">
          <ul className="flex -mb-px">
            <li className="mr-2">
              <button
                className={`tab-transition inline-block p-4 ${
                  activeTab === "errors" ? "tab-active" : "tab-inactive"
                }`}
                onClick={() => setActiveTab("errors")}
              >
                Detected Errors
              </button>
            </li>
            {results.corrected_text && (
              <li className="mr-2">
                <button
                  className={`tab-transition inline-block p-4 ${
                    activeTab === "corrected" ? "tab-active" : "tab-inactive"
                  }`}
                  onClick={() => setActiveTab("corrected")}
                >
                  Corrected Text
                </button>
              </li>
            )}
          </ul>
        </div>

        {activeTab === "errors" && (
          <div className="mt-4">
            {renderErrorCategory(
              results.spelling,
              "Spelling",
              "bg-red-600 text-white"
            )}
            {renderErrorCategory(
              results.punctuation,
              "Punctuation",
              "bg-blue-600 text-white"
            )}
            {renderErrorCategory(
              results.grammar,
              "Grammar",
              "bg-yellow-500 text-white"
            )}
          </div>
        )}

        {activeTab === "corrected" && results.corrected_text && (
          <div className="mt-4 rounded-lg overflow-hidden shadow-md">
            <div className="bg-green-600 text-white p-3">
              <h5 className="mb-0">Corrected Text</h5>
              <p className="text-green-100 text-sm mb-0 mt-1">
                <i>
                  Hover over corrections to see original errors and explanations
                </i>
              </p>
            </div>
            <div className="p-4 bg-white">
              <div className="border p-3 rounded bg-gray-900 corrected-text-container">
                <p className="mb-2 text-sm text-gray-400">
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded mr-2">
                    Tip
                  </span>
                  Hover over highlighted text to see the original errors and
                  explanations.
                </p>
                {processHighlightedText(results)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarResults;
