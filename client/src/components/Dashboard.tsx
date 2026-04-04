import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState([]);

  const [postgresData, setPostgresData] = useState([]);

  const [appData, setAppData] = useState([]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const stats = await response.json();
      // Преобразуем дату для красивого отображения на оси X
      const formattedData = stats.map((s: any) => ({
        ...s,
        id: s.id,
        queueName: s.queueName,
        publishRate: s.publishRate,
        deliverRate: s.deliverRate,
        time: new Date(s.createdAt).toLocaleTimeString(),
      })).reverse(); // Переворачиваем, чтобы новые данные были справа
      
      setData(formattedData);

      const formattedPostgresData = stats.map((s: any) => ({
        ...s,
        id: s.id,
       postgresCpu: s.postgresCpu,
       postgresRam: s.postgresRam,
        time: new Date(s.createdAt).toLocaleTimeString(),
      })).reverse(); // Переворачиваем, чтобы новые данные были справа
      setPostgresData(formattedPostgresData);


      const formattedAppData = stats.map((s: any) => ({
        ...s,
        id: s.id,
       appCpu: s.appCpu,
       appRam: s.appRam,
        time: new Date(s.createdAt).toLocaleTimeString(),
      })).reverse(); // Переворачиваем, чтобы новые данные были справа
      setAppData(formattedAppData);


      

    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Обновляем каждые 5 сек
    return () => clearInterval(interval);
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