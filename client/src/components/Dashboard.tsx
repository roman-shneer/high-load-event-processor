import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState([]);

  const [postgresData, setPostgresData] = useState([]);

  const [appData, setAppData] = useState([]);

  const getStatsStream = () => {
    const es = new EventSource('/api/stats/stream');
    es.onmessage = (e) => {
      const stats = JSON.parse(e.data);
       const formattedData = stats.map((s: any) => ({
        ...s,
        id: s.id,
        queueName: s.queueName,
        publishRate: s.publishRate,
        deliverRate: s.deliverRate,
        time: new Date(s.createdAt).toLocaleTimeString(),
      })).reverse(); 
      
      setData(formattedData);

      const formattedPostgresData = stats.map((s: any) => ({
        ...s,
        id: s.id,
       postgresCpu: s.postgresCpu,
       postgresRam: s.postgresRam,
        time: new Date(s.createdAt).toLocaleTimeString(),
      })).reverse();
      setPostgresData(formattedPostgresData);


      const formattedAppData = stats.map((s: any) => ({
        ...s,
        id: s.id,
       appCpu: s.appCpu,
       appRam: s.appRam,
        time: new Date(s.createdAt).toLocaleTimeString(),
      })).reverse(); 
      setAppData(formattedAppData);

    };

    es.onerror = () => {
      console.error('SSE connection lost, retrying...');
    };

     // Cleanup on unmount
    return () => es.close();
  };

  useEffect(() => {
    getStatsStream();
  }, []);

  return (
    <div>
      <div style={{ width: '100%', height: 450, background: '#1e1e1e', padding: '20px', borderRadius: '10px' }}>
        <h2 style={{ color: '#fff' }}>RabbitMQ Performance (msg/s)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Line type="monotone" dataKey="publishRate" stroke="#8884d8" name="Publish Rate" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="deliverRate" stroke="#82ca9d" name="Deliver Rate" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <br/>
      <div style={{ width: '100%', height: 450, background: '#1e1e1e', padding: '20px', borderRadius: '10px' }}>
        <h2 style={{ color: '#fff', marginTop: '40px' }}>PostgreSQL Performance</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={postgresData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Line type="monotone" dataKey="postgresCpu" stroke="#8884d8" name="Postgres CPU" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="postgresRam" stroke="#82ca9d" name="Postgres RAM" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <br/>
      <div style={{ width: '100%', height: 450, background: '#1e1e1e', padding: '20px', borderRadius: '10px' }}>
        <h2 style={{ color: '#fff', marginTop: '40px' }}>Application Performance</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={appData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Line type="monotone" dataKey="appCpu" stroke="#8884d8" name="App CPU" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="appRam" stroke="#82ca9d" name="App RAM" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};