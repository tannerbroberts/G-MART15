import React, { useState, useEffect } from 'react';
import { Value, PipPlacementMap, PipPosition, getDefaultPipPlacements, generateCardSVG } from '../cardGenerator';
import ClipboardButton from './ClipboardButton';

interface PipPlacementGeneratorProps {
  onSave?: (placements: PipPlacementMap) => void;
}

const PipPlacementGenerator: React.FC<PipPlacementGeneratorProps> = ({ onSave }) => {
  const [selectedCard, setSelectedCard] = useState<Value>('2');
  const [pipPlacements, setPipPlacements] = useState<PipPlacementMap>(getDefaultPipPlacements());
  const [currentCardPips, setCurrentCardPips] = useState<PipPosition[]>([]);
  const [pipPreview, setPipPreview] = useState<string>('');
  const [jsonString, setJsonString] = useState<string>('');
  const [globalScale, setGlobalScale] = useState<number>(1.2);

  // Updated card values to include A, J, Q, K
  const cardValues: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const isRoyalOrAce = selectedCard === 'A' || selectedCard === 'J' || selectedCard === 'Q' || selectedCard === 'K';
  
  useEffect(() => {
    // Initialize with current pips for selected card
    const pips = pipPlacements[selectedCard] || [];
    setCurrentCardPips([...pips]);
    
    // Set global scale based on first pip (if exists)
    if (pips.length > 0) {
      setGlobalScale(pips[0][2]);
    } else {
      setGlobalScale(1.2); // Default scale
    }
  }, [selectedCard, pipPlacements]);

  useEffect(() => {
    // Apply the global scale to all pips
    if (currentCardPips.length > 0) {
      const pipsWithGlobalScale = currentCardPips.map(pip => [pip[0], pip[1], globalScale] as PipPosition);
      
      // Generate preview SVG with current pip placements
      const customPlacement: PipPlacementMap = {
        [selectedCard]: pipsWithGlobalScale
      };
      
      const previewSvg = generateCardSVG('spades', selectedCard, customPlacement);
      setPipPreview(previewSvg);
      
      // For saving, we need to ensure all pips have the global scale
      const updatedPipPlacements = { ...pipPlacements };
      updatedPipPlacements[selectedCard] = pipsWithGlobalScale;
      
      // Update JSON string representation with the global scale applied
      const placementsJson = JSON.stringify(updatedPipPlacements, null, 2);
      setJsonString(placementsJson);
    } else {
      // No pips for this card
      const customPlacement: PipPlacementMap = {
        [selectedCard]: []
      };
      
      const previewSvg = generateCardSVG('spades', selectedCard, customPlacement);
      setPipPreview(previewSvg);
      
      // Update JSON string representation
      const placementsJson = JSON.stringify(pipPlacements, null, 2);
      setJsonString(placementsJson);
    }
  }, [selectedCard, currentCardPips, pipPlacements, globalScale]);

  const handleAddPip = () => {
    // Add a new pip at default position, using the global scale
    const newPip: PipPosition = [40, 60, globalScale];
    setCurrentCardPips([...currentCardPips, newPip]);
  };

  const handleUpdatePip = (index: number, field: 0 | 1, value: number) => {
    // Update only x or y position of a pip (scale is handled globally)
    const updatedPips = [...currentCardPips];
    updatedPips[index][field] = value;
    setCurrentCardPips(updatedPips);
  };

  const handleUpdateGlobalScale = (value: number) => {
    setGlobalScale(value);
  };

  const handleRemovePip = (index: number) => {
    // Remove a pip at specified index
    const updatedPips = currentCardPips.filter((_, i) => i !== index);
    setCurrentCardPips(updatedPips);
  };

  const handleSavePlacements = () => {
    // Apply global scale to all pips before saving
    const pipsWithGlobalScale = currentCardPips.map(pip => [pip[0], pip[1], globalScale] as PipPosition);
    
    // Save current pip placements for the selected card
    const updatedPlacements = {
      ...pipPlacements,
      [selectedCard]: pipsWithGlobalScale
    };
    setPipPlacements(updatedPlacements);
    
    // Call onSave callback if provided
    if (onSave) {
      onSave(updatedPlacements);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const pastedPlacements = JSON.parse(text) as PipPlacementMap;
      setPipPlacements(pastedPlacements);
    } catch (err) {
      console.error('Failed to paste or parse JSON: ', err);
      alert('Invalid JSON format');
    }
  };

  const handleReset = () => {
    setPipPlacements(getDefaultPipPlacements());
  };

  return (
    <div className="pip-placement-generator" style={{ padding: '1rem', margin: '0 auto' }}>
      <h2>Pip Placement Generator</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 350px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="card-select">Select Card Value: </label>
            <select 
              id="card-select"
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value as Value)}
              style={{ padding: '0.5rem' }}
            >
              {cardValues.map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <button 
              onClick={handleAddPip}
              style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
            >
              Add Pip
            </button>
            <button 
              onClick={handleSavePlacements}
              style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
            >
              Save Placements
            </button>
            <button 
              onClick={handleReset}
              style={{ padding: '0.5rem 1rem' }}
            >
              Reset to Default
            </button>
          </div>
          
          {/* Global scale control for all pips */}
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Global Pip Scale:
              <input
                type="number"
                value={globalScale}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(e) => handleUpdateGlobalScale(Number(e.target.value))}
                style={{ width: '60px', marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <h3>Current Pips for {selectedCard}</h3>
            {isRoyalOrAce && (
              <p>
                Letter '{selectedCard}' will be displayed in the center of each pip for this card.
              </p>
            )}
            
            {currentCardPips.length === 0 ? (
              <p>No pips defined. Click "Add Pip" to add a new pip.</p>
            ) : (
              <div>
                {currentCardPips.map((pip, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Pip {index + 1}:</span>
                    <label>
                      X:
                      <input
                        type="number"
                        value={pip[0]}
                        min={0}
                        max={80}
                        onChange={(e) => handleUpdatePip(index, 0, Number(e.target.value))}
                        style={{ width: '60px', marginLeft: '0.25rem', marginRight: '0.5rem' }}
                      />
                    </label>
                    <label>
                      Y:
                      <input
                        type="number"
                        value={pip[1]}
                        min={0}
                        max={120}
                        onChange={(e) => handleUpdatePip(index, 1, Number(e.target.value))}
                        style={{ width: '60px', marginLeft: '0.25rem', marginRight: '0.5rem' }}
                      />
                    </label>
                    <button onClick={() => handleRemovePip(index)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ flex: '1 1 250px' }}>
          <h3>Preview</h3>
          <div 
            style={{ 
              width: '160px', 
              height: '240px', 
              border: '1px solid #ccc', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem'
            }} 
            dangerouslySetInnerHTML={{ __html: pipPreview }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>JSON Proposal Output</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ClipboardButton 
            text={jsonString} 
            style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
          />
          <button 
            onClick={handlePasteFromClipboard}
            style={{ padding: '0.5rem 1rem' }}
          >
            Paste from Clipboard
          </button>
        </div>
        <pre 
          style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {jsonString}
        </pre>
      </div>
    </div>
  );
};

export default PipPlacementGenerator;