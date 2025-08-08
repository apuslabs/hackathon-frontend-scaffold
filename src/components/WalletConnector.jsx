// src/components/WalletConnector.js
import React from 'react';
import { useConnection, useActiveAddress } from '@arweave-wallet-kit/react';
import { ConnectButton } from '@arweave-wallet-kit/react'; // Import the button

export default function WalletConnector() {
  const { connected } = useConnection();
  const activeAddress = useActiveAddress();

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '500px' }}>
      <h2>Wallet Connection</h2>
      <ConnectButton profileModal={true} showBalance={false} />
      {connected && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Active Address:</strong> {activeAddress}</p>
        </div>
      )}
    </div>
  );
}