import { useEffect, useMemo, useRef, useState } from 'react'
import { bendImage } from './engine.js'

const SOURCES = ['RED', 'GREEN', 'BLUE', 'LUMA', 'X', 'Y', 'NOISE']
const TARGETS = ['RED', 'GREEN', 'BLUE', 'X_OFFSET', 'Y_OFFSET', 'THRESHOLD', 'POSTERIZE']
const MODES = ['PATCH', 'BRIDGE', 'SHORT']

const sourceColors = {
  RED: '#ff355e',
  GREEN: '#74ff66',
  BLUE: '#3fd5ff',
  LUMA: '#f8ff8d',
  X: '#ff70e8',
  Y: '#b69cff',
  NOISE: '#ff9f43',
}

const targetColors = {
  RED: '#ff355e',
  GREEN: '#74ff66',
  BLUE: '#3fd5ff',
  X_OFFSET: '#ff70e8',
  Y_OFFSET: '#b69cff',
  THRESHOLD: '#f8ff8d',
  POSTERIZE: '#ff9f43',
}

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function displayPort(name) {
  return name.replaceAll('_', ' ')
}

function App() {
  const canvasRef = useRef(null)
  const sourceDataRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [imageName, setImageName] = useState('')
  const [pendingSource, setPendingSource] = useState(null)
  const [connections, setConnections] = useState([])
  const [selectedWireId, setSelectedWireId] = useState(null)
  const [status, setStatus] = useState('LOAD AN IMAGE. THEN TOUCH A SOURCE JACK AND A TARGET JACK.')
  const [savedBends, setSavedBends] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('curcuitbent:bends') || '[]')
    } catch {
      return []
    }
  })

  const selectedWire = connections.find(w => w.id === selectedWireId) || null

  useEffect(() => {
    if (!sourceDataRef.current || !dimensions.width) return
    const bent = bendImage(
      sourceDataRef.current,
      dimensions.width,
      dimensions.height,
      connections,
    )
    const canvas = canvasRef.current
    if (!canvas || !bent) return
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    canvas.getContext('2d').putImageData(bent, 0, 0)
  }, [connections, dimensions])

  const wireCountByTarget = useMemo(() => {
    const counts = {}
    for (const wire of connections) counts[wire.target] = (counts[wire.target] || 0) + 1
    return counts
  }, [connections])

  function loadImage(file) {
    if (!file) return

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const maxDimension = 900
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))

      const buffer = document.createElement('canvas')
      buffer.width = width
      buffer.height = height
      const ctx = buffer.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0, width, height)
      sourceDataRef.current = ctx.getImageData(0, 0, width, height)

      setDimensions({ width, height })
      setImageName(file.name)
      setStatus('IMAGE HOT. PATCH SOMETHING THAT SHOULD NOT BE PATCHED.')
      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      setStatus('THAT IMAGE REFUSED TO ENTER THE MACHINE.')
      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  function chooseSource(source) {
    setPendingSource(source)
    setStatus(`${source} ARMED. NOW TOUCH A TARGET JACK.`)
  }

  function chooseTarget(target) {
    if (!pendingSource) {
      setStatus('PICK A SOURCE JACK FIRST.')
      return
    }

    const wire = {
      id: makeId(),
      source: pendingSource,
      target,
      mode: 'PATCH',
      strength: 0.65,
    }

    setConnections(current => [...current, wire])
    setSelectedWireId(wire.id)
    setPendingSource(null)
    setStatus(`${wire.source} → ${displayPort(wire.target)} CONNECTED.`)
  }

  function updateSelected(patch) {
    if (!selectedWireId) return
    setConnections(current =>
      current.map(wire => wire.id === selectedWireId ? { ...wire, ...patch } : wire),
    )
  }

  function removeSelected() {
    if (!selectedWireId) return
    setConnections(current => current.filter(wire => wire.id !== selectedWireId))
    setSelectedWireId(null)
    setStatus('WIRE YANKED OUT.')
  }

  function lickCircuitBoard() {
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)]
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)]
    const mode = MODES[Math.floor(Math.random() * MODES.length)]
    const strength = Number((0.25 + Math.random() * 0.7).toFixed(2))
    const wire = { id: makeId(), source, target, mode, strength }

    setConnections(current => [...current, wire])
    setSelectedWireId(wire.id)
    setStatus(`⚡ ACCIDENTAL CONTACT: ${source} → ${displayPort(target)} / ${mode}`)
  }

  function clearBoard() {
    setConnections([])
    setSelectedWireId(null)
    setPendingSource(null)
    setStatus('BOARD CLEARED. THE CAMERA HAS FORGOTTEN ITS SINS.')
  }

  function exportPng() {
    const canvas = canvasRef.current
    if (!canvas || !dimensions.width) return
    const link = document.createElement('a')
    const stem = imageName ? imageName.replace(/\.[^.]+$/, '') : 'image'
    link.download = `${stem}-curcuitbent.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function saveBend() {
    if (!connections.length) {
      setStatus('THERE IS NOTHING TO SAVE. COMMIT A SMALL ELECTRICAL CRIME FIRST.')
      return
    }

    const suggested = `SPECIMEN ${String(savedBends.length + 1).padStart(3, '0')}`
    const name = window.prompt('NAME THIS BEND', suggested)
    if (!name) return

    const bend = {
      id: makeId(),
      name,
      createdAt: new Date().toISOString(),
      connections,
    }

    const next = [bend, ...savedBends]
    setSavedBends(next)
    localStorage.setItem('curcuitbent:bends', JSON.stringify(next))
    setStatus(`${name.toUpperCase()} PRESERVED IN A JAR.`)
  }

  function loadBend(bend) {
    const restored = bend.connections.map(wire => ({ ...wire, id: makeId() }))
    setConnections(restored)
    setSelectedWireId(null)
    setPendingSource(null)
    setStatus(`${bend.name.toUpperCase()} REANIMATED.`)
  }

  function deleteBend(id) {
    const next = savedBends.filter(bend => bend.id !== id)
    setSavedBends(next)
    localStorage.setItem('curcuitbent:bends', JSON.stringify(next))
  }

  const sourceY = index => 34 + index * 42
  const targetY = index => 34 + index * 42

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">VIRTUAL IMAGE INSTRUMENT // V0.1</p>
          <h1>CURCUIT<span>BENT</span></h1>
        </div>
        <p className="manifesto">
          NOT A FILTER. A CAMERA SIGNAL WITH THE BACK PANEL RIPPED OFF.
        </p>
      </header>

      <section className="workbench">
        <div className="viewer panel">
          <div className="panel-topline">
            <span>IMAGE MONITOR</span>
            <span>{dimensions.width ? `${dimensions.width}×${dimensions.height}` : 'NO SIGNAL'}</span>
          </div>

          <div className="screen">
            <canvas ref={canvasRef} className={dimensions.width ? '' : 'empty'} />
            {!dimensions.width && (
              <div className="empty-message">
                <strong>NO IMAGE SIGNAL</strong>
                <span>Feed the machine a JPG, PNG, or WEBP.</span>
              </div>
            )}
          </div>

          <div className="image-controls">
            <label className="button hot">
              LOAD IMAGE
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={event => loadImage(event.target.files?.[0])}
              />
            </label>
            <button className="button" onClick={exportPng} disabled={!dimensions.width}>
              EXPORT PNG
            </button>
          </div>
        </div>

        <div className="patcher panel">
          <div className="panel-topline">
            <span>PATCH BAY</span>
            <span>{connections.length} WIRE{connections.length === 1 ? '' : 'S'}</span>
          </div>

          <div className="status">{status}</div>

          <svg className="patchboard" viewBox="0 0 520 330" role="img" aria-label="Circuit patch bay">
            <text x="18" y="16" className="bay-heading">SIGNAL OUT</text>
            <text x="502" y="16" textAnchor="end" className="bay-heading">SIGNAL IN</text>

            {connections.map(wire => {
              const sIndex = SOURCES.indexOf(wire.source)
              const tIndex = TARGETS.indexOf(wire.target)
              const y1 = sourceY(sIndex)
              const y2 = targetY(tIndex)
              const selected = wire.id === selectedWireId
              return (
                <path
                  key={wire.id}
                  d={`M 146 ${y1} C 220 ${y1}, 300 ${y2}, 374 ${y2}`}
                  className={`patch-cable ${selected ? 'selected' : ''}`}
                  style={{ '--wire-color': sourceColors[wire.source] }}
                  onClick={() => setSelectedWireId(wire.id)}
                />
              )
            })}

            {SOURCES.map((source, index) => {
              const y = sourceY(index)
              return (
                <g
                  key={source}
                  className={`port source-port ${pendingSource === source ? 'armed' : ''}`}
                  onClick={() => chooseSource(source)}
                >
                  <text x="18" y={y + 5}>{source}</text>
                  <circle className="port-hit" cx="140" cy={y} r="16" />
                  <circle
                    className="jack"
                    cx="140"
                    cy={y}
                    r="8"
                    style={{ '--port-color': sourceColors[source] }}
                  />
                </g>
              )
            })}

            {TARGETS.map((target, index) => {
              const y = targetY(index)
              return (
                <g
                  key={target}
                  className="port target-port"
                  onClick={() => chooseTarget(target)}
                >
                  <circle className="port-hit" cx="380" cy={y} r="16" />
                  <circle
                    className="jack"
                    cx="380"
                    cy={y}
                    r="8"
                    style={{ '--port-color': targetColors[target] }}
                  />
                  <text x="502" y={y + 5} textAnchor="end">
                    {displayPort(target)}{wireCountByTarget[target] ? ` ×${wireCountByTarget[target]}` : ''}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="chaos-row">
            <button className="button danger" onClick={lickCircuitBoard}>⚡ LICK THE CIRCUIT BOARD</button>
            <button className="button" onClick={clearBoard}>CLEAR BOARD</button>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="inspector panel">
          <div className="panel-topline"><span>WIRE INSPECTOR</span><span>{selectedWire ? 'LIVE' : 'IDLE'}</span></div>
          {selectedWire ? (
            <div className="inspector-body">
              <div className="wire-title">
                <span style={{ color: sourceColors[selectedWire.source] }}>{selectedWire.source}</span>
                <b>→</b>
                <span>{displayPort(selectedWire.target)}</span>
              </div>

              <div className="mode-row">
                {MODES.map(mode => (
                  <button
                    key={mode}
                    className={`mode-button ${selectedWire.mode === mode ? 'active' : ''}`}
                    onClick={() => updateSelected({ mode })}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <label className="slider-label">
                <span>STRENGTH</span>
                <output>{Math.round(selectedWire.strength * 100)}%</output>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedWire.strength}
                  onChange={event => updateSelected({ strength: Number(event.target.value) })}
                />
              </label>

              <p className="mode-help">
                {selectedWire.mode === 'PATCH' && 'Signal politely modulates the destination.'}
                {selectedWire.mode === 'BRIDGE' && 'Signals contaminate each other around their midpoint.'}
                {selectedWire.mode === 'SHORT' && 'The source aggressively takes over the destination.'}
              </p>

              <button className="button danger ghost" onClick={removeSelected}>YANK THIS WIRE</button>
            </div>
          ) : (
            <div className="idle-card">
              <strong>NO WIRE SELECTED</strong>
              <span>Tap any glowing cable to alter the damage.</span>
            </div>
          )}
        </div>

        <div className="specimens panel">
          <div className="panel-topline"><span>SPECIMEN JARS</span><span>{savedBends.length} SAVED</span></div>
          <div className="specimen-actions">
            <button className="button hot" onClick={saveBend}>SAVE CURRENT BEND</button>
          </div>

          <div className="specimen-list">
            {!savedBends.length && (
              <div className="idle-card">
                <strong>EMPTY SHELF</strong>
                <span>Saved bends live in this browser for now.</span>
              </div>
            )}

            {savedBends.map(bend => (
              <article className="specimen" key={bend.id}>
                <button className="specimen-main" onClick={() => loadBend(bend)}>
                  <strong>{bend.name}</strong>
                  <span>{bend.connections.length} wire{bend.connections.length === 1 ? '' : 's'}</span>
                </button>
                <button className="delete" onClick={() => deleteBend(bend.id)} aria-label={`Delete ${bend.name}`}>×</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span>THE MACHINE IS ALLOWED TO BE WRONG.</span>
        <span>CURCUITBENT // SIGNAL GRAPH PROTOTYPE</span>
      </footer>
    </main>
  )
}

export default App
