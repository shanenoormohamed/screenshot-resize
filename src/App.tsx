import { useCallback, useMemo, useState } from 'react';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { ResultRow } from './components/ResultRow';
import { SettingsPanel } from './components/SettingsPanel';
import { downloadAllAsZip } from './lib/download';
import { buildInputFile } from './lib/fileMeta';
import { processFile } from './lib/processFile';
import { getFfmpeg } from './hooks/useFfmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  DEFAULT_SETTINGS,
  type FileResult,
  type InputFile,
  type ProcessedOutput,
  type ResizeSettings,
} from './types';
import './App.css';

function App() {
  const [files, setFiles] = useState<InputFile[]>([]);
  const [settings, setSettings] = useState<ResizeSettings>(DEFAULT_SETTINGS);
  const [results, setResults] = useState<FileResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const hasVideo = useMemo(
    () => files.some((file) => file.kind === 'video'),
    [files],
  );

  const allOutputs = useMemo(
    () => results.flatMap((result) => result.outputs),
    [results],
  );

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const built = (
      await Promise.all(incoming.map((file) => buildInputFile(file)))
    ).filter((item): item is InputFile => item !== null);

    if (built.length === 0) return;

    setFiles((prev) => [...prev, ...built]);
    setResults([]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setResults((prev) => prev.filter((result) => result.inputId !== id));
  }, []);

  const updateResult = useCallback(
    (inputId: string, patch: Partial<FileResult>) => {
      setResults((prev) => {
        const index = prev.findIndex((result) => result.inputId === inputId);
        if (index === -1) {
          return [
            ...prev,
            {
              inputId,
              status: 'pending',
              progress: 0,
              outputs: [],
              ...patch,
            },
          ];
        }
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [],
  );

  const processAll = useCallback(async () => {
    if (files.length === 0 || processing) return;

    setProcessing(true);
    setResults(
      files.map((file) => ({
        inputId: file.id,
        status: 'pending',
        progress: 0,
        outputs: [],
      })),
    );

    let ffmpeg: FFmpeg | null = null;
    const needsFfmpeg = files.some((file) => file.kind === 'video');

    if (needsFfmpeg) {
      setFfmpegLoading(true);
      try {
        ffmpeg = await getFfmpeg();
      } catch {
        setFfmpegLoading(false);
        setProcessing(false);
        for (const file of files) {
          updateResult(file.id, {
            status: 'error',
            error: 'Failed to load video processor',
          });
        }
        return;
      }
      setFfmpegLoading(false);
    }

    for (const file of files) {
      updateResult(file.id, { status: 'processing', progress: 0.05 });
      try {
        const outputs = await processFile(
          file,
          settings,
          ffmpeg,
          (progress) => updateResult(file.id, { progress }),
        );
        updateResult(file.id, {
          status: 'done',
          progress: 1,
          outputs,
        });
      } catch (error) {
        updateResult(file.id, {
          status: 'error',
          progress: 0,
          error: error instanceof Error ? error.message : 'Processing failed',
        });
      }
    }

    setProcessing(false);
  }, [files, processing, settings, updateResult]);

  const handleDownloadZip = useCallback(async () => {
    const outputs: ProcessedOutput[] = results.flatMap((r) => r.outputs);
    await downloadAllAsZip(outputs);
  }, [results]);

  const clearAll = useCallback(() => {
    setFiles([]);
    setResults([]);
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h1>PR Media Resizer</h1>
        <p>
          Resize screenshots and recordings for GitHub PRs. Default 800px matches
          iOS CI (<code>sips -Z 800</code>).
        </p>
      </header>

      <DropZone onFiles={addFiles} disabled={processing} />
      <FileList files={files} onRemove={removeFile} />
      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        hasVideo={hasVideo}
      />

      <footer className="app__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={files.length === 0 || processing}
          onClick={processAll}
        >
          {processing
            ? ffmpegLoading
              ? 'Loading video tools…'
              : 'Processing…'
            : 'Process all'}
        </button>

        {allOutputs.length > 1 && (
          <button
            type="button"
            className="btn"
            onClick={handleDownloadZip}
            disabled={processing}
          >
            Download all (.zip)
          </button>
        )}

        {files.length > 0 && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={clearAll}
            disabled={processing}
          >
            Clear all
          </button>
        )}
      </footer>

      {results.length > 0 && (
        <section className="results">
          <h2>Results</h2>
          <ul>
            {results.map((result) => {
              const input = files.find((file) => file.id === result.inputId);
              return (
                <ResultRow
                  key={result.inputId}
                  result={result}
                  originalName={input?.file.name ?? 'Unknown'}
                />
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

export default App;
