import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function BehaviorAnalyticsChart({ data, height = 260 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="clicks" name="Clicks/min" fill="rgba(255, 209, 102, 0.45)" radius={[8, 8, 0, 0]} />
          <Line type="monotone" dataKey="typing" name="Typing WPM" stroke="#10d9ff" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="rhythm" name="Rhythm" stroke="#2dff9d" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="mouse" name="Mouse px/s" stroke="#ff3f5f" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BehaviorAnalyticsChart;
