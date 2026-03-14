import os
import re
import argparse
from pathlib import Path

def update_go_version(new_version):
    root_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Update compose.yaml files
    for compose_file in root_dir.glob("compose.y*ml"):
        with open(compose_file, "r") as f:
            content = f.read()
            
        new_content = content
        # Replace GO_VERSION=1.26-alpine (with any version)
        new_content = re.sub(r'GO_VERSION=\d+\.\d+(?:\.\d+)?-alpine', f'GO_VERSION={new_version}-alpine', new_content)
        
        if new_content != content:
            with open(compose_file, "w") as f:
                f.write(new_content)
            print(f"Updated {compose_file.relative_to(root_dir)}")
            
    # 2. Update go.mod files
    for mod_file in root_dir.rglob("go.mod"):
        if any(skip in mod_file.parts for skip in [".git", "frontend", "node_modules"]):
            continue
            
        with open(mod_file, "r") as f:
            content = f.read()
            
        # Replace go 1.21 with go {new_version}
        new_content = re.sub(r'^go \d+\.\d+(?:\.\d+)?', f'go {new_version}', content, flags=re.MULTILINE)
        
        if new_content != content:
            with open(mod_file, "w") as f:
                f.write(new_content)
            print(f"Updated {mod_file.relative_to(root_dir)}")

    # 3. Update Dockerfiles
    for docker_file in root_dir.rglob("Dockerfile"):
        if any(skip in docker_file.parts for skip in [".git", "frontend", "node_modules"]):
            continue
            
        with open(docker_file, "r") as f:
            content = f.read()
            
        # Replace golang:1.21-alpine with golang:{new_version}-alpine
        new_content = re.sub(r'golang:\d+\.\d+(?:\.\d+)?-alpine', f'golang:{new_version}-alpine', content)
        
        if new_content != content:
            with open(docker_file, "w") as f:
                f.write(new_content)
            print(f"Updated {docker_file.relative_to(root_dir)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update Go version across the project.")
    parser.add_argument("new_version", help="The new Go version (e.g., 1.26 or 1.27.0)")
    args = parser.parse_args()
    
    update_go_version(args.new_version)
