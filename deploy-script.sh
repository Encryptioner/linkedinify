#!/bin/bash

# LinkedInify Deployment Script
# Automates the deployment process

echo "🚀 LinkedInify Deployment Script v1.2"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Python is available
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "Python not found. Please install Python to continue."
        exit 1
    fi
    print_status "Python found: $PYTHON_CMD"
}

# Generate icons
generate_icons() {
    print_info "Generating PWA icons..."
    
    if [ ! -d "icons" ]; then
        mkdir icons
        print_status "Created icons directory"
    fi
    
    # Check if Pillow is installed
    if $PYTHON_CMD -c "import PIL" &> /dev/null; then
        $PYTHON_CMD generate-icons.py
        print_status "Icons generated successfully"
    else
        print_warning "Pillow not installed. Installing..."
        pip install Pillow
        if [ $? -eq 0 ]; then
            $PYTHON_CMD generate-icons.py
            print_status "Icons generated successfully"
        else
            print_error "Failed to install Pillow. Please install manually: pip install Pillow"
            print_info "You can also generate icons manually or use online generators"
        fi
    fi
}

# Validate files
validate_files() {
    print_info "Validating required files..."
    
    required_files=("index.html" "manifest.json" "sw.js" "README.md" "LICENSE")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_status "All required files present"
    else
        print_error "Missing files: ${missing_files[*]}"
        exit 1
    fi
    
    # Check if icons exist
    if [ -d "icons" ] && [ "$(ls -A icons/)" ]; then
        print_status "Icons directory found with files"
    else
        print_warning "Icons directory empty or missing"
        generate_icons
    fi
}

# Start local server
start_server() {
    print_info "Starting local development server..."
    
    # Try different server options
    if command -v python3 &> /dev/null; then
        print_status "Starting Python HTTP server on http://localhost:8000"
        print_info "Press Ctrl+C to stop the server"
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        print_status "Starting Python HTTP server on http://localhost:8000"
        print_info "Press Ctrl+C to stop the server"
        python -m http.server 8000
    elif command -v node &> /dev/null; then
        if command -v npx &> /dev/null; then
            print_status "Starting Node.js HTTP server on http://localhost:8000"
            print_info "Press Ctrl+C to stop the server"
            npx http-server -p 8000
        else
            print_error "Node.js found but npx not available. Please install http-server: npm install -g http-server"
            exit 1
        fi
    elif command -v php &> /dev/null; then
        print_status "Starting PHP built-in server on http://localhost:8000"
        print_info "Press Ctrl+C to stop the server"
        php -S localhost:8000
    else
        print_error "No suitable server found. Please install Python, Node.js, or PHP"
        exit 1
    fi
}

# Production build
build_production() {
    print_info "Building for production..."
    
    # Create dist directory
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    mkdir dist
    
    # Copy files
    cp index.html dist/
    cp manifest.json dist/
    cp sw.js dist/
    cp -r icons dist/ 2>/dev/null || print_warning "Icons directory not found"
    
    # Minify HTML (if html-minifier is available)
    if command -v html-minifier &> /dev/null; then
        html-minifier --collapse-whitespace --remove-comments dist/index.html > dist/index.min.html
        mv dist/index.min.html dist/index.html
        print_status "HTML minified"
    else
        print_info "html-minifier not found. Skipping HTML minification."
    fi
    
    print_status "Production build created in dist/ directory"
    print_info "Upload the contents of dist/ to your web server"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Generate icons"
    echo "2) Validate files"
    echo "3) Start development server"
    echo "4) Build for production"
    echo "5) Deploy to GitHub Pages (requires git)"
    echo "6) Exit"
    echo ""
}

# GitHub Pages deployment
deploy_github() {
    print_info "Preparing GitHub Pages deployment..."
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git to deploy to GitHub Pages."
        return 1
    fi
    
    # Check if this is a git repository
    if [ ! -d ".git" ]; then
        print_warning "Not a git repository. Initializing..."
        git init
        git add .
        git commit -m "Initial commit - LinkedInify v1.2"
        print_info "Please add a remote origin and push to GitHub:"
        print_info "git remote add origin https://github.com/yourusername/linkedinify.git"
        print_info "git push -u origin main"
        return 0
    fi
    
    # Build production version
    build_production
    
    # Deploy to gh-pages branch
    if git show-ref --verify --quiet refs/heads/gh-pages; then
        git checkout gh-pages
    else
        git checkout -b gh-pages
    fi
    
    # Copy dist files to root
    cp -r dist/* .
    git add .
    git commit -m "Deploy LinkedInify v1.2"
    git push origin gh-pages
    
    git checkout main
    
    print_status "Deployed to GitHub Pages!"
    print_info "Your app will be available at: https://yourusername.github.io/repositoryname"
}

# Main script execution
main() {
    check_python
    
    while true; do
        show_menu
        read -p "Enter your choice [1-6]: " choice
        
        case $choice in
            1)
                generate_icons
                ;;
            2)
                validate_files
                ;;
            3)
                validate_files
                start_server
                ;;
            4)
                validate_files
                build_production
                ;;
            5)
                validate_files
                deploy_github
                ;;
            6)
                print_status "Goodbye! 👋"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-6."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main