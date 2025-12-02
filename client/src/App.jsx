import React from 'react';
import TelegraphKey from './TelegraphKey.jsx';
import DisplayManager from './DisplayManager.jsx';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Telegraph AI Agent</h1>
        <p className="app-subtitle">Morse Code Communication - Est. 1865</p>
      </header>
      
      <main>
        <TelegraphKey 
          onDotDash={(symbol) => console.log('Symbol:', symbol)}
          onCharacterBreak={(sequence) => console.log('Character break:', sequence)}
          onTransmissionComplete={(morse) => console.log('Transmission:', morse)}
        />
        
        <DisplayManager 
          currentMorseSequence=""
          isPlayingResponse={false}
          responseText=""
        />
      </main>
    </div>
  );
}

export default App;
