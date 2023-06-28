import { RadarChart, CircularGridLines } from "react-vis";

export default function RadarFeatures(props) {
  const { fetching, radarFeatures, currentMoveIndex } = props;

  if (!radarFeatures?.length) return null;
  const features = radarFeatures[currentMoveIndex] || radarFeatures[0];
  if (fetching) return <div>Loading...</div>;

  const data = [
    {
      space: features.space.white_score.toFixed(2),
      piece_mobility: features.piece_mobility.white_score.toFixed(2),
      king_safety: features.king_safety.white_score.toFixed(2),
      pawn_structure_health: features.pawn_structure_health.white_score,
      attacked_pieces: features.attacked_pieces.white_score,
      tactical_opps: features.tactical_opps.white_score,
      material_balance: features.material_balance.white_score,
      central_control: features.central_control.white_score,
      kingside_attack: features.kingside_attack.white_score,
      queenside_attack: features.queenside_attack.white_score,
      strong_threats: features.strong_threats.white_score,
      forks: features.forks.white_score,
      checks_captures_threats: features.checks_captures_threats.white_score,
    },
    {
      space: features.space.black_score,
      piece_mobility: features.piece_mobility.black_score,
      king_safety: features.king_safety.black_score,
      pawn_structure_health: features.pawn_structure_health.black_score,
      attacked_pieces: features.attacked_pieces.black_score,
      tactical_opps: features.tactical_opps.black_score,
      material_balance: features.material_balance.black_score,
      central_control: features.central_control.black_score,
      kingside_attack: features.kingside_attack.black_score,
      queenside_attack: features.queenside_attack.black_score,
      strong_threats: features.strong_threats.black_score,
      forks: features.forks.black_score,
      checks_captures_threats: features.checks_captures_threats.black_score,
    },
  ]

  return (
    <RadarChart
      animation
      data={data}
      height={500}
      width={500}
      // startingAngle={0}
      style={{
        polygons: {
          fillOpacity: 0.05,
          strokeWidth: 3,
          strokeOpacity: 1,
        },
        axes: {
          text: {
            opacity: 1
          }
        },
        labels: {
          textAnchor: 'middle',
          fontSize: 16,
          fontWeight: 500,
          color: '#FFFFFF',
        }
      }}
      margin={{
        left: 60,
        top: 60,
        bottom: 60,
        right: 60
      }}
      colorRange={['lawngreen', 'red']}
      tickFormat={t => ''}
      domains={[
        { name: 'Space', domain: [0, 10], getValue: (d) => d.space },
        { name: 'Mobility', domain: [0, 10], getValue: (d) => d.piece_mobility },
        { name: 'King Safety', domain: [0, 10], getValue: (d) => d.king_safety },
        { name: 'Structure', domain: [0, 10], getValue: (d) => d.pawn_structure_health },
        { name: 'Attacks', domain: [0, 10], getValue: (d) => d.attacked_pieces },
        // { name: 'Tactics', domain: [0, 10], getValue: (d) => d.tactical_opps },
        { name: 'Material', domain: [0, 10], getValue: (d) => d.material_balance },
        { name: 'Central Ctrl', domain: [0, 10], getValue: (d) => d.central_control },
        { name: 'Kingside Attk', domain: [0, 10], getValue: (d) => d.kingside_attack },
        { name: 'Queenside Attk', domain: [0, 10], getValue: (d) => d.queenside_attack },
        { name: 'Threats', domain: [0, 10], getValue: (d) => d.strong_threats },
        { name: 'Forks', domain: [0, 10], getValue: (d) => d.forks },
        { name: 'CCT', domain: [0, 10], getValue: (d) => d.checks_captures_threats },
      ]}
    >
      <CircularGridLines
        tickValues={[...new Array(10)].map((v, i) => i / 9 - 1)}
        style={{
          fill: 'none',
          stroke: '#FFFFFF',
          opacity: 0.1,
        }}
        animation
      />
  </RadarChart>

  );
}

/**
 interface CircularGridLinesProps {
    centerX?: number | undefined; // default: 0
    centerY?: number | undefined; // default: 0
    width?: number | undefined;
    height?: number | undefined;
    top?: number | undefined;
    left?: number | undefined;
    rRange?: number[] | undefined;
    style?: CSSProperties | undefined;
    tickValues?: number[] | undefined;
    tickTotal?: number | undefined;
    animation?: string | AnimationParam | boolean | undefined;
    marginTop?: number | undefined;
    marginBottom?: number | undefined;
    marginLeft?: number | undefined;
    marginRight?: number | undefined;
    innerWidth?: number | undefined;
    innerHeight?: number | undefined;
}
 */