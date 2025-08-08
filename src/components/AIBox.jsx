// src/components/AIBox.jsx
import React, { useState } from 'react';
import { useConnection } from '@arweave-wallet-kit/react';
import { connect, createSigner } from '@permaweb/aoconnect';

export default function AIBox() {
  const { connected } = useConnection(); // Check if wallet is connected

  const [prompt, setPrompt] = useState('');
  const [requestReference, setRequestReference] = useState(''); // Stores the reference for the sent request
  const [aiResult, setAiResult] = useState(''); // Stores the fetched AI result

  const YOUR_AO_PROCESS_ID = '-MGlzBNikS86-QKR6B-6lxxoabC5pMGYoGxKWk5QVFg'; // <-- IMPORTANT: Replace with your actual AO Process ID
  const APUS_HYPERBEAM_NODE_URL = `http://72.46.85.207:8734`;

  // --- aoconnect setup for HyperBEAM ---
  // Connect aoconnect to the APUS HyperBEAM Node using the connected browser wallet as signer.
  // This setup should ideally be done once at a higher level (e.g., App.jsx or context provider)
  // in a real application to avoid re-initialization.
  const { request } = connect({
    MODE: "mainnet", 
    URL: APUS_HYPERBEAM_NODE_URL,
    signer: createSigner(window.arweaveWallet),
  });

  const handleSendPrompt = async () => {
    if (!connected) { alert('Please connect your wallet first.'); return; }
    if (!prompt.trim()) { alert('Prompt cannot be empty.'); return; }

    setAiResult(''); // Clear previous result
    let ref = Date.now().toString()
    setRequestReference(ref); // Set new reference

    try {
      // Send message to your AO process using aoconnect.request
      const data = await request({
        type: 'Message',
        path: `/${YOUR_AO_PROCESS_ID}~process@1.0/push/serialize~json@1.0`,
        method: "POST",
        'data-protocol': 'ao',
        variant: 'ao.N.1',
        "accept-bundle": "true",
        "accept-codec": "httpsig@1.0",
        signingFormat: "ANS-104",
        target: YOUR_AO_PROCESS_ID,
        Action: "Infer",
        // your tags
        // ...tags.filter(t => t.name !== 'device').reduce((a, t) => assoc(t.name, t.value, a), {}),
        'X-Reference': ref, // Unique reference for this request
        data: prompt, // The AI prompt to send
      });
      console.log(data)

      console.log('Prompt sent. Check "Sent Request Ref" for fetching results.');

    } catch (error) {
      console.error('Failed to send prompt:', error);
      setAiResult(`Error sending prompt: ${error.message}`);
    }
  };

  const handleFetchResult = async () => {
    if (!requestReference) { alert('Please send a prompt first to get a reference.'); return; }

    setAiResult(''); // Clear previous result

    try {
      // Construct the URL to query your AO process's exposed cache via patch@1.0
      // This assumes your backend Lua uses 'patch@1.0' to expose Results[clientRequestRef]
      const resultApiUrl = 
        `${APUS_HYPERBEAM_NODE_URL}/${YOUR_AO_PROCESS_ID}~process@1.0/now/cache/results/${YOUR_AO_PROCESS_ID}-${requestReference}/serialize~json@1.0`;
      
      console.log("Fetching result from URL:", resultApiUrl);

      const response = await fetch(resultApiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json(); // Data from patch is already JSON
      setAiResult(data.body); // Set the AI result to state

    } catch (error) {
      console.error('Failed to fetch result:', error);
      setAiResult(`Error fetching result: ${error.message}`);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '500px' }}>
      <h2>APUS AI Box</h2>
      <p><strong>Your AO Process ID:</strong> {YOUR_AO_PROCESS_ID}</p> 

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your AI prompt here..."
        rows="4"
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={handleSendPrompt} disabled={!connected}>
        Send Prompt
      </button>
      <button onClick={handleFetchResult} disabled={!requestReference}>
        Fetch Result
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Details:</h3>
        <p><strong>Sent Request Ref:</strong> {requestReference || 'N/A'}</p>
        <p><strong>AI Result:</strong> {aiResult || 'N/A'}</p>
      </div>
    </div>
  );
}
