import React, { useState } from 'react';
import { suits, values } from '../constants';
import { generateCardSVG } from '../cardGenerator';

const CardSelector: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('A');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
      <div role="radiogroup" aria-label="Card Value Selector" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {values.map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="card-value"
              value={value}
              checked={selectedValue === value}
              onChange={() => setSelectedValue(value)}
            />
            {value}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {suits.map((suit) => (
          <div key={suit} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, background: '#fff' }}>
            <div dangerouslySetInnerHTML={{ __html: generateCardSVG(suit, selectedValue as any) }} />
            <div style={{ textAlign: 'center', marginTop: 4 }}>{suit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSelector;
