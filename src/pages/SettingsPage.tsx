/**
 * Réglages : apparence, objectifs, audio, données (export, import,
 * réinitialisation) et raccourcis clavier.
 */
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { store, useAppState } from '@/state/store';
import { useAccount } from '@/account/instance';
import { englishVoices, onVoicesChanged, speak, stopSpeaking } from '@/audio/tts';
import { resolveTheme } from '@/app/theme';
import { SESSION_SIZES, type Settings } from '@/engine/learning/types';
import { dayKey } from '@/state/dates';
import { Button, Card, Modal, PageHeader, Segmented, Switch } from '@/ui/kit';
import { IconCheck, IconDatabase, IconDownload, IconKeyboard, IconPalette, IconPlay, IconTarget, IconTrash, IconUpload, IconVolume, IconWarning } from '@/ui/icons';

type IconT = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

function Section({ icon: Icon, title, children, id }: { icon: IconT; title: string; children: ReactNode; id: string }) {
  return (
    <Card className="settings-section" aria-labelledby={id}>
      <header className="settings-head">
        <span className="settings-icon">
          <Icon size={20} aria-hidden />
        </span>
        <h2 id={id}>{title}</h2>
      </header>
      <div className="settings-body">{children}</div>
    </Card>
  );
}

function Row({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-label">
        <span className="switch-label">{label}</span>
        {hint && <p className="muted small">{hint}</p>}
      </div>
      <div className="settings-control">{children}</div>
    </div>
  );
}

function useEnglishVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState(() => englishVoices());
  useEffect(() => onVoicesChanged(() => setVoices([...englishVoices()])), []);
  return voices;
}

const GOALS = [
  { value: '50', label: '50 XP · détente' },
  { value: '100', label: '100 XP · régulier' },
  { value: '150', label: '150 XP · sérieux' },
  { value: '250', label: '250 XP · intensif' },
];

export function SettingsPage() {
  const settings = useAppState((s) => s.settings);
  const set = (patch: Partial<Settings>) => store.updateSettings(patch);
  const setAudio = (patch: Partial<Settings['audio']>) => store.updateSettings({ audio: { ...settings.audio, ...patch } });
  const resolved = resolveTheme(settings.theme);
  const goalValue = GOALS.some((g) => Number(g.value) === settings.dailyGoalXp) ? String(settings.dailyGoalXp) : '100';

  return (
    <div className="stack settings">
      <PageHeader eyebrow="Réglages" title="Paramètres" subtitle="Vos préférences sont enregistrées automatiquement sur cet appareil." />

      <Section icon={IconPalette} title="Apparence" id="set-look">
        <Row label="Thème" hint={settings.theme === 'system' ? `Suit le réglage de votre appareil (actuellement ${resolved === 'dark' ? 'sombre' : 'clair'}).` : undefined}>
          <Segmented
            label="Thème"
            value={settings.theme}
            onChange={(theme) => set({ theme })}
            options={[
              { value: 'system', label: 'Système' },
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
            ]}
          />
        </Row>
        <Row label="Animations" hint="« Système » respecte le réglage « réduire les animations » de votre appareil.">
          <Segmented
            label="Animations"
            value={settings.motion}
            onChange={(motion) => set({ motion })}
            options={[
              { value: 'system', label: 'Système' },
              { value: 'reduce', label: 'Réduites' },
              { value: 'full', label: 'Complètes' },
            ]}
          />
        </Row>
        <Switch label="Sons de réussite et d'erreur" description="Un court signal sonore après chaque vérification." checked={settings.sounds} onChange={(sounds) => set({ sounds })} />
      </Section>

      <Section icon={IconTarget} title="Objectifs et séances" id="set-goals">
        <Row label="Objectif quotidien" hint="Une séance moyenne rapporte entre 60 et 120 XP.">
          <Segmented label="Objectif quotidien" value={goalValue} onChange={(v) => set({ dailyGoalXp: Number(v) })} options={GOALS} />
        </Row>
        <Row label="Longueur des séances" hint="Nombre d'exercices des séances du parcours et des révisions.">
          <Segmented
            label="Longueur des séances"
            value={settings.sessionLength}
            onChange={(sessionLength) => set({ sessionLength })}
            options={[
              { value: 'short', label: `Courte (${SESSION_SIZES.short})` },
              { value: 'medium', label: `Moyenne (${SESSION_SIZES.medium})` },
              { value: 'long', label: `Longue (${SESSION_SIZES.long})` },
            ]}
          />
        </Row>
        <Switch
          label="Afficher les traductions par défaut"
          description="Sinon, la traduction française reste masquée et s'affiche d'un clic (plus exigeant)."
          checked={settings.showTranslations}
          onChange={(showTranslations) => set({ showTranslations })}
        />
      </Section>

      <AudioSection settings={settings} setAudio={setAudio} />
      <DataSection />

      <Section icon={IconKeyboard} title="Raccourcis clavier" id="set-keys">
        <ul className="shortcuts">
          <li>
            <kbd>Entrée</kbd> vérifier la réponse, puis passer à l'exercice suivant
          </li>
          <li>
            <kbd>1</kbd> à <kbd>4</kbd> choisir une option dans un QCM
          </li>
          <li>
            <kbd>Tab</kbd> parcourir les étiquettes, <kbd>Entrée</kbd> ou <kbd>Espace</kbd> pour placer / retirer un mot
          </li>
          <li>
            <kbd>←</kbd> <kbd>→</kbd> déplacer un mot déjà placé, <kbd>Suppr</kbd> le retirer
          </li>
          <li>
            <kbd>Échap</kbd> fermer une fenêtre de dialogue
          </li>
        </ul>
      </Section>

      <p className="faint small center">Passerelle fonctionne entièrement dans votre navigateur : aucun compte, aucun serveur, aucune donnée envoyée.</p>
    </div>
  );
}

function AudioSection({ settings, setAudio }: { settings: Settings; setAudio: (p: Partial<Settings['audio']>) => void }) {
  const supported = useAppState((s) => s.audioSupported);
  const voices = useEnglishVoices();
  const [testing, setTesting] = useState(false);
  const audio = settings.audio;
  useEffect(() => () => stopSpeaking(), []);

  const test = async () => {
    setTesting(true);
    await speak('Hello! This is the voice you will hear in the listening exercises.', { rate: audio.rate, voiceURI: audio.voiceURI, accent: audio.accent });
    setTesting(false);
  };

  return (
    <Section icon={IconVolume} title="Audio et prononciation" id="set-audio">
      {!supported ? (
        <div className="notice notice-warning">
          <IconWarning size={20} aria-hidden />
          <p>Votre navigateur ne propose pas la synthèse vocale. Les exercices d'écoute et les dictées sont désactivés ; tous les autres exercices restent disponibles.</p>
        </div>
      ) : (
        <>
          <Switch label="Activer l'audio" description="Lecture des phrases, exercices d'écoute et dictées." checked={audio.enabled} onChange={(enabled) => setAudio({ enabled })} />
          <fieldset className="settings-fieldset" disabled={!audio.enabled}>
            <legend className="sr-only">Options audio</legend>
            <Row label="Accent préféré">
              <Segmented
                label="Accent préféré"
                value={audio.accent}
                onChange={(accent) => setAudio({ accent, voiceURI: null })}
                options={[
                  { value: 'en-GB', label: 'Britannique' },
                  { value: 'en-US', label: 'Américain' },
                  { value: 'any', label: 'Indifférent' },
                ]}
              />
            </Row>
            <Row label="Voix" hint={voices.length ? `${voices.length} voix anglaise${voices.length > 1 ? 's' : ''} disponible${voices.length > 1 ? 's' : ''} sur cet appareil.` : "Aucune voix anglaise détectée pour l'instant : la voix par défaut du navigateur sera utilisée."}>
              <select className="select" value={audio.voiceURI ?? ''} onChange={(e) => setAudio({ voiceURI: e.target.value || null })} aria-label="Voix anglaise">
                <option value="">Automatique (meilleure voix pour l'accent choisi)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </Row>
            <Row label={`Vitesse de lecture : ${audio.rate.toFixed(2).replace('.', ',')}×`} hint="Le bouton « Lent » des exercices ralentit encore de 30 %.">
              <input type="range" min={0.6} max={1.3} step={0.05} value={audio.rate} onChange={(e) => setAudio({ rate: Number(e.target.value) })} aria-label="Vitesse de lecture" />
            </Row>
            <Switch label="Lecture automatique" description="Lit la phrase dès l'affichage des exercices d'écoute et de dictée." checked={audio.autoplay} onChange={(autoplay) => setAudio({ autoplay })} />
            <div>
              <Button variant="secondary" icon={IconPlay} onClick={() => void test()} disabled={testing}>
                {testing ? 'Lecture…' : 'Tester la voix'}
              </Button>
            </div>
          </fieldset>
        </>
      )}
    </Section>
  );
}

function DataSection() {
  const storage = useAppState((s) => s.storage);
  const signedIn = useAccount((s) => !!s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ name: string; text: string } | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const doExport = async () => {
    setMessage(null);
    try {
      const json = await store.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passerelle-progression-${dayKey(Date.now())}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ tone: 'ok', text: 'Sauvegarde exportée.' });
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : String(e) });
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    if (file.size > 30 * 1024 * 1024) {
      setMessage({ tone: 'error', text: 'Fichier trop volumineux pour être une sauvegarde Passerelle.' });
      return;
    }
    const text = await file.text();
    setPending({ name: file.name, text });
  };

  const doImport = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await store.importData(pending.text);
      setMessage({ tone: 'ok', text: 'Progression importée avec succès.' });
    } catch (e) {
      setMessage({ tone: 'error', text: `Import refusé : ${e instanceof Error ? e.message : String(e)} Vos données actuelles n'ont pas été modifiées.` });
    } finally {
      setBusy(false);
      setPending(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const doReset = async () => {
    setBusy(true);
    try {
      await store.reset();
      setMessage({ tone: 'ok', text: 'Toutes les données ont été effacées.' });
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
      setResetOpen(false);
      setConfirmed(false);
    }
  };

  return (
    <Section icon={IconDatabase} title="Vos données" id="set-data">
      {storage === 'memory' ? (
        <div className="notice notice-warning">
          <IconWarning size={20} aria-hidden />
          <p>Le stockage du navigateur est indisponible (navigation privée ?) : votre progression sera perdue à la fermeture de l'onglet. Exportez-la pour la conserver.</p>
        </div>
      ) : (
        <p className="muted small">
          Votre progression est enregistrée dans ce navigateur (IndexedDB).{' '}
          {signedIn ? 'Elle est aussi synchronisée avec votre compte.' : 'Exportez-la régulièrement pour la sauvegarder, ou créez un compte pour la retrouver sur vos autres appareils.'}
        </p>
      )}
      <div className="row row-wrap">
        <Button variant="secondary" icon={IconDownload} onClick={() => void doExport()}>
          Exporter ma progression
        </Button>
        <Button variant="secondary" icon={IconUpload} onClick={() => fileRef.current?.click()}>
          Importer une sauvegarde
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        <span className="spacer" />
        <Button variant="ghost" className="danger-text" icon={IconTrash} onClick={() => setResetOpen(true)}>
          Tout réinitialiser
        </Button>
      </div>
      {message && (
        <p className={`notice ${message.tone === 'ok' ? 'notice-success' : 'notice-danger'}`} role="status">
          {message.tone === 'ok' ? <IconCheck size={18} aria-hidden /> : <IconWarning size={18} aria-hidden />}
          <span>{message.text}</span>
        </p>
      )}

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Importer cette sauvegarde ?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Annuler
            </Button>
            <Button onClick={() => void doImport()} disabled={busy}>
              {busy ? 'Import…' : 'Remplacer ma progression'}
            </Button>
          </>
        }
      >
        <p>
          Le fichier <strong>{pending?.name}</strong> va remplacer toute votre progression actuelle. Le fichier est vérifié avant tout remplacement : s'il est invalide, rien ne sera modifié.
        </p>
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setConfirmed(false);
        }}
        title="Effacer toutes les données ?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setResetOpen(false);
                setConfirmed(false);
              }}
            >
              Annuler
            </Button>
            <Button variant="danger" icon={IconTrash} disabled={!confirmed || busy} onClick={() => void doReset()}>
              Tout effacer
            </Button>
          </>
        }
      >
        <p>Progression, statistiques, erreurs enregistrées, révisions et réglages seront définitivement supprimés de ce navigateur.</p>
        {signedIn && (
          <p className="notice notice-warning">
            <IconWarning size={18} aria-hidden />
            <span>Vous êtes connecté : la progression vide sera ensuite synchronisée et remplacera celle de votre compte. Pour seulement retirer vos données de cet appareil, déconnectez-vous depuis la page Compte.</span>
          </p>
        )}
        <p className="muted small">Conseil : exportez d'abord votre progression si vous souhaitez pouvoir la restaurer.</p>
        <label className="check-row">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span>Je comprends que cette action est irréversible.</span>
        </label>
      </Modal>
    </Section>
  );
}
