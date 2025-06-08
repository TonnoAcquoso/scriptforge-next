import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts'
import { SparklineData } from '../hooks/useWeeklyScriptStats'

type Props = {
  data: SparklineData[]
}

export const WeeklySparkline = ({ data }: Props) => {
  return (
    <div style={{ width: '100%', height: 100 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              fontSize: '0.75rem',
              borderRadius: '8px',
            }}
            labelFormatter={(label) => `📅 ${label}`}
            formatter={(value) => [`${value} script`, 'Totale']}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}