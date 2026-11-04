import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import ts from 'typescript'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'

// Used only by local QA commands; not imported into the application bundle.
export async function statisticsPreviewCompiler(root) {
  const work = await mkdtemp(join(tmpdir(), 'kairos-publication-check-'))
  const modules = new Map()
  const css = []
  async function compile(path) {
    const absolute = resolve(root, path)
    if (modules.has(absolute)) return modules.get(absolute)
    const target = pathToFileURL(join(work, `${modules.size}.mjs`)).href
    modules.set(absolute, target)
    let source = await readFile(absolute, 'utf8')
    if (path.endsWith('.vue')) {
      const { descriptor } = parse(source, { filename: absolute })
      const id = `data-v-check-${modules.size}`
      source = compileScript(descriptor, { id, inlineTemplate: true }).content
      source = source.replace('export default', 'const previewComponent =')
      source = `import { computed } from 'vue'\n${source}\npreviewComponent.__scopeId = '${id}'\nexport default previewComponent`
      for (const style of descriptor.styles)
        css.push(
          compileStyle({
            source: style.content,
            filename: absolute,
            id,
            scoped: style.scoped,
          }).code,
        )
    }
    source = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    }).outputText
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/g)]
    for (const [, specifier] of imports) {
      const url = specifier.startsWith('~/')
        ? await compile(
            specifier.slice(2) + (specifier.endsWith('.vue') ? '' : '.ts'),
          )
        : specifier.startsWith('.')
          ? await compile(resolve(absolute, '..', specifier))
          : import.meta.resolve(specifier)
      source = source
        .replaceAll(`'${specifier}'`, `'${url}'`)
        .replaceAll(`"${specifier}"`, `"${url}"`)
    }
    await writeFile(fileURLToPath(target), source)
    return target
  }
  return {
    work,
    compile,
    css,
    close: () => rm(work, { recursive: true, force: true }),
  }
}
