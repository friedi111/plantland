import os, re

workspace = "/Users/friedrich/Desktop/plantland"

for root, dirs, files in os.walk(workspace):
    if '.git' in root: continue
    for file in files:
        if file.endswith(".html") and not file.startswith("._"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            if '<ul class="nav-links">' in content:
                content = re.sub(r'\s*<ul class="nav-links">[\s\S]*?</ul>', '', content)
                
                if 'href="../shop.html"' in content or 'action="../shop.html"' in content:
                    search_html = '''<div class="nav-search-container">
        <form action="../shop.html" method="get" class="nav-search-form">
          <input type="text" name="search" placeholder="Find plants..." class="nav-search-input" aria-label="Search plants">
          <button type="button" class="nav-search-btn" aria-label="Search">🔍</button>
        </form>
      </div>'''
                else:
                    search_html = '''<div class="nav-search-container">
        <form action="shop.html" method="get" class="nav-search-form">
          <input type="text" name="search" placeholder="Find plants..." class="nav-search-input" aria-label="Search plants">
          <button type="button" class="nav-search-btn" aria-label="Search">🔍</button>
        </form>
      </div>'''
                # Note: Changed button type to "button" to handle mobile expand logic in JS later. Wait, no. If I change it to "button" it won't submit natively unless I handle it in JS. I will keep it "submit" and just handle the click with event.preventDefault() if input is empty or hidden.
                search_html = search_html.replace('type="button"', 'type="submit"')

                content = content.replace('<div class="nav-actions">', '<div class="nav-actions">\n      ' + search_html)

            # Add arrows to product-image-main
            if '<div class="product-image-main">' in content and '<button class="gallery-nav' not in content:
                content = content.replace(
                    '<div class="product-image-main">\n        <img',
                    '<div class="product-image-main">\n        <button class="gallery-nav prev" aria-label="Previous image">←</button>\n        <img'
                )
                content = content.replace(
                    'id="main-product-image" />\n      </div>',
                    'id="main-product-image" />\n        <button class="gallery-nav next" aria-label="Next image">→</button>\n      </div>'
                )

            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
