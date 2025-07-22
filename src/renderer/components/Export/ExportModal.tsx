import React, { useState, useEffect } from 'react';
import { MathJaxExportService } from '../../services/export/MathJaxExportService';
import { ExportOptions, ExportFormat, ExportResult } from '../../services/export/IExportService';
import { UserConfigManager } from '../../services/user-config-manager';

interface ExportModalProps {
  latex: string;
  onClose: () => void;
}

interface ExportState {
  format: ExportFormat;
  isExporting: boolean;
  progress: string;
  error: string | null;
  success: boolean;
}

const configManager = new UserConfigManager();

export const ExportModal: React.FC<ExportModalProps> = ({ latex, onClose }) => {
  const [exportState, setExportState] = useState<ExportState>({
    format: 'svg',
    isExporting: false,
    progress: '',
    error: null,
    success: false
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    scale: 4,
    quality: 0.95,
    backgroundColor: 'white',
    padding: 20
  });

  const [exportService, setExportService] = useState<MathJaxExportService | null>(null);

  useEffect(() => {
    // Initialize export service with current config
    const initializeService = async () => {
      const config = await configManager.loadConfig();
      setExportService(new MathJaxExportService(config));
    };
    initializeService();
  }, []);

  const handleFormatChange = (format: ExportFormat) => {
    setExportState(prev => ({ ...prev, format, error: null, success: false }));
    
    // Adjust default options based on format
    if (format === 'jpg') {
      setExportOptions(prev => ({ ...prev, backgroundColor: 'white' }));
    } else if (format === 'png') {
      setExportOptions(prev => ({ ...prev, backgroundColor: 'transparent' }));
    }
  };

  const handleExport = async () => {
    if (!exportService) {
      setExportState(prev => ({ ...prev, error: 'Export service not initialized' }));
      return;
    }

    console.log('Starting export process...');
    console.log('Format:', exportState.format);
    console.log('LaTeX:', latex);
    console.log('Options:', exportOptions);

    setExportState(prev => ({ 
      ...prev, 
      isExporting: true, 
      progress: 'Preparing export...', 
      error: null,
      success: false 
    }));

    try {
      let result: ExportResult;

      setExportState(prev => ({ ...prev, progress: `Generating ${exportState.format.toUpperCase()}...` }));

      switch (exportState.format) {
        case 'svg':
          console.log('Exporting as SVG...');
          result = await exportService.exportSVG(latex, exportOptions);
          break;
        case 'png':
          console.log('Exporting as PNG...');
          result = await exportService.exportPNG(latex, exportOptions);
          break;
        case 'jpg':
          console.log('Exporting as JPG...');
          result = await exportService.exportJPG(latex, exportOptions);
          break;
        case 'pdf':
          console.log('Exporting as PDF...');
          result = await exportService.exportPDF(latex, exportOptions);
          break;
        default:
          throw new Error(`Unsupported format: ${exportState.format}`);
      }

      console.log('Export result:', result);

      if (result.success && result.data) {
        setExportState(prev => ({ ...prev, progress: 'Saving file...' }));
        
        // Save file using Electron's dialog
        let dataToSave: string;
        
        if (typeof result.data === 'string') {
          dataToSave = result.data;
        } else if (result.data && typeof result.data.toString === 'function') {
          // Handle Buffer or other objects that can be converted to string
          dataToSave = result.data.toString('base64');
        } else {
          throw new Error('Invalid data format returned from export');
        }
        
        // Determine encoding based on format
        const encoding = exportState.format === 'svg' ? 'utf8' : 'base64';
        
        await saveFile(result.filename || `formula.${exportState.format}`, dataToSave, exportState.format, encoding);
        
        setExportState(prev => ({ 
          ...prev, 
          isExporting: false, 
          progress: '', 
          success: true 
        }));
      } else {
        throw new Error(result.error || 'Export failed - no data returned');
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportState(prev => ({ 
        ...prev, 
        isExporting: false, 
        progress: '', 
        error: error.message 
      }));
    }
  };

    const saveFile = async (filename: string, data: string, format: ExportFormat, encoding: 'utf8' | 'base64' = 'utf8') => {
    console.log('Saving file:', { filename, format, encoding, dataLength: data.length });
    
    try {
      // Check if we're in Electron environment
      if (window.electronAPI?.exportFile) {
        const result = await window.electronAPI.exportFile({
          filename,
          data,
          format,
          encoding
        });
        console.log('Save result:', result);
        return result;
      } else {
        // Fallback for browser environment - trigger download
        console.log('Using browser download fallback');
        const blob = encoding === 'base64' 
          ? new Blob([Uint8Array.from(atob(data), c => c.charCodeAt(0))], { 
              type: getMimeType(format) 
            })
          : new Blob([data], { type: getMimeType(format) });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true, filePath: filename };
      }
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const getMimeType = (format: ExportFormat): string => {
    switch (format) {
      case 'svg': return 'image/svg+xml';
      case 'png': return 'image/png';
      case 'jpg': return 'image/jpeg';
      case 'pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  };

  const handleClose = () => {
    if (!exportState.isExporting) {
      onClose();
    }
  };

  const supportedFormats: { value: ExportFormat; label: string; description: string }[] = [
    { value: 'svg', label: 'SVG', description: 'Vector graphics (scalable, small file size)' },
    { value: 'png', label: 'PNG', description: 'Raster image (transparent background support)' },
    { value: 'jpg', label: 'JPG', description: 'Raster image (smaller file size, no transparency)' },
    // { value: 'pdf', label: 'PDF', description: 'Vector graphics (print-ready)' } // Disabled for now
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#2d2d2d',
          border: '1px solid #444',
          borderRadius: '12px',
          padding: '24px',
          width: '480px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Export Formula</h2>
          <button
            onClick={handleClose}
            disabled={exportState.isExporting}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
              fontSize: '24px',
              opacity: exportState.isExporting ? 0.5 : 1
            }}
          >
            ×
          </button>
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: 'bold' }}>
            Export Format
          </label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {supportedFormats.map((format) => (
              <label
                key={format.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: exportState.format === format.value ? '#3d4a3e' : '#3a3a3a',
                  border: `1px solid ${exportState.format === format.value ? '#4a7c59' : '#555'}`,
                  borderRadius: '6px',
                  cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: exportState.isExporting ? 0.6 : 1
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={exportState.format === format.value}
                  onChange={() => handleFormatChange(format.value)}
                  disabled={exportState.isExporting}
                  style={{ marginRight: '8px' }}
                />
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{format.label}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontWeight: 'bold' }}>
            Export Options
          </label>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Scale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ color: '#ccc', minWidth: '60px' }}>Scale:</label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={exportOptions.scale || 4}
                onChange={(e) => setExportOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                disabled={exportState.isExporting}
                style={{ flex: 1 }}
              />
              <span style={{ color: '#ccc', minWidth: '30px' }}>{exportOptions.scale}×</span>
            </div>

            {/* Quality (for JPG) */}
            {exportState.format === 'jpg' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ color: '#ccc', minWidth: '60px' }}>Quality:</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={exportOptions.quality || 0.95}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                  disabled={exportState.isExporting}
                  style={{ flex: 1 }}
                />
                <span style={{ color: '#ccc', minWidth: '30px' }}>{Math.round((exportOptions.quality || 0.95) * 100)}%</span>
              </div>
            )}

            {/* Background Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ color: '#ccc', minWidth: '60px' }}>Background:</label>
              <select
                value={exportOptions.backgroundColor || 'white'}
                onChange={(e) => setExportOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                disabled={exportState.isExporting}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: '#444',
                  color: 'white',
                  border: '1px solid #666',
                  borderRadius: '4px'
                }}
              >
                <option value="transparent">Transparent</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="#f0f0f0">Light Gray</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress/Status */}
        {exportState.isExporting && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#3a3a3a', borderRadius: '6px' }}>
            <div style={{ color: 'white', marginBottom: '8px' }}>{exportState.progress}</div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              backgroundColor: '#555', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #4a7c59, #6aa96f)',
                animation: 'pulse 2s infinite'
              }} />
            </div>
          </div>
        )}

        {/* Error Message */}
        {exportState.error && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '6px',
            color: '#ff6b6b'
          }}>
            <strong>Export Error:</strong> {exportState.error}
          </div>
        )}

        {/* Success Message */}
        {exportState.success && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px', 
            backgroundColor: 'rgba(0, 255, 0, 0.1)', 
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '6px',
            color: '#51cf66'
          }}>
            <strong>Success!</strong> Formula exported successfully.
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleClose}
            disabled={exportState.isExporting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
              opacity: exportState.isExporting ? 0.5 : 1
            }}
          >
            {exportState.success ? 'Close' : 'Cancel'}
          </button>
          
          {!exportState.success && (
            <button
              onClick={handleExport}
              disabled={exportState.isExporting}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4a7c59',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
                opacity: exportState.isExporting ? 0.5 : 1
              }}
            >
              {exportState.isExporting ? 'Exporting...' : 'Export'}
            </button>
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
};
