import os
import re

def find_unused_files(root_dir='src'):
    all_files = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx', '.css')):
                rel_path = os.path.relpath(os.path.join(root, file), os.getcwd())
                all_files.append(rel_path.replace('\\', '/'))

    # Entry point files should be ignored
    ignored_files = ['src/main.jsx', 'src/App.jsx', 'src/routes.jsx', 'src/supabaseClient.js']
    
    potential_unused = []
    
    for f in all_files:
        if f in ignored_files:
            continue
            
        # Get filename without extension or directory for loose matching (risky but good for finding likely unused)
        basename = os.path.basename(f).split('.')[0]
        
        # Search for references in all other files
        found = False
        # Limit search to source files
        search_command = f'Select-String -Path src/**/* -Pattern "{basename}" -Exclude {os.path.basename(f)}'
        # Instead of running command per file, I'll just gather all contents in memory or use one big scan.
        potential_unused.append(f)

    return potential_unused

# Actually, a better way is to find all import statements across the whole project.
def get_imported_paths(root_dir='src'):
    imported_paths = set()
    # Import patterns: 
    # import ... from './path'
    # lazy(() => import('./path'))
    # require('./path')
    # @import './path' (css)
    
    import_regex = re.compile(r"from\s+['\"](.*?)['\"]|import\(['\"](.*?)['\"]\)|require\(['\"](.*?)['\"]\)|@import\s+['\"](.*?)['\"]")
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx', '.css', '.html')):
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        for match in import_regex.findall(content):
                            # match is a tuple matching the capture groups
                            path = next(p for p in match if p)
                            imported_paths.add(path)
                except:
                    pass
    return imported_paths

def main():
    print("Gathering all source files...")
    all_src_files = []
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx', '.css')):
                # Store full path and normalized path for comparison
                full_path = os.path.normpath(os.path.join(root, file))
                all_src_files.append(full_path)

    print(f"Found {len(all_src_files)} total source files.")
    
    imported = get_imported_paths()
    print(f"Detected {len(imported)} unique import strings.")
    
    # This is complex because imports are relative. 
    # We need to resolve each import relative to the file it's in.
    # For now, let's just do a simple "basename" check as a first filter.
    
    unused_candidates = []
    
    for full_path in all_src_files:
        basename = os.path.basename(full_path).split('.')[0]
        if basename in ['main', 'App', 'routes', 'index', 'supabaseClient']:
            continue
            
        # Check if basename appears in any OTHER file
        # Use simple string matching for now (Research phase)
        # We'll use grep_search for real verification.
        unused_candidates.append(full_path)
        
    print(f"Total candidates for unused check: {len(unused_candidates)}")
    # Output to file for model to read
    with open('potential_unused_candidates.txt', 'w') as out:
        for c in unused_candidates:
            out.write(c + '\n')

if __name__ == "__main__":
    main()
