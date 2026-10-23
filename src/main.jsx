import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown,
  Columns2, Expand, Grid2X2, Heart, Image as ImageIcon,
  LayoutList, MapPin, Maximize2, MousePointer2, Pencil, Plus,
  Search, Share2, Sparkles, Undo2, Upload, X
} from 'lucide-react'
import './styles.css'

import { seedPhotos } from './sample-content.js'
const albumPalette = ['#ef715d', '#71a8b8', '#b7a063', '#8a9a5b']

function Logo() {
  return <div className="logo" aria-label="记忆随笔首页"><span className="logo-mark"><i></i><i></i></span><b>记忆随笔</b><small>MEMORY JOURNAL</small></div>
}

function App() {
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('memory-journal-v1')
      return saved ? JSON.parse(saved) : seedPhotos
    } catch { return seedPhotos }
  })
  const [view, setView] = useState('photos')
  const [albumFilter, setAlbumFilter] = useState('全部照片')
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [toast, setToast] = useState('')
  const fileInput = useRef(null)

  useEffect(() => {
    const clean = photos.filter(p => !p.src.startsWith('blob:'))
    localStorage.setItem('memory-journal-v1', JSON.stringify(clean))
  }, [photos])

  const notify = (message) => {
    setToast(message)
    window.clearTimeout(notify.timer)
    notify.timer = window.setTimeout(() => setToast(''), 2400)
  }

  const visiblePhotos = useMemo(() => photos.filter(photo => {
    const byAlbum = albumFilter === '全部照片' || albumFilter === '已收藏' ?
      (albumFilter !== '已收藏' || photo.favorite) : photo.album === albumFilter
    const q = search.trim().toLowerCase()
    const bySearch = !q || [photo.title, photo.place, photo.album, photo.note, ...(photo.tags || [])].join(' ').toLowerCase().includes(q)
    return byAlbum && bySearch
  }), [photos, albumFilter, search])

  const activePhoto = photos.find(p => p.id === activeId)
  const updatePhoto = (nextPhoto) => setPhotos(items => items.map(p => p.id === nextPhoto.id ? nextPhoto : p))

  const toggleFavorite = (id) => setPhotos(items => items.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p))

  const handleUpload = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const additions = files.map((file, index) => ({
      id: Date.now() + index,
      src: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, ''),
      date: new Date().toISOString().slice(0, 10).replaceAll('-', '.'),
      place: '待补充地点', album: '最近导入', note: '', tags: ['新照片'], favorite: false,
      aspect: index % 3 === 1 ? 'tall' : 'standard', pins: [], strokes: []
    }))
    setPhotos(items => [...additions, ...items])
    setAlbumFilter('全部照片')
    setView('photos')
    notify(`已加入 ${additions.length} 张照片`)
    event.target.value = ''
  }

  return <div className="app-shell">
    <header className="topbar">
      <Logo />
      <nav className="view-tabs" aria-label="主要视图">
        <button className={view === 'photos' ? 'active' : ''} onClick={() => setView('photos')}>照片</button>
        <button className={view === 'memory' ? 'active' : ''} onClick={() => setView('memory')}>回顾</button>
        <button className={view === 'notes' ? 'active' : ''} onClick={() => setView('notes')}>随笔</button>
      </nav>
      <div className="top-actions">
        <label className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索地点、文字或标签"/><kbd>⌘ K</kbd></label>
        <button className="primary-button" onClick={() => fileInput.current?.click()}><Plus size={17}/>添加照片</button>
        <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" multiple onChange={handleUpload}/>
        <button className="avatar" aria-label="个人资料">照</button>
      </div>
    </header>

    <div className="workspace">
      <Sidebar photos={photos} albumFilter={albumFilter} setAlbumFilter={(name) => { setAlbumFilter(name); setView('photos') }} />
      <main className="main-content">
        {view === 'photos' && <PhotoLibrary photos={visiblePhotos} albumFilter={albumFilter} search={search} onOpen={setActiveId} onFavorite={toggleFavorite} onUpload={() => fileInput.current?.click()} />}
        {view === 'memory' && <MemoryView photos={photos} onOpen={setActiveId} />}
        {view === 'notes' && <NotesView photos={photos} onOpen={setActiveId} />}
      </main>
    </div>

    {activePhoto && <PhotoEditor photo={activePhoto} onClose={() => setActiveId(null)} onSave={(p) => { updatePhoto(p); notify('这段回忆已保存') }} notify={notify} />}
    <div className={`toast ${toast ? 'show' : ''}`} role="status"><Check size={16}/>{toast}</div>
  </div>
}

function Sidebar({ albumFilter, setAlbumFilter, photos }) {
  const albums = [...new Set(photos.map(photo => photo.album))]
  const mainItems = [
    { name: '全部照片', icon: Grid2X2, count: photos.length },
    { name: '已收藏', icon: Heart, count: photos.filter(photo => photo.favorite).length },
  ]
  return <aside className="sidebar">
    <div className="side-section">
      <div className="side-label">照片库</div>
      {mainItems.map(item => <button key={item.name} className={`side-item ${albumFilter === item.name ? 'active' : ''}`} onClick={() => setAlbumFilter(item.name)}>
        <item.icon size={17}/><span>{item.name}</span><em>{item.count}</em>
      </button>)}
    </div>
    <div className="side-section album-section">
      <div className="side-label row">我的相册 <button aria-label="新建相册"><Plus size={15}/></button></div>
      {albums.map((name, index) => <button key={name} className={`side-item album-item ${albumFilter === name ? 'active' : ''}`} onClick={() => setAlbumFilter(name)}>
        <span className="album-dot" style={{background: albumPalette[index % albumPalette.length]}}></span><span>{name}</span><em>{photos.filter(photo => photo.album === name).length}</em>
      </button>)}
    </div>
    <div className="storage-card">
      <div className="storage-top"><span>本地存储</span><b>{photos.length}</b></div>
      <div className="storage-track"><i style={{width: `${Math.min(100, photos.length * 8)}%`}}></i></div>
      <small>{photos.filter(photo => photo.note).length} 段随笔 · 仅保存在浏览器</small>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>回到顶部 <ArrowRight size={13}/></button>
    </div>
  </aside>
}

function PhotoLibrary({ photos, albumFilter, search, onOpen, onFavorite, onUpload }) {
  const title = albumFilter === '全部照片' ? '所有照片' : albumFilter
  return <div className="library-page page-enter">
    <section className="page-heading">
      <div><div className="eyebrow">你的照片库</div><h1>{title}</h1><p>{search ? `与“${search}”相关的 ${photos.length} 个瞬间` : '把散落的瞬间，慢慢写成一段生活。'}</p></div>
      <div className="heading-actions"><button className="quiet-button"><CalendarDays size={17}/>按日期 <ChevronDown size={14}/></button><button className="icon-button"><LayoutList size={18}/></button></div>
    </section>

    {albumFilter === '全部照片' && !search && <RecallCard photos={photos} onOpen={() => onOpen(photos[0]?.id)} />}

    {photos.length > 0 ? <>
      <div className="date-divider"><span>最近的记录</span><i></i><small>{photos.length} 张照片</small></div>
      <div className="photo-grid">
        {photos.map((photo, idx) => <PhotoCard key={photo.id} photo={photo} index={idx} onOpen={onOpen} onFavorite={onFavorite}/>) }
      </div>
    </> : <div className="empty-state"><div><ImageIcon size={27}/></div><h2>还没有找到这个瞬间</h2><p>试试地点、相册名，或者照片里的某个标签。</p><button className="primary-button" onClick={onUpload}><Upload size={16}/>导入照片</button></div>}
  </div>
}

function RecallCard({ photos, onOpen }) {
  const preview = photos.slice(0, 3)
  const thoughts = photos.filter(photo => photo.note).length
  return <section className="recall-card">
    <div className="recall-copy">
      <div className="recall-badge"><Sparkles size={14}/> 本周回顾</div>
      <div><h2>把日常，<br/>收进一页相册。</h2><p>{photos.length} 张照片 · {thoughts} 段随笔<br/>示例内容，可以全部替换成你的。</p></div>
      <button onClick={onOpen}>打开这段记录 <ArrowRight size={16}/></button>
    </div>
    <div className="recall-collage" aria-label="回顾照片拼贴">
      {preview.map((photo, index) => <div key={photo.id} className={`collage-photo ${['one', 'two', 'three'][index]}`}><img src={photo.src} alt={photo.title}/><span>{photo.date.slice(5).replace('.', '/')}</span></div>)}
      <div className="tape"></div>
      <div className="hand-note">remember<br/>the light.</div>
    </div>
  </section>
}

function PhotoCard({ photo, index, onOpen, onFavorite }) {
  return <article className={`photo-card ${photo.aspect}`} style={{'--delay': `${Math.min(index, 7) * 45}ms`}} onClick={() => onOpen(photo.id)}>
    <div className="photo-frame">
      <img src={photo.src} alt={photo.title}/>
      <div className="photo-shade"></div>
      <button className={`heart-button ${photo.favorite ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onFavorite(photo.id) }} aria-label={photo.favorite ? '取消收藏' : '收藏'}><Heart size={17} fill={photo.favorite ? 'currentColor' : 'none'}/></button>
      {photo.pins?.length > 0 && <span className="annotated"><MapPin size={12}/>{photo.pins.length}</span>}
      <div className="photo-open"><Maximize2 size={18}/></div>
    </div>
    <div className="photo-meta"><div><h3>{photo.title}</h3><p><MapPin size={12}/>{photo.place}</p></div><time>{photo.date.slice(5).replace('.', '/')}</time></div>
  </article>
}

function MemoryView({ photos, onOpen }) {
  const memoryPhotos = photos.slice(0, 4)
  const cover = photos[0]
  const parts = (cover?.date || '').split('.')
  return <div className="memory-page page-enter">
    <section className="memory-hero">
      <img src={cover?.src} alt={cover?.title || '最近的记录'}/>
      <div className="memory-scrim"></div>
      <div className="memory-stamp"><span>MEMORY</span><b>{parts[2] || '—'}</b><small>{parts[1] || ''} · {parts[0] || ''}</small></div>
      <div className="memory-copy"><div className="eyebrow light">最近的这周</div><h1>把走过的路，<br/>慢慢看一遍。</h1><p>{photos.length} 个瞬间　{photos.filter(photo => photo.note).length} 段随笔</p><button onClick={() => onOpen(cover?.id)}><Sparkles size={17}/>开始回顾</button></div>
    </section>
    <section className="memory-timeline">
      <div className="timeline-heading"><div><div className="eyebrow">时间折叠</div><h2>沿着照片，再走一遍</h2></div><p>按时间与地点整理，<br/>照片旁边是你写下的字。</p></div>
      <div className="timeline-line"></div>
      {memoryPhotos.map((photo, index) => <article className={`timeline-entry ${index % 2 ? 'reverse' : ''}`} key={photo.id} onClick={() => onOpen(photo.id)}>
        <div className="timeline-date"><b>0{index + 1}</b><span>{photo.date.slice(5).replace('.', ' / ')}</span></div>
        <div className="timeline-image"><img src={photo.src} alt={photo.title}/><span>{photo.place}</span></div>
        <div className="timeline-note"><h3>{photo.title}</h3><p>{photo.note}</p><button>打开照片 <ArrowRight size={14}/></button></div>
      </article>)}
    </section>
  </div>
}

function NotesView({ photos, onOpen }) {
  return <div className="notes-page page-enter">
    <section className="page-heading"><div><div className="eyebrow">照片旁边的话</div><h1>随笔</h1><p>共写下 {photos.filter(p => p.note).length} 段文字，它们让照片有了声音。</p></div><button className="primary-button" onClick={() => onOpen(photos[0]?.id)}><Pencil size={16}/>写一段随笔</button></section>
    <div className="notes-grid">
      {photos.filter(p => p.note).map((photo, index) => <article className={`note-card note-${index % 3}`} key={photo.id} onClick={() => onOpen(photo.id)}>
        <div className="note-photo"><img src={photo.src} alt=""/><time>{photo.date}</time></div>
        <div className="note-paper"><div className="quote-mark">“</div><h2>{photo.title}</h2><p>{photo.note}</p><div className="note-footer"><span>{photo.place}</span><div>{photo.tags.slice(0,2).map(tag => <em key={tag}>#{tag}</em>)}</div></div></div>
      </article>)}
    </div>
  </div>
}

function PhotoEditor({ photo, onClose, onSave, notify }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(photo)))
  const [layout, setLayout] = useState('side')
  const [tool, setTool] = useState('pointer')
  const [color, setColor] = useState('#ff6f59')
  const [dirty, setDirty] = useState(false)
  const [activePin, setActivePin] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(null)
  const stageRef = useRef(null)

  const patch = (data) => { setDraft(p => ({ ...p, ...data })); setDirty(true) }

  const posFromEvent = (event) => {
    const rect = stageRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    }
  }

  const handleStageDown = (event) => {
    if (tool === 'pin') {
      const pos = posFromEvent(event)
      const pin = { id: Date.now(), x: pos.x, y: pos.y, text: '' }
      patch({ pins: [...(draft.pins || []), pin] })
      setActivePin(pin.id)
      event.preventDefault()
    }
    if (tool === 'pen') {
      const pos = posFromEvent(event)
      const stroke = { id: Date.now(), color, points: [pos] }
      setCurrentStroke(stroke)
      setDrawing(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    }
  }

  const handleStageMove = (event) => {
    if (!drawing || tool !== 'pen') return
    const pos = posFromEvent(event)
    setCurrentStroke(stroke => ({ ...stroke, points: [...stroke.points, pos] }))
  }

  const endDrawing = () => {
    if (drawing && currentStroke?.points.length > 1) patch({ strokes: [...(draft.strokes || []), currentStroke] })
    setDrawing(false)
    setCurrentStroke(null)
  }

  const updatePin = (id, text) => patch({ pins: draft.pins.map(pin => pin.id === id ? { ...pin, text } : pin) })
  const deletePin = (id) => { patch({ pins: draft.pins.filter(pin => pin.id !== id) }); setActivePin(null) }
  const save = () => { onSave(draft); setDirty(false) }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const pathFor = (stroke) => stroke.points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')

  return <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="照片编辑器">
    <div className="editor-shell">
      <header className="editor-header">
        <button className="back-button" onClick={onClose}><ArrowLeft size={19}/><span>返回照片库</span></button>
        <div className="editor-title"><b>{draft.title || '未命名照片'}</b><small>{dirty ? '有未保存的更改' : '所有更改已保存'}</small></div>
        <div className="layout-switch" aria-label="图文布局">
          <button className={layout === 'side' ? 'active' : ''} onClick={() => setLayout('side')} title="左右布局"><Columns2 size={16}/></button>
          <button className={layout === 'stack' ? 'active' : ''} onClick={() => setLayout('stack')} title="上下布局"><LayoutList size={16}/></button>
          <button className={layout === 'overlay' ? 'active' : ''} onClick={() => setLayout('overlay')} title="沉浸布局"><Expand size={16}/></button>
        </div>
        <div className="editor-actions"><button className="quiet-button" onClick={() => notify('分享链接已复制')}><Share2 size={16}/>分享</button><button className="save-button" onClick={save}><Check size={16}/>保存</button></div>
      </header>

      <div className={`editor-body layout-${layout}`}>
        <section className={`image-workbench tool-${tool}`}>
          <div className="floating-toolbar">
            <button className={tool === 'pointer' ? 'active' : ''} onClick={() => setTool('pointer')}><MousePointer2 size={17}/><span>浏览</span></button>
            <button className={tool === 'pin' ? 'active' : ''} onClick={() => setTool('pin')}><MapPin size={17}/><span>标注</span></button>
            <button className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')}><Pencil size={17}/><span>画笔</span></button>
            {tool === 'pen' && <div className="color-dots">{['#ff6f59','#f4ca64','#ffffff'].map(c => <button key={c} aria-label={`选择颜色 ${c}`} className={color === c ? 'selected' : ''} style={{background:c}} onClick={() => setColor(c)}></button>)}</div>}
            {(draft.strokes || []).length > 0 && <button className="undo-drawing" title="撤销最后一笔" onClick={() => patch({ strokes: draft.strokes.slice(0, -1) })}><Undo2 size={16}/></button>}
          </div>
          <div className="photo-stage" ref={stageRef} onPointerDown={handleStageDown} onPointerMove={handleStageMove} onPointerUp={endDrawing} onPointerCancel={endDrawing}>
            <img src={draft.src} alt={draft.title}/>
            <svg className="drawing-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
              {(draft.strokes || []).map(stroke => <path key={stroke.id} d={pathFor(stroke)} stroke={stroke.color} vectorEffect="non-scaling-stroke"/>) }
              {currentStroke && <path d={pathFor(currentStroke)} stroke={currentStroke.color} vectorEffect="non-scaling-stroke"/>}
            </svg>
            {(draft.pins || []).map((pin, index) => <button key={pin.id} className={`image-pin ${activePin === pin.id ? 'active' : ''}`} style={{left: `${pin.x}%`, top: `${pin.y}%`}} onClick={(e) => { e.stopPropagation(); setActivePin(pin.id) }} aria-label={`批注 ${index + 1}`}><span>{index + 1}</span></button>)}
            {tool === 'pin' && <div className="tool-hint"><MapPin size={14}/>点击照片放置标注</div>}
            {tool === 'pen' && <div className="tool-hint"><Pencil size={14}/>按住并拖动来画线</div>}
          </div>
          <div className="image-info"><span>{draft.date}</span><i></i><span>{draft.place}</span></div>
        </section>

        <aside className="writing-panel">
          <div className="writing-inner">
            <div className="writing-kicker"><span>PHOTO NOTE</span><time>{draft.date.replaceAll('.', ' / ')}</time></div>
            <input className="title-input" value={draft.title} onChange={e => patch({title:e.target.value})} aria-label="照片标题"/>
            <div className="location-line"><MapPin size={14}/><input value={draft.place} onChange={e => patch({place:e.target.value})} aria-label="拍摄地点"/></div>
            <div className="rule"></div>
            <label className="note-label">写下这张照片旁边的话</label>
            <textarea className="note-editor" value={draft.note} onChange={e => patch({note:e.target.value})} placeholder="当时发生了什么？你记得怎样的光、声音或气味……"/>
            <div className="prompt-row"><button onClick={() => patch({note: draft.note + (draft.note ? '\n\n' : '') + '那一刻，我最想记住的是……'})}>那一刻，我想记住…</button><button onClick={() => patch({note: draft.note + (draft.note ? '\n\n' : '') + '如果重回这里，我会……'})}>如果重回这里…</button></div>

            <section className="annotation-list">
              <div className="section-title"><span><MapPin size={15}/>图片批注</span><em>{(draft.pins || []).length}</em></div>
              {(draft.pins || []).length === 0 ? <button className="empty-annotation" onClick={() => setTool('pin')}><Plus size={15}/>在照片上加一个标注</button> :
                draft.pins.map((pin, index) => <div className={`annotation-row ${activePin === pin.id ? 'active' : ''}`} key={pin.id} onClick={() => setActivePin(pin.id)}>
                  <b>{index + 1}</b><input autoFocus={activePin === pin.id && !pin.text} value={pin.text} onChange={e => updatePin(pin.id, e.target.value)} placeholder="写下这里的细节…"/>
                  <button onClick={(e) => {e.stopPropagation(); deletePin(pin.id)}} aria-label="删除标注"><X size={14}/></button>
                </div>)}
            </section>

            <div className="tag-editor">{(draft.tags || []).map(tag => <span key={tag}>#{tag}</span>)}<button onClick={() => patch({tags:[...(draft.tags || []), '新标签']})}><Plus size={13}/>标签</button></div>
            <div className="save-tip">按 <kbd>⌘ S</kbd> 保存这段回忆</div>
          </div>
        </aside>
      </div>
    </div>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
