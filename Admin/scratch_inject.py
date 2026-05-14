import os

files_to_update = [
    "index.html",
    "incidents.html",
    "centers.html",
    "relief-ops.html",
    "broadcast.html",
    "profile.html",
    "settings.html",
    "audit-logs.html",
    "login.html"
]

injection_string = '  <link rel="stylesheet" href="css/modern-ui.css">\n'

for filename in files_to_update:
    filepath = os.path.join(r"d:\Downloads\LIGTAS-main\Admin", filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "css/modern-ui.css" in content:
        print(f"Already injected in: {filename}")
        continue
        
    # Find </style> and insert the link after it
    style_end_index = content.find("</style>")
    if style_end_index == -1:
        print(f"</style> not found in {filename}")
        continue
        
    insert_pos = style_end_index + len("</style>\n")
    # if there is no newline after </style>, we just insert it right after
    
    new_content = content[:insert_pos] + injection_string + content[insert_pos:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Successfully injected CSS in {filename}")
