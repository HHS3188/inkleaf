import { defaultSchema } from 'rehype-sanitize'

export const markdownSanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  clobberPrefix: 'inkleaf-',
  tagNames: defaultSchema.tagNames?.filter((tagName) => tagName !== 'svg' && tagName !== 'iframe'),
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title'],
    img: ['src', 'alt', 'title'],
    code: ['className'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https'],
    src: ['http', 'https', 'data'],
  },
}
