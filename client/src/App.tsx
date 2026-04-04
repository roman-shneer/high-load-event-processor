//import { useState } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard';
import { TestControll } from './components/TestControll';
function App() {
  //const [count, setCount] = useState(0)

  return (
    <>

      <section id="next-steps">        
        <div className="App">
          <h1>Monitoring System</h1>
          <TestControll />
          <Dashboard />
        </div>
      </section>

    </>
  )
}

export default App
