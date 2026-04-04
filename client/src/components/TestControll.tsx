import  { useState } from 'react';
export const TestControll = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTest, setSelectedTest] = useState('insert1m.yml');
    const runTest = async (endpoint:string, configFileName:string) => {
        const response = await fetch(`/api/tests/${endpoint}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json', // Обязательно указываем тип данных
            },
            body: JSON.stringify({ 
            filename: configFileName,           
            }),
        });
        const data = await response.json();
        console.log(data);
    };

    const changedTest = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTest(e.target.value);
    };
  const toggleTest = async () => {
      const endpoint = isRunning ? 'stop' : 'start';
      await runTest(endpoint, selectedTest);    
        setIsRunning(!isRunning);
    };
    
    

  return (
    <div style={{ padding: '10px', background: '#333', borderRadius: '8px' }}>
      <button 
        onClick={toggleTest} 
        style={{ backgroundColor: isRunning ? 'red' : 'green', color: 'white' }}
      >
        {isRunning ? 'STOP TEST' : 'START LOAD TEST'}
          </button>        
        <select onChange={changedTest} value={selectedTest} style={{ marginLeft: '10px', padding: '5px' }}>
            <option value="insert1m.yml">Insert 1M</option>
            <option value="main.yml">Stress Test</option>
        </select>     
      <span style={{ marginLeft: '10px' }}>
        Status: {isRunning ? '🔥 High Load' : 'Idle'}
      </span>
    </div>
  );
};