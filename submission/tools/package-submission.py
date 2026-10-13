import hashlib
import json
import pathlib
import shutil
import zipfile

root = pathlib.Path(__file__).resolve().parents[2]
checkout = root / '.submission-repo'
assert checkout.is_relative_to(root) and (checkout / '.git').is_dir()
skip_dirs = {'.git', 'node_modules', '.expo', 'dist', 'dist-notifications-check',
             'test-results', 'playwright-report', 'artifacts', '__pycache__', '.tools', 'previews'}

def allowed(file):
    if file.name in {'source-package.json', 'publication.json'}:
        return False
    if any(part in skip_dirs for part in file.parts):
        return False
    if file.name.startswith('.env') and file.name != '.env.example':
        return False
    if file.suffix in {'.zip', '.pyc', '.tsbuildinfo'} or file.name.endswith('.local'):
        return False
    return 'server/data' not in file.as_posix()

files = [root / 'README.md', root / 'package.json', root / '.gitignore', root / '.gitattributes']
for directory in ['study-room', 'submission']:
    for file in (root / directory).rglob('*'):
        if file.is_file() and allowed(file.relative_to(root)):
            files.append(file)

manifest = []
for file in files:
    relative = file.relative_to(root)
    destination = checkout / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file, destination)
    manifest.append({'path': relative.as_posix(), 'bytes': file.stat().st_size,
                     'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})

archive = root / 'submission' / 'Mini-Project-2_Source_Nguyen-Ngoc-Bao-Trung_23IT.B236.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for file in files:
        output.write(file, pathlib.Path('Mini-Project-2') / file.relative_to(root))
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None
    assert 'Mini-Project-2/study-room/package-lock.json' in check.namelist()
    assert not any('/node_modules/' in name or '/.git/' in name or name.endswith('/.env') for name in check.namelist())
summary = {'files': len(files), 'archive': archive.name, 'archiveBytes': archive.stat().st_size,
           'excluded': sorted(skip_dirs), 'manifest': manifest}
(root / 'submission' / 'evidence' / 'source-package.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps({key: summary[key] for key in ['files', 'archive', 'archiveBytes']}, indent=2))
