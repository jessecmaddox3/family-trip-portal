#!/usr/bin/env python3
"""Build explicit, deterministic source/demo archives after `npm run build`."""
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import zipfile

ROOT=Path(__file__).resolve().parents[1]
VERSION=json.loads((ROOT/'package.json').read_text())['version']
OUTPUT=ROOT/'artifacts/release'

def sha(data): return hashlib.sha256(data).hexdigest()
def archive(destination,entries):
    with zipfile.ZipFile(destination,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as out:
        for name,data,executable in sorted(entries):
            info=zipfile.ZipInfo(name,date_time=(2020,1,1,0,0,0));info.create_system=3
            info.external_attr=((stat.S_IFREG | (0o755 if executable else 0o644))<<16)
            info.compress_type=zipfile.ZIP_DEFLATED
            out.writestr(info,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)

def main():
    for key in ['PORTAL_CONTENT_DIR','PORTAL_CONFIG','NEXT_PUBLIC_BASE_PATH']:
        if os.environ.get(key):raise SystemExit(f'Unset {key} before building the public release')
    if not json.loads((ROOT/'portal.config.json').read_text())['demo']:raise SystemExit('Public packaging requires the fictional demo configuration')
    paths=json.loads((ROOT/'release-files.json').read_text())
    if len(paths)!=len(set(paths)) or paths!=sorted(paths):raise SystemExit('Release file manifest must be sorted and unique')
    allowed=set(paths)
    for folder in ['src','content','public','templates','scripts','tests','docs','skills','packaging','third-party','.github']:
        for p in (ROOT/folder).rglob('*'):
            if p.is_symlink():raise SystemExit(f'Symlink cannot enter the public release: {p.relative_to(ROOT)}')
            if p.is_file() and p.relative_to(ROOT).as_posix() not in allowed:raise SystemExit(f'Unreviewed source file: {p.relative_to(ROOT)}')
    records=[];source=[]
    for name in paths:
        p=ROOT/name
        if p.is_symlink() or '..' in Path(name).parts or Path(name).is_absolute() or not p.is_file():raise SystemExit(f'Invalid source path: {name}')
        blob=p.read_bytes();records.append({'path':name,'sha256':sha(blob)})
        source.append((f'family-trip-portal-{VERSION}/{name}',blob,name.endswith('.command')))
    subprocess.run(['node', str(ROOT/'node_modules/tsx/dist/cli.mjs'), str(ROOT/'scripts/check-build.ts')],cwd=ROOT,check=True)
    build=ROOT/'out'
    if not (build/'index.html').is_file():raise SystemExit('Run npm run build before packaging')
    html=(build/'index.html').read_text()
    if 'Fictional demo.' not in html or '/demo/_next/' in html:raise SystemExit('Output is not the root-path fictional demo build')
    demo=[];build_records=[]
    for p in sorted(build.rglob('*')):
        if p.is_symlink():raise SystemExit('Static export contains a symlink')
        if p.is_file():
            relative=p.relative_to(build).as_posix();blob=p.read_bytes();demo.append((f'family-trip-portal-demo-{VERSION}/site/{relative}',blob,False));build_records.append({'path':relative,'sha256':sha(blob)})
    extras={'scripts/serve.mjs':'serve.mjs','packaging/demo-Start.command':'Start.command','packaging/demo-Start Windows.cmd':'Start Windows.cmd','packaging/demo-README.txt':'README.txt','LICENSE':'LICENSE','ASSETS.md':'ASSETS.md','THIRD_PARTY.md':'THIRD_PARTY.md','docs/TIDES.md':'docs/TIDES.md','docs/IMAGE-PROMPTS.md':'docs/IMAGE-PROMPTS.md'}
    extras.update({name:name for name in paths if name.startswith('third-party/')})
    for name,target in extras.items():demo.append((f'family-trip-portal-demo-{VERSION}/{target}',(ROOT/name).read_bytes(),target.endswith('.command')))
    OUTPUT.mkdir(parents=True,exist_ok=True)
    source_file=OUTPUT/f'family-trip-portal-source-{VERSION}.zip';demo_file=OUTPUT/f'family-trip-portal-demo-{VERSION}.zip'
    archive(source_file,source);archive(demo_file,demo)
    provenance={'project':'family-trip-portal','version':VERSION,'source_files':records,'static_files':build_records,'source_manifest_sha256':sha(json.dumps(records,sort_keys=True,separators=(',',':')).encode()),'artifacts':{p.name:sha(p.read_bytes()) for p in [source_file,demo_file]}}
    provenance_file=OUTPUT/f'family-trip-portal-provenance-{VERSION}.json';provenance_file.write_text(json.dumps(provenance,indent=2)+'\n')
    (OUTPUT/'SHA256SUMS').write_text(''.join(f'{sha(p.read_bytes())}  {p.name}\n' for p in [source_file,demo_file,provenance_file]))
    print(f'Packaged {len(records)} allowlisted source files and {len(build_records)} static files. Four artifacts in artifacts/release/.')
if __name__=='__main__':main()
