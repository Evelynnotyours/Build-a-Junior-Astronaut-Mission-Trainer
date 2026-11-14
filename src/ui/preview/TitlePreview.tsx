import { useState } from 'react';
import { LearnScreen } from '../screens/LearnScreen';
import { SettingsScreen, type SettingsValues } from '../screens/SettingsScreen';
import { SourcesScreen } from '../screens/SourcesScreen';
import { TitleScreen, type TitleAction } from '../screens/TitleScreen';
import { TeachersScreen } from '../screens/TeachersScreen';

type MenuView = 'title' | 'learn' | 'sources' | 'settings' | 'teachers';

/** Open /ui-preview.html?screen=title */
export function TitlePreview() {
  const [view, setView] = useState<MenuView>('title');
  const [canContinue, setCanContinue] = useState(false);
  const [replaceWarning, setReplaceWarning] = useState(false);
  const [settings, setSettings] = useState<SettingsValues>({
    soundEnabled: true,
    reduceMotion: false,
    textSize: 'md',
    classroomMode: false,
  });

  function handleAction(action: TitleAction) {
    if (action === 'start') {
      if (canContinue) setReplaceWarning(true);
      else window.alert('Start Mission → Member 1 wires sky fetch + Plan.');
      return;
    }
    if (action === 'continue') {
      window.alert('Continue Mission → Member 1 restores durable save.');
      return;
    }
    setView(action);
  }

  if (view === 'learn') return <LearnScreen onClose={() => setView('title')} />;
  if (view === 'sources') return <SourcesScreen onClose={() => setView('title')} />;
  if (view === 'settings') {
    return (
      <SettingsScreen
        values={settings}
        onChange={setSettings}
        onClose={() => setView('title')}
      />
    );
  }
  if (view === 'teachers') return <TeachersScreen onClose={() => setView('title')} />;

  return (
    <div>
      <div className="ui-preview__dev" style={{ margin: '0.75rem', position: 'relative', zIndex: 4 }}>
        <strong>Title preview</strong>
        {' · '}
        <button type="button" onClick={() => setCanContinue((v) => !v)}>
          {canContinue ? 'Hide Continue' : 'Show Continue'}
        </button>
      </div>
      <TitleScreen
        canContinue={canContinue}
        replaceWarning={replaceWarning}
        sky={{ level: 'active', status: 'saved', observationDate: '2026-11-14' }}
        onAction={handleAction}
        onConfirmStart={() => {
          setReplaceWarning(false);
          window.alert('Replace confirmed → new run.');
        }}
        onCancelStart={() => setReplaceWarning(false)}
      />
    </div>
  );
}
