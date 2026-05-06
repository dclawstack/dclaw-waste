'use client';
import { useState } from 'react';
import { auditWasteStream, getBreakdown } from '@/lib/api';

export default function Dashboard() {
  const [siteId, setSiteId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const data = await auditWasteStream(siteId);
      setResult(data);
      const b = await getBreakdown(data.id);
      setBreakdown(b);
    } catch (e) {
      alert('Audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:40,maxWidth:800}}>
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <input placeholder="Site ID" value={siteId} onChange={e => setSiteId(e.target.value)}
          style={{padding:'10px 16px',borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#f8fafc',minWidth:240}} />
        <button onClick={handleAudit} disabled={loading}
          style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#65A30D',color:'#fff',cursor:'pointer'}}>
          {loading ? 'Auditing...' : 'Audit Waste Stream'}
        </button>
      </div>

      {result && (
        <div style={{display:'grid',gap:16}}>
          <div style={{padding:20,borderRadius:12,background:'#1e293b',border:'1px solid #334155'}}>
            <h3 style={{marginBottom:12,color:'#65A30D'}}>Waste Audit Result</h3>
            <p><strong>Total waste:</strong> {result.total_waste_kg} kg</p>
            <p><strong>Recycling rate:</strong> {result.recycling_rate}%</p>
            <p><strong>Compostable fraction:</strong> {result.compostable_fraction}</p>
            <p><strong>Reduction recommendations:</strong> {result.reduction_recommendations?.join(', ')}</p>
          </div>
          {breakdown.length > 0 && (
            <div style={{padding:20,borderRadius:12,background:'#1e293b',border:'1px solid #334155'}}>
              <h3 style={{marginBottom:12,color:'#65A30D'}}>Waste Breakdown</h3>
              {breakdown.map((item, i) => (
                <p key={i}>{item.category}: {item.percentage}%</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
