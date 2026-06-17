import { PR_MAX_EDGE, type ResizeSettings } from '../types';

type SettingsPanelProps = {
  settings: ResizeSettings;
  onChange: (settings: ResizeSettings) => void;
  hasVideo: boolean;
};

export function SettingsPanel({
  settings,
  onChange,
  hasVideo,
}: SettingsPanelProps) {
  const usePreset = settings.maxEdge === PR_MAX_EDGE;

  return (
    <section className="settings">
      <h2>Resize settings</h2>

      <div className="settings__row">
        <label className="settings__label">
          <input
            type="radio"
            name="preset"
            checked={usePreset}
            onChange={() => onChange({ ...settings, maxEdge: PR_MAX_EDGE })}
          />
          GitHub PR (800px max edge)
        </label>
        <label className="settings__label">
          <input
            type="radio"
            name="preset"
            checked={!usePreset}
            onChange={() => onChange({ ...settings, maxEdge: 1200 })}
          />
          Custom max edge
        </label>
      </div>

      {!usePreset && (
        <div className="settings__field">
          <label htmlFor="max-edge">Max longest edge (px)</label>
          <input
            id="max-edge"
            type="number"
            min={100}
            max={4096}
            value={settings.maxEdge}
            onChange={(event) =>
              onChange({
                ...settings,
                maxEdge: Number(event.target.value) || PR_MAX_EDGE,
              })
            }
          />
        </div>
      )}

      <div className="settings__field">
        <label htmlFor="still-format">Still image output</label>
        <select
          id="still-format"
          value={settings.stillFormat}
          onChange={(event) =>
            onChange({
              ...settings,
              stillFormat: event.target.value as 'png' | 'jpeg',
            })
          }
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
      </div>

      {settings.stillFormat === 'jpeg' && (
        <div className="settings__field">
          <label htmlFor="jpeg-quality">
            JPEG quality ({Math.round(settings.jpegQuality * 100)}%)
          </label>
          <input
            id="jpeg-quality"
            type="range"
            min={0.5}
            max={1}
            step={0.05}
            value={settings.jpegQuality}
            onChange={(event) =>
              onChange({
                ...settings,
                jpegQuality: Number(event.target.value),
              })
            }
          />
        </div>
      )}

      {hasVideo && (
        <>
          <h3 className="settings__subheading">MOV / video options</h3>
          <div className="settings__row">
            <label className="settings__label">
              <input
                type="radio"
                name="mov-mode"
                checked={settings.movMode === 'resize'}
                onChange={() => onChange({ ...settings, movMode: 'resize' })}
              />
              Resize video (MP4)
            </label>
            <label className="settings__label">
              <input
                type="radio"
                name="mov-mode"
                checked={settings.movMode === 'extract'}
                onChange={() => onChange({ ...settings, movMode: 'extract' })}
              />
              Extract frames (PNG)
            </label>
          </div>

          {settings.movMode === 'extract' && (
            <div className="settings__field">
              <label htmlFor="frame-interval">
                Frame every {settings.frameIntervalSec}s
              </label>
              <input
                id="frame-interval"
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={settings.frameIntervalSec}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    frameIntervalSec: Number(event.target.value),
                  })
                }
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
