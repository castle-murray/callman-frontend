import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

function ConfirmPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/confirm/${token}/`);
        setData(res.data);
      } catch (err) {
        setError('Confirmation not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/confirm/${token}/`, { response });
      alert('Response submitted successfully');
    } catch (err) {
      alert('Error submitting response');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Availability</h1>
      <p><strong>Event:</strong> {data.event.event_name}</p>
      <p><strong>Call Time:</strong> {data.call_time.name}</p>
      <p><strong>Labor Type:</strong> {data.labor_requirement.labor_type.name}</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Response</label>
          {data.available_responses.map(([value, label]) => (
            <div key={value} className="flex items-center mb-2">
              <input
                type="radio"
                id={value}
                name="response"
                value={value}
                checked={response === value}
                onChange={(e) => setResponse(e.target.value)}
                className="mr-2"
              />
              <label htmlFor={value}>{label}</label>
            </div>
          ))}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

export default ConfirmPage;
