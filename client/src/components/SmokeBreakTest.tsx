import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SmokeBreakTest.css';

const SmokeBreakTest: React.FC = () => {
  const navigate = useNavigate();
  const tableId = 'test-table-1';

  return (
    <div className="smoke-break-test">
      <div className="test-info">
        <h2>Smoke Break Test Page</h2>
        <p>This is a test page for the smoke break functionality.</p>
        <p>Click the button below to go to the smoke break lounge.</p>
        <button
          className="test-button"
          onClick={() => navigate(`/smoke-break/${tableId}`)}
        >
          Go to Smoke Break Lounge
        </button>
      </div>
    </div>
  );
};

export default SmokeBreakTest;