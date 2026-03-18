import fitz
import json
import os

pdf_path = "/Users/shayisa/Library/Mobile Documents/com~apple~CloudDocs/iCloud Downloads/Marina.pdf"
output_data = "pdf_content.json"

def analyze_pdf():
    doc = fitz.open(pdf_path)
    content = {
        "metadata": doc.metadata,
        "pages": [],
        "styles": {
            "colors": [],
            "fonts": []
        }
    }

    # Extract fonts and colors (sample first few pages for style)
    for i in range(min(5, len(doc))):
        page = doc[i]
        font_list = page.get_fonts()
        for font in font_list:
            if font[3] not in content["styles"]["fonts"]:
                content["styles"]["fonts"].append(font[3])
        
        # Color extraction is trickier, let's just get the text with color info
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    for s in l["spans"]:
                        color = s["color"]
                        # Convert integer color to hex
                        hex_color = f"#{ (color >> 16) & 0xFF:02x}{ (color >> 8) & 0xFF:02x}{ color & 0xFF:02x}"
                        if hex_color not in content["styles"]["colors"]:
                            content["styles"]["colors"].append(hex_color)

    # Extract all text
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        content["pages"].append({
            "page_num": page_num + 1,
            "text": text
        })

    with open(output_data, "w") as f:
        json.dump(content, f, indent=2)
    
    print(f"Extraction complete. Data saved to {output_data}")
    doc.close()

if __name__ == "__main__":
    analyze_pdf()
