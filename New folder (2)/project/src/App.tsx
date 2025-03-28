import React, { useState } from 'react';
import { Clock, History } from 'lucide-react';

interface HistoryEntry {
  calculatedTime: string;
  projectedPull: string;
  timeDifference: number;
  adjustment: number;
  buttonPressed: string;
  multipliedResult: number;
  timestamp: string;
}

function App() {
  const [inputTime, setInputTime] = useState('');
  const [projectedPull, setProjectedPull] = useState('');
  const [timeDifference, setTimeDifference] = useState<number | null>(null);
  const [multipliedResult, setMultipliedResult] = useState<number | null>(null);
  const [showMultiplierInput, setShowMultiplierInput] = useState(false);
  const [customMultiplier, setCustomMultiplier] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const calculateTimeDifference = () => {
    if (!inputTime || !projectedPull) return;

    const [hours1, minutes1] = inputTime.split(':').map(Number);
    const [hours2, minutes2] = projectedPull.split(':').map(Number);
    
    const time1InMinutes = hours1 * 60 + minutes1;
    const time2InMinutes = hours2 * 60 + minutes2;
    
    let difference = time2InMinutes - time1InMinutes;
    
    if (Math.abs(difference) > 12 * 60) {
      if (difference > 0) {
        difference = difference - (24 * 60);
      } else {
        difference = difference + (24 * 60);
      }
    }
    
    setTimeDifference(difference);
    setMultipliedResult(null);
    setShowMultiplierInput(false);
    setCustomMultiplier('');
  };

  const getAdjustedTimeDifference = () => {
    if (timeDifference === null) return null;
    return 15 - timeDifference;
  };

  const roundToNearest5 = (num: number) => {
    return Math.round(num / 5) * 5;
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const addToHistory = (buttonName: string, result: number) => {
    const newEntry: HistoryEntry = {
      calculatedTime: inputTime,
      projectedPull: projectedPull,
      timeDifference: timeDifference!,
      adjustment: getAdjustedTimeDifference()!,
      buttonPressed: buttonName,
      multipliedResult: result,
      timestamp: formatTimestamp()
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10 entries
  };

  const handleL2ButtonClick = () => {
    const adjusted = getAdjustedTimeDifference();
    if (adjusted !== null) {
      const multiplied = adjusted * 5.2;
      const rounded = roundToNearest5(multiplied);
      setMultipliedResult(rounded);
      addToHistory('L2-L3-L4-L7', rounded);
    }
    setShowMultiplierInput(false);
  };

  const handleL5ButtonClick = () => {
    const adjusted = getAdjustedTimeDifference();
    if (adjusted !== null) {
      const multiplied = adjusted * 2.3;
      const rounded = roundToNearest5(multiplied);
      setMultipliedResult(rounded);
      addToHistory('L5', rounded);
    }
    setShowMultiplierInput(false);
  };

  const handleL6ButtonClick = () => {
    setShowMultiplierInput(true);
    setMultipliedResult(null);
  };

  const handleCustomMultiply = (e: React.FormEvent) => {
    e.preventDefault();
    const adjusted = getAdjustedTimeDifference();
    if (adjusted !== null && customMultiplier) {
      const multiplier = parseFloat(customMultiplier);
      const multiplied = adjusted * multiplier;
      const rounded = roundToNearest5(multiplied);
      setMultipliedResult(rounded);
      addToHistory('L6', rounded);
      setShowMultiplierInput(false);
      setCustomMultiplier('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTimeDifference();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Scriver's ppl adjust</h1>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Show History"
          >
            <History className="w-5 h-5 text-blue-400" />
          </button>
        </div>
        
        {showHistory && history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-700 rounded-md border border-gray-600">
            <h2 className="text-lg font-semibold text-white mb-3">History</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map((entry, index) => (
                <div key={index} className="p-2 bg-gray-800 rounded border border-gray-600">
                  <div className="text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Time: {entry.calculatedTime}</span>
                      <span>Pull: {entry.projectedPull}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Button: {entry.buttonPressed}</span>
                      <span className="text-green-400">Result: {entry.multipliedResult > 0 ? '+' : ''}{entry.multipliedResult}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400 text-right">
                      {entry.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1 text-center">
              Calculated Time (e.g., 1430)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="time"
                value={inputTime}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (value.length === 4) {
                    const hours = parseInt(value.slice(0, 2));
                    const minutes = parseInt(value.slice(2));
                    if (hours < 24 && minutes < 60) {
                      setInputTime(`${value.slice(0, 2)}:${value.slice(2)}`);
                    }
                  } else {
                    setInputTime(value);
                  }
                }}
                placeholder="1430"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-white placeholder-gray-400"
                maxLength={4}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">Format: HHMM (0000-2359)</p>
          </div>

          <div>
            <label htmlFor="projectedPull" className="block text-sm font-medium text-gray-300 mb-1 text-center">
              Projected Pull
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="projectedPull"
                value={projectedPull}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (value.length === 4) {
                    const hours = parseInt(value.slice(0, 2));
                    const minutes = parseInt(value.slice(2));
                    if (hours < 24 && minutes < 60) {
                      setProjectedPull(`${value.slice(0, 2)}:${value.slice(2)}`);
                    }
                  } else {
                    setProjectedPull(value);
                  }
                }}
                placeholder="1430"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-white placeholder-gray-400"
                maxLength={4}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">Format: HHMM (0000-2359)</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            Calculate Time Difference
          </button>
        </form>
        
        {timeDifference !== null && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md text-center border border-gray-600">
            <p className="text-sm text-gray-300">Time Difference:</p>
            <p className="text-2xl font-mono font-bold text-white">
              {timeDifference > 0 ? '+' : ''}{timeDifference}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {timeDifference > 0 
                ? `Projected Pull is ${Math.abs(timeDifference)} minutes after Calculated Time`
                : `Projected Pull is ${Math.abs(timeDifference)} minutes before Calculated Time`}
            </p>
            {inputTime && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-sm text-gray-300">Adjustment needed for 15min ahead:</p>
                <p className="text-xl font-mono font-bold text-blue-400">
                  {getAdjustedTimeDifference() !== null ? (getAdjustedTimeDifference() > 0 ? '+' : '') + getAdjustedTimeDifference() : ''}
                </p>
                {multipliedResult !== null && (
                  <p className="text-xl font-mono font-bold text-green-400 mt-2">
                    {multipliedResult > 0 ? '+' : ''}{multipliedResult}
                  </p>
                )}
              </div>
            )}
            {showMultiplierInput && (
              <form onSubmit={handleCustomMultiply} className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={customMultiplier}
                    onChange={(e) => setCustomMultiplier(e.target.value)}
                    placeholder="Enter multiplier"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Multiply
                  </button>
                </div>
              </form>
            )}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button 
                onClick={handleL2ButtonClick}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-2 px-4 rounded transition-all duration-300 hover:from-orange-600 hover:to-yellow-600 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                L2-L3-L4-L7
              </button>
              <button 
                onClick={handleL5ButtonClick}
                className="bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold py-2 px-4 rounded transition-all duration-300 hover:from-pink-500 hover:to-pink-700 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                L5
              </button>
              <button 
                onClick={handleL6ButtonClick}
                className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-2 px-4 rounded transition-all duration-300 hover:from-purple-500 hover:to-purple-700 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                L6
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;