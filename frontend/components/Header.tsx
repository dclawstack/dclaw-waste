import { Recycle } from 'lucide-react';
export default function Header() {
  return (
    <header style={{display:'flex',alignItems:'center',gap:12,padding:'20px 40px',borderBottom:'1px solid #1e293b'}}>
      <Recycle color="#65A30D" size={28} />
      <div>
        <h1 style={{fontSize:20,fontWeight:700,color:'#f8fafc'}}>DClaw Waste</h1>
        <p style={{fontSize:12,color:'#94a3b8'}}>Waste reduction AI</p>
      </div>
    </header>
  );
}
