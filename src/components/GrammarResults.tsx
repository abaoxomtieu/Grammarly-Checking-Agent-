import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { Typography } from "antd";
import type { Grammar, Error as GrammarError } from "../types";

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
    return (
      <pre className="whitespace-pre-wrap text-gray-800">
        {results.corrected_text}
      </pre>
    );
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
            <span key={`text-${segments.length}`} className="text-gray-800">
              {correctedParts[i]}
            </span>
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
    segments.push(
      <span key={`text-${segments.length}`} className="text-gray-800">
        {remainingText}
      </span>
    );
  }

  return (
    <pre className="whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-100">
      {segments}
    </pre>
  );
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
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
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
        <div className="mb-4 rounded-xl overflow-hidden shadow-sm error-card border border-gray-100">
          <div className={`${bgColorClass} p-4`}>
            <h5 className="mb-0 flex items-center text-white font-medium">
              {title}{" "}
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-white bg-opacity-20 text-white rounded-full">
                {errors.length}
              </span>
            </h5>
          </div>
          <div className="p-4 bg-white">
            <p className="text-gray-500 mb-0">
              No {title.toLowerCase()} errors found.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 rounded-xl overflow-hidden shadow-sm error-card border border-gray-100">
        <div className={`${bgColorClass} p-4`}>
          <h5 className="mb-0 flex items-center text-white font-medium">
            {title}{" "}
            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-white bg-opacity-20 text-white rounded-full">
              {errors.length}
            </span>
          </h5>
        </div>
        <div className="bg-white">
          {errors.map((error, index) => (
            <div
              key={index}
              className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="text-sm text-gray-500 mb-1">Original:</div>
                  <div className="p-2 bg-red-50 rounded text-red-800 border border-red-100">
                    {error.before}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="text-sm text-gray-500 mb-1">Corrected:</div>
                  <div className="p-2 bg-green-50 rounded text-green-800 border border-green-100">
                    {error.after}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="text-sm text-gray-500 mb-1">Explanation:</div>
                  <div className="text-gray-700">{error.explanation}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <Title level={3} className="text-2xl font-bold mb-2 text-gray-800">
            Grammar Check Results
          </Title>
          <Text className="text-gray-600">
            {totalErrors === 0
              ? "No errors found! Your text looks perfect."
              : `Found ${totalErrors} ${
                  totalErrors === 1 ? "issue" : "issues"
                } to correct.`}
          </Text>
        </div>
        <div className="flex mt-4 md:mt-0">
          <button
            onClick={handleDownload}
            className="flex items-center text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Download Report
          </button>
        </div>
      </div>

      <div
        ref={chartRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="md:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Error Summary
            </h4>
          </div>
          <div style={{ maxWidth: "300px", margin: "0 auto" }}>
            <Pie
              data={chartData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 20,
                      boxWidth: 12,
                    },
                  },
                  tooltip: {
                    bodyFont: {
                      size: 14,
                    },
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw as number;
                        const total = (
                          context.chart.data.datasets[0].data as number[]
                        ).reduce((a, b) => (a as number) + (b as number), 0);
                        const percentage = total
                          ? Math.round((value / total) * 100)
                          : 0;
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
                animation: {
                  animateScale: true,
                },
              }}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex mb-4 gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "errors"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("errors")}
            >
              Errors Found
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === "corrected"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("corrected")}
            >
              Corrected Text
            </button>
          </div>

          {activeTab === "errors" ? (
            <div className="space-y-1">
              {renderErrorCategory(results.spelling, "Spelling", "bg-red-500")}
              {renderErrorCategory(
                results.punctuation,
                "Punctuation",
                "bg-blue-500"
              )}
              {renderErrorCategory(results.grammar, "Grammar", "bg-yellow-500")}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-primary-700 text-white">
                <h5 className="m-0 font-medium">Corrected Text</h5>
              </div>
              <div className="p-0">{processHighlightedText(results)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarResults;
