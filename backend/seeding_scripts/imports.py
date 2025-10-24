import sys
"""
This script checks the installed versions of specified Python packages.
Should only be run in a development environment. If your device has all the packages installed and they work correctly.
"""

PACKAGES_MAP = {
    'bs4': 'beautifulsoup4',
    'requests': 'requests',
    'googlemaps': 'googlemaps',
    'supabase': 'supabase',
    'bcrypt': 'bcrypt',
    'sentence_transformers': 'sentence-transformers',
    'fastapi': 'fastapi',
    'uvicorn': 'uvicorn'
}

output_file = 'requirements.txt'
found_packages = {}
missing_packages = []

print(f"Starting package version check...")

# --- 1. Loop and check for package presence and version ---
for package_name, display_name in PACKAGES_MAP.items():
    version = None
    try:
          # Attempt to import the package
          module = __import__(package_name)
          
          # Try common attributes for version
          if hasattr(module, '__version__'):
              version = module.__version__
          elif hasattr(module, 'VERSION'):
              version = module.VERSION
          elif hasattr(module, 'version'):
              version = module.version
          else:
              version = "Version attribute not found (Package Installed)"

          # Store the successful find
          found_packages[display_name] = version

    except ImportError:
        # If any package is not found, record it and stop the main loop
        print(f"ERROR: Package '{display_name}' (import: '{package_name}') was NOT found. Stopping check.")
        missing_packages.append(display_name)

    except Exception as e:
        # Catch other errors during import/version check
        print(f"ERROR: An exception occurred checking '{display_name}' (import: '{package_name}'): {e}")
        found_packages[display_name] = f"Error checking version: {e}"


# --- 2. Conditional Output ---

if not missing_packages:
    # If all packages were found, write to requirements.txt
    print("\n✅ All required packages were found. Writing to requirements.txt...")
    
    with open(output_file, 'w') as f:
        for display_name, version in found_packages.items():
            # Standard library versions are not written to requirements.txt
            if "Standard Library" not in version:
                output_line = f"{display_name}=={version}\n"
                f.write(output_line)
                print(output_line.strip())

    print("\nProcess complete. requirements.txt successfully created.")

else:
    # If even one package was missing, output found versions to console
    print("\n⚠️ Because packages were missing, requirements.txt was NOT created.")
    print("\nFound Packages and Versions:")
    for display_name, version in found_packages.items():
        print(f"{display_name}=={version}")
    
    # Optionally list the missing ones again
    print("\nMissing Packages:")
    for name in missing_packages:
        print(f"- {name}")
    
    print("\nProcess complete.")