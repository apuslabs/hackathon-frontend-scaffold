// src/components/AIBox.jsx
import React, { useState } from 'react';
import { useConnection } from '@arweave-wallet-kit/react';
import { message, dryrun, createDataItemSigner } from '@permaweb/aoconnect';

export default function AIBox() {
  const { connected } = useConnection(); // Check if wallet is connected

  const [messageId, setMessageId] = useState(''); // Stores the Arweave message ID
  const [code, setCode] = useState(''); // Stores the fetched code
  const [status, setStatus] = useState(''); // Stores the current status
  const [requestReference, setRequestReference] = useState(''); // Stores the reference for the sent request
  const [aiResult, setAiResult] = useState(''); // Stores the fetched AI result
  const [taskRef, setTaskRef] = useState(''); // Stores the task reference
  const [resultStatus, setResultStatus] = useState(''); // Stores the result status
  const [llmData, setLlmData] = useState(''); // Stores the LLM data
  const [attestation, setAttestation] = useState(''); // Stores the attestation
  const [showAttestation, setShowAttestation] = useState(false); // Controls attestation visibility

  const YOUR_AO_PROCESS_ID = 'rnrMBoIP3GdpCzwWl7IJ-X3duZ5YfSbWYLhlDCy_h2Y'; // <-- IMPORTANT: Replace with your actual AO Process ID

  const handleFetchCode = async () => {
    if (!messageId.trim()) { 
      alert('Please enter a message ID.'); 
      return; 
    }

    setStatus('Fetching code...');
    setCode('');
    setAiResult('');

    try {
      const response = await fetch(`https://arweave.net/${messageId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const codeText = await response.text();
      setCode(codeText);
      setStatus('Code fetched successfully. Click "Evaluate Code" to analyze.');
    } catch (error) {
      console.error('Failed to fetch code:', error);
      setStatus(`Error fetching code: ${error.message}`);
    }
  };

  const handleEvaluateCode = async () => {
    if (!connected) { 
      alert('Please connect your wallet first.'); 
      return; 
    }
    
    if (!code) { 
      alert('Please fetch code first.'); 
      return; 
    }

    setStatus('Processing...');
    setAiResult('');
    let ref = Date.now().toString();
    setRequestReference(ref);
    let Options = {
      "reference": ref,
      "max_tokens": 512,
    }
    try {
      // Create the evaluation prompt
      const evaluationPrompt = `"Review the following code with a focus on security and data leakage risks. Provide a concise response including: Key strengths (secure practices, safe handling) Key weaknesses (bugs, vulnerabilities, possible leaks) A final security rating (0–5)Code:${code}"`;
      
      // Send message to your AO process using aoconnect.message
      const messageId = await message({
        process: YOUR_AO_PROCESS_ID,
        tags: [
          { name: "Action", value: "SendRequest" },
          { name: "X-Prompt", value: evaluationPrompt },
          { name: "X-Options", value: JSON.stringify(Options) }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });
      console.log(messageId);

      setTaskRef(ref); // Set the taskRef variable
      setStatus('Code sent for evaluation. Click "Fetch Result" to see the analysis.');
    } catch (error) {
      console.error('Failed to send code for evaluation:', error);
      setStatus(`Error sending code: ${error.message}`);
    }
  };

  const handleFetchResult = async () => {
    if (!requestReference) { 
      alert('Please evaluate code first to get a reference.'); 
      return; 
    }
    console.log(requestReference);
    setStatus('Fetching result...');
    setAiResult('');

    try {
      // Use dryrun to fetch the result from the AO process
      const result = await dryrun({
        process: YOUR_AO_PROCESS_ID,
        data: '',
        tags: [{ name: 'Action', value: 'GetResult' }, { name: 'Taskref', value: requestReference }],
      });

      console.log(result);

      if (result.Messages && result.Messages.length > 0) {
        const aiResult = result.Messages[0].Data;
        setAiResult(aiResult);
        
        // Parse the JSON result
        try {
          const parsedResult = JSON.parse(aiResult);
          setResultStatus(parsedResult.status);
          setLlmData(parsedResult.data);
          setAttestation(parsedResult.attestation);
        } catch (parseError) {
          console.error('Failed to parse JSON result:', parseError);
        }
        
        setStatus('Result received');
      } else {
        setStatus('No result found');
      }
    } catch (error) {
      console.error('Failed to fetch result:', error);
      setStatus(`Error fetching result: ${error.message}`);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Sentinel AI on AO</h2>
      <p><strong>Sentinel Process ID:</strong> {YOUR_AO_PROCESS_ID}</p> 
      
      {/* Message ID Input */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="messageId" style={{ display: 'block', marginBottom: '5px' }}>
          <strong>Arweave Message ID:</strong>
        </label>
        <input
          type="text"
          id="messageId"
          value={messageId}
          onChange={(e) => setMessageId(e.target.value)}
          placeholder="Enter Arweave message ID..."
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button onClick={handleFetchCode} style={{ padding: '8px 16px' }}>
          Fetch Code
        </button>
      </div>

      {/* Status Display */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Status:</strong> {status || 'Ready'}
      </div>

      {/* Code Display Area */}
      {code && (
        <div style={{ marginBottom: '15px' }}>
          <h3>Fetched Code:</h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '10px', 
            maxHeight: '200px', 
            overflow: 'auto', 
            backgroundColor: '#f8f8f8',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap'
          }}>
            {code}
          </div>
        </div>
      )}

      {/* Task Reference Display */}
      {taskRef && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
          <strong>Task Reference:</strong> {taskRef}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleEvaluateCode} 
          disabled={!connected || !code}
          style={{ padding: '8px 16px', marginRight: '10px' }}
        >
          Evaluate Code
        </button>
        <button 
          onClick={handleFetchResult} 
          disabled={!requestReference}
          style={{ padding: '8px 16px' }}
        >
          Fetch Result
        </button>
      </div>

      {/* AI Result Display */}
      {llmData && (
        <div style={{ marginTop: '15px' }}>
          <h3>AI Evaluation Result:</h3>
          {resultStatus && (
            <div style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
              <strong>Status:</strong> {resultStatus}
            </div>
          )}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '15px', 
            backgroundColor: '#f9f9f9',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.5'
          }}>
            {llmData.split('\n').map((line, index) => (
              <div key={index}>
                {line.startsWith('##') ? <h2>{line.substring(2).trim()}</h2> : 
                 line.startsWith('#') ? <h1>{line.substring(1).trim()}</h1> : 
                 line.startsWith('**') && line.endsWith('**') ? <strong>{line.substring(2, line.length-2)}</strong> : 
                 line.startsWith('*') && line.endsWith('*') ? <em>{line.substring(1, line.length-1)}</em> : 
                 line}
              </div>
            ))}
          </div>
          {attestation && (
            <div style={{ marginTop: '10px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowAttestation(!showAttestation)}
                style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {showAttestation ? 'Hide Attestation' : 'Show Attestation'}
              </button>
              {showAttestation && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px', 
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {attestation}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}