import os
import re

html_path = r'c:\Users\jange\Desktop\LIGTAS\dashboard.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace nav buttons with anchor tags
nav_replacements = [
    (r'<button class="nav-item active" data-target="dashboard">', r'<a href="dashboard.html" class="nav-item" data-target="dashboard">'),
    (r'<button class="nav-item" data-target="incidents">', r'<a href="incidents.html" class="nav-item" data-target="incidents">'),
    (r'<button class="nav-item" data-target="centers">', r'<a href="centers.html" class="nav-item" data-target="centers">'),
    (r'<button class="nav-item" data-target="relief-ops">', r'<a href="relief-ops.html" class="nav-item" data-target="relief-ops">'),
    (r'<button class="nav-item" data-target="broadcast">', r'<a href="broadcast.html" class="nav-item" data-target="broadcast">'),
    (r'<button class="nav-item" data-target="profile">', r'<a href="profile.html" class="nav-item" data-target="profile">'),
    (r'</button>\s*<!-- End Nav -->', r'</a>') # Just a general replace for nav buttons, but we can do it safer:
]

content = content.replace('<button class="nav-item active" data-target="dashboard"><i class="ph ph-squares-four"></i> Dashboard</button>', '<a href="dashboard.html" class="nav-item" data-target="dashboard"><i class="ph ph-squares-four"></i> Dashboard</a>')
content = content.replace('<button class="nav-item" data-target="incidents"><i class="ph ph-warning-circle"></i> Incidents</button>', '<a href="incidents.html" class="nav-item" data-target="incidents"><i class="ph ph-warning-circle"></i> Incidents</a>')
content = content.replace('<button class="nav-item" data-target="centers"><i class="ph ph-buildings"></i> Centers</button>', '<a href="centers.html" class="nav-item" data-target="centers"><i class="ph ph-buildings"></i> Centers</a>')
content = content.replace('<button class="nav-item" data-target="relief-ops"><i class="ph ph-package"></i> Relief Ops</button>', '<a href="relief-ops.html" class="nav-item" data-target="relief-ops"><i class="ph ph-package"></i> Relief Ops</a>')
content = content.replace('<button class="nav-item" data-target="broadcast"><i class="ph ph-megaphone"></i> Broadcast</button>', '<a href="broadcast.html" class="nav-item" data-target="broadcast"><i class="ph ph-megaphone"></i> Broadcast</a>')
content = content.replace('<button class="nav-item" data-target="profile"><i class="ph ph-user-gear"></i> Admin Profile</button>', '<a href="profile.html" class="nav-item" data-target="profile"><i class="ph ph-user-gear"></i> Admin Profile</a>')

# Update admin profile onclick link
content = content.replace(r'''onclick="document.querySelector('[data-target=\'profile\']').click()"''', 'onclick="window.location.href=\'profile.html\'"')

# The sections
sections_to_extract = ['dashboard', 'incidents', 'centers', 'relief-ops', 'broadcast', 'profile']

# We need to find the content area boundary
# It starts at: <main class="content-area" id="main-scroll">
# And ends at: </main>
main_start = content.find('<main class="content-area" id="main-scroll">')
main_end = content.find('</main>', main_start)

main_content = content[main_start:main_end]

# Extract each section HTML
sections_html = {}
for sec in sections_to_extract:
    # Regex to capture the full section. We know they are <section id="XYZ" class="module-view"> ... </section>
    pattern = rf'<section id="{sec}" class="module-view.*?</section>'
    match = re.search(pattern, main_content, flags=re.DOTALL)
    if match:
        sections_html[sec] = match.group(0).replace('class="module-view"', 'class="module-view active"').replace('class="module-view active active"', 'class="module-view active"')

# We also need to change the page title in the topbar
titles = {
    'dashboard': 'Command Center',
    'incidents': 'Incident Management',
    'centers': 'Evacuation Centers',
    'relief-ops': 'Relief Operations',
    'broadcast': 'Emergency Broadcast',
    'profile': 'Admin Profile'
}

file_mapping = {
    'dashboard': 'dashboard.html',
    'incidents': 'incidents.html',
    'centers': 'centers.html',
    'relief-ops': 'relief-ops.html',
    'broadcast': 'broadcast.html',
    'profile': 'profile.html'
}

for sec in sections_to_extract:
    new_html = content[:main_start] + '<main class="content-area" id="main-scroll">\n                \n                <!-- ' + sec.capitalize() + ' Module -->\n                ' + sections_html[sec] + '\n\n            ' + content[main_end:]
    
    # Replace the page title
    new_html = new_html.replace('<h1 id="page-title">Command Center</h1>', f'<h1 id="page-title">{titles[sec]}</h1>')
    
    # Fix the active nav item
    new_html = new_html.replace('class="nav-item active"', 'class="nav-item"')
    new_html = new_html.replace(f'data-target="{sec}"', f'data-target="{sec}" class="nav-item active"')
    
    # Save the file
    out_path = os.path.join(r'c:\Users\jange\Desktop\LIGTAS', file_mapping[sec])
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(new_html)

print("Split completed.")
