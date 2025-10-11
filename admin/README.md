# Admin Dashboard - Content Management System

## Overview

This is a comprehensive admin dashboard for managing content across all pages of the website. It provides an intuitive interface for editing text, uploading media files, and managing website content without needing to edit HTML files directly.

## Features

### 📊 Dashboard
- Overview of website statistics
- Recent activity tracking
- Quick access to all management tools
- System information and storage usage

### 📝 Page Editor
- Select any page from the website to edit
- Live preview of changes
- Add new text sections and image sections
- Visual content management interface

### 🖼️ Media Manager
- **Easy Upload**: Drag and drop or click to upload
- **Multiple Formats**: Support for images, videos, and documents
- **Detailed Metadata**: Add titles, descriptions, alt text, and tags
- **Search and Filter**: Find media files quickly
- **Preview and Management**: View, edit, and delete media files

### ✏️ Content Editor
- **Rich Text Editor**: Powered by Quill.js with full formatting options
- **Live Editing**: Real-time content editing with immediate preview
- **Media Integration**: Insert uploaded media directly into content
- **Cross-Page Editing**: Edit content across all website pages

### ⚙️ Settings
- **Backup & Restore**: Create and restore complete system backups
- **Import/Export**: Transfer content data between environments
- **Cache Management**: Clear cache and refresh content
- **System Information**: Monitor storage usage and system status

## How to Use

### Accessing the Admin Dashboard

1. **From any page**: Click the green "Dashboard" button (floating button on the right side)
2. **Direct access**: Navigate to `/admin/index.html`

### Uploading Media Files

1. Go to the **Media Manager** section
2. **Drag and drop** files onto the upload zone, or **click to browse**
3. Supported formats:
   - **Images**: JPG, PNG, GIF, WebP, SVG
   - **Videos**: MP4, WebM, AVI, MOV
   - **Documents**: PDF, DOC, DOCX, TXT, XLSX, PPTX

4. **Add detailed information**:
   - **Title**: Give your media a descriptive title
   - **Description**: Write detailed text about the media
   - **Alt Text**: For accessibility (especially important for images)
   - **Tags**: Add searchable tags for better organization

### Editing Page Content

1. Go to **Page Editor** or **Content Editor**
2. Select the page you want to edit from the dropdown
3. Use the rich text editor to modify content
4. **Insert media** by clicking the "Insert Media" button
5. **Save changes** when finished

### Managing Content

- **Save All Changes**: Use the main "Save All Changes" button to persist all modifications
- **Preview Site**: Click "Preview Site" to see your changes live
- **Create Backups**: Regularly backup your content from the Settings section

## Technical Details

### File Structure
```
admin/
├── index.html          # Main dashboard interface
├── admin-dashboard.css # Dashboard styling
├── admin-dashboard.js  # Dashboard functionality
└── README.md          # This documentation
```

### Storage
- All content is stored in browser localStorage
- Media files are stored as base64 data URLs
- Automatic backup creation available
- Export/import functionality for data portability

### Integration
- Seamlessly integrates with existing admin system
- Maintains compatibility with current content structure
- Adds enhanced functionality without breaking existing features

### Browser Compatibility
- Modern browsers with ES6+ support
- localStorage support required
- File API support for media uploads

## Key Features for Content Management

### Rich Text Editing
- **Headers**: H1-H6 formatting
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Colors**: Text and background color options
- **Alignment**: Left, center, right, justify
- **Lists**: Ordered and unordered lists
- **Quotes**: Blockquotes and code blocks
- **Media**: Direct image and video insertion
- **Links**: Easy link creation and management

### Media Management
- **Batch Upload**: Upload multiple files at once
- **File Organization**: Search, filter, and categorize media
- **Metadata Management**: Comprehensive file information
- **URL Generation**: Copy media URLs for use in content
- **Preview System**: View media before insertion

### Content Organization
- **Page-Based Editing**: Edit content specific to each page
- **Section Management**: Add and organize content sections
- **Live Preview**: See changes in real-time
- **Version Control**: Backup and restore capabilities

## Best Practices

1. **Regular Backups**: Create backups before major changes
2. **Descriptive Media**: Always add titles and descriptions to media files
3. **Alt Text**: Include alt text for all images for accessibility
4. **Organized Tags**: Use consistent tagging for better media organization
5. **Preview Changes**: Always preview before publishing
6. **Save Frequently**: Use the save function regularly to prevent data loss

## Troubleshooting

### Common Issues
- **Media not loading**: Check file size and format compatibility
- **Changes not saving**: Ensure localStorage is enabled
- **Slow performance**: Clear cache and refresh content

### Support
For technical support or feature requests, refer to the main website documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-11  
**Compatibility**: Modern browsers with localStorage support