import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import { errorText, h, notice } from './ui'

export interface Page {
  id: string
  title: string
  order: number
  render: () => HTMLElement | Promise<HTMLElement>
}

const home: Page = {
  id: 'inicio',
  title: 'Início',
  order: 0,
  render: () => h('div', 'card card-body',
    h('h2', 'h4', 'Gestão da autoescola'),
    h('p', 'mb-0', 'Use o menu para acessar os recursos disponíveis nesta versão.')),
}
const pages = [home, ...Object.values(import.meta.glob<Page>('./features/*.ts', {
  eager: true,
  import: 'default',
}))].sort((a, b) => a.order - b.order)

const nav = h('nav', 'd-flex flex-wrap gap-2 py-3')
nav.setAttribute('aria-label', 'Menu principal')
const panel = h('main', 'container py-4')
panel.id = 'conteudo'
panel.tabIndex = -1
const skip = h('a', 'visually-hidden-focusable position-absolute bg-white p-2', 'Ir ao conteúdo')
skip.href = '#conteudo'
skip.addEventListener('click', (event) => {
  event.preventDefault()
  panel.focus()
})
const heading = h('h1', 'h3 mb-4')
const body = h('div')
panel.append(heading, body)

const links = pages.map((page) => {
  const link = h('a', 'btn btn-sm btn-outline-light', page.title)
  link.href = `#${page.id}`
  nav.append(link)
  return link
})

let version = 0
async function navigate(focus = false) {
  const token = ++version
  const index = Math.max(0, pages.findIndex((page) => page.id === location.hash.slice(1)))
  const page = pages[index]!
  links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
    link.classList.toggle('active', i === index)
  })
  heading.textContent = page.title
  body.replaceChildren(notice('Carregando…'))
  if (focus) panel.focus()
  try {
    const content = await page.render()
    if (version === token) body.replaceChildren(content)
  } catch (error) {
    if (version === token) body.replaceChildren(notice(errorText(error), 'danger'))
  }
}

document.querySelector('#app')!.append(skip,
  h('header', 'app-header text-white', h('div', 'container pt-3',
    h('div', 'fw-bold fs-4', 'Autoescola em Dia'), nav)), panel)
window.addEventListener('hashchange', () => { void navigate(true) })
void navigate()
