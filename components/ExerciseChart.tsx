import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ExerciseChartProps {
    data: { date: string; weight: number }[];
    color?: string;
}

export const ExerciseChart: React.FC<ExerciseChartProps> = ({ data, color = '#00E376' }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0D1412',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: color }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={color}
                        strokeWidth={3}
                        dot={{ fill: '#050B0A', stroke: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
