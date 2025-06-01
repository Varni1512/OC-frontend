import React, { useState, useEffect } from 'react';
import { Play, Zap, Code, Terminal, Cpu, Settings, Sun, Moon, Bot, FileText, Copy, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';

const defaultTemplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  py: `print("Hello, World!")`
};

const languageConfig = {
  cpp: { name: 'C++', color: 'from-blue-500 to-cyan-500', monaco: 'cpp' },
  c: { name: 'C', color: 'from-gray-500 to-slate-600', monaco: 'c' },
  java: { name: 'Java', color: 'from-orange-500 to-red-500', monaco: 'java' },
  py: { name: 'Python', color: 'from-green-500 to-emerald-500', monaco: 'python' }
};

function AdvancedCompiler() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(defaultTemplates['cpp']);
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [aiReview, setAiReview] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('');
    setExecutionTime(null);
    const payload = { language, code, input };

    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:8000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (response.ok) {
        setOutput(data.output);
      } else {
        setOutput("Error: " + (data.error || 'Compilation failed'));
      }
    } catch (error) {
      setOutput("Error: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiReview = async () => {
    setIsReviewing(true);
    setAiReview('');
    const payload = { code };

    try {
      const response = await fetch('http://localhost:8000/ai-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setAiReview(data.review);
      } else {
        setAiReview('Error in AI review: ' + (data.error || 'Review failed'));
      }
    } catch (error) {
      setAiReview('Error in AI review: ' + error.message);
    } finally {
      setIsReviewing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLang = languageConfig[language];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
      : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
      }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${isDark ? 'bg-purple-500' : 'bg-blue-500'
          } animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 ${isDark ? 'bg-cyan-500' : 'bg-purple-500'
          } animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-5">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="relative">
              <Cpu className={`w-12 h-12 ${isDark ? 'text-purple-400' : 'text-purple-600'} animate-spin-slow`} />
              <Zap className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className={`text-4xl md:text-6xl font-black ${isDark ? 'text-white' : 'text-gray-900'
                } tracking-tight`}>
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  Varnikumar
                </span>
              </h1>
              <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Code Compiler
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sun className={`w-5 h-5 ${!isDark ? 'text-yellow-500' : 'text-gray-500'}`} />
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'
                  }`}></div>
              </button>
              <Moon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Code Editor Section */}
          <div className="xl:col-span-2">
            <div className={`backdrop-blur-sm rounded-3xl p-6 shadow-2xl border transition-all duration-300 ${isDark
              ? 'bg-gray-900/80 border-purple-500/30 shadow-purple-500/20'
              : 'bg-white/80 border-gray-200 shadow-gray-300/50'
              }`}>
              {/* Editor Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <Code className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Code Editor
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${currentLang.color} text-white`}>
                    {currentLang.icon} {currentLang.name}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={language}
                    onChange={(e) => {
                      const selectedLang = e.target.value;
                      setLanguage(selectedLang);
                      setCode(defaultTemplates[selectedLang]);
                      setOutput('');
                      setAiReview('');
                      setExecutionTime(null);
                    }}
                    className={`px-4 py-2 rounded-xl border-2 focus:ring-2 focus:ring-purple-500 transition-all ${isDark
                      ? 'bg-gray-800 text-white border-purple-500/30'
                      : 'bg-white text-gray-900 border-gray-300'
                      }`}
                  >
                    {Object.entries(languageConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-xl transition-all duration-200 ${isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className={`rounded-2xl overflow-hidden border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'
                }`} style={{ height: '500px' }}>
                <Editor
                  height="100%"
                  language={currentLang.monaco}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme={isDark ? 'vs-dark' : 'light'}
                  options={{
                    fontSize: 14,
                    fontFamily: 'Fira Code, Monaco, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: true,
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    folding: true,
                    showFoldingControls: 'mouseover',
                    matchBrackets: 'always',
                    autoIndent: 'full',
                    formatOnType: true,
                    formatOnPaste: true,
                    suggest: {
                      showKeywords: true,
                      showSnippets: true
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Input Section */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all ${isDark
              ? 'bg-gray-900/80 border-gray-700'
              : 'bg-white/80 border-gray-200'
              }`}>
              <div className="flex items-center space-x-2 mb-4">
                <Terminal className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Input</h3>
              </div>
              <textarea
                className={`w-full h-24 p-3 rounded-xl border-2 resize-none focus:ring-2 focus:ring-purple-500 transition-all ${isDark
                  ? 'bg-gray-800 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                placeholder="Enter program input..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${isRunning
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                  } text-white`}
              >
                {isRunning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Run Code</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAiReview}
                disabled={isReviewing}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${isReviewing
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25'
                  } text-white`}
              >
                {isReviewing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5" />
                    <span>AI Review</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Section */}
            {output && (
              <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all transform hover:scale-[1.02] duration-300 ${output.startsWith("Error")
                ? isDark
                  ? 'bg-red-900/20 border-red-500/50 shadow-red-500/10'
                  : 'bg-red-50/80 border-red-200 shadow-red-200/30'
                : isDark
                  ? 'bg-green-900/20 border-green-500/50 shadow-green-500/10'
                  : 'bg-green-50/80 border-green-200 shadow-green-200/30'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${output.startsWith("Error") ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                    <Terminal className={`w-5 h-5 ${output.startsWith("Error") ? 'text-red-500' : 'text-green-500'
                      }`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {output.startsWith("Error") ? 'Error Output' : 'Program Output'}
                    </h3>
                  </div>
                  {executionTime && !output.startsWith("Error") && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      <span className="text-sm text-green-500 font-mono bg-green-500/10 px-2 py-1 rounded-lg">
                        ⚡ {executionTime}ms
                      </span>
                    </div>
                  )}
                </div>
                <div className={`relative overflow-hidden rounded-xl ${isDark ? 'bg-gray-950/80' : 'bg-gray-50/80'
                  }`}>
                  <div className={`absolute top-0 left-0 w-full h-1 ${output.startsWith("Error")
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    } animate-pulse`}></div>
                  <pre className={`font-mono text-sm whitespace-pre-wrap p-4 ${output.startsWith("Error")
                    ? isDark ? 'text-red-400' : 'text-red-700'
                    : isDark ? 'text-green-400' : 'text-green-700'
                    }`}>
                    {output}
                  </pre>
                </div>
              </div>
            )}

            {/* AI Review Section */}
            {aiReview && (
              <div
                className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl border transition-all overflow-y-auto max-h-[300px] w-full hide-scrollbar ${isDark ? 'bg-gray-900/80 border-blue-500/30' : 'bg-white/80 border-blue-200'
                  }`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="w-5 h-5 text-blue-500" />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    AI Review
                  </h3>
                </div>
                <pre
                  className={`font-mono text-sm whitespace-pre-wrap p-4 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-gray-50 text-blue-700'
                    }`}
                >
                  {aiReview}
                </pre>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedCompiler;