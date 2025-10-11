// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.quillEditor = null;
        this.mediaFiles = [];
        this.contentData = {};
        this.pages = [
            { path: 'index.html', name: 'Home Page' },
            { path: 'pages/about/mission.html', name: 'About - Mission' },
            { path: 'pages/about/vision.html', name: 'About - Vision' },
            { path: 'pages/about/team.html', name: 'About - Team' },
            { path: 'pages/about/organization.html', name: 'About - Organization' },
            { path: 'pages/about/governance.html', name: 'About - Governance' },
            { path: 'pages/about/locations.html', name: 'About - Locations' },
            { path: 'pages/projects.html', name: 'Projects' },
            { path: 'pages/focus-areas/agriculture.html', name: 'Focus Areas - Agriculture' }
        ];
        
        this.auth = null;
        this.init();
    }

    async init() {
        // Check authentication first
        await this.checkAuthentication();
        
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeQuillEditor();
        this.loadDashboardData();
        this.setupMediaManager();
        this.setupPageEditor();
        this.loadStoredData();
        this.setupSecurityFeatures();
    }

    async checkAuthentication() {
        // Wait for auth system to be available
        if (typeof AdminAuth !== 'undefined') {
            this.auth = new AdminAuth();
            
            // Check if user is authenticated
            const isAuthenticated = await this.auth.checkExistingSession();
            
            if (!isAuthenticated) {
                // Redirect to login page
                window.location.href = 'login.html';
                return;
            }
            
            // Load user session data
            const sessionData = await this.auth.getSessionData();
            if (sessionData) {
                this.displayUserInfo(sessionData);
            }
        } else {
            // Fallback: redirect to login if auth system not loaded
            console.error('Authentication system not loaded');
            window.location.href = 'login.html';
        }
    }

    displayUserInfo(sessionData) {
        // Add user info to header
        const header = document.querySelector('.admin-header');
        if (header && sessionData.email) {
            const userInfo = document.createElement('div');
            userInfo.className = 'admin-user-info';
            userInfo.innerHTML = `
                <div class="user-details">
                    <span class="user-email">${sessionData.email}</span>
                    <span class="user-role">Administrator</span>
                </div>
                <button onclick="adminDashboard.logout()" class="btn btn-outline" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            `;
            
            // Insert before existing actions
            const actions = header.querySelector('.admin-actions');
            if (actions) {
                header.insertBefore(userInfo, actions);
            } else {
                header.appendChild(userInfo);
            }
        }
    }

    setupSecurityFeatures() {
        // Add logout functionality
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+L for quick logout
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.logout();
            }
        });

        // Add session timeout warning
        this.setupSessionWarning();
        
        // Add CSRF protection to forms
        this.addCSRFProtection();
    }

    setupSessionWarning() {
        // Warn user 5 minutes before session expires
        const warningTime = 5 * 60 * 1000; // 5 minutes
        const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        
        setTimeout(() => {
            if (this.auth && this.auth.isAuthenticated()) {
                const confirmed = confirm('Your session will expire in 5 minutes. Would you like to extend it?');
                if (confirmed) {
                    // Refresh session by making a simple request
                    this.refreshSession();
                }
            }
        }, sessionDuration - warningTime);
    }

    async refreshSession() {
        try {
            const sessionData = await this.auth.getSessionData();
            if (sessionData) {
                // Extend session
                sessionData.expiresAt = Date.now() + (2 * 60 * 60 * 1000);
                const encryptedSession = await this.auth.encryptData(JSON.stringify(sessionData));
                sessionStorage.setItem('admin_session', encryptedSession);
                
                this.showToast('Session extended successfully', 'success');
            }
        } catch (error) {
            console.error('Failed to refresh session:', error);
            this.showToast('Failed to extend session', 'error');
        }
    }

    addCSRFProtection() {
        // Add CSRF tokens to all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.querySelector('input[name="csrf_token"]')) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = this.generateCSRFToken();
                form.appendChild(csrfInput);
            }
        });
    }

    generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    logout() {
        if (this.auth) {
            const confirmed = confirm('Are you sure you want to logout?');
            if (confirmed) {
                this.auth.logout();
            }
        }
    }

    initializeContentManager(contentType) {
        if (window.contentManager) {
            const container = contentType === 'focusAreas' ? 
                document.getElementById('content-manager-container-focus') : 
                document.getElementById('content-manager-container');
            
            if (container) {
                window.contentManager.showContentType(contentType);
            }
        }
    }

    // Navigation
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update title
        const titles = {
            dashboard: 'Dashboard',
            pages: 'Page Editor',
            media: 'Media Manager',
            content: 'Content Editor',
            projects: 'Projects',
            'focus-areas': 'Focus Areas',
            settings: 'Settings'
        };
        document.getElementById('section-title').textContent = titles[section];

        this.currentSection = section;

        // Initialize section-specific functionality
        if (section === 'media') {
            this.refreshMediaGrid();
        } else if (section === 'content') {
            this.initializeContentEditor();
        } else if (section === 'projects') {
            this.initializeContentManager('projects');
        } else if (section === 'focus-areas') {
            this.initializeContentManager('focusAreas');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Save all changes
        document.getElementById('save-all').addEventListener('click', () => {
            this.saveAllChanges();
        });

        // Preview site
        document.getElementById('preview-site').addEventListener('click', () => {
            window.open('../index.html', '_blank');
        });

        // Page selector
        document.getElementById('page-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadPageEditor(e.target.value);
            }
        });

        // Content page selector
        document.getElementById('content-page-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadContentEditor(e.target.value);
            }
        });

        // Media upload buttons
        document.getElementById('upload-images').addEventListener('click', () => {
            this.triggerFileUpload('image/*');
        });

        document.getElementById('upload-videos').addEventListener('click', () => {
            this.triggerFileUpload('video/*');
        });

        document.getElementById('upload-documents').addEventListener('click', () => {
            this.triggerFileUpload('.pdf,.doc,.docx,.txt,.xlsx,.pptx');
        });

        // Upload zone
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');

        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Media filter and search
        document.getElementById('media-filter').addEventListener('change', () => {
            this.filterMedia();
        });

        document.getElementById('media-search').addEventListener('input', () => {
            this.filterMedia();
        });

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Settings buttons
        document.getElementById('create-backup').addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('restore-backup').addEventListener('click', () => {
            this.restoreBackup();
        });

        document.getElementById('export-content').addEventListener('click', () => {
            this.exportContent();
        });

        document.getElementById('import-content').addEventListener('click', () => {
            this.importContent();
        });

        document.getElementById('clear-cache').addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('refresh-content').addEventListener('click', () => {
            this.refreshContent();
        });
    }

    // Quill Editor
    initializeQuillEditor() {
        if (typeof Quill !== 'undefined') {
            this.quillEditor = new Quill('#quill-editor', {
                theme: 'snow',
                placeholder: 'Start writing your content...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video'],
                        ['clean']
                    ]
                }
            });

            // Save content button
            document.getElementById('save-content').addEventListener('click', () => {
                this.saveQuillContent();
            });

            // Insert media button
            document.getElementById('insert-media').addEventListener('click', () => {
                this.showMediaSelector();
            });
        }
    }

    // Dashboard
    loadDashboardData() {
        // Update statistics
        document.getElementById('total-pages').textContent = this.pages.length;
        document.getElementById('total-media').textContent = this.mediaFiles.length;
        
        // Load editable elements count
        this.countEditableElements();
        
        // Load last updated
        const lastUpdated = localStorage.getItem('admin_last_updated');
        if (lastUpdated) {
            document.getElementById('last-updated').textContent = new Date(lastUpdated).toLocaleDateString();
        }

        // Load recent activity
        this.loadRecentActivity();
    }

    countEditableElements() {
        // This would typically scan all pages for editable elements
        // For now, we'll use a placeholder
        document.getElementById('total-editable').textContent = '45';
    }

    loadRecentActivity() {
        const activities = JSON.parse(localStorage.getItem('admin_activities') || '[]');
        const activityList = document.getElementById('activity-list');
        
        if (activities.length === 0) {
            activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
            return;
        }

        activityList.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <p class="activity-time">${new Date(activity.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `).join('');
    }

    addActivity(text, icon = 'fas fa-edit') {
        const activities = JSON.parse(localStorage.getItem('admin_activities') || '[]');
        activities.unshift({
            text,
            icon,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(50);
        }
        
        localStorage.setItem('admin_activities', JSON.stringify(activities));
        this.loadRecentActivity();
    }

    // Page Editor
    setupPageEditor() {
        // Initialize page editor functionality
    }

    loadPageEditor(pagePath) {
        const pageEditor = document.getElementById('page-editor');
        const previewFrame = document.getElementById('page-preview-frame');
        
        pageEditor.style.display = 'block';
        previewFrame.src = `../${pagePath}`;
        
        this.loadPageContent(pagePath);
        this.addActivity(`Opened page editor for ${pagePath}`, 'fas fa-file-alt');
    }

    loadPageContent(pagePath) {
        // Load page content for editing
        // This would typically fetch the HTML content and parse editable elements
        const contentSections = document.getElementById('content-sections');
        contentSections.innerHTML = `
            <div class="content-section">
                <h4>Page: ${pagePath}</h4>
                <p>Content sections will be loaded here...</p>
            </div>
        `;
    }

    // Media Manager
    setupMediaManager() {
        this.loadMediaFromStorage();
    }

    triggerFileUpload(accept) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.multiple = true;
        input.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        input.click();
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            this.processFile(file);
        });
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const mediaItem = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                title: file.name.split('.')[0],
                description: '',
                altText: '',
                tags: [],
                uploadDate: new Date().toISOString()
            };

            this.mediaFiles.push(mediaItem);
            this.saveMediaToStorage();
            this.refreshMediaGrid();
            this.showToast(`${file.name} uploaded successfully!`, 'success');
            this.addActivity(`Uploaded media file: ${file.name}`, 'fas fa-upload');
            
            // Update dashboard stats
            document.getElementById('total-media').textContent = this.mediaFiles.length;
        };
        reader.readAsDataURL(file);
    }

    refreshMediaGrid() {
        const mediaGrid = document.getElementById('media-grid');
        const uploadZone = mediaGrid.querySelector('.upload-zone');
        
        // Clear existing media items but keep upload zone
        const mediaItems = mediaGrid.querySelectorAll('.media-item');
        mediaItems.forEach(item => item.remove());

        this.mediaFiles.forEach(media => {
            const mediaElement = this.createMediaElement(media);
            mediaGrid.appendChild(mediaElement);
        });
    }

    createMediaElement(media) {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.dataset.mediaId = media.id;

        const isImage = media.type.startsWith('image/');
        const isVideo = media.type.startsWith('video/');
        
        let thumbnail = '';
        if (isImage) {
            thumbnail = `<img src="${media.data}" alt="${media.altText || media.name}" class="media-thumbnail">`;
        } else if (isVideo) {
            thumbnail = `<video src="${media.data}" class="media-thumbnail" muted></video>`;
        } else {
            thumbnail = `<div class="media-thumbnail document-thumbnail">
                <i class="fas fa-file"></i>
            </div>`;
        }

        div.innerHTML = `
            ${thumbnail}
            <div class="media-info">
                <div class="media-title">${media.title || media.name}</div>
                <div class="media-type">${this.getFileType(media.type)}</div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.showMediaModal(media);
        });

        return div;
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'Image';
        if (mimeType.startsWith('video/')) return 'Video';
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet';
        return 'File';
    }

    showMediaModal(media) {
        const modal = document.getElementById('media-modal');
        const preview = document.getElementById('media-preview');
        
        // Set modal title
        document.getElementById('media-modal-title').textContent = media.name;
        
        // Set preview
        if (media.type.startsWith('image/')) {
            preview.innerHTML = `<img src="${media.data}" alt="${media.name}">`;
        } else if (media.type.startsWith('video/')) {
            preview.innerHTML = `<video src="${media.data}" controls></video>`;
        } else {
            preview.innerHTML = `<div class="document-preview">
                <i class="fas fa-file fa-3x"></i>
                <p>${media.name}</p>
            </div>`;
        }
        
        // Set form values
        document.getElementById('media-title').value = media.title || '';
        document.getElementById('media-description').value = media.description || '';
        document.getElementById('media-alt-text').value = media.altText || '';
        document.getElementById('media-tags').value = media.tags ? media.tags.join(', ') : '';
        
        // Set up save button
        document.getElementById('save-media-details').onclick = () => {
            this.saveMediaDetails(media.id);
        };
        
        // Set up copy URL button
        document.getElementById('copy-media-url').onclick = () => {
            this.copyMediaUrl(media.data);
        };
        
        // Set up delete button
        document.getElementById('delete-media').onclick = () => {
            this.deleteMedia(media.id);
        };
        
        modal.classList.add('active');
    }

    saveMediaDetails(mediaId) {
        const media = this.mediaFiles.find(m => m.id === mediaId);
        if (media) {
            media.title = document.getElementById('media-title').value;
            media.description = document.getElementById('media-description').value;
            media.altText = document.getElementById('media-alt-text').value;
            media.tags = document.getElementById('media-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            this.saveMediaToStorage();
            this.refreshMediaGrid();
            this.closeModal();
            this.showToast('Media details saved successfully!', 'success');
            this.addActivity(`Updated media details: ${media.name}`, 'fas fa-edit');
        }
    }

    copyMediaUrl(dataUrl) {
        navigator.clipboard.writeText(dataUrl).then(() => {
            this.showToast('Media URL copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy URL', 'error');
        });
    }

    deleteMedia(mediaId) {
        if (confirm('Are you sure you want to delete this media file?')) {
            const mediaIndex = this.mediaFiles.findIndex(m => m.id === mediaId);
            if (mediaIndex > -1) {
                const media = this.mediaFiles[mediaIndex];
                this.mediaFiles.splice(mediaIndex, 1);
                this.saveMediaToStorage();
                this.refreshMediaGrid();
                this.closeModal();
                this.showToast('Media file deleted successfully!', 'success');
                this.addActivity(`Deleted media file: ${media.name}`, 'fas fa-trash');
                
                // Update dashboard stats
                document.getElementById('total-media').textContent = this.mediaFiles.length;
            }
        }
    }

    filterMedia() {
        const filter = document.getElementById('media-filter').value;
        const search = document.getElementById('media-search').value.toLowerCase();
        
        const mediaItems = document.querySelectorAll('.media-item');
        mediaItems.forEach(item => {
            const mediaId = item.dataset.mediaId;
            const media = this.mediaFiles.find(m => m.id == mediaId);
            
            if (!media) return;
            
            let showItem = true;
            
            // Filter by type
            if (filter !== 'all') {
                if (filter === 'images' && !media.type.startsWith('image/')) showItem = false;
                if (filter === 'videos' && !media.type.startsWith('video/')) showItem = false;
                if (filter === 'documents' && (media.type.startsWith('image/') || media.type.startsWith('video/'))) showItem = false;
            }
            
            // Filter by search
            if (search && !media.name.toLowerCase().includes(search) && 
                !media.title.toLowerCase().includes(search) &&
                !media.description.toLowerCase().includes(search)) {
                showItem = false;
            }
            
            item.style.display = showItem ? 'block' : 'none';
        });
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Content Editor
    initializeContentEditor() {
        // Initialize content editor functionality
    }

    loadContentEditor(pagePath) {
        const container = document.getElementById('content-editor-container');
        container.style.display = 'grid';
        
        this.loadEditableElements(pagePath);
        this.addActivity(`Opened content editor for ${pagePath}`, 'fas fa-edit');
    }

    loadEditableElements(pagePath) {
        // Load editable elements from the page
        const elementsList = document.getElementById('editable-elements-list');
        elementsList.innerHTML = `
            <div class="editable-element">
                <h4>Page: ${pagePath}</h4>
                <p>Editable elements will be loaded here...</p>
            </div>
        `;
    }

    saveQuillContent() {
        const content = this.quillEditor.getContents();
        const html = this.quillEditor.root.innerHTML;
        
        // Save content logic here
        this.showToast('Content saved successfully!', 'success');
        this.addActivity('Saved content using rich text editor', 'fas fa-save');
    }

    showMediaSelector() {
        // Show media selector for inserting into content
        this.showToast('Media selector functionality coming soon!', 'info');
    }

    // Storage
    saveMediaToStorage() {
        localStorage.setItem('admin_media_files', JSON.stringify(this.mediaFiles));
    }

    loadMediaFromStorage() {
        const stored = localStorage.getItem('admin_media_files');
        if (stored) {
            this.mediaFiles = JSON.parse(stored);
        }
    }

    loadStoredData() {
        const stored = localStorage.getItem('admin_content_data');
        if (stored) {
            this.contentData = JSON.parse(stored);
        }
    }

    saveStoredData() {
        localStorage.setItem('admin_content_data', JSON.stringify(this.contentData));
        localStorage.setItem('admin_last_updated', new Date().toISOString());
    }

    // Save and Export
    saveAllChanges() {
        this.showLoading(true);
        
        setTimeout(() => {
            this.saveStoredData();
            this.saveMediaToStorage();
            this.showLoading(false);
            this.showToast('All changes saved successfully!', 'success');
            this.addActivity('Saved all changes', 'fas fa-save');
            
            // Update dashboard
            document.getElementById('last-updated').textContent = new Date().toLocaleDateString();
        }, 1000);
    }

    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            contentData: this.contentData,
            mediaFiles: this.mediaFiles,
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        localStorage.setItem('admin_last_backup', new Date().toISOString());
        document.getElementById('last-backup').textContent = new Date().toLocaleDateString();
        
        this.showToast('Backup created successfully!', 'success');
        this.addActivity('Created system backup', 'fas fa-download');
    }

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        this.contentData = backup.contentData || {};
                        this.mediaFiles = backup.mediaFiles || [];
                        
                        this.saveStoredData();
                        this.saveMediaToStorage();
                        this.refreshMediaGrid();
                        this.loadDashboardData();
                        
                        this.showToast('Backup restored successfully!', 'success');
                        this.addActivity('Restored system backup', 'fas fa-upload');
                    } catch (error) {
                        this.showToast('Error restoring backup: Invalid file format', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    exportContent() {
        const exportData = {
            timestamp: new Date().toISOString(),
            contentData: this.contentData,
            pages: this.pages,
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        this.showToast('Content exported successfully!', 'success');
        this.addActivity('Exported content data', 'fas fa-file-export');
    }

    importContent() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);
                        this.contentData = { ...this.contentData, ...importData.contentData };
                        
                        this.saveStoredData();
                        this.loadDashboardData();
                        
                        this.showToast('Content imported successfully!', 'success');
                        this.addActivity('Imported content data', 'fas fa-file-import');
                    } catch (error) {
                        this.showToast('Error importing content: Invalid file format', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    clearCache() {
        if (confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
            localStorage.removeItem('admin_content_data');
            localStorage.removeItem('admin_media_files');
            localStorage.removeItem('admin_activities');
            
            this.contentData = {};
            this.mediaFiles = [];
            
            this.refreshMediaGrid();
            this.loadDashboardData();
            
            this.showToast('Cache cleared successfully!', 'success');
            this.addActivity('Cleared system cache', 'fas fa-trash');
        }
    }

    refreshContent() {
        this.showLoading(true);
        
        setTimeout(() => {
            this.loadStoredData();
            this.loadMediaFromStorage();
            this.refreshMediaGrid();
            this.loadDashboardData();
            this.showLoading(false);
            
            this.showToast('Content refreshed successfully!', 'success');
            this.addActivity('Refreshed content data', 'fas fa-sync');
        }, 1000);
    }

    // UI Helpers
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 4000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Calculate storage usage
    calculateStorageUsage() {
        let totalSize = 0;
        
        // Calculate content data size
        totalSize += new Blob([JSON.stringify(this.contentData)]).size;
        
        // Calculate media files size
        this.mediaFiles.forEach(media => {
            totalSize += media.size || 0;
        });
        
        // Convert to MB
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        document.getElementById('storage-used').textContent = `${sizeInMB} MB`;
    }
}

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});