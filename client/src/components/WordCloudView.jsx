import { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import { scaleLinear } from 'd3-scale';

export default function WordCloudView({ keywords, onWordClick }) {
  const containerRef = useRef(null);
  const [words, setWords] = useState([]);
  const [dims, setDims] = useState({ width: 400, height: 280 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ width: entry.contentRect.width, height: 280 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!keywords?.length || dims.width < 10) return;

    const maxWeight = Math.max(...keywords.map((k) => k.tf_idf_weight || 1));
    const fontScale = scaleLinear().domain([0, maxWeight]).range([12, 48]);

    cloud()
      .size([dims.width, dims.height])
      .words(
        keywords.map((k) => ({
          text: k.word,
          size: fontScale(k.tf_idf_weight || 0),
          weight: k.tf_idf_weight,
        }))
      )
      .padding(4)
      .rotate(0)
      .font('sans-serif')
      .fontSize((d) => d.size)
      .on('end', setWords)
      .start();
  }, [keywords, dims]);

  const colors = ['#1d4ed8', '#0891b2', '#059669', '#7c3aed', '#dc2626', '#b45309'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Key Terms</h3>
      <div ref={containerRef} style={{ height: dims.height }}>
        <svg width={dims.width} height={dims.height}>
          <g transform={`translate(${dims.width / 2},${dims.height / 2})`}>
            {words.map((w, i) => (
              <text
                key={w.text}
                transform={`translate(${w.x},${w.y})`}
                textAnchor="middle"
                fontSize={w.size}
                fill={colors[i % colors.length]}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onWordClick(w.text)}
              >
                {w.text}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
