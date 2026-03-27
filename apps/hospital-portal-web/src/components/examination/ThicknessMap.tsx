'use client';

interface PeripheralThickness {
  superior: number;
  inferior: number;
  temporal: number;
  nasal: number;
  superotemporal: number;
  inferotemporal: number;
  superonasal: number;
  inferonasal: number;
}

interface ThicknessMapProps {
  cct: number;
  thinnestPoint: number;
  peripheralThickness: PeripheralThickness;
  eye: 'OD' | 'OS';
}

export default function ThicknessMap({ cct, thinnestPoint, peripheralThickness, eye }: ThicknessMapProps) {
  // Color coding based on thickness (μm)
  const getColor = (thickness: number): string => {
    if (thickness < 500) return '#ef4444'; // Red - Thin (risk)
    if (thickness < 520) return '#f97316'; // Orange - Borderline thin
    if (thickness < 540) return '#fbbf24'; // Yellow - Lower normal
    if (thickness < 570) return '#4ade80'; // Green - Normal
    if (thickness < 600) return '#60a5fa'; // Blue - Upper normal
    return '#a78bfa'; // Purple - Thick
  };

  const getLegendLabel = (color: string): string => {
    switch (color) {
      case '#ef4444':
        return 'Thin (<500 μm)';
      case '#f97316':
        return 'Borderline (500-520 μm)';
      case '#fbbf24':
        return 'Lower Normal (520-540 μm)';
      case '#4ade80':
        return 'Normal (540-570 μm)';
      case '#60a5fa':
        return 'Upper Normal (570-600 μm)';
      case '#a78bfa':
        return 'Thick (≥600 μm)';
      default:
        return '';
    }
  };

  // SVG viewBox: 300x300 coordinate system
  const centerX = 150;
  const centerY = 150;
  const centerRadius = 30;
  const innerRadius = 70;
  const outerRadius = 130;

  // Polar coordinates for 8 peripheral locations (0° = right, 90° = top in standard math)
  // But we adjust for anatomical positioning (Superior = top, Temporal = right for OD, left for OS)
  const locations = {
    superior: { angle: 90, thickness: peripheralThickness.superior },
    superotemporal: { angle: eye === 'OD' ? 45 : 135, thickness: peripheralThickness.superotemporal },
    temporal: { angle: eye === 'OD' ? 0 : 180, thickness: peripheralThickness.temporal },
    inferotemporal: { angle: eye === 'OD' ? 315 : 225, thickness: peripheralThickness.inferotemporal },
    inferior: { angle: 270, thickness: peripheralThickness.inferior },
    inferonasal: { angle: eye === 'OD' ? 225 : 315, thickness: peripheralThickness.inferonasal },
    nasal: { angle: eye === 'OD' ? 180 : 0, thickness: peripheralThickness.nasal },
    superonasal: { angle: eye === 'OD' ? 135 : 45, thickness: peripheralThickness.superonasal },
  };

  // Convert polar to Cartesian
  const polarToCartesian = (angle: number, radius: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY - radius * Math.sin(angleRad), // Subtract because SVG Y increases downward
    };
  };

  // Create pie slice path
  const createSlicePath = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const startInner = polarToCartesian(startAngle, innerRadius);
    const endInner = polarToCartesian(endAngle, innerRadius);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `
      M ${startInner.x} ${startInner.y}
      L ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
      L ${endInner.x} ${endInner.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}
      Z
    `;
  };

  // Create 8 slices (45° each)
  const slices = Object.entries(locations).map(([name, { angle, thickness }], index) => {
    const startAngle = angle - 22.5;
    const endAngle = angle + 22.5;
    const midPoint = polarToCartesian(angle, (innerRadius + outerRadius) / 2);
    const labelPoint = polarToCartesian(angle, outerRadius + 20);

    return (
      <g key={name}>
        {/* Slice */}
        <path
          d={createSlicePath(startAngle, endAngle, outerRadius)}
          fill={getColor(thickness)}
          stroke="white"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* Thickness value in slice */}
        <text
          x={midPoint.x}
          y={midPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-semibold fill-white"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {thickness}
        </text>
        {/* Location label outside */}
        <text
          x={labelPoint.x}
          y={labelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] font-medium fill-gray-700"
        >
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </text>
      </g>
    );
  });

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-800">Corneal Thickness Map</h4>
      
      {/* SVG Map */}
      <div className="flex justify-center">
        <svg width="100%" height="auto" viewBox="0 0 300 300" className="max-w-md">
          {/* Background */}
          <rect width="300" height="300" fill="#f9fafb" />

          {/* Peripheral zones (8 slices) */}
          {slices}

          {/* Central zone (CCT) */}
          <circle cx={centerX} cy={centerY} r={centerRadius} fill={getColor(cct)} stroke="white" strokeWidth="3" />
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-bold fill-white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
          >
            CCT
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-semibold fill-white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
          >
            {cct} μm
          </text>

          {/* Thinnest point indicator (small red dot with value) */}
          <circle cx={centerX} cy={centerY - 15} r={3} fill="#dc2626" />
          <text
            x={centerX + 10}
            y={centerY - 15}
            textAnchor="start"
            dominantBaseline="middle"
            className="text-[10px] font-medium fill-red-700"
          >
            Thinnest: {thinnestPoint} μm
          </text>

          {/* Eye label */}
          <text
            x={centerX}
            y={20}
            textAnchor="middle"
            className="text-lg font-bold fill-gray-800"
          >
            {eye} {eye === 'OD' ? '(Right Eye)' : '(Left Eye)'}
          </text>
        </svg>
      </div>

      {/* Color Legend */}
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <h5 className="text-xs font-semibold text-gray-700 mb-2">Thickness Legend</h5>
        <div className="grid grid-cols-2 gap-2">
          {[
            { color: '#ef4444', label: 'Thin (<500 μm)' },
            { color: '#f97316', label: 'Borderline (500-520)' },
            { color: '#fbbf24', label: 'Lower Normal (520-540)' },
            { color: '#4ade80', label: 'Normal (540-570)' },
            { color: '#60a5fa', label: 'Upper Normal (570-600)' },
            { color: '#a78bfa', label: 'Thick (≥600)' },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Thickness Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h5 className="text-xs font-semibold text-gray-700 mb-2">Thickness Summary</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">Central (CCT):</span> <span className="font-mono">{cct} μm</span>
          </div>
          <div>
            <span className="font-medium">Thinnest:</span> <span className="font-mono">{thinnestPoint} μm</span>
          </div>
          <div>
            <span className="font-medium">Avg Peripheral:</span>{' '}
            <span className="font-mono">
              {Math.round(
                (peripheralThickness.superior +
                  peripheralThickness.inferior +
                  peripheralThickness.temporal +
                  peripheralThickness.nasal +
                  peripheralThickness.superotemporal +
                  peripheralThickness.inferotemporal +
                  peripheralThickness.superonasal +
                  peripheralThickness.inferonasal) /
                  8
              )}{' '}
              μm
            </span>
          </div>
          <div>
            <span className="font-medium">Variation:</span>{' '}
            <span className="font-mono">
              {Math.max(
                peripheralThickness.superior,
                peripheralThickness.inferior,
                peripheralThickness.temporal,
                peripheralThickness.nasal,
                peripheralThickness.superotemporal,
                peripheralThickness.inferotemporal,
                peripheralThickness.superonasal,
                peripheralThickness.inferonasal
              ) -
                Math.min(
                  peripheralThickness.superior,
                  peripheralThickness.inferior,
                  peripheralThickness.temporal,
                  peripheralThickness.nasal,
                  peripheralThickness.superotemporal,
                  peripheralThickness.inferotemporal,
                  peripheralThickness.superonasal,
                  peripheralThickness.inferonasal
                )}{' '}
              μm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
