import "./FileExplorer.scss"

import { Proton } from "@denshya/proton"
import { State, StateArray } from "@denshya/reactive"

import Icon from "@/ui/static/Icon/Icon"
import Loader from "@/ui/static/Loader/Loader"
import LoaderCover from "@/ui/static/Loader/LoaderCover"
import Link from "@/app/navigation/Link"




interface Dirent {
  type: "file" | "directory"
  name: string
  parentPath: string
}

async function* FileExplorer() {
  yield <LoaderCover />

  const dirents = new StateArray<Dirent>(DEFAULT_DIRENTS)

  const directory = new State<string>(DEFAULT_DIRECTORY)
  const directorySlugs = new StateArray<string>(directory.to(it => it.split("/")))
  const directoryEntries = new StateArray<Dirent>(
    State.combine(
      [dirents, directory],
      (dirents, directory) => dirents.filter(dirent => {
        if (!dirent.parentPath.startsWith(directory)) return false
        if (dirent.parentPath.indexOf("/", directory.length) >= 0) return false

        return true
      }),
    )
  )

  return (
    <div className="file-explorer">
      <div className="file-explorer__seek">
        <div className="file-explorer__directory">
          {directorySlugs.map((slug, index, array) => (
            <>
              {index > 0 ? "/" : null}
              <button type="button" on={{ click: () => directory.set(array.slice(0, index + 1).join("/")) }}>{slug}</button>
            </>
          ))}
        </div>
      </div>
      <div className="file-explorer__grid">
        {directoryEntries.map(entry => {
          if (entry.type === "file") {
            return (
              <div className="file file--file">
                <div className="file__preview"><FilePreview dirent={entry} /></div>
                <div className="file__name">{entry.name}</div>
                <Link className="ghost" to={"/case-studies/" + entry.name} label={`Go to ${entry.name} case study`} />
              </div>
            )
          }

          return (
            <button className="file" type="button" on={{ click: () => directory.set(entry.parentPath + "/" + entry.name) }}>
              <div className="file__preview"><Icon name="folder" /></div>
              <div className="file__name">{entry.name}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FileExplorer

async function* FilePreview(this: Proton.Component, props: { dirent: Dirent }) {
  yield <Loader />

  return <img src={`https://cms.dev.pinely.eu/api/media/file/` + files[props.dirent.name]} alt="file preview" />
}


const files: Record<string, string> = {
  "chronly": "chronly-min.jpg",
  "clarity-clinic": "clarity clinic-min.jpg",
  "erzy": "erzy-min.jpg",
  "schedule-me": "schedule me-min.jpg",
  "stream-menu": "stream menu plugin-min.jpg",
}

const DEFAULT_DIRECTORY = "case-studies"
const DEFAULT_DIRENTS: Dirent[] = [
  { type: "directory", name: "web", parentPath: DEFAULT_DIRECTORY },
  { type: "directory", name: "games", parentPath: DEFAULT_DIRECTORY },
  { type: "directory", name: "cloud-infra", parentPath: DEFAULT_DIRECTORY },

  ...Object.keys(files).map(file => ({ type: "file", name: file, parentPath: DEFAULT_DIRECTORY }) as const),
  ...Object.keys(files).map(file => ({ type: "file", name: file, parentPath: DEFAULT_DIRECTORY + "/web" }) as const),
]
