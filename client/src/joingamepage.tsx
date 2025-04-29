import React, { useState } from 'react';
import './textboxpages.css';
import fannedcards from './fannedcards.png';
import { useNavigate } from 'react-router-dom';

function joinOrCreateTable(tableID) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // FAKE RULES
        if (tableID === "FULL1") {
          reject({ message: "Table is full." });
        } else if (tableID.length > 5) {
          reject({ message: "tableID too long." });
        } else if (tableID === "tableIdError") {
          reject({ message: "Unknown tableIdError." });
        } else {
          resolve({ success: true, tableId: tableID });
        }
      }, 1000);
    });
  }

  const JoinGamePage = () => {
    const [tableID, setCode] = useState('');
    const [tableIdError, setTableIdError] = useState(null)
    const navigate = useNavigate();
    const {loading, data: publicGameTables, error:publicGamesError} = useFetch('http://www.gmart15.com/publicgames') //ALI WRITING THIS
  
    const handleInputChange = (e) => {
      setCode(e.target.value);
      setTableIdError('');
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (tableID.length !== 5) {
        setTableIdError('Game tableID must be exactly 5 characters.');
        return;
      }
  
      setTableIdError('');
      try {
        const response = await joinOrCreateTable(tableID);
        if (response.success)
          navigate(`/table/${response.tableId}`);
      } catch (err) {
        setTableIdError(err.message || "A tableID error occurred.");
      }
    };
  
    return (
      <>
        <div className='formFormattingWrapper'>
          <form onSubmit={handleSubmit}>
            <label htmlFor="tableID">tableID:</label>
            <input
              type="text"
              id="tableID"
              name="tableID"
              required
              minLength={5}
              maxLength={5}
              placeholder="Enter game tableID"
              value={tableID}
              onChange={handleInputChange}
              disabled={loading}
            />
            <button type="submit">
                Submit
            </button>
            {tableIdError && <div className="tableIdError-message">{tableIdError}</div>}
          </form>
        </div>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
      </>
    );
  };
  
  export default JoinGamePage;