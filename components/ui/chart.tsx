"use client"

import * as React from "react"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Bar } from "@visx/shape"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip"
import { localPoint } from "@visx/event"
import { LegendOrdinal } from "@visx/legend"
import { LinePath } from "@visx/shape"
import { curveMonotoneX } from "@visx/curve"
import { Pie } from "@visx/shape"
import { Text } from "@visx/text"

// Bar Chart
export function BarChart({
  data,
  categories,
  index,
  colors,
  valueFormatter,
  showLegend = true,
  height = 300,
  width = 500,
}) {
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  // Scales
  const xScale = scaleBand({
    domain: data.map((d) => d[index]),
    padding: 0.3,
  })

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map((d) => Math.max(...categories.map((c) => d[c]))))],
    nice: true,
  })

  const colorScale = scaleOrdinal({
    domain: categories,
    range: colors,
  })

  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "white",
    color: "black",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  }

  // Responsive sizing
  const [size, setSize] = React.useState({ width: 0, height })
  const containerRef2 = React.useRef(null)

  React.useEffect(() => {
    if (containerRef2.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSize({
            width: entry.contentRect.width,
            height,
          })
        }
      })

      resizeObserver.observe(containerRef2.current)
      return () => resizeObserver.disconnect()
    }
  }, [height])

  // Dimensions
  const innerWidth = size.width - margin.left - margin.right
  const innerHeight = size.height - margin.top - margin.bottom

  // Update scales
  xScale.rangeRound([0, innerWidth])
  yScale.range([innerHeight, 0])

  return (
    <div ref={containerRef2} style={{ width: "100%", height: "100%" }}>
      {size.width > 0 && (
        <>
          <svg width={size.width} height={size.height} ref={containerRef}>
            <Group left={margin.left} top={margin.top}>
              {/* Bars */}
              {data.map((d, i) => {
                const barWidth = xScale.bandwidth() / categories.length

                return categories.map((category, j) => {
                  const barHeight = innerHeight - yScale(d[category])
                  const barX = xScale(d[index]) + j * barWidth
                  const barY = innerHeight - barHeight

                  return (
                    <Bar
                      key={`bar-${i}-${j}`}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={colorScale(category)}
                      onMouseMove={(event) => {
                        const point = localPoint(event)
                        showTooltip({
                          tooltipData: {
                            category,
                            value: d[category],
                            label: d[index],
                          },
                          tooltipLeft: point.x,
                          tooltipTop: point.y,
                        })
                      }}
                      onMouseLeave={() => hideTooltip()}
                    />
                  )
                })
              })}

              {/* Axes */}
              <AxisBottom
                top={innerHeight}
                scale={xScale}
                tickFormat={(d) => d}
                stroke="#ccc"
                tickStroke="#ccc"
                tickLabelProps={() => ({
                  fill: "#666",
                  fontSize: 12,
                  textAnchor: "middle",
                })}
              />

              <AxisLeft
                scale={yScale}
                stroke="#ccc"
                tickStroke="#ccc"
                tickLabelProps={() => ({
                  fill: "#666",
                  fontSize: 12,
                  textAnchor: "end",
                  dx: "-0.25em",
                  dy: "0.25em",
                })}
              />
            </Group>
          </svg>

          {/* Legend */}
          {showLegend && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" shape="circle" />
            </div>
          )}

          {/* Tooltip */}
          {tooltipOpen && (
            <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
              <div>
                <strong>{tooltipData.label}</strong>
              </div>
              <div style={{ color: colorScale(tooltipData.category) }}>
                {tooltipData.category}: {valueFormatter ? valueFormatter(tooltipData.value) : tooltipData.value}
              </div>
            </TooltipInPortal>
          )}
        </>
      )}
    </div>
  )
}

// Line Chart
export function LineChart({
  data,
  categories,
  index,
  colors,
  valueFormatter,
  showLegend = true,
  height = 300,
  width = 500,
}) {
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  // Scales
  const xScale = scaleBand({
    domain: data.map((d) => d[index]),
    padding: 0.3,
  })

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map((d) => Math.max(...categories.map((c) => d[c]))))],
    nice: true,
  })

  const colorScale = scaleOrdinal({
    domain: categories,
    range: colors,
  })

  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "white",
    color: "black",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  }

  // Responsive sizing
  const [size, setSize] = React.useState({ width: 0, height })
  const containerRef2 = React.useRef(null)

  React.useEffect(() => {
    if (containerRef2.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSize({
            width: entry.contentRect.width,
            height,
          })
        }
      })

      resizeObserver.observe(containerRef2.current)
      return () => resizeObserver.disconnect()
    }
  }, [height])

  // Dimensions
  const innerWidth = size.width - margin.left - margin.right
  const innerHeight = size.height - margin.top - margin.bottom

  // Update scales
  xScale.rangeRound([0, innerWidth])
  yScale.range([innerHeight, 0])

  return (
    <div ref={containerRef2} style={{ width: "100%", height: "100%" }}>
      {size.width > 0 && (
        <>
          <svg width={size.width} height={size.height} ref={containerRef}>
            <Group left={margin.left} top={margin.top}>
              {/* Lines */}
              {categories.map((category, i) => (
                <LinePath
                  key={`line-${i}`}
                  data={data}
                  x={(d) => xScale(d[index]) + xScale.bandwidth() / 2}
                  y={(d) => yScale(d[category])}
                  stroke={colorScale(category)}
                  strokeWidth={3}
                  curve={curveMonotoneX}
                />
              ))}

              {/* Points */}
              {data.map((d, i) => (
                <React.Fragment key={`point-${i}`}>
                  {categories.map((category, j) => (
                    <circle
                      key={`point-${i}-${j}`}
                      cx={xScale(d[index]) + xScale.bandwidth() / 2}
                      cy={yScale(d[category])}
                      r={4}
                      fill={colorScale(category)}
                      stroke="white"
                      strokeWidth={2}
                      onMouseMove={(event) => {
                        const point = localPoint(event)
                        showTooltip({
                          tooltipData: {
                            category,
                            value: d[category],
                            label: d[index],
                          },
                          tooltipLeft: point.x,
                          tooltipTop: point.y,
                        })
                      }}
                      onMouseLeave={() => hideTooltip()}
                    />
                  ))}
                </React.Fragment>
              ))}

              {/* Axes */}
              <AxisBottom
                top={innerHeight}
                scale={xScale}
                tickFormat={(d) => d}
                stroke="#ccc"
                tickStroke="#ccc"
                tickLabelProps={() => ({
                  fill: "#666",
                  fontSize: 12,
                  textAnchor: "middle",
                })}
              />

              <AxisLeft
                scale={yScale}
                stroke="#ccc"
                tickStroke="#ccc"
                tickLabelProps={() => ({
                  fill: "#666",
                  fontSize: 12,
                  textAnchor: "end",
                  dx: "-0.25em",
                  dy: "0.25em",
                })}
              />
            </Group>
          </svg>

          {/* Legend */}
          {showLegend && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" shape="circle" />
            </div>
          )}

          {/* Tooltip */}
          {tooltipOpen && (
            <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
              <div>
                <strong>{tooltipData.label}</strong>
              </div>
              <div style={{ color: colorScale(tooltipData.category) }}>
                {tooltipData.category}: {valueFormatter ? valueFormatter(tooltipData.value) : tooltipData.value}
              </div>
            </TooltipInPortal>
          )}
        </>
      )}
    </div>
  )
}

// Pie Chart
export function PieChart({ data, category, index, colors, valueFormatter, height = 300, width = 500 }) {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }

  // Scales
  const colorScale = scaleOrdinal({
    domain: data.map((d) => d[index]),
    range: colors,
  })

  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: "white",
    color: "black",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  }

  // Responsive sizing
  const [size, setSize] = React.useState({ width: 0, height })
  const containerRef2 = React.useRef(null)

  React.useEffect(() => {
    if (containerRef2.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSize({
            width: entry.contentRect.width,
            height,
          })
        }
      })

      resizeObserver.observe(containerRef2.current)
      return () => resizeObserver.disconnect()
    }
  }, [height])

  // Dimensions
  const innerWidth = size.width - margin.left - margin.right
  const innerHeight = size.height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerX = innerWidth / 2 + margin.left
  const centerY = innerHeight / 2 + margin.top

  // Pie
  const pie = React.useMemo(
    () => ({
      data,
      value: (d) => d[category],
      label: (d) => d[index],
    }),
    [data, category, index],
  )

  return (
    <div ref={containerRef2} style={{ width: "100%", height: "100%" }}>
      {size.width > 0 && (
        <>
          <svg width={size.width} height={size.height} ref={containerRef}>
            <Group top={centerY} left={centerX}>
              <Pie
                data={data}
                pieValue={(d) => d[category]}
                outerRadius={radius}
                innerRadius={radius / 2}
                padAngle={0.01}
              >
                {(pie) => {
                  return pie.arcs.map((arc, i) => {
                    const [centroidX, centroidY] = pie.path.centroid(arc)
                    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1
                    const arcPath = pie.path(arc)
                    const arcFill = colorScale(arc.data[index])

                    return (
                      <g key={`arc-${i}`}>
                        <path
                          d={arcPath}
                          fill={arcFill}
                          onMouseMove={(event) => {
                            const point = localPoint(event)
                            showTooltip({
                              tooltipData: {
                                label: arc.data[index],
                                value: arc.data[category],
                              },
                              tooltipLeft: point.x,
                              tooltipTop: point.y,
                            })
                          }}
                          onMouseLeave={() => hideTooltip()}
                        />
                        {hasSpaceForLabel && (
                          <Text x={centroidX} y={centroidY} dy=".33em" fontSize={12} textAnchor="middle" fill="white">
                            {arc.data[index]}
                          </Text>
                        )}
                      </g>
                    )
                  })
                }}
              </Pie>
            </Group>
          </svg>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" shape="circle" />
          </div>

          {/* Tooltip */}
          {tooltipOpen && (
            <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
              <div>
                <strong>{tooltipData.label}</strong>
              </div>
              <div>{valueFormatter ? valueFormatter(tooltipData.value) : tooltipData.value}</div>
            </TooltipInPortal>
          )}
        </>
      )}
    </div>
  )
}
