/**
 * Footnote popovers for Markdown footnotes ([^1]).
 *
 * Without JavaScript a footnote reference jumps to the note at the end of the
 * page. With this module, clicking it opens the note next to the reference on
 * wide screens and as a sheet at the bottom on phones. Esc, the close button
 * or a click elsewhere closes it. Styles: .pgai-fn-* in src/css/custom.css.
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

let pop = null
let current = null

function close() {
  if (pop) {
    pop.remove()
    pop = null
  }
  if (current) {
    current.setAttribute('aria-expanded', 'false')
    current = null
  }
}

function open(ref) {
  const id = decodeURIComponent((ref.getAttribute('href') || '').slice(1))
  const note = id && document.getElementById(id)
  if (!note) return false
  close()
  current = ref
  ref.setAttribute('aria-expanded', 'true')

  const body = note.cloneNode(true)
  body.removeAttribute('id')
  body.querySelectorAll('[data-footnote-backref]').forEach((a) => a.remove())
  body.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))

  pop = document.createElement('div')
  pop.className = 'pgai-fn-pop'
  pop.setAttribute('role', 'dialog')
  pop.setAttribute('aria-label', `Note ${ref.textContent.trim()}`)

  const head = document.createElement('div')
  head.className = 'pgai-fn-head'
  head.innerHTML = `<span class="pgai-fn-label">Note ${ref.textContent.trim()}</span>`
  const x = document.createElement('button')
  x.type = 'button'
  x.className = 'pgai-fn-close'
  x.setAttribute('aria-label', 'Close note')
  x.textContent = '×'
  x.addEventListener('click', close)
  head.appendChild(x)

  const content = document.createElement('div')
  content.className = 'pgai-fn-body'
  content.append(...body.childNodes)

  pop.append(head, content)
  document.body.appendChild(pop)

  if (!window.matchMedia('(max-width: 600px)').matches) {
    const r = ref.getBoundingClientRect()
    const w = pop.offsetWidth
    const left = Math.min(Math.max(8, r.left + window.scrollX - w / 2), window.scrollX + document.documentElement.clientWidth - w - 8)
    pop.style.left = `${left}px`
    // Below if it fits, else above if it fits, else the larger side with a scrolling body
    const below = window.innerHeight - r.bottom - 16
    const above = r.top - 16
    let h = pop.offsetHeight
    if (h > below && h > above) {
      const room = Math.max(below, above)
      content.style.maxHeight = `${room - (h - content.offsetHeight)}px`
      content.style.overflowY = 'auto'
      h = pop.offsetHeight
    }
    const up = h > below && above > below
    pop.style.top = `${(up ? r.top - 8 - h : r.bottom + 8) + window.scrollY}px`
  }
  x.focus({ preventScroll: true })
  return true
}

if (ExecutionEnvironment.canUseDOM) {
  document.addEventListener('click', (e) => {
    const ref = e.target.closest && e.target.closest('a[data-footnote-ref]')
    if (ref) {
      if (ref === current) {
        e.preventDefault()
        close()
      } else if (open(ref)) {
        e.preventDefault()
      }
      return
    }
    if (pop && !pop.contains(e.target)) close()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pop) {
      const ref = current
      close()
      if (ref) ref.focus()
    }
  })
}

export function onRouteDidUpdate() {
  close()
}
