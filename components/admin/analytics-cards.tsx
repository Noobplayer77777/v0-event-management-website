"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface AnalyticsCardsProps {
  totalEvents: number
  approvedEvents: number
  pendingEvents: number
  totalRegistrations: number
  totalUsers: number
}

export function AnalyticsCards({
  totalEvents,
  approvedEvents,
  pendingEvents,
  totalRegistrations,
  totalUsers,
}: AnalyticsCardsProps) {
  const rejectedEvents = totalEvents - approvedEvents - pendingEvents

  const eventStatusData = [
    { name: "Approved", value: approvedEvents, color: "#22c55e" },
    { name: "Pending", value: pendingEvents, color: "#f59e0b" },
    { name: "Rejected", value: rejectedEvents, color: "#ef4444" },
  ]

  const overviewData = [
    { name: "Events", value: totalEvents },
    { name: "Registrations", value: totalRegistrations },
    { name: "Users", value: totalUsers },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Status Distribution</CardTitle>
          <CardDescription>Breakdown of events by approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              approved: { label: "Approved", color: "#22c55e" },
              pending: { label: "Pending", color: "#f59e0b" },
              rejected: { label: "Rejected", color: "#ef4444" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Count", color: "hsl(var(--primary))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">{totalEvents}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{approvedEvents}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-4 bg-amber-500/10 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{pendingEvents}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">{totalRegistrations}</p>
              <p className="text-sm text-muted-foreground">Registrations</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
