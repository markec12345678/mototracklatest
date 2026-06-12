'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import {
  PieChart, Trophy, Clock, MapPin, Search, Route,
  Camera, Download, Target, Navigation, Ruler, Pencil,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMapStore } from '@/lib/map-store'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const ACHIEVEMENTS = [
  { id: 'explorer', name: 'Explorer', desc: 'Visit 10 different locations', icon: MapPin, target: 10, statKey: 'totalLocationsAdded' as const },
  { id: 'cartographer', name: 'Cartographer', desc: 'Create 5 routes', icon: Route, target: 5, statKey: 'totalRoutesCreated' as const },
  { id: 'surveyor', name: 'Surveyor', desc: 'Take 10 measurements', icon: Ruler, target: 10, statKey: 'totalMeasurements' as const },
  { id: 'navigator', name: 'Navigator', desc: 'Use directions 20 times', icon: Navigation, target: 20, statKey: 'totalSearches' as const },
  { id: 'photographer', name: 'Photographer', desc: 'Take 10 screenshots', icon: Camera, target: 10, statKey: 'totalScreenshots' as const },
  { id: 'night-owl', name: 'Night Owl', desc: 'Use the app after midnight', icon: Clock, target: 1, statKey: null },
  { id: 'globe-trotter', name: 'Globe Trotter', desc: 'View 5 different map styles', icon: Target, target: 5, statKey: 'totalStyleSwitches' as const },
]

const PIE_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#f97316']

export function MapUsageStats() {
  const usageStats = useMapStore((s) => s.usageStats)
  const usageStatsOpen = useMapStore((s) => s.usageStatsOpen)
  const setUsageStatsOpen = useMapStore((s) => s.setUsageStatsOpen)
  const sessionStartTime = useMapStore((s) => s.sessionStartTime)

  const [sessionDuration, setSessionDuration] = useState(0)
  const animRef = useRef<number>(0)

  // Session duration timer
  useEffect(() => {
    if (!usageStatsOpen) return
    const tick = () => {
      setSessionDuration(Date.now() - sessionStartTime)
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [usageStatsOpen, sessionStartTime])

  // Daily usage area chart data (last 30 days)
  const dailyUsageData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })
    return days.map((date) => ({
      date: date.slice(5),
      minutes: usageStats.dailyUsage[date] || 0,
    }))
  }, [usageStats.dailyUsage])

  // Feature usage pie chart data
  const featureUsageData = useMemo(() => {
    const features = [
      { name: 'Searches', value: usageStats.totalSearches },
      { name: 'Locations', value: usageStats.totalLocationsAdded },
      { name: 'Routes', value: usageStats.totalRoutesCreated },
      { name: 'Measurements', value: usageStats.totalMeasurements },
      { name: 'Screenshots', value: usageStats.totalScreenshots },
      { name: 'Style Switches', value: usageStats.totalStyleSwitches },
    ].filter((f) => f.value > 0)
    return features.length > 0 ? features : [{ name: 'No data', value: 1 }]
  }, [usageStats])

  // Tool usage bar chart data
  const toolUsageData = useMemo(() => {
    return Object.entries(usageStats.toolUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [usageStats.toolUsage])

  // Search terms top 10
  const topSearchTerms = useMemo(() => {
    return Object.entries(usageStats.searchTerms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }))
  }, [usageStats.searchTerms])

  const handleExport = () => {
    const data = JSON.stringify(usageStats, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `map-usage-stats-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={usageStatsOpen} onOpenChange={setUsageStatsOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-500" />
            Map Usage Statistics
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="session" className="text-xs">Session</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">Achievements</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          </TabsList>

          {/* Session Stats Tab */}
          <TabsContent value="session" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={<Clock className="h-4 w-4 text-emerald-500" />} label="Session Duration" value={formatDuration(sessionDuration)} />
              <StatCard icon={<MapPin className="h-4 w-4 text-red-500" />} label="Locations Added" value={String(usageStats.totalLocationsAdded)} />
              <StatCard icon={<Search className="h-4 w-4 text-amber-500" />} label="Searches" value={String(usageStats.totalSearches)} />
              <StatCard icon={<Route className="h-4 w-4 text-cyan-500" />} label="Routes Created" value={String(usageStats.totalRoutesCreated)} />
              <StatCard icon={<Ruler className="h-4 w-4 text-orange-500" />} label="Measurements" value={String(usageStats.totalMeasurements)} />
              <StatCard icon={<Camera className="h-4 w-4 text-purple-500" />} label="Screenshots" value={String(usageStats.totalScreenshots)} />
              <StatCard icon={<Target className="h-4 w-4 text-teal-500" />} label="Style Switches" value={String(usageStats.totalStyleSwitches)} />
              <StatCard icon={<Pencil className="h-4 w-4 text-pink-500" />} label="Total Sessions" value={String(usageStats.sessionCount)} />
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4 mt-3">
            {/* Daily Usage Area Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Daily Usage (Last 30 Days)</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyUsageData}>
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={6} />
                    <YAxis tick={{ fontSize: 9 }} width={30} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(value: number) => [`${value} min`, 'Usage']}
                    />
                    <Area type="monotone" dataKey="minutes" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Usage Pie Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Feature Usage Breakdown</h4>
              <div className="h-48 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <RPieChart>
                    <Pie data={featureUsageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={2} stroke="#fff">
                      {featureUsageData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </RPieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1 pl-2">
                  {featureUsageData.filter((f) => f.name !== 'No data').map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="truncate">{entry.name}</span>
                      <span className="text-muted-foreground ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tool Usage Bar Chart */}
            {toolUsageData.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Most Used Tools</h4>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={toolUsageData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 9 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} />
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Search Terms */}
            {topSearchTerms.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Top Search Terms</h4>
                <div className="flex flex-wrap gap-1.5">
                  {topSearchTerms.map((item, i) => {
                    const maxSize = 1 + (item.count / Math.max(...topSearchTerms.map((t) => t.count), 1)) * 0.6
                    return (
                      <Badge
                        key={item.term}
                        variant="secondary"
                        className="text-xs"
                        style={{ fontSize: `${maxSize * 11}px` }}
                      >
                        {item.term} ({item.count})
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-3 mt-3">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = usageStats.achievementsUnlocked.includes(ach.id)
              let current = 0
              if (ach.statKey) {
                current = usageStats[ach.statKey]
              } else if (ach.id === 'night-owl') {
                // Check if current hour is after midnight
                const hour = new Date().getHours()
                current = (hour >= 0 && hour < 5) ? 1 : 0
              }
              const progress = Math.min((current / ach.target) * 100, 100)
              const Icon = ach.icon

              return (
                <div
                  key={ach.id}
                  className={`rounded-xl border p-3 space-y-2 transition-all ${
                    isUnlocked
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/50 bg-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isUnlocked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {isUnlocked ? <Trophy className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {ach.name}
                        {isUnlocked && (
                          <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 h-4">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{ach.desc}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {Math.min(current, ach.target)}/{ach.target}
                    </span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )
            })}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4 mt-3">
            <div className="text-center space-y-4 py-6">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Download className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Export Usage Data</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Download all your usage statistics as a JSON file.
                </p>
              </div>
              <Button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
              <div className="text-[10px] text-muted-foreground">
                Includes: session stats, search terms, daily usage, tool usage, achievements
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-3 flex items-center gap-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-semibold tabular-nums">{value}</div>
        <div className="text-[10px] text-muted-foreground truncate">{label}</div>
      </div>
    </div>
  )
}
