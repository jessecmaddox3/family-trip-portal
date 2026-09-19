"""Refresh legal notices from the installed, locked production dependencies."""
import hashlib
import json
import pathlib
import subprocess
root=pathlib.Path(__file__).resolve().parents[1]
result=subprocess.run(['npm','ls','--omit=dev','--all','--parseable'],cwd=root,text=True,capture_output=True,check=True)
records=[]
for line in result.stdout.splitlines():
 p=pathlib.Path(line)
 if p==root or not (p/'package.json').is_file():continue
 data=json.loads((p/'package.json').read_text());name=data['name'];version=data['version']
 slug=name.replace('@','').replace('/','--')+'-'+version
 licenses=[f for f in p.rglob('*') if f.is_file() and 'node_modules' not in f.relative_to(p).parts and f.name.lower().startswith(('license','licence','copying','notice'))]
 if name=='next':licenses.extend(f for f in (p/'dist/compiled').rglob('*') if f.is_file() and f.name.lower().startswith(('license','licence','copying','notice')))
 target=root/'third-party/dependencies'/slug;target.mkdir(parents=True,exist_ok=True)
 files=[]
 for f in sorted(set(licenses)):
  relative=f.relative_to(p);dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);blob=f.read_bytes();dest.write_bytes(blob)
  files.append({'path':dest.relative_to(root).as_posix(),'sha256':hashlib.sha256(blob).hexdigest()})
 records.append({'package':name,'version':version,'license':data.get('license','see upstream notices'),'notices':files})
(root/'third-party/dependencies.json').write_text(json.dumps(sorted(records,key=lambda r:(r['package'],r['version'])),indent=2)+'\n')
print(f'Copied notices for {len(records)} installed production packages.')
missing=[r['package'] for r in records if not r['notices']];print('Packages without a top-level notice:',missing)
