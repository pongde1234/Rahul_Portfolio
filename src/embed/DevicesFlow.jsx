import { useCallback, useEffect, useState } from 'react'
import { Home, Monitor, Bell, LayoutDashboard, Plus, MoreVertical, Thermometer, Waves, Snowflake, Cpu, Router, CirclePlus, FileSpreadsheet } from 'lucide-react'
import {
  ActionList, ActionListItem, Alert, AppShell, Badge, Button, Card, CardBody, CardHeader, CardHeaderLeading, CardMetric, Divider,
  DropdownMenu, DropdownMenuOverlay, DropdownMenuTrigger, FileUpload,
  Modal, ModalBody, ModalFooter, ModalHeader, NAV_ICON_SIZE, ProgressBar, SearchInput, Table,
} from '@faclon-labs/fds'
import Glow from './Glow.jsx'

// The "Adding many devices" prototype, built the way the FDS Device page pattern describes it:
//   the AppShell, with Devices as a page in its menu -> a Devices page of device cards with Add device in its toolbar
//   -> Add device pop-up (one by one or bulk) -> Bulk add: Upload -> check the devices, fix the errors -> Confirm
//   -> the upload runs: an FDS Alert above the search bar shows the bar, the count and "View progress" -> it finishes.
// The real upload takes about 8 minutes, so here it is sped up and finishes in about 15 seconds.
// It opens on the Devices page. A glowing pointer sits beside the control to click next.
// "One by one" is shown but not wired: this prototype follows the bulk path only.
// The data is made up. Nothing is sent anywhere, and no file dialog opens (the pick is simulated).
//
// The case study's timeline (under the frame) and this page stay in step by messages:
//   this page -> the case study: { type: 'proto:step', step }   whenever the screen changes
//   the case study -> this page: { type: 'proto:goto', step }   when a step in the timeline is clicked
// The steps (screens): devices, choose, upload, file, preview, fixed, progress (uploading), done (finished).

const icon = (Icon) => <Icon size={NAV_ICON_SIZE} />
const NAV = [
  { id: 'home', label: 'Home', icon: icon(Home) },
  { id: 'devices', label: 'Devices', icon: icon(Monitor) },
  { id: 'alerts', label: 'Alerts', icon: icon(Bell) },
  { id: 'dashboards', label: 'Dashboards', icon: icon(LayoutDashboard) },
]

const GROUPS = [
  {
    name: 'Favourites',
    devices: [
      { name: 'Boiler sensor 01', type: 'Temperature sensor', icon: Thermometer, added: '12 Mar 2026' },
      { name: 'Pump 14', type: 'Flow meter', icon: Waves, added: '03 Apr 2026' },
    ],
  },
  {
    name: 'Boiler house',
    devices: [
      { name: 'Chiller 07', type: 'Chiller', icon: Snowflake, added: '21 Jan 2026', disconnected: true },
      { name: 'Valve 03', type: 'Valve controller', icon: Cpu, added: '08 Feb 2026' },
      { name: 'Gateway 02', type: 'Gateway', icon: Router, added: '30 Nov 2025' },
    ],
  },
]

// the sheet the visitor "uploads": two rows have a mistake until they are fixed
const sheet = (fixed) => [
  { id: 'FKEM_K11', name: 'Boiler sensor 11', ok: true },
  { id: fixed ? 'FKEM_K15' : '', name: 'Pump 15', ok: fixed, error: 'Device ID is missing' },
  { id: 'FKEM_K17', name: 'Chiller 17', ok: true },
  { id: 'FKEM_K19', name: fixed ? 'Valve 19' : '', ok: fixed, error: 'Device name is missing' },
]
const SHEET_COLUMNS = [
  { key: 'id', header: 'Device ID', isRowHeader: true, cell: (r) => r.id || '—' },
  { key: 'name', header: 'Device name', cell: (r) => r.name || '—' },
  { key: 'ok', header: 'Status', cell: (r) => (r.ok ? <Badge label="Ready" color="Positive" /> : <Badge label={r.error} color="Negative" />) },
]

// what to do next, for screen readers (the sighted hint is the glowing pointer)
const NEXT = {
  devices: 'Next: click Add device.',
  choose: 'Next: click the Bulk add card.',
  upload: 'Next: click Upload.',
  file: 'Next: click Next.',
  preview: 'Next: click Fix errors.',
  fixed: 'Next: click Confirm.',
  progress: 'The upload is in progress. Click View progress to see it.',
  done: 'The upload is finished.',
}

// the upload after Confirm
const TOTAL = 250
const ADDED = [
  { name: 'Boiler sensor 11', type: 'Temperature sensor', icon: Thermometer, added: '14 Nov 2026' },
  { name: 'Pump 15', type: 'Flow meter', icon: Waves, added: '14 Nov 2026' },
  { name: 'Chiller 17', type: 'Chiller', icon: Snowflake, added: '14 Nov 2026' },
  { name: 'Valve 19', type: 'Valve controller', icon: Cpu, added: '14 Nov 2026' },
]
// the rows in the "View progress" pop-up: added, adding now, or waiting, by how far the upload has got
const progressRows = (count) =>
  ['FKEM_K11 · Boiler sensor 11', 'FKEM_K15 · Pump 15', 'FKEM_K17 · Chiller 17', 'FKEM_K19 · Valve 19', 'FKEM_K20 · Gateway 20'].map((name, i) => {
    const at = Math.floor(count / (TOTAL / 5))
    const status = count >= TOTAL || i < at ? 'Added' : i === at ? 'Adding' : 'Waiting'
    return { name, status }
  })
const PROGRESS_COLUMNS = [
  { key: 'name', header: 'Device', isRowHeader: true },
  { key: 'status', header: 'Status', cell: (r) => <Badge label={r.status} color={r.status === 'Added' ? 'Positive' : r.status === 'Adding' ? 'Information' : 'Neutral'} /> },
]

// a stand-in for the file a visitor would pick: no file dialog opens in a prototype
const demoFile = () => {
  const f = new File([new ArrayBuffer(48200)], 'Bulk Upload Template.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  f.id = 'demo-sheet'
  f.status = 'success'
  return f
}

const grid = { display: 'grid', gap: 'var(--spacing-16)' }

// the inside of a choice card: a centred column of an icon tile, a title and one line.
// An available choice has a brand tile; one that is not available yet has a neutral tile and a muted title.
function ChoiceBody({ icon: Icon, title, line, available }) {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 'var(--spacing-8)', textAlign: 'center' }}>
      <span
        aria-hidden="true"
        style={{
          display: 'grid', placeItems: 'center',
          width: 'calc(var(--spacing-32) + var(--spacing-8))', height: 'calc(var(--spacing-32) + var(--spacing-8))',
          borderRadius: 'var(--radius-m)',
          background: available ? 'var(--background-brand-faded)' : 'var(--background-neutral-faded)',
          color: available ? 'var(--text-brand-normal)' : 'var(--text-neutral-muted)',
        }}
      >
        <Icon size={20} />
      </span>
      <div className="BodyMediumSemibold" style={{ color: available ? 'var(--text-neutral-normal)' : 'var(--text-neutral-muted)' }}>{title}</div>
      <div className="BodySmallRegular" style={{ color: 'var(--text-neutral-subtle)' }}>{line}</div>
    </div>
  )
}

function DeviceCard({ device }) {
  const Icon = device.icon
  return (
    <Card padding={16}>
      <CardBody>
        <div style={{ display: 'grid', gap: 'var(--spacing-12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)' }}>
            <span
              aria-hidden="true"
              style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 'calc(var(--spacing-32) + var(--spacing-8))', height: 'calc(var(--spacing-32) + var(--spacing-8))', borderRadius: 'var(--radius-m)', background: 'var(--background-neutral-faded)', color: 'var(--text-neutral-normal)' }}
            >
              <Icon size={20} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="BodyMediumSemibold" style={{ color: 'var(--text-neutral-normal)' }}>{device.name}</div>
              <div className="BodySmallRegular" style={{ color: 'var(--text-neutral-subtle)' }}>{device.type}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button iconOnly variant="ghost" tone="neutral" size="sm" aria-label={`Actions for ${device.name}`}><MoreVertical size={16} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuOverlay>
                <ActionList accessibilityLabel={`Actions for ${device.name}`}>
                  <ActionListItem title="Edit device" value="edit" />
                  <ActionListItem title="Delete device" value="delete" intent="negative" />
                </ActionList>
              </DropdownMenuOverlay>
            </DropdownMenu>
          </div>
          <Divider />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-8)' }}>
            <span className="BodySmallRegular" style={{ color: 'var(--text-neutral-muted)' }}>Added on {device.added}</span>
            {device.disconnected && <Badge label="Disconnected" color="Negative" />}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default function DevicesFlow() {
  // `embed.html#choose` opens straight on the Add device pop-up (used for the still image on the work list): no hints there
  const still = typeof window !== 'undefined' && window.location.hash === '#choose'
  const [page, setPage] = useState('devices')
  const [dlg, setDlg] = useState(still ? 'choose' : null)
  const [mode, setMode] = useState(still ? 'bulk' : '')
  const [file, setFile] = useState(null)
  const [fixed, setFixed] = useState(false)
  // the upload after Confirm: idle -> running (count climbs to TOTAL) -> done
  const [upload, setUpload] = useState({ status: 'idle', count: 0 })
  const [progressOpen, setProgressOpen] = useState(false)

  const close = () => {
    setDlg(null)
    setMode('')
    setFile(null)
    setFixed(false)
  }
  // Confirm: the pop-up closes straight to the Devices page and the upload starts
  const startUpload = () => {
    close()
    setUpload({ status: 'running', count: 0 })
  }

  // the sped-up upload: about 15 seconds instead of 8 minutes
  useEffect(() => {
    if (upload.status !== 'running') return undefined
    const id = setInterval(() => {
      setUpload((u) => {
        if (u.status !== 'running') return u
        const count = Math.min(TOTAL, u.count + 3.5)
        return count >= TOTAL ? { status: 'done', count: TOTAL } : { status: 'running', count }
      })
    }, 200)
    return () => clearInterval(id)
  }, [upload.status])

  // which screen is showing, as one of: devices, choose, upload, file, preview, fixed, progress, done
  const step =
    dlg === 'choose' ? 'choose'
    : dlg === 'upload' ? (file ? 'file' : 'upload')
    : dlg === 'preview' ? (fixed ? 'fixed' : 'preview')
    : upload.status === 'running' ? 'progress'
    : upload.status === 'done' ? 'done'
    : 'devices'

  // `embed.html?solo=1` is a copy that is not tied to the case study's timeline (the "Try the flow" demo further down the page)
  const solo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('solo')

  // tell the case study's timeline which screen this is
  useEffect(() => {
    if (!solo && window.parent !== window) window.parent.postMessage({ type: 'proto:step', step }, window.location.origin)
  }, [step, solo])

  // a step in the timeline was clicked: show that screen
  const goto = useCallback((to) => {
    setPage('devices')
    setProgressOpen(false)
    setDlg(to === 'choose' ? 'choose' : to === 'upload' || to === 'file' ? 'upload' : to === 'preview' || to === 'fixed' ? 'preview' : null)
    setMode(to === 'devices' || to === 'choose' ? '' : 'bulk')
    setFile(['file', 'preview', 'fixed'].includes(to) ? demoFile() : null)
    setFixed(to === 'fixed')
    // the upload is only running or finished on its own two screens; every earlier screen shows the page before it started
    setUpload(to === 'progress' ? { status: 'running', count: 90 } : to === 'done' ? { status: 'done', count: TOTAL } : { status: 'idle', count: 0 })
  }, [])
  useEffect(() => {
    if (solo) return undefined
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'proto:goto') return
      goto(e.data.step)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [goto, solo])

  // a click on the drop zone would open the system file picker: stand in for the pick instead
  const pickFile = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setFile(demoFile())
  }

  const hint = !still // the glowing pointer is off in the still image

  return (
    <>
      <AppShell
        navItems={NAV}
        activeId={page}
        routing="none"
        onNavigate={(id) => {
          if (!dlg && (id === 'home' || id === 'devices')) setPage(id)
        }}
      >
        {page === 'home' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-64) * 3), 1fr))', gap: 'var(--spacing-16)', alignContent: 'start' }}>
            {[['Devices online', '1,240'], ['Open alerts', '3'], ['Data points today', '4.2M']].map(([title, value]) => (
              <Card key={title} padding={16}>
                <CardHeader showDivider={false}>
                  <CardHeaderLeading title={title} />
                </CardHeader>
                <CardBody>
                  <CardMetric value={value} />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-24)', alignContent: 'start' }}>
            {/* the upload: an FDS Alert above the search bar with the bar, the count and View progress */}
            {upload.status !== 'idle' && (
              <Glow block on={hint && step === 'progress'}>
                <Alert
                  isFullWidth
                  isDismissible={false}
                  color={upload.status === 'done' ? 'Positive' : 'Information'}
                  title={upload.status === 'done' ? '250 devices added' : 'Device upload is in progress'}
                  description={
                    <div style={{ display: 'grid', gap: 'var(--spacing-8)' }}>
                      {upload.status === 'done' && <span>Done in 8 min. Adding 100 devices used to take 20.</span>}
                      <ProgressBar
                        label={`${Math.floor(upload.count)} of ${TOTAL} devices`}
                        showPercentage
                        value={Math.round((upload.count / TOTAL) * 100)}
                        color={upload.status === 'done' ? 'Positive' : 'Brand'}
                      />
                    </div>
                  }
                  actions={{ primary: { text: 'View progress', onClick: () => setProgressOpen(true) } }}
                />
              </Glow>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SearchInput accessibilityLabel="Search devices" placeholder="Search devices" />
              </div>
              <Glow on={hint && step === 'devices'}>
                <Button label="Add device" leadingIcon={<Plus size={16} />} onClick={() => setDlg('choose')} />
              </Glow>
            </div>
            {upload.status === 'done' && (
              <section style={{ display: 'grid', gap: 'var(--spacing-8)' }}>
                <h2 className="BodyMediumSemibold" style={{ margin: 0, color: 'var(--text-neutral-subtle)' }}>Just added</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-64) * 4), 1fr))', gap: 'var(--spacing-16)' }}>
                  {ADDED.map((d) => <DeviceCard key={d.name} device={d} />)}
                </div>
              </section>
            )}
            {GROUPS.map((g) => (
              <section key={g.name} style={{ display: 'grid', gap: 'var(--spacing-8)' }}>
                <h2 className="BodyMediumSemibold" style={{ margin: 0, color: 'var(--text-neutral-subtle)' }}>{g.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-64) * 4), 1fr))', gap: 'var(--spacing-16)' }}>
                  {g.devices.map((d) => <DeviceCard key={d.name} device={d} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </AppShell>

      {/* 1. one by one, or bulk: two selectable cards (the CreationView pattern's flow selection). Clicking a card goes straight on. */}
      <Modal isOpen={dlg === 'choose'} onDismiss={close} size="sm">
        <ModalHeader title="Add device" subtitle="How do you want to add devices?" />
        <ModalBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-16)' }}>
            {/* not part of this prototype: a choice that is not available takes no click, and shows it with a muted tile and title */}
            <Card padding={16}>
              <CardBody>
                <ChoiceBody icon={CirclePlus} title="Add one by one" line="Add one device with its name and ID." available={false} />
              </CardBody>
            </Card>
            <Glow block on={hint && step === 'choose'}>
              <Card
                padding={16}
                isSelected={mode === 'bulk'}
                accessibilityLabel="Select Bulk add"
                onClick={() => {
                  setMode('bulk')
                  setDlg('upload')
                }}
              >
                <CardBody>
                  <ChoiceBody icon={FileSpreadsheet} title="Bulk add" line="Add many devices from an Excel sheet." available />
                </CardBody>
              </Card>
            </Glow>
          </div>
        </ModalBody>
      </Modal>

      {/* 2. upload the sheet */}
      <Modal isOpen={dlg === 'upload'} onDismiss={close} size="md">
        <ModalHeader title="Bulk add devices" subtitle="Upload your Excel sheet." />
        <ModalBody>
          <div style={grid}>
            <Glow block on={hint && step === 'upload'}>
              <div style={{ width: '100%' }} onClickCapture={pickFile} onKeyDownCapture={(e) => (e.key === 'Enter' || e.key === ' ') && pickFile(e)}>
                <FileUpload
                  accessibilityLabel="Upload file"
                  accept=".xlsx,.csv"
                  files={file ? [file] : []}
                  onChange={({ files }) => setFile(files[0] ?? null)}
                  helpText="Excel (.xlsx) or CSV."
                />
              </div>
            </Glow>
            {file && <Alert isFullWidth isDismissible={false} color="Positive" title="250 devices found" description="Next, check them before they are added." />}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" tone="neutral" label="Cancel" onClick={close} />
          <Glow on={hint && step === 'file'}>
            <Button label="Next" isDisabled={!file} onClick={() => setDlg('preview')} />
          </Glow>
        </ModalFooter>
      </Modal>

      {/* 3. check the devices and fix the errors */}
      <Modal isOpen={dlg === 'preview'} onDismiss={close} size="lg">
        <ModalHeader title="Check your devices" subtitle="Showing 4 of 250." />
        <ModalBody>
          <div style={grid}>
            {fixed ? (
              <Alert isFullWidth isDismissible={false} color="Positive" title="All errors fixed" description="Every device is ready to add." />
            ) : (
              <Glow block on={hint && step === 'preview'}>
                <Alert
                  isFullWidth
                  isDismissible={false}
                  color="Negative"
                  title="2 devices need fixing"
                  description="A device ID and a device name are missing."
                  actions={{ primary: { text: 'Fix errors', onClick: () => setFixed(true) } }}
                />
              </Glow>
            )}
            <Table accessibilityLabel="Devices to add" data={sheet(fixed)} columns={SHEET_COLUMNS} getRowId={(r) => r.id || r.name || r.error} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" tone="neutral" label="Cancel" onClick={close} />
          <Glow on={hint && step === 'fixed'}>
            <Button label="Confirm" isDisabled={!fixed} onClick={startUpload} />
          </Glow>
        </ModalFooter>
      </Modal>

      {/* 4. View progress: how far the upload has got, device by device */}
      <Modal isOpen={progressOpen} onDismiss={() => setProgressOpen(false)} size="md">
        <ModalHeader title="Upload progress" subtitle={`${Math.floor(upload.count)} of ${TOTAL} devices`} />
        <ModalBody>
          <div style={grid}>
            <ProgressBar
              label={upload.status === 'done' ? 'Done' : 'Adding devices'}
              showPercentage
              value={Math.round((upload.count / TOTAL) * 100)}
              color={upload.status === 'done' ? 'Positive' : 'Brand'}
            />
            <Table accessibilityLabel="Upload progress" data={progressRows(upload.count)} columns={PROGRESS_COLUMNS} getRowId={(r) => r.name} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button label="Close" onClick={() => setProgressOpen(false)} />
        </ModalFooter>
      </Modal>

      {/* what to do next, for screen readers */}
      {hint && <div className="sr-hint" aria-live="polite">{NEXT[step]}</div>}
    </>
  )
}
