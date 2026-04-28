import markdown
from xhtml2pdf import pisa

def md_to_pdf(md_file, pdf_file):
    with open(md_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    html = markdown.markdown(text, extensions=['tables'])
    
    # Simple CSS to make the PDF look like a decent document
    html_template = f"""
    <html>
    <head>
    <style>
        @page {{
            size: a4 portrait;
            @frame header_frame {{
                -pdf-frame-content: header_content;
                left: 50pt; width: 512pt; top: 50pt; height: 40pt;
            }}
            @frame content_frame {{
                left: 50pt; width: 512pt; top: 90pt; height: 632pt;
            }}
            @frame footer_frame {{
                -pdf-frame-content: footer_content;
                left: 50pt; width: 512pt; top: 772pt; height: 20pt;
            }}
        }}
        body {{ font-family: Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.4; }}
        h1 {{ color: #2c3e50; border-bottom: 1px solid #2c3e50; padding-bottom: 3px; font-size: 16pt; }}
        h2 {{ color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 2px; margin-top: 15px; font-size: 14pt; }}
        h3 {{ color: #2980b9; margin-top: 10px; font-size: 12pt; }}
        p {{ margin-bottom: 8px; text-align: justify; }}
        ul, ol {{ margin-left: 20px; }}
        li {{ margin-bottom: 4px; }}
    </style>
    </head>
    <body>
    {html}
    </body>
    </html>
    """
    
    with open(pdf_file, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(html_template, dest=result_file)
        if pisa_status.err:
            print(f"Error creating {pdf_file}")
        else:
            print(f"Successfully created {pdf_file}")

if __name__ == "__main__":
    md_to_pdf("project_onboarding_guide.md", "project_onboarding_guide.pdf")
    md_to_pdf("hackathon_submission_details_elaborated.md", "hackathon_submission_details_elaborated.pdf")
