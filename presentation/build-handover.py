"""Create a team handbook from the same slide content used by the deck."""
from pathlib import Path
import json
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'.build/handover-content.json').read_text())
doc=Document();sec=doc.sections[0];sec.page_width=Inches(8.5);sec.page_height=Inches(11);sec.top_margin=sec.bottom_margin=Inches(.7);sec.left_margin=sec.right_margin=Inches(.75)
for name in ['Normal','Title','Heading 1','Heading 2','Heading 3']:
 s=doc.styles[name];s.font.name='Arial';s.font.color.rgb=RGBColor(0,0,0)
 for border in list(s.element.findall('.//'+qn('w:pBdr'))):border.getparent().remove(border)
doc.styles['Normal'].font.size=Pt(10.5);doc.styles['Normal'].paragraph_format.space_after=Pt(5)
doc.styles['Normal'].paragraph_format.line_spacing=1.04
doc.styles['Title'].font.size=Pt(24);doc.styles['Heading 1'].font.size=Pt(16);doc.styles['Heading 2'].font.size=Pt(12)
def p(text,lead=None):
 para=doc.add_paragraph()
 if lead:para.add_run(lead+' ').bold=True
 para.add_run(text);return para
def heading(s):doc.add_heading(s,1)
def table(rows,widths):
 tb=doc.add_table(rows=0,cols=len(rows[0]));tb.autofit=False
 for column,width in zip(tb.columns,widths):column.width=Inches(width)
 for r,row in enumerate(rows):
  cells=tb.add_row().cells
  for c,value in enumerate(row):
   cells[c].width=Inches(widths[c]);cells[c].text=str(value)
   pr=cells[c]._tc.get_or_add_tcPr();shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'17252C' if r==0 else ('F1F4F4' if r%2==0 else 'FFFFFF'));pr.append(shade)
   borders=OxmlElement('w:tcBorders')
   for edge in ['top','left','bottom','right']:
    e=OxmlElement('w:'+edge);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
   pr.append(borders)
   for run in cells[c].paragraphs[0].runs:
    run.font.size=Pt(10);run.bold=r==0
    if r==0:run.font.color.rgb=RGBColor(255,255,255)
 return tb
doc.add_paragraph('CS440 NoSQL presentation handover',style='Title')
p('A teaching guide for Ercong Kee, Pheobe Neo, Kendrick Poon and Liu Qingyu. Use it to understand the argument, divide delivery and rehearse answers beyond your own slides.')
heading('The core idea')
p('The vulnerable application expects a password string but accepts an object containing a MongoDB operator. It passes that object into its query. MongoDB returns Alice because her stored password satisfies the new condition. The application then mistakes the match for proof of identity and creates a session. Input validation blocks this tested object before a query; the complete fix also verifies a stored password hash.')
heading('Suggested speaking order')
table([['Speaker','Slides','Content time'],['Ercong Kee','1–3','2:00'],['Pheobe Neo','4–6','2:25'],['Kendrick Poon','7–9, including demo','3:15'],['Liu Qingyu','10–13','2:45']],[2,2.7,1.8])
p('The order follows the supplied name order. Planned slide content totals 10:25, including the 90-second demo. Reserve about 25 seconds for handovers and navigation. The target full run is 10:50 to 11:00; the lecturer stops at 12:00. These are targets until your group measures a complete rehearsal.')
heading('Files to open')
p('Use CS440-NoSQL-Injections-Final-Deck.pptx for editable delivery or the matching PDF for static viewing. Speaker-Script.md contains the complete narration and sources. Demo-Backup-90s.mp4 is the silent narrated-by-you fallback. Q-and-A-Defence-Pack.md contains additional challenges. The repository is https://github.com/Qingyu255/CS440-Project.')
p('Keep slide 8 and the lab browser ready. The standard PowerPoint builds on slides 5 and 10 reveal the explanation on clicks. Test those builds on the actual presentation machine; the PDF contains every final state. If a viewer does not play builds correctly, use the PDF.')
doc.add_page_break();heading('Vocabulary before the talk')
terms=[['Term','Explain it this way'],['NoSQL','A broad family of databases using models such as documents, key-value entries, graphs and wide columns.'],['MongoDB document','A stored record containing named fields.'],['JSON','A text format for structured data. The server parses it into values such as strings and objects.'],['Query or filter','The condition used to select records. The driver sends it to MongoDB.'],['Predicate','A condition that is true or false for a record.'],['$ne','MongoDB’s not-equal operator. $ne: "" means different from an empty string and can also match missing fields.'],['findOne','Ask MongoDB for one matching record.'],['Session','A remembered login used on later requests.'],['Authentication','Establishing who the caller is.'],['Read-only account','A database account allowed to read but not write. That does not prove the end user’s identity.'],['Hash verification','Checking a supplied password against a stored password hash.'],['Tenant','A customer or organisation whose records must stay separate from another customer’s records.']]
table(terms,[1.7,4.8])
heading('Keep the evidence claim precise')
p('150 means 15 cases multiplied by five configurations and two runs. The repetitions check local repeatability. The lab experimentally demonstrates operator injection only. The $where expression is a fixed harmless configuration probe. JavaScript injection is a conceptual comparison. Synthetic plaintext passwords appear only in the deliberately vulnerable account store; the hardened store is hash-only.')
for offset in range(0,24,2):
 doc.add_page_break()
 for s in data['slides'][offset:offset+2]:
  heading(f"Slide {s['number']}  {s['title']}")
  p((s['owner']+f"  |  {s['seconds']} seconds") if s['seconds'] else 'Q&A appendix  |  All members')
  p(s['core'],'Core idea')
  p(s['script'],'Explain it')
  p(s['point'],'Point and pace')
  if s['transition']:p(s['transition'],'Transition')
  p(s['question']+' '+s['answer'],'Likely question')
 if offset==22:
  heading('Source links')
  for key in ['publication','manuscript','paper','ne','where','nosql','password']:
   p(data['refs'][key])
doc.add_page_break();heading('Live demonstration checklist')
for text in ['Before class, follow nosql-lab/README.md, run the checks on the presentation machine, preload the browser, and open the local video.','0–15 seconds: baseline, Wrong password, Send JSON request. Show the failed login and denied notes.','15–40 seconds: Operator object. Show the unchanged username, password object, Alice session and accessible synthetic notes.','40–65 seconds: switch to the full hardened configuration and send the identical object. Show rejection before query and denied access.','65–85 seconds: Valid credentials. Wait for the completed hash verification; show that legitimate access still works.','85–90 seconds: return to results slide 9.','If anything fails, switch to the video or slides 20–21 within ten seconds. Say that the group is using captured output from the local lab. The video is a sequence of authentic captured states, not a continuous screen recording.']:
 p(text)
heading('Rehearsal and submission')
for text in ['Run once for accuracy. Every member explains $ne, object versus string, read-only access and the difference between a query match and password proof.','Run again with a timer, all handovers and browser navigation. Record the total. Aim for 10:50 to 11:00.','Run a deliberate demo failure and practise the fallback. Recheck that the final recommendation is delivered before 12:00.','Check the final PPTX and PDF on the actual classroom machine. Inspect the two click-build slides in slide-show mode.','All four members must present and attend Q&A. Each member submits the deck individually by midnight before the presentation, subject to the eLearn instructions.']:
 p(text)
heading('Source and evidence navigation')
p('Slides 14–16: exact environment and code. Slides 17–18: all 15 cases. Slide 19: independent configuration probes. Slides 20–21: actual browser response captures. Slide 22: limitations. Slides 23–24: literature and reproducibility.')
p('The literature categories were checked against the authors’ InfoQ republication and an author-uploaded manuscript. The publisher proxy remained unavailable; the author manuscript is not represented as the final typeset publisher PDF. MongoDB operator semantics use version 7.0 documentation. The immutable original experiment commit is c8252d2bb3baeb543a011992e2a79ee2123ecfec.')
doc.save(root/'deliverables/CS440-Team-Handover.docx')
print('Created team handover document.')
