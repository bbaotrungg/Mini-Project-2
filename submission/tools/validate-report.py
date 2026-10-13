import json
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / '.tools'))
import pymupdf as fitz
from pypdf import PdfReader

pdf = root / 'Mini-Project-2_Technical-Report_Nguyen-Ngoc-Bao-Trung_23IT.B236.pdf'
reader = PdfReader(pdf)
assert len(reader.pages) == 4, f'Expected four pages, got {len(reader.pages)}'
text = '\n'.join(page.extract_text() for page in reader.pages)
for required in ['Nguyen Ngoc Bao Trung', '23IT.B236', '13/10/2026',
                 'GENERAL INFORMATION', 'FEATURE IMPLEMENTATION',
                 'TECHNICAL ARCHITECTURE', 'EMPIRICAL EVIDENCE',
                 'TECHNICAL CHALLENGES', 'browser', 'pending']:
    assert required.lower() in text.lower(), required
document = fitz.open(pdf)
previews = root / 'previews'
previews.mkdir(exist_ok=True)
for index, page in enumerate(document):
    assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1
    page.get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(previews / f'report-page-{index + 1}.png')
summary = {'file': pdf.name, 'pages': 4, 'paper': 'A4', 'requiredSectionsPresent': True,
           'studentMetadataVerified': True, 'screenshots': 'Browser previews; native screenshots pending'}
(root / 'evidence' / 'pdf-validation.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps(summary, indent=2))
