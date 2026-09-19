import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImagePlus,
  Code,
  Undo2,
  Redo2,
} from 'lucide-react'
import { uploadAdminMedia } from '@/api'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the project story. Add headings, images, and links…',
}: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'project-prose min-h-[280px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor: next }) => onChange(next.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = value || '<p></p>'
    if (current !== incoming) {
      editor.commands.setContent(incoming, false)
    }
  }, [editor, value])

  const insertImage = async (file: File) => {
    if (!editor) return
    const { url } = await uploadAdminMedia(file)
    editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previous || 'https://')
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  if (!editor) return null

  const btn = (active: boolean) =>
    `rounded p-1.5 transition-colors ${
      active ? 'bg-[#64ffda]/15 text-[#64ffda]' : 'text-[#8892b0] hover:bg-[#233554] hover:text-[#ccd6f6]'
    }`

  return (
    <div className="overflow-hidden rounded-xl border border-[#233554] bg-[#112240]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#172a45] px-2 py-1.5">
        <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-[#233554]" />
        <button type="button" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subheading">
          <Heading3 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="List">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code">
          <Code className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-[#233554]" />
        <button type="button" className={btn(editor.isActive('link'))} onClick={setLink} title="Link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" className={btn(false)} onClick={() => fileRef.current?.click()} title="Insert image">
          <ImagePlus className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-[#233554]" />
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void insertImage(file).catch((err: Error) => window.alert(err.message))
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
