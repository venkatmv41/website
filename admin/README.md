# Secure Admin Panel - Setup & Usage Guide

## 🔐 Security Features

This admin panel includes enterprise-level security features:

- **256-bit AES Encryption**: All session data is encrypted
- **Brute Force Protection**: Account lockout after 3 failed attempts
- **Session Management**: 2-hour sessions with automatic timeout
- **CSRF Protection**: Cross-site request forgery prevention
- **Activity Logging**: All admin actions are logged
- **Secure Authentication**: SHA-256 password hashing

## 🚀 Quick Start

### 1. Access the Admin Panel

1. Navigate to `/admin/login.html`
2. Use the default credentials:
   - **Email**: `admin@ngo.org`
   - **Password**: `AdminSecure123!`

⚠️ **IMPORTANT**: Change the default password immediately after first login!

### 2. First Time Setup

1. **Login** with default credentials
2. **Change Password**: Go to Settings → Security
3. **Create Backup**: Go to Settings → Backup & Restore
4. **Test Features**: Explore all sections to ensure everything works

## 📋 Features Overview

### Dashboard
- Overview of content statistics
- Recent activity log
- Quick access to all sections

### Content Management
- **Projects**: Manage project information, status, and media
- **Pages**: Create and edit website pages
- **Focus Areas**: Manage organizational focus areas

### Media Manager
- **Drag & Drop Upload**: Images, videos, documents
- **Gallery Management**: Organize and categorize media
- **Alt Text & Captions**: Accessibility features
- **Preview & Download**: Full media management

### Security Features
- **Session Timeout**: Automatic logout after inactivity
- **Account Lockout**: Protection against brute force attacks
- **Activity Logging**: Track all admin actions
- **Backup & Restore**: Data protection

## 🛡️ Security Best Practices

### Password Security
- Use strong passwords (8+ characters, mixed case, numbers, symbols)
- Change default password immediately
- Don't share login credentials

### Session Security
- Always logout when finished
- Don't leave admin panel open on shared computers
- Sessions expire after 2 hours automatically

### Data Protection
- Create regular backups
- Export content before major changes
- Monitor activity logs for suspicious activity

## 🔧 Configuration

### Changing Admin Credentials

To change the admin email and password, edit `admin/auth.js`:

```javascript
this.adminCredentials = {
    email: 'your-new-email@domain.com',
    // Generate new password hash using SHA-256
    passwordHash: 'your-new-password-hash'
};
```

### Security Settings

Adjust security parameters in `admin/auth.js`:

```javascript
this.maxLoginAttempts = 3;        // Failed login attempts before lockout
this.lockoutDuration = 15 * 60 * 1000;  // 15 minutes lockout
this.sessionDuration = 2 * 60 * 60 * 1000;  // 2 hours session
```

## 📱 Usage Guide

### Adding New Projects

1. Go to **Projects** section
2. Click **"Add New Project"**
3. Fill in project details:
   - Title, summary, description
   - Status, focus area, location
   - Dates, budget, beneficiaries
   - Upload hero image and gallery
   - Add outcomes and partners
4. **Preview** before saving
5. Click **"Create"** to save

### Managing Media

1. Go to **Media Manager**
2. **Drag & drop** files or click upload buttons
3. Click on any media item to:
   - Edit title, description, alt text
   - Add tags for organization
   - Copy URL for use in content
   - Delete if no longer needed

### Content Editing

1. Select content type (Projects, Pages, Focus Areas)
2. Click **"Edit"** on any item
3. Use the rich text editor for formatting
4. **Preview** changes before saving
5. Save and publish when ready

## 🔍 Troubleshooting

### Login Issues
- **Account Locked**: Wait 15 minutes or clear browser storage
- **Wrong Credentials**: Check email/password carefully
- **Session Expired**: Login again (sessions last 2 hours)

### Upload Issues
- **File Too Large**: Check file size limits
- **Unsupported Format**: Use JPG, PNG, GIF for images
- **Upload Failed**: Check internet connection

### General Issues
- **Page Not Loading**: Clear browser cache
- **Features Not Working**: Check browser console for errors
- **Data Lost**: Restore from backup

## 🚨 Emergency Access

If you're locked out of the admin panel:

1. **Clear Browser Storage**:
   - Open browser developer tools (F12)
   - Go to Application/Storage tab
   - Clear localStorage and sessionStorage
   - Refresh page

2. **Reset Admin Credentials**:
   - Edit `admin/auth.js` file
   - Replace credentials with defaults
   - Access with default login

## 📞 Support

For technical support or questions:
- Check browser console for error messages
- Review activity logs in Settings
- Create backup before making changes
- Test changes in preview mode first

## 🔄 Updates & Maintenance

### Regular Maintenance
- Create weekly backups
- Review activity logs monthly
- Update passwords quarterly
- Clear old media files as needed

### Version Updates
- Always backup before updating
- Test all features after updates
- Review security logs after changes

---

**Remember**: This admin panel controls your entire website content. Always backup before making major changes and test thoroughly before publishing updates.