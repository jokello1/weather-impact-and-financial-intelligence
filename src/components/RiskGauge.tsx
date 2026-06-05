import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { riskColor } from '@/lib/utils'
import type { RiskLevel } from '@/types/financial'

interface RiskGaugeProps {
  riskScore: number
  riskLevel: RiskLevel
}

export function RiskGauge({ riskScore, riskLevel }: RiskGaugeProps) {
  const data = [
    { name: 'score', value: riskScore },
    { name: 'rest', value: 100 - riskScore },
  ]

  const gaugeColor =
    riskLevel === 'High' ? '#ef4444' : riskLevel === 'Medium' ? '#f59e0b' : '#10b981'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Score</CardTitle>
        <CardDescription>Composite severity from rain, wind, heat, and alerts</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-0">
        <div className="mx-auto h-10 w-full max-w-[140px] sm:h-11 lg:h-14 lg:max-w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="72%"
                outerRadius="100%"
                stroke="none"
              >
                <Cell fill={gaugeColor} />
                <Cell fill="#1e293b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-0.5 flex items-baseline gap-0.5 lg:mt-1">
          <span className={`text-xl font-bold leading-none lg:text-3xl ${riskColor(riskLevel)}`}>
            {riskScore}
          </span>
          <span className="text-[11px] text-slate-400 lg:text-sm">/ 100</span>
        </div>

        <Badge
          variant={
            riskLevel === 'High' ? 'danger' : riskLevel === 'Medium' ? 'warning' : 'success'
          }
          className="mt-1.5 px-2 py-0 text-[11px] lg:mt-2 lg:px-2.5 lg:text-sm"
        >
          {riskLevel} Risk
        </Badge>
      </CardContent>
    </Card>
  )
}
