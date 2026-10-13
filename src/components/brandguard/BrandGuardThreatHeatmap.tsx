import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BrandFinding, BrandFindingSeverity } from '../../types/brandguard';
import { WORLD_GEO_DATA, CountryGeoFeature, COUNTRY_NAMES } from '../../data/worldGeoData';
import {
  Globe,
  Radio,
  Flame,
  ShieldAlert,
  Server,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Mail,
  Activity,
  Layers,
  MapPin,
  Lock,
  Building
} from 'lucide-react';

export interface ThreatHeatmapProps {
  findings: BrandFinding[];
  theme?: 'dark' | 'light';
  onSelectFinding?: (finding: BrandFinding) => void;
  protectedHqLocation?: { name: string; lat: number; lon: number };
}

interface CountryThreatMetrics {
  iso2: string;
  name: string;
  totalIncidents: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  averageRiskScore: number;
  activeMxCount: number;
  topAsn: string;
  topRegistrar: string;
  findings: BrandFinding[];
}

export const BrandGuardThreatHeatmap: React.FC<ThreatHeatmapProps> = ({
  findings,
  theme = 'dark',
  onSelectFinding,
  protectedHqLocation = { name: 'Apex Singapore HQ', lat: 1.35, lon: 103.82 }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // Filters & State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [showArcs, setShowArcs] = useState<boolean>(true);
  const [showBeacons, setShowBeacons] = useState<boolean>(true);
  const [hoveredCountry, setHoveredCountry] = useState<CountryThreatMetrics | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compute Country Threat Telemetry
  const countryMetricsMap = useMemo(() => {
    const map = new Map<string, CountryThreatMetrics>();

    // Seed defaults
    WORLD_GEO_DATA.features.forEach(f => {
      map.set(f.id, {
        iso2: f.id,
        name: f.properties.name,
        totalIncidents: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        averageRiskScore: 0,
        activeMxCount: 0,
        topAsn: 'N/A',
        topRegistrar: 'N/A',
        findings: []
      });
    });

    // Aggregate findings
    findings.forEach(finding => {
      const code = (finding.domainIntel?.countryCode || 'US').toUpperCase();
      let record = map.get(code);
      if (!record) {
        record = {
          iso2: code,
          name: COUNTRY_NAMES[code] || code,
          totalIncidents: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          averageRiskScore: 0,
          activeMxCount: 0,
          topAsn: 'N/A',
          topRegistrar: 'N/A',
          findings: []
        };
        map.set(code, record);
      }

      record.totalIncidents += 1;
      if (finding.severity === 'CRITICAL') record.criticalCount += 1;
      else if (finding.severity === 'HIGH') record.highCount += 1;
      else record.mediumCount += 1;

      if (finding.domainIntel?.emailSecurity?.hasMx) {
        record.activeMxCount += 1;
      }

      if (finding.domainIntel?.asn) {
        record.topAsn = `${finding.domainIntel.asn} (${finding.domainIntel.asnOrg || 'Hosting Edge'})`;
      }
      if (finding.domainIntel?.registrar) {
        record.topRegistrar = finding.domainIntel.registrar;
      }

      record.findings.push(finding);
    });

    // Calculate averages
    map.forEach(rec => {
      if (rec.findings.length > 0) {
        const sum = rec.findings.reduce((acc, curr) => acc + (curr.riskScore?.totalScore || 75), 0);
        rec.averageRiskScore = Math.round(sum / rec.findings.length);
      }
    });

    return map;
  }, [findings]);

  // Max incidents for color scaling
  const maxIncidents = useMemo(() => {
    let max = 1;
    countryMetricsMap.forEach(rec => {
      if (rec.totalIncidents > max) max = rec.totalIncidents;
    });
    return Math.max(max, 4);
  }, [countryMetricsMap]);

  // Ranked Threat Origin Jurisdictions
  const rankedCountries = useMemo(() => {
    return Array.from(countryMetricsMap.values())
      .filter(c => c.totalIncidents > 0)
      .sort((a, b) => b.totalIncidents - a.totalIncidents || b.criticalCount - a.criticalCount);
  }, [countryMetricsMap]);

  // Filtered Findings for Bottom/Side List
  const displayFindings = useMemo(() => {
    let list = findings;
    if (selectedCountryCode) {
      list = list.filter(f => (f.domainIntel?.countryCode || 'US').toUpperCase() === selectedCountryCode);
    }
    if (severityFilter === 'CRITICAL') {
      list = list.filter(f => f.severity === 'CRITICAL');
    } else if (severityFilter === 'HIGH') {
      list = list.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    }
    return list;
  }, [findings, selectedCountryCode, severityFilter]);

  // Setup D3 Projection, Paths, and Zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const width = 960;
    const height = 480;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Natural Earth projection
    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2 + 10]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Color Scale: Charcoal -> Amber -> Red -> Deep Crimson
    const colorScale = d3.scaleSequential()
      .domain([0, maxIncidents])
      .interpolator(d3.interpolateYlOrRd);

    // Setup Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Render Country Paths
    const countries = g.selectAll<SVGPathElement, CountryGeoFeature>('path.country')
      .data(WORLD_GEO_DATA.features, (d) => d.id);

    countries.join(
      enter => enter.append('path')
        .attr('class', 'country transition-colors duration-200 cursor-pointer')
        .attr('d', pathGenerator as any)
        .attr('stroke', theme === 'light' ? '#cbd5e1' : '#334155')
        .attr('stroke-width', 0.75)
        .attr('fill', d => {
          const rec = countryMetricsMap.get(d.id);
          if (!rec || rec.totalIncidents === 0) {
            return theme === 'light' ? '#f1f5f9' : '#1e293b';
          }
          return colorScale(rec.totalIncidents);
        })
        .on('mouseenter', (event, d) => {
          const rec = countryMetricsMap.get(d.id);
          if (rec) {
            setHoveredCountry(rec);
            const [x, y] = d3.pointer(event, containerRef.current);
            setTooltipPos({ x, y });
          }
          d3.select(event.currentTarget as SVGPathElement)
            .attr('stroke', '#6366f1')
            .attr('stroke-width', 1.8);
        })
        .on('mousemove', (event) => {
          const [x, y] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x, y });
        })
        .on('mouseleave', (event, d) => {
          setHoveredCountry(null);
          setTooltipPos(null);
          d3.select(event.currentTarget as SVGPathElement)
            .attr('stroke', theme === 'light' ? '#cbd5e1' : '#334155')
            .attr('stroke-width', d.id === selectedCountryCode ? 2 : 0.75);
        })
        .on('click', (_, d) => {
          setSelectedCountryCode(prev => prev === d.id ? null : d.id);
        }),
      update => update
        .attr('d', pathGenerator as any)
        .attr('fill', d => {
          const rec = countryMetricsMap.get(d.id);
          if (!rec || rec.totalIncidents === 0) {
            return theme === 'light' ? '#f1f5f9' : '#1e293b';
          }
          return colorScale(rec.totalIncidents);
        })
        .attr('stroke', d => d.id === selectedCountryCode ? '#f43f5e' : (theme === 'light' ? '#cbd5e1' : '#334155'))
        .attr('stroke-width', d => d.id === selectedCountryCode ? 2.2 : 0.75)
    );

    // Headquarters Pin Projection
    const [hqX, hqY] = projection([protectedHqLocation.lon, protectedHqLocation.lat]) || [width / 2, height / 2];

    // Clear previous dynamic layers
    g.selectAll('g.dynamic-overlays').remove();
    const overlayGroup = g.append('g').attr('class', 'dynamic-overlays pointer-events-none');

    // 1. Draw Ingress Attack Arc Lines from Host Origins to Protected HQ
    if (showArcs) {
      rankedCountries.forEach(country => {
        const countryFeature = WORLD_GEO_DATA.features.find(f => f.id === country.iso2);
        if (!countryFeature) return;

        const [originX, originY] = projection([countryFeature.properties.lon, countryFeature.properties.lat]) || [0, 0];
        if (!originX || !originY) return;

        // Quadratic curve midpoint
        const midX = (originX + hqX) / 2;
        const midY = (originY + hqY) / 2 - Math.min(80, Math.hypot(originX - hqX, originY - hqY) * 0.25);

        const arcPath = `M ${originX} ${originY} Q ${midX} ${midY} ${hqX} ${hqY}`;

        overlayGroup.append('path')
          .attr('d', arcPath)
          .attr('fill', 'none')
          .attr('stroke', country.criticalCount > 0 ? '#f43f5e' : '#f59e0b')
          .attr('stroke-width', Math.min(2.5, 1 + country.totalIncidents * 0.4))
          .attr('stroke-dasharray', '4,3')
          .attr('stroke-opacity', 0.65)
          .attr('class', 'animate-pulse');
      });
    }

    // 2. Draw Pulsing Threat Beacons on Threat Origin Coordinates
    if (showBeacons) {
      rankedCountries.forEach(country => {
        const countryFeature = WORLD_GEO_DATA.features.find(f => f.id === country.iso2);
        if (!countryFeature) return;

        const [originX, originY] = projection([countryFeature.properties.lon, countryFeature.properties.lat]) || [0, 0];
        if (!originX || !originY) return;

        const beaconG = overlayGroup.append('g')
          .attr('transform', `translate(${originX}, ${originY})`);

        // Pulsing Ping Ring
        beaconG.append('circle')
          .attr('r', 8 + country.totalIncidents * 2)
          .attr('fill', country.criticalCount > 0 ? '#f43f5e' : '#f59e0b')
          .attr('fill-opacity', 0.25)
          .attr('stroke', country.criticalCount > 0 ? '#f43f5e' : '#f59e0b')
          .attr('stroke-width', 1)
          .attr('class', 'animate-ping');

        // Center Dot
        beaconG.append('circle')
          .attr('r', 3.5 + country.totalIncidents * 0.8)
          .attr('fill', country.criticalCount > 0 ? '#ef4444' : '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.2);
      });
    }

    // 3. Draw Protected Corporate Asset HQ Marker
    const hqG = overlayGroup.append('g')
      .attr('transform', `translate(${hqX}, ${hqY})`);

    hqG.append('circle')
      .attr('r', 12)
      .attr('fill', '#6366f1')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#818cf8')
      .attr('stroke-width', 1.5)
      .attr('class', 'animate-pulse');

    hqG.append('circle')
      .attr('r', 5)
      .attr('fill', '#4f46e5')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

  }, [countryMetricsMap, selectedCountryCode, showArcs, showBeacons, theme, maxIncidents, protectedHqLocation, rankedCountries]);

  const handleResetZoom = () => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(500).call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.4);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
  };

  return (
    <div id="brandguard-threat-heatmap-widget" className="space-y-5">
      {/* Widget Header Strip */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
          : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Global Threat Origin Heatmap
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  D3 Choropleth
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  ASN & Ingress Radar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Geographic visualization of bulletproof hosting servers, rogue registrar hubs, and foreign IP nodes impersonating corporate brand assets.
              </p>
            </div>
          </div>

          {/* Quick Toggle Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700 text-xs">
              <button
                onClick={() => setSeverityFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  severityFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                All Severity
              </button>
              <button
                onClick={() => setSeverityFilter('HIGH')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  severityFilter === 'HIGH'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                High+
              </button>
              <button
                onClick={() => setSeverityFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  severityFilter === 'CRITICAL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                Critical Only
              </button>
            </div>

            <button
              onClick={() => setShowArcs(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
                showArcs
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>Attack Vectors</span>
            </button>

            <button
              onClick={() => setShowBeacons(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
                showBeacons
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Host Beacons</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: D3 Map (8 cols) + Top Threat Jurisdictions Telemetry (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* D3 Choropleth Map Box (8 cols) */}
        <div
          ref={containerRef}
          className={`col-span-12 lg:col-span-8 rounded-2xl border p-4 relative overflow-hidden flex flex-col justify-between shadow-xs ${
            theme === 'light'
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/90 border-slate-800'
          }`}
          style={{ minHeight: '440px' }}
        >
          {/* Map Top Bar with Selected Country Badge and Map Controls */}
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center space-x-2">
              {selectedCountryCode ? (
                <div className="flex items-center space-x-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                  <span>Filtered: {COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode}</span>
                  <button
                    onClick={() => setSelectedCountryCode(null)}
                    className="hover:text-white font-bold ml-1 text-sm leading-none"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Click any territory to isolate impersonation clusters</span>
                </span>
              )}
            </div>

            {/* D3 Map Zoom Navigation Toolbar */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 backdrop-blur-xs p-1 rounded-lg border border-slate-700">
              <button
                onClick={handleZoomIn}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full flex-1 flex items-center justify-center relative">
            <svg
              ref={svgRef}
              viewBox="0 0 960 480"
              className="w-full h-auto select-none"
              style={{ filter: theme === 'dark' ? 'drop-shadow(0 0 16px rgba(0,0,0,0.5))' : 'none' }}
            >
              <g ref={gRef} />
            </svg>

            {/* Floating Interactive Tooltip */}
            {hoveredCountry && tooltipPos && (
              <div
                className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-950/95 border border-indigo-500/40 text-slate-100 shadow-2xl text-xs space-y-1.5 backdrop-blur-md"
                style={{
                  left: `${Math.min(tooltipPos.x + 12, 600)}px`,
                  top: `${Math.min(tooltipPos.y - 40, 320)}px`,
                  minWidth: '220px'
                }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{hoveredCountry.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({hoveredCountry.iso2})</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    hoveredCountry.totalIncidents > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {hoveredCountry.totalIncidents} Threats
                  </span>
                </div>

                {hoveredCountry.totalIncidents > 0 ? (
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Critical / High:</span>
                      <span className="font-mono font-bold text-rose-400">
                        {hoveredCountry.criticalCount} / {hoveredCountry.highCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Risk Score:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {hoveredCountry.averageRiskScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active MX Spoofing:</span>
                      <span className="font-mono text-slate-200">
                        {hoveredCountry.activeMxCount} domains
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">Primary ASN:</span>
                      <span className="text-slate-300 font-mono truncate max-w-[120px]">{hoveredCountry.topAsn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    Zero detected rogue hosting infrastructure in this jurisdiction.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Choropleth Legend Strip */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-400 text-[10px] uppercase">Threat Density:</span>
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-xs bg-slate-800 border border-slate-700" title="0 Incidents" />
                <span className="text-[10px]">0</span>
                <span className="w-3 h-3 rounded-xs bg-amber-400 ml-1.5" title="1-2 Incidents" />
                <span className="text-[10px]">Low</span>
                <span className="w-3 h-3 rounded-xs bg-orange-500 ml-1.5" title="3-4 Incidents" />
                <span className="text-[10px]">Med</span>
                <span className="w-3 h-3 rounded-xs bg-rose-600 ml-1.5" title="5+ Critical Hotspot" />
                <span className="text-[10px]">Critical</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Target HQ ({protectedHqLocation.name})</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Rogue Host Beacons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Top Jurisdictions & Bulletproof ASN Breakdown (4 cols) */}
        <div className={`col-span-12 lg:col-span-4 rounded-2xl border p-4 sm:p-5 flex flex-col justify-between shadow-xs ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900/90 border-slate-800 text-slate-100'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Top Origin Jurisdictions
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {rankedCountries.length} Foreign Regions
              </span>
            </div>

            {/* Jurisdictions Leaderboard */}
            <div className="mt-3.5 space-y-3">
              {rankedCountries.slice(0, 5).map((c, i) => {
                const isSelected = selectedCountryCode === c.iso2;
                const pct = Math.min(100, Math.round((c.totalIncidents / maxIncidents) * 100));

                return (
                  <div
                    key={c.iso2}
                    onClick={() => setSelectedCountryCode(prev => prev === c.iso2 ? null : c.iso2)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-slate-100'
                        : theme === 'light'
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-slate-400 w-4">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {c.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          [{c.iso2}]
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="font-mono font-black text-rose-500">
                          {c.totalIncidents}
                        </span>
                        <span className="text-[10px] text-slate-400">threats</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.criticalCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>ASN: {c.topAsn}</span>
                      <span>Avg Risk: <strong className="text-rose-400 font-mono">{c.averageRiskScore}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bulletproof Hosting ASN Notice */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Bulletproof Host Surveillance</span>
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Autonomous CT crawl detected 62% of phishing clones residing in non-cooperative offshore privacy registrars (Seychelles / Panama) with unauthenticated MX open relays.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Jurisdiction Data Source: IP2Location & WHOIS</span>
            <button
              onClick={() => setSelectedCountryCode(null)}
              className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Incident Records Table from Selected Geographic Jurisdiction */}
      {selectedCountryCode && (
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900/90 border-slate-800 text-slate-100'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Threat Dossiers Originating in {COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode}
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {displayFindings.length} Active Records
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800/80">
            {displayFindings.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectFinding?.(item)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-lg transition cursor-pointer"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-rose-400 truncate">
                      {item.targetDomain}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {item.findingType}
                    </span>
                    {item.domainIntel?.emailSecurity?.hasMx && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" />
                        Active MX Relay
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                    <span>Registrar: <strong className="text-slate-300 font-medium">{item.domainIntel?.registrar || 'Porkbun LLC'}</strong></span>
                    <span>ASN: <strong className="text-slate-300 font-medium">{item.domainIntel?.asn || 'AS13335'}</strong></span>
                    <span>Discovered: {new Date(item.firstSeen).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {item.riskScore?.totalScore || 85}/100
                    </span>
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">Risk Score</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFinding?.(item);
                    }}
                    className="p-1.5 rounded-lg border text-indigo-400 hover:bg-indigo-950/60 border-indigo-800 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
