import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
export interface ProjectManifest { name:string; version:string; entry?:string; modules?:string[] }
export class ProjectManager { constructor(public readonly root:string){}
  async init(name:string):Promise<ProjectManifest>{const manifest={name,version:"0.1.0",entry:"src/index.ts",modules:[]};await fs.mkdir(join(this.root,"src"),{recursive:true});await fs.writeFile(join(this.root,"framework.project.json"),JSON.stringify(manifest,null,2));return manifest}
  async read():Promise<ProjectManifest>{return JSON.parse(await fs.readFile(join(this.root,"framework.project.json"),"utf8"))}
  path(relative:string):string{const root=resolve(this.root),target=resolve(root,relative);if(target!==root&&!target.startsWith(root+"/"))throw new Error("Path escapes project root");return target}
}
