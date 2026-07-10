import { formatBytes } from '../lib/download';
import type { InputFile } from '../types';

type FileListProps = {
  files: InputFile[];
  onRemove: (id: string) => void;
  onOutputStemChange: (id: string, outputStem: string) => void;
  disabled?: boolean;
};

const KIND_LABELS = {
  still: 'Image',
  gif: 'GIF',
  video: 'Video',
};

export function FileList({
  files,
  onRemove,
  onOutputStemChange,
  disabled = false,
}: FileListProps) {
  if (files.length === 0) return null;

  return (
    <section className="file-list">
      <h2>Files ({files.length})</h2>
      <ul>
        {files.map((item) => (
          <li key={item.id} className="file-card">
            <div className="file-card__preview">
              {item.kind === 'video' ? (
                <video src={item.previewUrl} muted playsInline />
              ) : (
                <img src={item.previewUrl} alt={item.outputStem} />
              )}
            </div>
            <div className="file-card__body">
              <input
                className="file-card__name"
                type="text"
                value={item.outputStem}
                placeholder="Output name"
                disabled={disabled}
                aria-label={`Output name for ${item.file.name}`}
                onChange={(event) =>
                  onOutputStemChange(item.id, event.target.value)
                }
              />
              <span className="file-card__meta">
                {item.file.name} · {KIND_LABELS[item.kind]}
                {item.width && item.height
                  ? ` · ${item.width}×${item.height}`
                  : ''}
                {' · '}
                {formatBytes(item.file.size)}
              </span>
            </div>
            <button
              type="button"
              className="file-card__remove"
              disabled={disabled}
              onClick={() => onRemove(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
