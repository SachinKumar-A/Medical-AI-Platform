from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

base = Path(__file__).resolve().parent
input_file = base / "Last_3_Responses_For_PDF.md"
output_file = base / "Last_3_Responses.pdf"

text = input_file.read_text(encoding="utf-8").splitlines()

c = canvas.Canvas(str(output_file), pagesize=A4)
width, height = A4
left_margin = 2 * cm
top_margin = 2 * cm
bottom_margin = 2 * cm
line_height = 14

font_name = "Helvetica"
font_size = 10
c.setFont(font_name, font_size)

y = height - top_margin

for raw_line in text:
    line = raw_line.expandtabs(4)

    # simple wrapping by character count to keep content readable
    max_chars = 105
    chunks = [line[i:i + max_chars] for i in range(0, len(line), max_chars)] or [""]

    for chunk in chunks:
        if y <= bottom_margin:
            c.showPage()
            c.setFont(font_name, font_size)
            y = height - top_margin

        c.drawString(left_margin, y, chunk)
        y -= line_height

c.save()
print(f"PDF created: {output_file}")
