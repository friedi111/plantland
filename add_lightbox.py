import os, re

workspace = "/Users/friedrich/Desktop/plantland"

lightbox_html = """
  <!-- Lightbox Modal -->
  <div id="image-lightbox" class="lightbox">
    <div class="lightbox-content">
      <button id="close-lightbox" class="close-lightbox" aria-label="Close image">✖</button>
      <img id="lightbox-img" src="" alt="Full size image">
    </div>
  </div>
"""

for root, dirs, files in os.walk(workspace):
    if '.git' in root: continue
    for file in files:
        if file.endswith(".html") and not file.startswith("._"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Add lightbox HTML if not already present
            if 'id="image-lightbox"' not in content:
                content = content.replace('</body>', lightbox_html + '</body>')

            # Remove inline onclick from thumbnails
            content = re.sub(r' onclick="[^"]+"', '', content)

            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Lightbox added and inline JS removed from all HTML files.")
