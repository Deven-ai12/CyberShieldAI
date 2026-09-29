import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function RiskTrendChart({ data, height = 280 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="riskScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10d9ff" stopOpacity={0.52} />
              <stop offset="95%" stopColor="#10d9ff" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="hijackGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3f5f" stopOpacity={0.42} />
              <stop offset="95%" stopColor="#ff3f5f" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
          <Area type="monotone" dataKey="score" name="Risk" stroke="#10d9ff" strokeWidth={3} fill="url(#riskScoreGradient)" />
          <Area type="monotone" dataKey="hijack" name="Hijack" stroke="#ff3f5f" strokeWidth={2} fill="url(#hijackGradient)" />
          <Area type="monotone" dataKey="bot" name="Bot" stroke="#2dff9d" strokeWidth={2} fill="rgba(45,255,157,0.05)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskTrendChart;
