import { formatBytes, downloadBlob } from '../lib/download';
import type { FileResult } from '../types';

type ResultRowProps = {
  result: FileResult;
  originalName: string;
};

export function ResultRow({ result, originalName }: ResultRowProps) {
  const statusLabel =
    result.status === 'processing'
      ? `Processing… ${Math.round(result.progress * 100)}%`
      : result.status === 'done'
        ? 'Done'
        : result.status === 'error'
          ? result.error ?? 'Failed'
          : 'Pending';

  return (
    <li className={`result-row result-row--${result.status}`}>
      <div className="result-row__header">
        <span className="result-row__name">{originalName}</span>
        <span className="result-row__status">{statusLabel}</span>
      </div>

      {result.status === 'processing' && (
        <div className="result-row__bar">
          <div
            className="result-row__bar-fill"
            style={{ width: `${result.progress * 100}%` }}
          />
        </div>
      )}

      {result.outputs.length > 0 && (
        <ul className="result-row__outputs">
          {result.outputs.map((output) => (
            <li key={output.filename}>
              <span>
                {output.filename} ({formatBytes(output.blob.size)})
              </span>
              <button
                type="button"
                className="download-btn"
                onClick={() => downloadBlob(output.blob, output.filename)}
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
