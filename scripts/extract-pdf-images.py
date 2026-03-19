import fitz
import os

def extract_images(pdf_path, out_dir, prefix):
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    image_paths = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        
        # We can either extract the raw image or render the page.
        # Sometimes rendering the page is better to get the layout, but raw image is faster.
        # Let's render the page at 2x resolution to ensure good quality for OCR
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        
        out_path = os.path.join(out_dir, f"{prefix}_page_{page_num + 1}.png")
        pix.save(out_path)
        image_paths.append(out_path)
        print(f"Saved {out_path}")
        
    return image_paths

extract_images(r"new_sources\Физика\Контрольное Мероприятие\Физика - РК - 1 - Билеты.pdf", "temp_ocr", "rk1")
extract_images(r"new_sources\Физика\Контрольное Мероприятие\Физика - РК - 2 - Билеты.pdf", "temp_ocr", "rk2")
