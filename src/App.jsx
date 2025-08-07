import React, { useEffect, useMemo, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'

const defaultPro = {
  title: '',
  author: '',
  location: '',
  datetime: new Date().toISOString().slice(0,16), // yyyy-MM-ddTHH:mm
  style: 'Pop',
  tempo: 100,
  timeSig: '4/4',
  key: 'C',
  notes: '',
  sections: [], // { type: 'Intro'|'Verse'|..., content: '' }
  imageDataUrl: null
}

const defaultSimple = {
  title: '',
  author: '',
  location: '',
  datetime: new Date().toISOString().slice(0,16),
  fontFamily: 'system-ui',
  fontSize: 16,
  body: '',
  imageDataUrl: null
}

const SECTION_TYPES = ['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Break','Outro']

function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initial
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

export default function App(){
  const [theme, setTheme] = useLocalState('theme', 'dark')
  const [mode, setMode] = useLocalState('mode', 'simple') // 'simple' | 'pro'

  useEffect(() => {
    const cls = theme === 'light' ? 'light' : ''
    document.documentElement.className = cls
  }, [theme])

  return (
    <div className="container">
      <div className="app-bar">
        <div>
          <div className="app-title">🎵 Songwriting Notebook</div>
          <div className="muted">โหมดสองแบบ: ธรรมดา / มือโปร • บันทึก • แชร์ • PDF</div>
        </div>
        <div className="row">
          <button className="button" onClick={() => setMode(mode === 'simple' ? 'pro' : 'simple')}>
            {mode === 'simple' ? 'สลับเป็นโหมดมือโปร' : 'สลับเป็นโหมดธรรมดา'}
          </button>
          <button className="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'ธีมมืด' : 'ธีมสว่าง'}
          </button>
        </div>
      </div>

      {mode === 'simple' ? <SimpleMode/> : <ProMode/>}

      <footer style={{marginTop: 24, opacity: .8}} className="muted">
        v0.0.1 • บันทึกอัตโนมัติในเครื่องของคุณ (LocalStorage)
      </footer>
    </div>
  )
}

function SimpleMode(){
  const [data, setData] = useLocalState('simpleData', defaultSimple)

  const onImgChange = (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => setData(d => ({...d, imageDataUrl: reader.result}))
    reader.readAsDataURL(file)
  }

  const copyBody = async () => {
    try {
      await navigator.clipboard.writeText(data.body || '')
      alert('คัดลอกเนื้อเพลงแล้ว')
    } catch {
      alert('เบราว์เซอร์ไม่อนุญาตการคัดลอกอัตโนมัติ')
    }
  }

  const downloadTxt = () => {
    const content = `Title: ${data.title}\nAuthor: ${data.author}\nWhen/Where: ${data.datetime} @ ${data.location}\n\n${data.body}`
    const blob = new Blob([content], {type:'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.title||'lyrics').replace(/\s+/g,'_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const makePDF = () => {
    const doc = new jsPDF({ unit:'pt', format:'a4' })
    const margin = 48
    let y = margin

    doc.setFont('helvetica','bold')
    doc.setFontSize(18)
    doc.text(data.title || 'Untitled', margin, y)
    y += 22

    doc.setFont('helvetica','normal')
    doc.setFontSize(12)
    doc.text(`Author: ${data.author || '-'}`, margin, y); y += 16
    doc.text(`Date/Time: ${data.datetime || '-'}`, margin, y); y += 16
    doc.text(`Location: ${data.location || '-'}`, margin, y); y += 22

    if (data.imageDataUrl) {
      try {
        doc.addImage(data.imageDataUrl, 'PNG', margin, y, 200, 120)
        y += 140
      } catch {}
    }

    const text = data.body || ''
    const lines = doc.splitTextToSize(text, 500)
    doc.setFontSize(13)
    doc.text(lines, margin, y)

    doc.save(`${(data.title||'lyrics')}.pdf`)
  }

  const shareEmail = () => {
    const subject = encodeURIComponent(`Lyrics: ${data.title || 'Untitled'}`)
    const body = encodeURIComponent(`${data.body || ''}\n\n— ${data.author || ''}\n${data.datetime || ''} @ ${data.location || ''}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const openDrive = () => {
    window.open('https://drive.google.com/drive/u/0/my-drive', '_blank')
  }

  return (
    <div style={{marginTop: 16}} className="grid">
      <div className="col-8">
        <div className="card">
          <div className="row gap-12" style={{marginBottom: 12}}>
            <input className="input" placeholder="หัวเรื่องเพลง / Title"
              value={data.title} onChange={e=>setData(d=>({...d,title:e.target.value}))}/>
            <input className="input" placeholder="ชื่อผู้แต่ง / Author"
              value={data.author} onChange={e=>setData(d=>({...d,author:e.target.value}))}/>
          </div>
          <div className="row gap-12" style={{marginBottom: 12}}>
            <input className="input" type="datetime-local"
              value={data.datetime} onChange={e=>setData(d=>({...d,datetime:e.target.value}))}/>
            <input className="input" placeholder="สถานที่ / Location"
              value={data.location} onChange={e=>setData(d=>({...d,location:e.target.value}))}/>
          </div>
          <div className="row gap-12" style={{marginBottom: 12}}>
            <select className="select" value={data.fontFamily}
              onChange={e=>setData(d=>({...d,fontFamily:e.target.value}))}>
              <option value="system-ui">System UI</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
            <input className="input" type="number" min="12" max="32" step="1"
              value={data.fontSize} onChange={e=>setData(d=>({...d,fontSize:Number(e.target.value)}))}/>
            <label className="button">
              อัปโหลดรูปภาพ
              <input type="file" accept="image/*" onChange={onImgChange} style={{display:'none'}}/>
            </label>
          </div>

          <textarea className="textarea" style={{fontFamily: data.fontFamily, fontSize: data.fontSize}}
            placeholder="เขียนเนื้อเพลงที่นี่..."
            value={data.body} onChange={e=>setData(d=>({...d, body:e.target.value}))}/>

          {data.imageDataUrl && <div style={{marginTop:12}}>
            <img className="preview" src={data.imageDataUrl} alt="uploaded preview"/>
          </div>}

          <div className="row" style={{marginTop: 12}}>
            <button className="button" onClick={copyBody}>คัดลอกเนื้อเพลง</button>
            <button className="button" onClick={downloadTxt}>บันทึก .txt</button>
            <button className="button" onClick={makePDF}>บันทึกเป็น PDF</button>
            <button className="button" onClick={()=>window.print()}>พิมพ์</button>
            <span className="ml-auto"/>
            <button className="button" onClick={shareEmail}>แชร์ทางอีเมล</button>
            <button className="button" onClick={openDrive}>เปิด Google Drive</button>
          </div>
        </div>
      </div>
      <div className="col-4">
        <div className="card">
          <div className="muted">พรีวิวตัวอักษร</div>
          <div className="preview" style={{fontFamily:data.fontFamily, fontSize:data.fontSize}}>
            {data.body || '— ตัวอย่างจะแสดงที่นี่ —'}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProMode(){
  const [data, setData] = useLocalState('proData', defaultPro)

  const addSection = (type) => {
    setData(d => ({
      ...d,
      sections: [...d.sections, { type, content: templateFor(type) }]
    }))
  }

  const onImgChange = (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => setData(d => ({...d, imageDataUrl: reader.result}))
    reader.readAsDataURL(file)
  }

  const exportPDF = () => {
    const doc = new jsPDF({ unit:'pt', format:'a4' })
    const margin = 48
    let y = margin

    doc.setFont('helvetica','bold'); doc.setFontSize(18)
    doc.text(data.title || 'Untitled', margin, y); y += 22

    doc.setFont('helvetica','normal'); doc.setFontSize(12)
    doc.text(`Author: ${data.author || '-'}`, margin, y); y += 16
    doc.text(`Date/Time: ${data.datetime || '-'}`, margin, y); y += 16
    doc.text(`Location: ${data.location || '-'}`, margin, y); y += 16
    doc.text(`Style: ${data.style || '-'} • BPM: ${data.tempo} • Time: ${data.timeSig} • Key: ${data.key}`, margin, y); y += 22

    if (data.imageDataUrl) {
      try { doc.addImage(data.imageDataUrl, 'PNG', margin, y, 200, 120); y += 140 } catch {}
    }

    if (data.notes) {
      doc.setFont('helvetica','bold'); doc.setFontSize(14)
      doc.text('Song Notes', margin, y); y += 16
      doc.setFont('helvetica','normal'); doc.setFontSize(12)
      const nlines = doc.splitTextToSize(data.notes, 500)
      doc.text(nlines, margin, y); y += 18
    }

    data.sections.forEach((s) => {
      doc.setFont('helvetica','bold'); doc.setFontSize(14)
      doc.text(s.type, margin, y); y += 14
      doc.setFont('helvetica','normal'); doc.setFontSize(12)
      const lines = doc.splitTextToSize(s.content || '', 500)
      lines.forEach((line) => {
        if (y > 760) { doc.addPage(); y = margin }
        doc.text(line, margin, y); y += 16
      })
      y += 8
    })

    doc.save(`${(data.title||'song')}-sheet.pdf`)
  }

  const shareEmail = () => {
    const sections = data.sections.map(s => `## ${s.type}\n${s.content}`).join('\n\n')
    const meta = `Title: ${data.title}\nAuthor: ${data.author}\nWhen/Where: ${data.datetime} @ ${data.location}\nStyle: ${data.style} • BPM ${data.tempo} • ${data.timeSig} • Key ${data.key}\n\nNotes:\n${data.notes}\n\n`

    const subject = encodeURIComponent(`Song Sheet: ${data.title || 'Untitled'}`)
    const body = encodeURIComponent(meta + sections)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const clearAll = () => {
    if (confirm('ล้างข้อมูลทั้งหมดของเพลงนี้?')) setData(defaultPro)
  }

  return (
    <div style={{marginTop: 16}} className="grid">
      <div className="col-12 card">
        <div className="row gap-12" style={{marginBottom: 12}}>
          <input className="input" placeholder="ชื่อเพลง / Title" value={data.title} onChange={e=>setData(d=>({...d,title:e.target.value}))}/>
          <input className="input" placeholder="ชื่อผู้แต่ง / Author" value={data.author} onChange={e=>setData(d=>({...d,author:e.target.value}))}/>
          <input className="input" type="datetime-local" value={data.datetime} onChange={e=>setData(d=>({...d,datetime:e.target.value}))}/>
          <input className="input" placeholder="สถานที่ / Location" value={data.location} onChange={e=>setData(d=>({...d,location:e.target.value}))}/>
        </div>

        <div className="row gap-12" style={{marginBottom: 12}}>
          <select className="select" value={data.style} onChange={e=>setData(d=>({...d,style:e.target.value}))}>
            {['Pop','Ballad','R&B','Rock','Hip-Hop','EDM','Country','Folk','Jazz','K-Pop','Thai-Esan'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <input className="input" type="number" min="40" max="220" value={data.tempo} onChange={e=>setData(d=>({...d,tempo:Number(e.target.value)}))} placeholder="BPM" />
          <select className="select" value={data.timeSig} onChange={e=>setData(d=>({...d,timeSig:e.target.value}))}>
            {['4/4','3/4','6/8','7/8','12/8'].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select className="select" value={data.key} onChange={e=>setData(d=>({...d,key:e.target.value}))}>
            {['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb','Am','Em','Bm','F#m','C#m','G#m','D#m','A#m','Dm','Gm','Cm','Fm','Bbm','Ebm','Abm'].map(k=><option key={k} value={k}>{k}</option>)}
          </select>
          <label className="button">
            เพิ่มรูปปก
            <input type="file" accept="image/*" onChange={onImgChange} style={{display:'none'}}/>
          </label>
        </div>

        <div className="row gap-8" style={{flexWrap:'wrap', marginBottom: 8}}>
          <span className="muted">เพิ่มท่อนอัตโนมัติ:</span>
          {SECTION_TYPES.map(t=>(
            <button key={t} className="button" onClick={()=>addSection(t)}>{t}</button>
          ))}
          <span className="tag">คลิกเพื่อเพิ่มท่อนลงด้านล่าง</span>
        </div>

        {data.imageDataUrl && <div style={{marginTop:12}}>
          <img className="preview" src={data.imageDataUrl} alt="cover preview" />
        </div>}

        <div className="grid" style={{marginTop: 12}}>
          <div className="col-8">
            {data.sections.length === 0 && <div className="muted">ยังไม่มีท่อนเพลง — กดปุ่มด้านบนเพื่อเพิ่ม (Intro/Verse/Chorus/...)</div>}
            {data.sections.map((s, idx)=>(
              <SectionEditor key={idx} section={s} onChange={(next)=>{
                setData(d=>{
                  const copy = [...d.sections]
                  copy[idx] = next
                  return {...d, sections: copy}
                })
              }} onRemove={()=>{
                setData(d=>({...d, sections: d.sections.filter((_,i)=>i!==idx)}))
              }}/>
            ))}
          </div>
          <div className="col-4">
            <div className="card">
              <div className="muted">บันทึกจากการแต่งเพลง (Song Notes)</div>
              <textarea className="textarea" placeholder="ไอเดีย โครงสร้าง ความรู้สึก อ้างอิง ฯลฯ"
                value={data.notes} onChange={e=>setData(d=>({...d, notes: e.target.value}))}/>
              <div className="row" style={{marginTop: 12}}>
                <button className="button" onClick={exportPDF}>บันทึกเป็น PDF</button>
                <button className="button" onClick={shareEmail}>แชร์ทางอีเมล</button>
                <span className="ml-auto"/>
                <button className="button warn" onClick={clearAll}>ล้างทั้งหมด</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionEditor({section, onChange, onRemove}){
  return (
    <div className="card" style={{marginBottom: 12}}>
      <div className="row">
        <strong>{section.type}</strong>
        <span className="ml-auto"/>
        <button className="button ghost" onClick={onRemove}>ลบ</button>
      </div>
      <textarea className="textarea" style={{marginTop: 8}} value={section.content}
        onChange={e=>onChange({...section, content:e.target.value})}/>
    </div>
  )
}

function templateFor(type){
  switch(type){
    case 'Intro': return '[Intro]\n(บรรยายบรรยากาศ / Riff / Motif)'
    case 'Verse': return '[Verse]\nเล่าเรื่องราว หลักฐาน ความรู้สึก'
    case 'Pre-Chorus': return '[Pre-Chorus]\nสร้างแรงดัน สะพานไปฮุค'
    case 'Chorus': return '[Chorus]\nใจความหลัก / ฮุค / ท่อนจำ'
    case 'Bridge': return '[Bridge]\nมุมมองใหม่ คีย์/คอร์ดที่ต่างออกไป'
    case 'Solo': return '[Solo]\nไลน์เครื่องดนตรี โชว์ธีม'
    case 'Break': return '[Break]\nพัก/หยุด เพื่อสร้างไดนามิก'
    case 'Outro': return '[Outro]\nปิดเพลง จาง/สรุปธีม'
    default: return ''
  }
}
