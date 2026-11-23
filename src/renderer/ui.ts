import type { Bridge } from '../shared/bridge'

declare global { interface Window { autoescola: Bridge } }

export async function request<T>(command: string, input?: unknown): Promise<T> {
  const reply = await window.autoescola.request(command, input)
  if (!reply.ok) throw new Error(reply.error)
  return reply.data as T
}

type Child = Node | string
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K, css = '', ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (css) node.className = css
  node.append(...children)
  return node
}

export function notice(text = '', kind: 'danger' | 'success' | 'info' = 'info') {
  const node = h('div')
  message(node, text, kind)
  return node
}

export function message(node: HTMLElement, text: string, kind: 'danger' | 'success' | 'info' = 'info') {
  node.className = `alert alert-${kind}${text ? '' : ' d-none'}`
  node.setAttribute('role', kind === 'danger' ? 'alert' : 'status')
  node.textContent = text
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Operação não concluída.'
}

export function table(headers: string[], rows: Child[][]) {
  if (!rows.length) return h('p', 'text-body-secondary', 'Nenhum registro encontrado.')
  const headings = headers.map((header) => {
    const col = h('th', '', header)
    col.scope = 'col'
    return col
  })
  return h('div', 'table-responsive', h('table', 'table table-striped align-middle',
    h('thead', '', h('tr', '', ...headings)),
    h('tbody', '', ...rows.map((row) => h('tr', '', ...row.map((cell) => h('td', '', cell)))))))
}

let fieldId = 0
export interface Field {
  key: string
  label: string
  type?: string
  options?: readonly (readonly [string, string])[]
  required?: boolean
  min?: string
  max?: string
  length?: number
  hint?: string
}

export function form(fields: Field[], submit: string) {
  const element = h('form', 'card card-body mb-4')
  const controls = new Map<string, HTMLInputElement | HTMLSelectElement>()
  const group = h('div', 'row g-3')
  for (const field of fields) {
    const id = `input-${++fieldId}`
    const label = h('label', 'form-label', field.label)
    label.htmlFor = id
    let control: HTMLInputElement | HTMLSelectElement
    if (field.options) {
      control = h('select', 'form-select')
      for (const [value, title] of field.options) control.add(new Option(title, value))
    } else {
      control = h('input', 'form-control')
      control.type = field.type ?? 'text'
      if (field.min !== undefined) control.min = field.min
      if (field.max !== undefined) control.max = field.max
      if (field.length) control.maxLength = field.length
    }
    control.id = id
    control.name = field.key
    control.required = field.required ?? false
    controls.set(field.key, control)
    const wrap = h('div', 'col-md-6 col-xl-4', label, control)
    if (field.hint) {
      const help = h('div', 'form-text', field.hint)
      help.id = `${id}-hint`
      control.setAttribute('aria-describedby', help.id)
      wrap.append(help)
    }
    group.append(wrap)
  }
  const button = h('button', 'btn btn-primary mt-3 align-self-start', submit)
  button.type = 'submit'
  element.append(group, button)
  return {
    element, controls, button,
    values: () => Object.fromEntries(new FormData(element)) as Record<string, string>,
    set: (values: Record<string, string | number | null>) => {
      for (const [key, value] of Object.entries(values)) {
        const control = controls.get(key)
        if (control) control.value = value === null ? '' : String(value)
      }
    },
  }
}

export function action(label: string, run: () => void) {
  const button = h('button', 'btn btn-sm btn-outline-primary', label)
  button.type = 'button'
  button.addEventListener('click', run)
  return button
}
