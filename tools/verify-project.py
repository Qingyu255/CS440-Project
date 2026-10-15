#!/usr/bin/env python3
"""Check committed evidence and editable presentation contracts without private tools."""
from pathlib import Path
import csv, json, re, subprocess, zipfile
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parents[1]
e = json.loads((root / 'nosql-lab/evidence/results.json').read_text())
assert e['method']['cases'] == 15 and e['method']['configurations'] == 5 and e['method']['repetitions'] == 2
rows = e['results']; assert len(rows) == 150
keys = {(r['configuration'], r['caseId'], r['repetition']) for r in rows}
assert len(keys) == 150
for r in rows:
    assert r['authenticated'] == (r['status'] == 200)
    assert r['protectedStatus'] == (200 if r['authenticated'] else 401)
    assert r['findCommands'] == (0 if r['status'] == 400 else 1)
    assert r['databaseQueried'] == (r['findCommands'] > 0)
    if r['caseId'] == 'C01': assert r['status'] == 200 and r['account'] == 'alice'
    if r['caseId'] in ['C02', 'C03', 'C06']: assert r['status'] == 401
    if r['caseId'] == 'C04':
        assert r['status'] == (400 if r['configuration'] in ['validated', 'hardened'] else 200)
        if r['status'] == 200: assert r['account'] == 'alice'
assert e['controls']['noscripting']['whereAllowed'] is False
assert e['controls']['noscripting']['whereErrorCode'] == 6108304
assert e['controls']['main']['whereAllowed'] is True
assert e['controls']['readonly']['authenticatedRoles'] == [{'role':'read','db':'cs440_lab'}]
assert e['controls']['readonly']['writeDenied'] is True
csv_rows=list(csv.DictReader((root/'nosql-lab/evidence/results.csv').open()))
assert len(csv_rows)==150
for a,b in zip(rows,csv_rows):
    for key in ['configuration','caseId','repetition','status','findCommands','protectedStatus']:
        assert str(a[key])==b[key]
source = json.loads((root/'presentation/slide-source.json').read_text()); assert len(source)==24
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(root/'deliverables/CS440-NoSQL-Injections-Reviewed.pptx') as z:
    assert z.testzip() is None
    slides=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide[0-9]+\.xml',n)]
    notes=[n for n in z.namelist() if re.fullmatch(r'ppt/notesSlides/notesSlide[0-9]+\.xml',n)]
    assert len(slides)==len(notes)==24
    tables=sum(len(ET.fromstring(z.read(n)).findall('.//a:tbl',ns)) for n in slides)
    assert tables==7
    for n in notes:
        text=' '.join(t.text or '' for t in ET.fromstring(z.read(n)).findall('.//a:t',ns))
        assert 'Target time:' in text and 'Sources:' in text
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
for name in filter(None,tracked):
    assert not any(part in Path(name).parts for part in ['.state','node_modules','.npm-cache','.build'])
    assert not name.endswith('.env')
# Credential redaction is checked against all intentional synthetic password fixtures.
for r in rows:
    serial=json.dumps({'request':r.get('request'),'filter':r.get('filter')})
    assert not any(p in serial for p in ['Alice-Lab-Only-440!','Bob-Lab-Only-440!','Carol-Lab-Only-440!'])
for token in ['ghp_', 'github_pat_', '-----BEGIN PRIVATE KEY-----']:
    for name in filter(None,tracked):
        p=root/name
        if p.exists() and p.suffix in ['.json','.ndjson','.mjs','.md','.yml','.yaml','.csv']:
            # This validator's own list of token prefixes is not an actual secret.
            assert token not in p.read_text(errors='replace'), f'Unexpected credential marker in {name}'
print('PASS: evidence matrix, CSV parity, control identities, credential redaction and 24-slide editable deck contracts')
