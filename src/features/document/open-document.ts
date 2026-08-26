import { detectFileType } from '../../lib/file-type'

const ignoredArgPrefixes = ['-', '/?']

export function getFirstOpenableArg(args: string[]): string | null {
  return (
    args
      .map((arg) => arg.trim())
      .find((arg) => {
        if (!arg || ignoredArgPrefixes.some((prefix) => arg.startsWith(prefix))) {
          return false
        }
        return detectFileType(arg) !== 'unknown' || /[\\/]/.test(arg)
      }) ?? null
  )
}
