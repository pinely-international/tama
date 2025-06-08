import * as fs from "fs"
import { sync as globSync } from "glob"
import * as path from "path"
import { JSDoc, Node, Project, SourceFile, SyntaxKind } from "ts-morph"

// 1) Initialize a ts-morph Project pointing at your tsconfig.json
const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
})

// 2) Load all .d.ts files
const dtsPaths = globSync("build/**/*.d.ts")
project.addSourceFilesAtPaths(dtsPaths)

const specProject = new Project({
  tsConfigFilePath: "spec/tsconfig.json",
  skipAddingFilesFromTsConfig: true,
})

// 3) Load all spec files
const specPaths = globSync("spec/**/*.spec.{ts,tsx}")
specProject.addSourceFilesAtPaths(specPaths)

function addImportedSourceFilesRecursively(sourceFiles: SourceFile[], visited = new Set<string>()) {
  for (const sf of sourceFiles) {
    if (visited.has(sf.getFilePath())) continue
    visited.add(sf.getFilePath())

    const imports = sf.getImportDeclarations()
    for (const imp of imports) {
      const resolved = imp.getModuleSpecifierSourceFile()
      if (resolved && !visited.has(resolved.getFilePath())) {
        project.addSourceFileAtPathIfExists(resolved.getFilePath())
        addImportedSourceFilesRecursively([resolved], visited)
      }
    }
  }
}

addImportedSourceFilesRecursively(project.getSourceFiles(dtsPaths))

// Utility to extract JSDoc text
function getJsDocText(node: { getJsDocs?(): JSDoc[] }) {
  if (node.getJsDocs == null) return

  const docs = node.getJsDocs()
  if (!docs.length) return ""
  return docs
    .map(d => d.getComment()?.toString().trim() || "")
    .filter(Boolean)
    .join("\n\n")
}

function getJsDocTags(jsdoc: JSDoc[]) {
  const result: Record<string, string[]> = {}
  for (const doc of jsdoc) {
    for (const tag of doc.getTags()) {
      const name = tag.getTagName()
      const text = tag.getComment() || "";
      (result[name] ||= []).push(text)
    }
  }
  return result
}

// Utility to compute GitHub link with line number
function toGitHubLink(filePath: string, node: { getStartLineNumber(): number }) {
  const repoRoot = process.cwd().replace(/\\/g, "/")
  const rel = filePath.replace(repoRoot + "/", "")
  const line = node.getStartLineNumber()
  return `https://github.com/denshya/proton/blob/main/${rel}#L${line}`
}


interface ExtendedTypeEntry {
  kind: "interface" | "typeAlias" | "class";
  name: string;
  jsDoc: string;
  properties?: { name: string; type: string; optional: boolean; jsDoc: string }[];
  methods?: { name: string; signature: string; jsDoc: string }[];
  sourceLink: string;
}

const typeMap: Record<string, ExtendedTypeEntry[]> = {}

for (const sf of project.getSourceFiles(dtsPaths)) {
  const base = path.basename(sf.getFilePath(), ".d.ts")
  typeMap[base] = []

  for (const iface of sf.getInterfaces()) {
    const props = iface.getProperties().map(p => ({
      name: p.getName(),
      type: p.getType().getText(),
      optional: p.hasQuestionToken(),
      jsDoc: getJsDocText(p)
    }))

    const methods = iface.getMethods().map(m => ({
      name: m.getName(),
      signature: generateMethodSignature(m),
      jsDoc: getJsDocText(m)
    }))

    typeMap[base].push({
      kind: "interface",
      name: iface.getName(),
      jsDoc: getJsDocText(iface),
      properties: props,
      methods,
      sourceLink: toGitHubLink(sf.getFilePath(), iface)
    })
  }

  for (const cls of sf.getClasses()) {
    const props = cls.getProperties().map(p => ({
      name: p.getName(),
      type: p.getType().getText(),
      optional: p.hasQuestionToken?.() ?? false,
      jsDoc: getJsDocText(p)
    }))

    const methods = cls.getMethods().map(m => ({
      name: m.getName(),
      signature: generateMethodSignature(m),
      jsDoc: getJsDocText(m)
    }))

    typeMap[base].push({
      kind: "class",
      name: cls.getName(),
      jsDoc: getJsDocText(cls),
      properties: props,
      methods,
      sourceLink: toGitHubLink(sf.getFilePath(), cls)
    })
  }

  for (const alias of sf.getTypeAliases()) {
    const tn = alias.getTypeNode()
    if (tn && tn.getKind() === SyntaxKind.TypeLiteral) {
      const members = (tn as any).getMembers?.() || []
      const properties = members
        .filter((m: any) => m.getKind() === SyntaxKind.PropertySignature)
        .map((p: any) => ({
          name: p.getName(),
          type: p.getType().getText(),
          optional: p.hasQuestionToken(),
          jsDoc: getJsDocText(p),
        }))

      typeMap[base].push({
        kind: "typeAlias",
        name: alias.getName(),
        jsDoc: getJsDocText(alias),
        properties,
        sourceLink: toGitHubLink(sf.getFilePath(), alias)
      })
    }
  }
}

function generateMethodSignature(method: MethodSignature | any): string {
  const name = method.getName()
  const params = method.getParameters()
    .map(p => `${p.getName()}: ${p.getType().getText()}`)
    .join(", ")
  const returnType = method.getReturnType().getText()
  return `${name}(${params}): ${returnType}`
}

const specMap: Record<string, { describe: string; comment: string; tests: { name: string; line: number }[] }[]> = {}

for (const sf of specProject.getSourceFiles(specPaths)) {
  const base = path.basename(sf.getFilePath(), ".spec.tsx")
  specMap[base] = []

  sf.forEachDescendant((node) => {
    if (Node.isCallExpression(node) && node.getExpression().getText() === "describe") {
      const comment = getJsDocText(node)
      const name = node.getArguments()[0]?.getText().replace(/['"`]/g, "") || "Unnamed"
      const tests: { name: string; line: number }[] = []

      node.forEachDescendant((n) => {
        if (Node.isCallExpression(n) && n.getExpression().getText() === "it") {
          const testName = n.getArguments()[0]?.getText().replace(/['"`]/g, "") || "Unnamed"
          tests.push({ name: testName, line: n.getStartLineNumber() })
        }
      })

      specMap[base].push({ describe: name, comment, tests })
    }
  })
}

function renderMarkdown(types: Record<string, ExtendedTypeEntry[]>, specs: typeof specMap): string {
  let out = "# API Documentation with Specs\n\n"

  for (const moduleName of new Set([...Object.keys(types), ...Object.keys(specs)])) {
    out += `## ${moduleName}\n\n`

    if (specs[moduleName]) {
      for (const s of specs[moduleName]) {
        out += `### ${s.describe}\n\n`
        if (s.comment) out += `${s.comment}\n\n`

        if (types[moduleName]) {
          for (const t of types[moduleName]) {
            out += `#### \`${t.name}\` (${t.kind})\n\n`
            if (t.jsDoc) out += `${t.jsDoc}\n\n`
            out += `[View Source](${t.sourceLink})\n\n`

            if (t.properties?.length) {
              out += `**Properties**\n\n`
              out += `| Name | Type | Optional | Description |\n`
              out += `| ---- | ---- | -------- | ----------- |\n`
              for (const p of t.properties) {
                out += `| \`${p.name}\` | \`${p.type}\` | ${p.optional ? "Yes" : "No"} | ${p.jsDoc} |\n`
              }
              out += `\n`
            }

            if (t.methods?.length) {
              out += `**Methods**\n\n`
              for (const m of t.methods) {
                out += `\`\`\`ts\n${m.signature}\n\`\`\`\n\n`
                if (m.jsDoc) out += `  ${m.jsDoc}\n\n`
              }
            }
          }
        }

        out += `**Tests**\n\n`
        for (const test of s.tests) {
          out += `- [${test.name}](https://github.com/denshya/proton/blob/main/spec/${moduleName}.spec.tsx#L${test.line})\n`
        }

        out += `\n---\n\n`
      }
    }
  }

  return out
}

const md = renderMarkdown(typeMap, specMap)
fs.writeFileSync("docs/docs/specification.md", md.trim() + "\n")
console.log("🚀 Generated specification.md")
