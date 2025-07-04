import React, { useRef } from 'react';
import { useMarchData } from '../context/MarchContext';
import { Download, Upload, RotateCcw, Database, AlertTriangle, CheckCircle } from 'lucide-react';

const DataManagement: React.FC = () => {
  const { marchData, exportData, importData, resetToSampleData, getTotalDistance } = useMarchData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the imported data structure
        if (data && 
            typeof data === 'object' && 
            Array.isArray(data.days) && 
            Array.isArray(data.marchers) && 
            Array.isArray(data.partnerOrganizations) &&
            data.title &&
            data.description) {
          importData(data);
        } else {
          alert('Invalid data format. Please select a valid March Organizer data file.');
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    exportData();
  };

  const handleReset = () => {
    resetToSampleData();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-red-600 to-blue-600 p-3 rounded-full">
            <Database className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Data Management</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Export your march data for backup, import data from other sources, or reset to sample data.
        </p>
      </div>

      {/* Current Data Summary */}
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-6 w-6 mr-3 text-blue-600" />
          Current Data Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Days</p>
            <p className="text-2xl font-bold text-blue-900">{marchData.days.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-600">Marchers</p>
            <p className="text-2xl font-bold text-purple-900">{marchData.marchers.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-600">Partners</p>
            <p className="text-2xl font-bold text-orange-900">{marchData.partnerOrganizations.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600">Total Distance</p>
            <p className="text-2xl font-bold text-green-900">{getTotalDistance().toFixed(1)} mi</p>
          </div>
        </div>
      </div>

      {/* Data Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Data */}
        <div className="card p-6">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Data</h3>
            <p className="text-gray-600 mb-4">
              Download your current march data as a JSON file for backup or sharing.
            </p>
            <button
              onClick={handleExport}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Import Data */}
        <div className="card p-6">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Data</h3>
            <p className="text-gray-600 mb-4">
              Import march data from a previously exported JSON file.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Choose File</span>
            </button>
          </div>
        </div>

        {/* Reset Data */}
        <div className="card p-6">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <RotateCcw className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Data</h3>
            <p className="text-gray-600 mb-4">
              Reset all data to the original sample data. This will delete all your current data.
            </p>
            <button
              onClick={handleReset}
              className="btn-outline border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Sample</span>
            </button>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-8 space-y-6">
        {/* Auto-Save Information */}
        <div className="card p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatic Data Saving</h3>
              <p className="text-gray-600">
                Your data is automatically saved to your browser's local storage. This means your changes 
                will persist between browser sessions, but they are stored locally on your device.
              </p>
            </div>
          </div>
        </div>

        {/* Backup Recommendations */}
        <div className="card p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Recommendations</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Export your data regularly to create backups</li>
                <li>• Store backup files in a safe location</li>
                <li>• Consider using cloud storage for important data</li>
                <li>• Data is stored locally and may be lost if you clear browser data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Format Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Format</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              The exported data is in JSON format and includes:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• March information (title, description, dates, total distance)</li>
              <li>• All march days with routes, meals, and events</li>
              <li>• All marchers and their schedules</li>
              <li>• All partner organizations and their schedules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement; 