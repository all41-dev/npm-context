import fs from 'fs';

export class NpmContext {
  private _pkg: any;
  private _pkgLock: any;
  constructor() {
    const pkgFile = this._findPkgFile();
    this._pkg = NpmContext.objFromPath(pkgFile);
    this._pkgLock = NpmContext.objFromPath(pkgFile.replace('package.json', 'package-lock.json'));
  }
  public static objFromPath(path: string): any {
    if (!fs.existsSync(path)) return;//throw new Error(`The file "${path}" doesn't exists.`);

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
    const basePath = ctDir.substr(0, ctDir.indexOf('node_modules'));
    if (fs.existsSync(ctFile = `${basePath}package.json`))
      return ctFile;

    while (!fs.existsSync(ctFile = `${ctDir}\\package.json`))
      ctDir += '\\..';

    return ctFile;
  }
  public get dependencies(): { name: string; rule: string; version: string }[] {
    const depsObj = this.getProp('dependencies');
    const res = Object.keys(depsObj).map((k) => ({
      name: k,
      rule: depsObj[k],
      version: this._pkgLock['packages'][`node_modules/${k}`]['version'],
    }));
    return res;
  }
  public get package(): { name: string; version: string } {
    return {
      name: this._pkg.name,
      version: this.package.version,
    };
  }
}