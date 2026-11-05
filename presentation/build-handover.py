"""Create a section-based team handbook from the same content used by the deck."""
from pathlib import Path
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

root = Path(__file__).resolve().parents[1]
data = json.loads((root / '.build/handover-content.json').read_text())
sections = data['sections']
slides = data['slides']

doc = Document()
sec = doc.sections[0]
sec.page_width = Inches(8.5)
sec.page_height = Inches(11)
sec.top_margin = sec.bottom_margin = Inches(.7)
sec.left_margin = sec.right_margin = Inches(.75)
for name in ['Normal', 'Title', 'Heading 1', 'Heading 2', 'Heading 3']:
    style = doc.styles[name]
    style.font.name = 'Arial'
    style.font.color.rgb = RGBColor(0, 0, 0)
    for border in list(style.element.findall('.//' + qn('w:pBdr'))):
        border.getparent().remove(border)
doc.styles['Normal'].font.size = Pt(10)
doc.styles['Normal'].paragraph_format.space_after = Pt(3)
doc.styles['Normal'].paragraph_format.line_spacing = 1.0
doc.styles['Title'].font.size = Pt(24)
doc.styles['Heading 1'].font.size = Pt(15)
doc.styles['Heading 2'].font.size = Pt(11.5)

def p(text, lead=None):
    para = doc.add_paragraph()
    para.paragraph_format.keep_together = True
    if lead:
        para.add_run(lead + ' ').bold = True
    para.add_run(text)
    return para

def heading(text):
    doc.add_heading(text, 1)

def subheading(text):
    para = doc.add_heading(text, 2)
    para.paragraph_format.keep_with_next = True
    return para

def fmt(seconds):
    return f'{seconds // 60}:{seconds % 60:02d}'

def table(rows, widths):
    tb = doc.add_table(rows=0, cols=len(rows[0]))
    tb.autofit = False
    for column, width in zip(tb.columns, widths):
        column.width = Inches(width)
    for row_number, row in enumerate(rows):
        cells = tb.add_row().cells
        for column_number, value in enumerate(row):
            cell = cells[column_number]
            cell.width = Inches(widths[column_number])
            cell.text = str(value)
            props = cell._tc.get_or_add_tcPr()
            shade = OxmlElement('w:shd')
            shade.set(qn('w:fill'), '17252C' if row_number == 0 else ('F1F4F4' if row_number % 2 == 0 else 'FFFFFF'))
            props.append(shade)
            borders = OxmlElement('w:tcBorders')
            for edge in ['top', 'left', 'bottom', 'right']:
                node = OxmlElement('w:' + edge)
                node.set(qn('w:val'), 'single')
                node.set(qn('w:sz'), '4')
                node.set(qn('w:color'), 'D9D9D9')
                borders.append(node)
            props.append(borders)
            for run in cell.paragraphs[0].runs:
                run.font.size = Pt(10)
                run.bold = row_number == 0
                if row_number == 0:
                    run.font.color.rgb = RGBColor(255, 255, 255)
    return tb

doc.add_paragraph('CS440 NoSQL presentation section handover', style='Title')
p('Use this guide to choose four presentation sections, assign one presenter to each section and rehearse the transitions as one continuous argument. The appendix responsibility map gives each backup slide a clear owner without fixing names in advance.')

heading('The core idea')
p('The vulnerable application expects a password string but accepts an object containing a MongoDB operator. It passes that object into its query. MongoDB returns Alice because her stored password satisfies the changed condition. The application mistakes the match for proof of identity and creates a session. Input validation blocks this tested object before a query. The complete fix also verifies a stored password hash.')

heading('Choose the four sections')
rows = [['Section', 'Slides', 'Time', 'Purpose', 'Assigned presenter']]
for section in sections:
    rows.append([section['id'], f"{section['start']}-{section['end']}", fmt(section['seconds']), section['title'], '________________'])
table(rows, [.6, .7, .7, 3.2, 1.3])
p('The four sections total 9:40, including the 90-second demo. Allow about 25 seconds for handovers and navigation. Aim for a measured full run of 10:10 to 10:30. The lecturer stops at 12:00.')

heading('Section handovers')
table([['From', 'Handover sentence']] + [[f"Section {section['id']}", section['outgoing']] for section in sections], [1.0, 5.5])

heading('Files to open')
p('Use CS440-NoSQL-Injections-Final-Deck-Excellent-v5.pptx for editable delivery or the matching PDF for static viewing. Speaker-Script.md contains the same section structure and complete narration. Demo-Backup-90s.mp4 is the silent fallback. Q-and-A-Defence-Pack.md contains additional challenges. The repository is https://github.com/Qingyu255/CS440-Project.')
p('Keep slide 7 and the lab browser ready. The standard PowerPoint builds on slides 5 and 9 reveal the explanation on clicks. Test those builds on the actual presentation machine. The PDF contains every final state.')

doc.add_page_break()
heading('Vocabulary before the talk')
terms = [
    ['Term', 'Explain it this way'],
    ['NoSQL', 'A broad family of databases using models such as documents, key-value entries, graphs and wide columns.'],
    ['MongoDB document', 'A stored record containing named fields.'],
    ['JSON', 'A text format for structured data. The server parses it into values such as strings and objects.'],
    ['Query or filter', 'The condition used to select records. The driver sends it to MongoDB.'],
    ['Predicate', 'A condition that is true or false for a record.'],
    ['$ne', 'MongoDB\'s not-equal operator. $ne: "" means different from an empty string and can also match missing fields.'],
    ['findOne', 'Ask MongoDB for one matching record.'],
    ['Session', 'A remembered login used on later requests.'],
    ['Authentication', 'Establishing who the caller is.'],
    ['Attack succeeds', 'The app creates an Alice session without the correct password and protected access becomes available.'],
    ['Attack stopped', 'The malicious object creates no session. In the protected modes it is rejected before a database query.'],
    ['HTTP status', 'A response code. In this lab, 200 means accepted, 401 means login rejected, and 400 means rejected before the query. The security outcome matters more than the number alone.'],
    ['Read-only account', 'A database account allowed to read but not write. That does not prove the end user\'s identity.'],
    ['Hash verification', 'Comparing the entered password with a stored one-way verifier instead of placing the password in the database query.'],
    ['Tenant', 'A customer or organisation whose records must stay separate from another customer\'s records.']
]
table(terms, [1.7, 4.8])
heading('Keep the evidence claim precise')
p('150 means 15 cases multiplied by five configurations and two runs. The repetitions check local repeatability. The lab experimentally demonstrates operator injection only. The $where expression is a fixed harmless configuration probe. JavaScript injection is a conceptual comparison. Synthetic plaintext passwords appear only in the deliberately vulnerable account store. The hardened store is hash-only.')

for section in sections:
    doc.add_page_break()
    heading(f"Section {section['id']}  {section['title']}")
    p('____________________', 'Assigned presenter')
    p(section['purpose'], 'Purpose')
    p(section['incoming'], 'Incoming handover')
    for slide in slides[section['start'] - 1:section['end']]:
        if slide['number'] == 12:
            doc.add_page_break()
            heading('Section D continued')
        subheading(f"Slide {slide['number']}  {slide['title']}")
        p(slide['core'], 'Core idea')
        p(slide['script'], 'Explain it')
        p(slide['point'], 'Point and pace')
        if slide['transition']:
            p(slide['transition'], 'Transition')
        p(slide['question'] + ' ' + slide['answer'], 'Likely question')
    p(section['outgoing'], 'Section handover')

doc.add_page_break()
heading('Appendix responsibility map')
appendix_rows = [['Section', 'Appendix slides', 'Responsibility']]
appendix_groups = {
    'A': ('None', 'Opening and background questions use the main slides.'),
    'B': ('15 and 23', 'Vulnerable code and the article or database references.'),
    'C': ('13-14 and 17-21', 'Experimental design, environment, case matrix, control probes and captured evidence.'),
    'D': ('16, 22 and 24', 'Hardened code, limitations, defences and reproducibility.')
}
for section in sections:
    slide_list, responsibility = appendix_groups[section['id']]
    appendix_rows.append([section['id'], slide_list, responsibility])
table(appendix_rows, [.8, 1.3, 4.4])
p('The assigned section presenter answers the first question for these appendix slides. Another teammate may add detail, but every appendix has one clear starting owner.')

for section in sections:
    assigned = [slide for slide in slides[data['mainSlideCount']:] if slide['section']['id'] == section['id']]
    if not assigned:
        continue
    if section['id'] == 'D':
        doc.add_page_break()
    heading(f"Section {section['id']} appendix notes")
    for slide in assigned:
        if slide['number'] == 14:
            doc.add_page_break()
            heading('Section C appendix notes continued')
        if slide['number'] == 21:
            doc.add_page_break()
            heading('Section C appendix notes continued')
        subheading(f"Slide {slide['number']}  {slide['title']}")
        p(slide['core'], 'Core idea')
        p(slide['script'], 'Explain it')
        p(slide['point'], 'Point and pace')
        p(slide['question'] + ' ' + slide['answer'], 'Likely question')

heading('Source links')
for key in ['publication', 'manuscript', 'paper', 'ne', 'where', 'nosql', 'password']:
    p(data['refs'][key])

doc.add_page_break()
heading('Live demonstration checklist')
for text in [
    'Before class, follow nosql-lab/README.md, run the checks on the presentation machine, preload the browser, and open the local video.',
    '0-15 seconds: baseline, Wrong password, Send JSON request. Show the failed login and denied notes.',
    '15-40 seconds: Operator object. Show the unchanged username, password object, Alice session and accessible synthetic notes.',
    '40-65 seconds: switch to the full hardened configuration and send the identical object. Show rejection before query and denied access.',
    '65-85 seconds: Valid credentials. Wait for the completed hash verification and show that legitimate access still works.',
    '85-90 seconds: return to results slide 8.',
    'If anything fails, switch to the video or slides 20-21 within ten seconds. Say that the group is using captured output from the local lab.'
]:
    p(text)

heading('Rehearsal and submission')
for text in [
    'Assign one presenter to each section and write the names into this guide and the section script.',
    'Run once for accuracy. Every presenter explains $ne, object versus string, read-only access and the difference between a query match and password proof.',
    'Run again with a timer, all handovers and browser navigation. Aim for 10:10 to 10:30.',
    'Run a deliberate demo failure and practise the fallback. Recheck that the final recommendation is delivered before 12:00.',
    'Check the final PPTX and PDF on the classroom machine. Inspect the two click-build slides in slide-show mode.',
    'All four members must present and attend Q&A. Each member submits the deck individually by midnight before the presentation, subject to the eLearn instructions.'
]:
    p(text)

heading('Source and evidence navigation')
p('Slide 13: experimental design. Slides 14-16: exact environment and code. Slides 17-18: all 15 cases. Slide 19: independent configuration probes. Slides 20-21: actual browser response captures. Slide 22: limitations. Slides 23-24: literature and reproducibility.')
p('The literature categories were checked against the authors\' InfoQ republication and an author-uploaded manuscript. The publisher proxy remained unavailable. MongoDB operator semantics use version 7.0 documentation. The immutable original experiment commit is c8252d2bb3baeb543a011992e2a79ee2123ecfec.')

doc.save(root / 'deliverables/CS440-Team-Handover.docx')
print('Created section-based team handover document.')
