export default function AnalysisControls(props) {
  const {
    depth,
    setDepth,
    previewCount,
    setPreviewCount,
    handleGetPreviews,
    fetching,
  } = props;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '10px'
    }}>
      <label htmlFor="analysis-depth">
        Analysis Depth:&nbsp;
        <input
          id="analysis-depth"
          name="analysis-depth"
          type="range"
          min="1"
          max="30"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
        {depth} ply
      </label>
      <label>
        Scenarios:&nbsp;
        <input
          id="preview-size"
          name="preview-size"
          type="range"
          min="0"
          max="10"
          value={previewCount}
          onChange={(e) => setPreviewCount(e.target.value)}
        />
        {previewCount} games
      </label>
      <label>
        <button
          type="button"
          onClick={() => handleGetPreviews()}
          disabled={fetching}
          style={{
            height: '40px',
            width: '100px',
            marginRight: '10px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          {fetching ? 'Analyzing...' : 'Analyze'}
        </button>
      </label>
    </div>
  );
}