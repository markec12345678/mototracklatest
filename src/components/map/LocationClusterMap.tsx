'use client'

import { useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Boxes,
  ScatterChart,
  ZoomIn,
  Download,
} from 'lucide-react'
import { useMapStore, type ClusterInfo, type SavedLocation } from '@/lib/map-store'
import { toast } from 'sonner'

const CLUSTER_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
]

/** Haversine distance in km between two lat/lng points */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** K-Means clustering implementation */
function kMeansClustering(
  locations: SavedLocation[],
  k: number
): { assignments: number[]; centroids: [number, number][] } {
  if (locations.length === 0) return { assignments: [], centroids: [] }
  const n = locations.length
  const effectiveK = Math.min(k, n)

  // Initialize centroids using k-means++ strategy
  const centroids: [number, number][] = []
  const idx0 = Math.floor(Math.random() * n)
  centroids.push([locations[idx0].longitude, locations[idx0].latitude])

  for (let c = 1; c < effectiveK; c++) {
    const distances = locations.map((loc) => {
      const minDist = Math.min(
        ...centroids.map((cent) =>
          haversineDistance(loc.latitude, loc.longitude, cent[1], cent[0]) ** 2
        )
      )
      return minDist
    })
    const totalDist = distances.reduce((a, b) => a + b, 0)
    let r = Math.random() * totalDist
    for (let i = 0; i < n; i++) {
      r -= distances[i]
      if (r <= 0) {
        centroids.push([locations[i].longitude, locations[i].latitude])
        break
      }
    }
    if (centroids.length <= c) {
      centroids.push([locations[c].longitude, locations[c].latitude])
    }
  }

  const assignments = new Array(n).fill(0)
  const maxIter = 100

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false

    // Assign each point to nearest centroid
    for (let i = 0; i < n; i++) {
      let minDist = Infinity
      let minIdx = 0
      for (let j = 0; j < effectiveK; j++) {
        const d = haversineDistance(
          locations[i].latitude, locations[i].longitude,
          centroids[j][1], centroids[j][0]
        )
        if (d < minDist) {
          minDist = d
          minIdx = j
        }
      }
      if (assignments[i] !== minIdx) {
        assignments[i] = minIdx
        changed = true
      }
    }

    if (!changed) break

    // Update centroids
    for (let j = 0; j < effectiveK; j++) {
      const members = locations.filter((_, i) => assignments[i] === j)
      if (members.length === 0) continue
      const avgLng = members.reduce((s, l) => s + l.longitude, 0) / members.length
      const avgLat = members.reduce((s, l) => s + l.latitude, 0) / members.length
      centroids[j] = [avgLng, avgLat]
    }
  }

  return { assignments, centroids }
}

/** DBSCAN clustering implementation */
function dbscanClustering(
  locations: SavedLocation[],
  epsilon: number, // km
  minPts: number
): { assignments: number[] } {
  const n = locations.length
  const assignments = new Array(n).fill(-1) // -1 = noise
  let clusterId = 0

  // Precompute distance matrix
  const distMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistance(
        locations[i].latitude, locations[i].longitude,
        locations[j].latitude, locations[j].longitude
      )
      distMatrix[i][j] = d
      distMatrix[j][i] = d
    }
  }

  function regionQuery(p: number): number[] {
    const neighbors: number[] = []
    for (let i = 0; i < n; i++) {
      if (distMatrix[p][i] <= epsilon) {
        neighbors.push(i)
      }
    }
    return neighbors
  }

  const visited = new Array(n).fill(false)

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue
    visited[i] = true
    const neighbors = regionQuery(i)

    if (neighbors.length < minPts) {
      assignments[i] = -1 // noise
      continue
    }

    assignments[i] = clusterId
    const seeds = [...neighbors.filter((ni) => ni !== i)]

    let idx = 0
    while (idx < seeds.length) {
      const q = seeds[idx]
      idx++

      if (!visited[q]) {
        visited[q] = true
        const qNeighbors = regionQuery(q)
        if (qNeighbors.length >= minPts) {
          for (const nn of qNeighbors) {
            if (!seeds.includes(nn)) {
              seeds.push(nn)
            }
          }
        }
      }

      if (assignments[q] === -1 || assignments[q] === -1) {
        assignments[q] = clusterId
      }
    }

    clusterId++
  }

  return { assignments }
}

/** Calculate silhouette score */
function calculateSilhouette(
  locations: SavedLocation[],
  assignments: number[]
): number {
  const n = locations.length
  if (n <= 1) return 0

  const uniqueClusters = [...new Set(assignments.filter((a) => a >= 0))]
  if (uniqueClusters.length <= 1) return 0

  const silhouettes: number[] = []

  for (let i = 0; i < n; i++) {
    const ci = assignments[i]
    if (ci < 0) continue

    // Average distance to same cluster
    const sameCluster = locations
      .map((_, j) => j)
      .filter((j) => assignments[j] === ci && j !== i)
    if (sameCluster.length === 0) {
      silhouettes.push(0)
      continue
    }

    const a =
      sameCluster.reduce(
        (sum, j) =>
          sum + haversineDistance(
            locations[i].latitude, locations[i].longitude,
            locations[j].latitude, locations[j].longitude
          ),
        0
      ) / sameCluster.length

    // Minimum average distance to other clusters
    let minB = Infinity
    for (const otherC of uniqueClusters) {
      if (otherC === ci) continue
      const otherMembers = locations
        .map((_, j) => j)
        .filter((j) => assignments[j] === otherC)
      if (otherMembers.length === 0) continue
      const avgDist =
        otherMembers.reduce(
          (sum, j) =>
            sum + haversineDistance(
              locations[i].latitude, locations[i].longitude,
              locations[j].latitude, locations[j].longitude
            ),
          0
        ) / otherMembers.length
      if (avgDist < minB) minB = avgDist
    }

    if (minB === Infinity) {
      silhouettes.push(0)
    } else {
      silhouettes.push((minB - a) / Math.max(a, minB))
    }
  }

  return silhouettes.length > 0
    ? silhouettes.reduce((a, b) => a + b, 0) / silhouettes.length
    : 0
}

export function LocationClusterMap() {
  const clusteringOpen = useMapStore((s) => s.clusteringOpen)
  const setClusteringOpen = useMapStore((s) => s.setClusteringOpen)
  const clusteringState = useMapStore((s) => s.clusteringState)
  const setClusteringState = useMapStore((s) => s.setClusteringState)
  const savedLocations = useMapStore((s) => s.savedLocations)

  const mapLayerIdsRef = useRef<string[]>([])

  const clearMapLayers = useCallback(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    for (const id of mapLayerIdsRef.current) {
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    }
    mapLayerIdsRef.current = []
  }, [])

  const renderClustersOnMap = useCallback(
    (clusters: ClusterInfo[]) => {
      if (typeof window === 'undefined') return
      const map = (window as any).__mainMap
      if (!map) return

      clearMapLayers()

      for (const cluster of clusters) {
        const sourceId = `cluster-source-${cluster.id}`
        const layerId = `cluster-layer-${cluster.id}`
        const centerSourceId = `cluster-center-source-${cluster.id}`
        const centerLayerId = `cluster-center-layer-${cluster.id}`

        // Find locations for this cluster
        const clusterLocations = savedLocations.filter((l) =>
          cluster.locationIds.includes(l.id)
        )

        // Add cluster points source
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: clusterLocations.map((loc) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude],
              },
              properties: { name: loc.name, clusterId: cluster.id },
            })),
          },
        })

        // Add cluster points layer (circles)
        map.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': 8,
            'circle-color': cluster.color,
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })

        // Add center marker source
        map.addSource(centerSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: cluster.center,
                },
                properties: { label: `Cluster ${cluster.id + 1}` },
              },
            ],
          },
        })

        // Add center marker layer (larger circle with symbol)
        map.addLayer({
          id: centerLayerId,
          type: 'symbol',
          source: centerSourceId,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 12,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': cluster.color,
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        })

        mapLayerIdsRef.current.push(layerId, centerLayerId)
        mapLayerIdsRef.current.push(sourceId, centerSourceId)
      }
    },
    [savedLocations, clearMapLayers]
  )

  const runClustering = useCallback(() => {
    if (savedLocations.length < 2) {
      toast.error('Need at least 2 saved locations to cluster')
      return
    }

    let assignments: number[]
    let centroids: [number, number][] | undefined

    if (clusteringState.algorithm === 'kmeans') {
      const result = kMeansClustering(savedLocations, clusteringState.k)
      assignments = result.assignments
      centroids = result.centroids
    } else {
      const result = dbscanClustering(
        savedLocations,
        clusteringState.epsilon,
        clusteringState.minPoints
      )
      assignments = result.assignments
      // Compute centroids for DBSCAN clusters
      const uniqueClusters = [...new Set(assignments.filter((a) => a >= 0))].sort()
      centroids = uniqueClusters.map((cid) => {
        const members = savedLocations.filter((_, i) => assignments[i] === cid)
        const avgLng = members.reduce((s, l) => s + l.longitude, 0) / members.length
        const avgLat = members.reduce((s, l) => s + l.latitude, 0) / members.length
        return [avgLng, avgLat] as [number, number]
      })
    }

    // Build cluster info
    const uniqueClusterIds = [...new Set(assignments.filter((a) => a >= 0))].sort()
    const clusters: ClusterInfo[] = uniqueClusterIds.map((cid, idx) => {
      const memberIndices = assignments
        .map((a, i) => (a === cid ? i : -1))
        .filter((i) => i >= 0)
      const members = memberIndices.map((i) => savedLocations[i])
      const center = centroids?.[idx] ?? [0, 0] as [number, number]

      // Compute radius (max distance from center to any member)
      let maxDist = 0
      for (const m of members) {
        const d = haversineDistance(m.latitude, m.longitude, center[1], center[0])
        if (d > maxDist) maxDist = d
      }

      return {
        id: idx,
        center,
        pointCount: members.length,
        color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
        locationIds: members.map((m) => m.id),
        radius: maxDist,
      }
    })

    const silhouetteScore = calculateSilhouette(savedLocations, assignments)

    setClusteringState({ clusters, silhouetteScore })
    renderClustersOnMap(clusters)
    toast.success(`Found ${clusters.length} clusters (silhouette: ${silhouetteScore.toFixed(3)})`)
  }, [savedLocations, clusteringState, setClusteringState, renderClustersOnMap])

  const handleZoomToCluster = useCallback(
    (cluster: ClusterInfo) => {
      if (typeof window === 'undefined') return
      const map = (window as any).__mainMap
      if (!map) return

      if (cluster.locationIds.length === 1) {
        map.flyTo({ center: cluster.center, zoom: 14 })
      } else {
        const clusterLocations = savedLocations.filter((l) =>
          cluster.locationIds.includes(l.id)
        )
        if (clusterLocations.length === 0) return
        const lats = clusterLocations.map((l) => l.latitude)
        const lngs = clusterLocations.map((l) => l.longitude)
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 80, maxZoom: 16 }
        )
      }
    },
    [savedLocations]
  )

  const handleExportGeoJSON = useCallback(() => {
    if (clusteringState.clusters.length === 0) {
      toast.error('No clusters to export. Run clustering first.')
      return
    }

    const features = clusteringState.clusters.flatMap((cluster) =>
      cluster.locationIds
        .map((id) => savedLocations.find((l) => l.id === id))
        .filter(Boolean)
        .map((loc) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [loc!.longitude, loc!.latitude] as [number, number],
          },
          properties: {
            name: loc!.name,
            clusterId: cluster.id,
            clusterColor: cluster.color,
          },
        }))
    )

    const geojson = {
      type: 'FeatureCollection' as const,
      features,
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cluster-assignments.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Cluster assignments exported as GeoJSON')
  }, [clusteringState.clusters, savedLocations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMapLayers()
    }
  }, [clearMapLayers])

  // Re-render clusters when dialog opens
  useEffect(() => {
    if (clusteringOpen && clusteringState.clusters.length > 0) {
      // Small delay to ensure map is ready
      const timer = setTimeout(() => {
        renderClustersOnMap(clusteringState.clusters)
      }, 100)
      return () => clearTimeout(timer)
    }
    if (!clusteringOpen) {
      clearMapLayers()
    }
  }, [clusteringOpen])

  return (
    <Dialog open={clusteringOpen} onOpenChange={setClusteringOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-emerald-500" />
            Location Clustering Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Algorithm Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Algorithm</label>
            <Select
              value={clusteringState.algorithm}
              onValueChange={(val: 'kmeans' | 'dbscan') =>
                setClusteringState({ algorithm: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kmeans">K-Means</SelectItem>
                <SelectItem value="dbscan">DBSCAN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* K-Means Parameters */}
          {clusteringState.algorithm === 'kmeans' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Number of Clusters (K)</label>
                <Badge variant="secondary">{clusteringState.k}</Badge>
              </div>
              <Slider
                value={[clusteringState.k]}
                onValueChange={([val]) => setClusteringState({ k: val })}
                min={2}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2</span>
                <span>10</span>
              </div>
            </div>
          )}

          {/* DBSCAN Parameters */}
          {clusteringState.algorithm === 'dbscan' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Epsilon (km)</label>
                  <Badge variant="secondary">{clusteringState.epsilon} km</Badge>
                </div>
                <Slider
                  value={[clusteringState.epsilon]}
                  onValueChange={([val]) => setClusteringState({ epsilon: val })}
                  min={1}
                  max={500}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 km</span>
                  <span>500 km</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Min Points</label>
                  <Badge variant="secondary">{clusteringState.minPoints}</Badge>
                </div>
                <Slider
                  value={[clusteringState.minPoints]}
                  onValueChange={([val]) => setClusteringState({ minPoints: val })}
                  min={2}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>10</span>
                </div>
              </div>
            </>
          )}

          {/* Run Button */}
          <Button
            onClick={runClustering}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ScatterChart className="h-4 w-4 mr-2" />
            Run Clustering
          </Button>

          {/* Results */}
          {clusteringState.clusters.length > 0 && (
            <div className="space-y-3">
              {/* Silhouette Score */}
              {clusteringState.silhouetteScore !== null && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Silhouette Score</span>
                    <Badge
                      variant={
                        clusteringState.silhouetteScore > 0.5
                          ? 'default'
                          : clusteringState.silhouetteScore > 0.25
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {clusteringState.silhouetteScore.toFixed(3)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clusteringState.silhouetteScore > 0.5
                      ? 'Well-defined clusters'
                      : clusteringState.silhouetteScore > 0.25
                        ? 'Moderate cluster structure'
                        : 'Weak cluster structure - consider adjusting parameters'}
                  </p>
                </div>
              )}

              {/* Cluster List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Clusters</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {clusteringState.clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      className="rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cluster.color }}
                          />
                          <span className="text-sm font-medium">
                            Cluster {cluster.id + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {cluster.pointCount} pts
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleZoomToCluster(cluster)}
                            title="Zoom to cluster"
                          >
                            <ZoomIn className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>
                          Center: {cluster.center[1].toFixed(4)}, {cluster.center[0].toFixed(4)}
                        </div>
                        <div>Radius: {cluster.radius.toFixed(2)} km</div>
                        {cluster.pointCount > 1 && (
                          <div>
                            Avg distance:{' '}
                            {(
                              cluster.locationIds
                                .map((id) =>
                                  savedLocations.find((l) => l.id === id)
                                )
                                .filter(Boolean)
                                .reduce((sum, loc) => {
                                  return (
                                    sum +
                                    haversineDistance(
                                      loc!.latitude,
                                      loc!.longitude,
                                      cluster.center[1],
                                      cluster.center[0]
                                    )
                                  )
                                }, 0) / cluster.pointCount
                            ).toFixed(2)}{' '}
                            km
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleExportGeoJSON}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as GeoJSON
              </Button>
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <ScatterChart className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>K-Means</strong> groups locations into K clusters by minimizing
                within-cluster distances. <strong>DBSCAN</strong> finds
                density-based clusters of arbitrary shape. Both algorithms are
                implemented without external libraries.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
