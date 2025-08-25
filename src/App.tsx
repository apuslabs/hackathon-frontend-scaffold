import './App.css'
import WalletConnector from './components/WalletConnector.jsx'
import AIBox from './components/AIBox.jsx'

function App() {

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: '0px', right: '0px', zIndex: 1000 }}>
        <WalletConnector />
      </div>
      <div style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
        <AIBox />
      </div>
    </div>
  )
}

export default App
