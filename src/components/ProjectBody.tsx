import DOMPurify from 'dompurify'

const PURIFY = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'h2',
    'h3',
    'h4',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'img',
    'code',
    'pre',
    'hr',
    'span',
    'figure',
    'figcaption',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
}

export function ProjectBody({ html }: { html: string }) {
  const trimmed = html.trim()
  if (!trimmed) return null
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed)
  if (!looksHtml) {
    return <div className="project-prose whitespace-pre-line">{trimmed}</div>
  }
  return (
    <div
      className="project-prose"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trimmed, PURIFY) }}
    />
  )
}
