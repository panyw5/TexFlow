import React, { useState, useEffect } from 'react';

interface PackageManagerProps {
  availablePackages: string[];
  enabledPackages: string[];
  onPackagesChange: (packages: string[]) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const PackageManager: React.FC<PackageManagerProps> = ({
  availablePackages,
  enabledPackages,
  onPackagesChange,
  onClose,
  isVisible
}) => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>(enabledPackages);

  useEffect(() => {
    setSelectedPackages(enabledPackages);
  }, [enabledPackages]);

  const handlePackageToggle = (packageName: string) => {
    if (selectedPackages.includes(packageName)) {
      setSelectedPackages(prev => prev.filter(p => p !== packageName));
    } else {
      setSelectedPackages(prev => [...prev, packageName]);
    }
  };

  const handleSave = () => {
    console.log('PackageManager: handleSave called with packages:', selectedPackages);
    onPackagesChange(selectedPackages);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPackages(enabledPackages); // Reset to original
    onClose();
  };

  if (!isVisible) return null;

  // Package descriptions
  const packageDescriptions: Record<string, string> = {
    'ams': 'AMS symbols and environments (amsmath, amssymb)',
    'mhchem': 'Chemistry equations and formulas',
    'physics': 'Physics notation (bra-ket, vectors, etc.)',
    'cancel': 'Strikethrough and cancellation',
    'color': 'Text and background colors',
    'bbox': 'Boxing and highlighting',
    'braket': 'Dirac notation for quantum mechanics',
    'enclose': 'Various enclosures and notations',
    'mathtools': 'Enhanced math tools',
    'cases': 'Enhanced case environments',
    'unicode': 'Unicode math characters',
    'newcommand': 'Custom command definitions',
    'configmacros': 'Configuration-based macros',
    'base': 'Core MathJax functionality'
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>
            Manage MathJax Packages
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '12px' }}>
            Enable or disable packages for MathJax rendering
          </p>
        </div>
        <button
          onClick={handleCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          ×
        </button>
      </div>

      {/* Package List */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {availablePackages.map(packageName => (
            <label
              key={packageName}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: selectedPackages.includes(packageName) ? '#2d4a3a' : '#2d2d2d',
                border: `1px solid ${selectedPackages.includes(packageName) ? '#4a7c59' : '#444'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!selectedPackages.includes(packageName)) {
                  e.currentTarget.style.backgroundColor = '#3a3a3a';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedPackages.includes(packageName)) {
                  e.currentTarget.style.backgroundColor = '#2d2d2d';
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedPackages.includes(packageName)}
                onChange={() => handlePackageToggle(packageName)}
                style={{
                  marginRight: '12px',
                  width: '16px',
                  height: '16px',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                  {packageName}
                </div>
                <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>
                  {packageDescriptions[packageName] || 'MathJax extension package'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: '#888' }}>
          {selectedPackages.length} packages selected
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCancel}
            style={{
              backgroundColor: '#3a3a3a',
              color: '#999',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4a4a4a';
              e.currentTarget.style.color = '#ccc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a3a';
              e.currentTarget.style.color = '#999';
            }}
          >
            ✕
          </button>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: '1px solid #28a745',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#34ce57';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
            title="Apply Changes"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};
