// src/components/WalletConnector.js
import React from 'react';
import { useConnection, useActiveAddress } from '@arweave-wallet-kit/react';
import { ConnectButton } from '@arweave-wallet-kit/react'; // Import the button

export default function WalletConnector() {
  const { connected } = useConnection();
  const activeAddress = useActiveAddress();

  return (
    <div style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '5px', minWidth: '200px' }}>
      <ConnectButton profileModal={true} showBalance={false} />
      {connected && (
        <div style={{ marginTop: '5px', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <p><strong>Address:</strong> {activeAddress?.substring(0, 8)}...{activeAddress?.substring(activeAddress.length - 4)}</p>
        </div>
      )}
    </div>
  );
}