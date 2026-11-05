"""Add standard PowerPoint click-to-appear builds without altering static slide content."""
from pathlib import Path
import sys, zipfile
from lxml import etree as E
path=Path(sys.argv[1])
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
def element(name,**attrs):return E.Element('{'+ns['p']+'}'+name,**{k:str(v) for k,v in attrs.items()})
with zipfile.ZipFile(path) as z: entries={n:z.read(n) for n in z.namelist()}
for number in (5,9):
 key=f'ppt/slides/slide{number}.xml';root=E.fromstring(entries[key]);groups={}
 for node in root.findall('.//p:cNvPr',ns):
  name=node.get('name','')
  if name.startswith('reveal'):
   stage=int(name.split('-')[0][6:]);groups.setdefault(stage,[]).append(node.get('id'))
 if not groups:raise ValueError(f'No reveal targets on slide {number}')
 timing=element('timing');tnlst=element('tnLst');timing.append(tnlst)
 par=element('par');tnlst.append(par);ct=element('cTn',id=1,dur='indefinite',restart='never',nodeType='tmRoot');par.append(ct)
 child=element('childTnLst');ct.append(child);seq=element('seq',concurrent=1,nextAc='seek');child.append(seq)
 main=element('cTn',id=2,dur='indefinite',nodeType='mainSeq');seq.append(main);ml=element('childTnLst');main.append(ml)
 ident=3
 for stage,targets in sorted(groups.items()):
  click=element('par');ml.append(click);ctn=element('cTn',id=ident,fill='hold');ident+=1;click.append(ctn)
  conds=element('stCondLst');conds.append(element('cond',delay='indefinite'));ctn.append(conds)
  cl=element('childTnLst');ctn.append(cl)
  for target in targets:
   effect=element('par');cl.append(effect);en=element('cTn',id=ident,fill='hold',nodeType='clickEffect' if target==targets[0] else 'withEffect');ident+=1;effect.append(en)
   st=element('stCondLst');st.append(element('cond',delay=0));en.append(st);children=element('childTnLst');en.append(children)
   setter=element('set');children.append(setter);behavior=element('cBhvr');setter.append(behavior)
   bt=element('cTn',id=ident,dur=1,fill='hold');ident+=1;behavior.append(bt)
   targetel=element('tgtEl');targetel.append(element('spTgt',spid=target));behavior.append(targetel)
   attrs=element('attrNameLst');attr=element('attrName');attr.text='style.visibility';attrs.append(attr);behavior.append(attrs)
   to=element('to');to.append(element('strVal',val='visible'));setter.append(to)
 prev=element('prevCondLst');prevcond=element('cond',evt='onPrev',delay=0);prevtarget=element('tgtEl');prevtarget.append(element('sldTgt'));prevcond.append(prevtarget);prev.append(prevcond);seq.append(prev)
 nxt=element('nextCondLst');nxtcond=element('cond',evt='onNext',delay=0);nxttarget=element('tgtEl');nxttarget.append(element('sldTgt'));nxtcond.append(nxttarget);nxt.append(nxtcond);seq.append(nxt)
 root.append(timing);entries[key]=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in entries.items():z.writestr(name,data)
print('Added standard click builds on slides 5 and 9; static PDF retains complete content.')
