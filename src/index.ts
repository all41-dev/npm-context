import fs from 'fs';
import { SemVer, compare, gt } from "semver";

export class NpmContext {
  private _pkg: any;
  private _pkgLock: any;
  constructor() {
    const pkgFile = this._findPkgFile();
    this._pkg = NpmContext.objFromPath(pkgFile);
    this._pkgLock = NpmContext.objFromPath(pkgFile.replace('package.json', 'package-lock.json'));
  }
  public static objFromPath(path: string): any {
    if (!fs.existsSync(path)) throw new Error(`The file "${path}" doesn't exists.`);

    try {
      const contentStr = fs.readFileSync(path).toString();
      const obj = JSON.parse(contentStr);
      return obj;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
  public get name(): string { return this.getProp('name'); }
  public getProp(propName: string): any {
    return this._pkg[propName];
  }
  private _findPkgFile(): string {
    let ctDir = __dirname;
    let ctFile;
    while (!fs.existsSync(ctFile = `${ctDir}\\package.json`))
      ctDir += '\\..';
    
    return ctFile;
  }
  public get dependencies(): { name: string; rule: string; version: string }[] {
    const depsObj = this.getProp('dependencies');
    const res = Object.keys(depsObj).map((k) => ({
      name: k,
      rule: depsObj[k],
      version: this._pkgLock['dependencies'][k]['version'],
    }));
    return res;
  }
}