from pathlib import Path
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderSVG
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
out=root/'presentation/assets';out.mkdir(exist_ok=True)
qr=QrCodeWidget('https://github.com/Qingyu255/CS440-Project/tree/c8252d2bb3baeb543a011992e2a79ee2123ecfec')
x,y,w,h=qr.getBounds();drawing=Drawing(300,300,transform=[300/(w-x),0,0,300/(h-y),0,0]);drawing.add(qr)
renderSVG.drawToFile(drawing,str(out/'evidence-qr.svg'))
qr.qr.make();count=qr.qr.getModuleCount();scale=10;quiet=4
image=Image.new('RGB',((count+2*quiet)*scale,(count+2*quiet)*scale),'white');draw=ImageDraw.Draw(image)
for row in range(count):
 for col in range(count):
  if qr.qr.isDark(row,col):
   draw.rectangle(((col+quiet)*scale,(row+quiet)*scale,(col+quiet+1)*scale-1,(row+quiet+1)*scale-1),fill='black')
image.save(out/'evidence-qr.png')
