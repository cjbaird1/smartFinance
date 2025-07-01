// Utility to get the hovered bar index and previous bar from chart data
// hoveredBar: {open, high, low, close}, data: array of bars
export function getHoveredIndexAndPrev(hoveredBar, data) {
  if (!hoveredBar || !data || !Array.isArray(data)) return { hoveredIndex: -1, prevBar: null };
  // Try to match by close value and OHLC (since time may be unix or string)
  const hoveredIndex = data.findIndex(d =>
    +d.open === hoveredBar.open &&
    +d.high === hoveredBar.high &&
    +d.low === hoveredBar.low &&
    +d.close === hoveredBar.close
  );
  const prevBar = hoveredIndex > 0 ? data[hoveredIndex - 1] : null;
  return { hoveredIndex, prevBar };
} 