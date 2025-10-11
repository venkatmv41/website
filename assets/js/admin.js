// Admin functionality for content editing
document.addEventListener('DOMContentLoaded', function() {
    
    // Admin state
    let isAdminMode = false;
    let contentData = {};
    let originalContent = {};

    // Admin elements
    const adminToggle = document.getElementById('adminToggle');
    const adminPanel = document.getElementById('adminPanel');
    const closeAdmin = document.getElementById('closeAdmin');

    // Initialize admin functionality
    function initializeAdmin() {
        if (adminToggle) {
            adminToggle.addEventListener('click', toggleAdminMode);
        }

        if (closeAdmin) {
            closeAdmin.addEventListener('click', closeAdminPanel);
        }

        // Load saved content
        loadContentData();
        
        // Initialize editable elements
        initializeEditableElements();
    }

    // Toggle admin mode
    function toggleAdminMode() {
        isAdminMode = !isAdminMode;
        document.body.classList.toggle('admin-mode', isAdminMode);
        adminPanel.classList.toggle('active', isAdminMode);
        
        if (isAdminMode) {
            showMessage('Edit mode enabled. Click on highlighted content to edit.', 'info');
        } else {
            showMessage('Edit mode disabled.', 'info');
        }
    }

    // Close admin panel
    function closeAdminPanel() {
        isAdminMode = false;
        document.body.classList.remove('admin-mode');
        adminPanel.classList.remove('active');
    }

    // Initialize editable elements
    function initializeEditableElements() {
        const editableElements = document.querySelectorAll('.editable, .editable-card, .editable-stat');
        
        editableElements.forEach(element => {
            const field = element.getAttribute('data-field');
            if (field) {
                // Store original content
                originalContent[field] = getElementContent(element);
                
                // Add click listener
                element.addEventListener('click', function(e) {
                    if (isAdminMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(field, element);
                    }
                });

                // Add keyboard listener for accessibility
                element.addEventListener('keydown', function(e) {
                    if (isAdminMode && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        openEditModal(field, element);
                    }
                });

                // Make focusable in admin mode
                if (isAdminMode) {
                    element.setAttribute('tabindex', '0');
                } else {
                    element.removeAttribute('tabindex');
                }
            }
        });
    }

    // Get element content based on type
    function getElementContent(element) {
        if (element.classList.contains('editable-stat')) {
            return {
                number: element.querySelector('.stat-number')?.textContent || '',
                label: element.querySelector('.stat-label')?.textContent || '',
                note: element.querySelector('.stat-note')?.textContent || ''
            };
        } else if (element.classList.contains('editable-card')) {
            return {
                title: element.querySelector('h3')?.textContent || '',
                description: element.querySelector('p')?.textContent || '',
                icon: element.querySelector('.focus-icon i')?.className || ''
            };
        } else {
            return element.textContent || element.innerHTML;
        }
    }

    // Set element content based on type
    function setElementContent(element, content) {
        if (element.classList.contains('editable-stat')) {
            const numberEl = element.querySelector('.stat-number');
            const labelEl = element.querySelector('.stat-label');
            const noteEl = element.querySelector('.stat-note');
            
            if (numberEl && content.number) numberEl.textContent = content.number;
            if (labelEl && content.label) labelEl.textContent = content.label;
            if (noteEl && content.note) noteEl.textContent = content.note;
        } else if (element.classList.contains('editable-card')) {
            const titleEl = element.querySelector('h3');
            const descEl = element.querySelector('p');
            const iconEl = element.querySelector('.focus-icon i');
            
            if (titleEl && content.title) titleEl.textContent = content.title;
            if (descEl && content.description) descEl.textContent = content.description;
            if (iconEl && content.icon) iconEl.className = content.icon;
        } else {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = content;
            } else {
                element.textContent = content;
            }
        }
    }

    // Open edit modal
    function openEditModal(field, element) {
        const modal = createEditModal(field, element);
        document.body.appendChild(modal);
        
        // Focus first input
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }

    // Create edit modal
    function createEditModal(field, element) {
        const modal = document.createElement('div');
        modal.className = 'edit-modal active';
        
        const content = getElementContent(element);
        let formFields = '';

        if (element.classList.contains('editable-stat')) {
            formFields = `
                <div class="edit-form-group">
                    <label for="stat-number">Number:</label>
                    <input type="text" id="stat-number" value="${content.number}" required>
                </div>
                <div class="edit-form-group">
                    <label for="stat-label">Label:</label>
                    <input type="text" id="stat-label" value="${content.label}" required>
                </div>
                <div class="edit-form-group">
                    <label for="stat-note">Note:</label>
                    <input type="text" id="stat-note" value="${content.note}">
                </div>
            `;
        } else if (element.classList.contains('editable-card')) {
            formFields = `
                <div class="edit-form-group">
                    <label for="card-title">Title:</label>
                    <input type="text" id="card-title" value="${content.title}" required>
                </div>
                <div class="edit-form-group">
                    <label for="card-description">Description:</label>
                    <textarea id="card-description" required>${content.description}</textarea>
                </div>
                <div class="edit-form-group">
                    <label for="card-icon">Icon Class:</label>
                    <input type="text" id="card-icon" value="${content.icon}" placeholder="e.g., fas fa-seedling">
                </div>
            `;
        } else {
            const isLongText = content.length > 100;
            formFields = `
                <div class="edit-form-group">
                    <label for="content-text">Content:</label>
                    ${isLongText ? 
                        `<textarea id="content-text" required>${content}</textarea>` :
                        `<input type="text" id="content-text" value="${content}" required>`
                    }
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="edit-modal-content">
                <h3>Edit ${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                <form id="edit-form">
                    ${formFields}
                    <div class="edit-modal-actions">
                        <button type="button" class="edit-modal-btn edit-modal-btn-secondary" onclick="closeEditModal()">Cancel</button>
                        <button type="submit" class="edit-modal-btn edit-modal-btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        // Add form submit handler
        const form = modal.querySelector('#edit-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveElementContent(field, element, modal);
        });

        // Add escape key handler
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeEditModal();
            }
        });

        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });

        return modal;
    }

    // Save element content
    function saveElementContent(field, element, modal) {
        let newContent;

        if (element.classList.contains('editable-stat')) {
            newContent = {
                number: modal.querySelector('#stat-number').value,
                label: modal.querySelector('#stat-label').value,
                note: modal.querySelector('#stat-note').value
            };
        } else if (element.classList.contains('editable-card')) {
            newContent = {
                title: modal.querySelector('#card-title').value,
                description: modal.querySelector('#card-description').value,
                icon: modal.querySelector('#card-icon').value
            };
        } else {
            newContent = modal.querySelector('#content-text').value;
        }

        // Update element
        setElementContent(element, newContent);
        
        // Store in content data
        contentData[field] = newContent;
        
        // Close modal
        closeEditModal();
        
        // Show success message
        showMessage('Content updated successfully!', 'success');
    }

    // Close edit modal
    window.closeEditModal = function() {
        const modal = document.querySelector('.edit-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    };

    // Save all content
    window.saveContent = function() {
        try {
            localStorage.setItem('ngo_website_content', JSON.stringify(contentData));
            showMessage('All changes saved successfully!', 'success');
        } catch (error) {
            showMessage('Error saving content: ' + error.message, 'error');
        }
    };

    // Load content data
    function loadContentData() {
        try {
            const saved = localStorage.getItem('ngo_website_content');
            if (saved) {
                contentData = JSON.parse(saved);
                applyContentData();
            }
        } catch (error) {
            console.error('Error loading content data:', error);
        }
    }

    // Apply loaded content data
    function applyContentData() {
        Object.keys(contentData).forEach(field => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element) {
                setElementContent(element, contentData[field]);
            }
        });
    }

    // Reset content
    window.resetContent = function() {
        if (confirm('Are you sure you want to reset all content to original values? This action cannot be undone.')) {
            contentData = {};
            localStorage.removeItem('ngo_website_content');
            
            Object.keys(originalContent).forEach(field => {
                const element = document.querySelector(`[data-field="${field}"]`);
                if (element) {
                    setElementContent(element, originalContent[field]);
                }
            });
            
            showMessage('Content reset to original values.', 'success');
        }
    };

    // Export content
    window.exportContent = function() {
        try {
            const dataStr = JSON.stringify(contentData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ngo-website-content.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            showMessage('Content exported successfully!', 'success');
        } catch (error) {
            showMessage('Error exporting content: ' + error.message, 'error');
        }
    };

    // Import content
    function importContent(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                contentData = { ...contentData, ...importedData };
                applyContentData();
                saveContent();
                showMessage('Content imported successfully!', 'success');
            } catch (error) {
                showMessage('Error importing content: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Add import functionality
    function addImportButton() {
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                importContent(e.target.files[0]);
            }
        });

        const importBtn = document.createElement('button');
        importBtn.className = 'admin-btn admin-btn-outline';
        importBtn.textContent = 'Import Data';
        importBtn.addEventListener('click', () => importInput.click());

        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            const quickActions = adminContent.querySelector('.admin-section');
            if (quickActions) {
                quickActions.appendChild(importInput);
                quickActions.appendChild(importBtn);
            }
        }
    }

    // Image upload functionality
    function initializeImageUpload() {
        const imageElements = document.querySelectorAll('img[data-editable="true"]');
        
        imageElements.forEach(img => {
            if (isAdminMode) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function() {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.addEventListener('change', function(e) {
                        if (e.target.files.length > 0) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                img.src = e.target.result;
                                showMessage('Image updated successfully!', 'success');
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                    input.click();
                });
            }
        });
    }

    // Auto-save functionality
    function initializeAutoSave() {
        let autoSaveTimeout;
        
        document.addEventListener('input', function(e) {
            if (isAdminMode && e.target.classList.contains('editable')) {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    saveContent();
                    showMessage('Auto-saved', 'info');
                }, 2000);
            }
        });
    }

    // Content validation
    function validateContent(field, content) {
        const validationRules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[1-9][\d]{0,15}$/,
            url: /^https?:\/\/.+/
        };

        if (field.includes('email') && !validationRules.email.test(content)) {
            return 'Please enter a valid email address';
        }
        
        if (field.includes('phone') && !validationRules.phone.test(content)) {
            return 'Please enter a valid phone number';
        }
        
        if (field.includes('url') && !validationRules.url.test(content)) {
            return 'Please enter a valid URL';
        }

        return null;
    }

    // Backup and restore functionality
    function createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            content: contentData,
            version: '1.0'
        };
        
        localStorage.setItem('ngo_website_backup', JSON.stringify(backup));
        showMessage('Backup created successfully!', 'success');
    }

    function restoreBackup() {
        try {
            const backup = localStorage.getItem('ngo_website_backup');
            if (backup) {
                const backupData = JSON.parse(backup);
                contentData = backupData.content;
                applyContentData();
                saveContent();
                showMessage('Backup restored successfully!', 'success');
            } else {
                showMessage('No backup found', 'error');
            }
        } catch (error) {
            showMessage('Error restoring backup: ' + error.message, 'error');
        }
    }

    // Add backup/restore buttons
    function addBackupButtons() {
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            const backupSection = document.createElement('div');
            backupSection.className = 'admin-section';
            backupSection.innerHTML = `
                <h4>Backup & Restore</h4>
                <button onclick="createBackup()" class="admin-btn">Create Backup</button>
                <button onclick="restoreBackup()" class="admin-btn admin-btn-secondary">Restore Backup</button>
            `;
            adminContent.appendChild(backupSection);
        }
    }

    // Make backup functions global
    window.createBackup = createBackup;
    window.restoreBackup = restoreBackup;

    // Initialize admin functionality
    initializeAdmin();
    addImportButton();
    addBackupButtons();
    initializeImageUpload();
    initializeAutoSave();

    // Update editable elements when admin mode changes
    document.addEventListener('adminModeChanged', function() {
        initializeEditableElements();
        initializeImageUpload();
    });

    console.log('Admin functionality initialized');
});