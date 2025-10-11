// Content Management System
class ContentManager {
    constructor() {
        this.contentTypes = {
            projects: {
                name: 'Projects',
                icon: 'fas fa-project-diagram',
                fields: [
                    { name: 'title', type: 'text', required: true, label: 'Project Title' },
                    { name: 'summary', type: 'textarea', required: true, label: 'Project Summary' },
                    { name: 'description', type: 'richtext', required: true, label: 'Full Description' },
                    { name: 'status', type: 'select', required: true, label: 'Status', options: ['Ongoing', 'Completed', 'Planned', 'On Hold'] },
                    { name: 'focusArea', type: 'select', required: true, label: 'Focus Area', options: ['Agriculture', 'Education', 'Healthcare', 'Environment', 'Community Development'] },
                    { name: 'location', type: 'text', required: true, label: 'Location' },
                    { name: 'startDate', type: 'date', required: true, label: 'Start Date' },
                    { name: 'endDate', type: 'date', required: false, label: 'End Date' },
                    { name: 'budget', type: 'number', required: false, label: 'Budget (₹)' },
                    { name: 'beneficiaries', type: 'number', required: false, label: 'Number of Beneficiaries' },
                    { name: 'heroImage', type: 'image', required: false, label: 'Hero Image' },
                    { name: 'gallery', type: 'gallery', required: false, label: 'Project Gallery' },
                    { name: 'outcomes', type: 'list', required: false, label: 'Key Outcomes' },
                    { name: 'partners', type: 'list', required: false, label: 'Project Partners' },
                    { name: 'ctaLabel', type: 'text', required: false, label: 'Call-to-Action Label' },
                    { name: 'ctaLink', type: 'url', required: false, label: 'Call-to-Action Link' }
                ]
            },
            pages: {
                name: 'Pages',
                icon: 'fas fa-file-alt',
                fields: [
                    { name: 'title', type: 'text', required: true, label: 'Page Title' },
                    { name: 'slug', type: 'text', required: true, label: 'URL Slug' },
                    { name: 'metaDescription', type: 'textarea', required: false, label: 'Meta Description' },
                    { name: 'heroTitle', type: 'text', required: false, label: 'Hero Section Title' },
                    { name: 'heroSubtitle', type: 'textarea', required: false, label: 'Hero Section Subtitle' },
                    { name: 'heroImage', type: 'image', required: false, label: 'Hero Background Image' },
                    { name: 'content', type: 'richtext', required: true, label: 'Page Content' },
                    { name: 'sidebar', type: 'richtext', required: false, label: 'Sidebar Content' },
                    { name: 'published', type: 'checkbox', required: false, label: 'Published' },
                    { name: 'featured', type: 'checkbox', required: false, label: 'Featured Page' },
                    { name: 'lastModified', type: 'datetime', required: false, label: 'Last Modified', readonly: true }
                ]
            },
            focusAreas: {
                name: 'Focus Areas',
                icon: 'fas fa-bullseye',
                fields: [
                    { name: 'name', type: 'text', required: true, label: 'Focus Area Name' },
                    { name: 'description', type: 'textarea', required: true, label: 'Description' },
                    { name: 'detailedDescription', type: 'richtext', required: true, label: 'Detailed Description' },
                    { name: 'icon', type: 'text', required: true, label: 'Icon Class (e.g., fas fa-seedling)' },
                    { name: 'color', type: 'color', required: false, label: 'Theme Color' },
                    { name: 'heroImage', type: 'image', required: false, label: 'Hero Image' },
                    { name: 'goals', type: 'list', required: false, label: 'Key Goals' },
                    { name: 'achievements', type: 'list', required: false, label: 'Key Achievements' },
                    { name: 'statistics', type: 'keyvalue', required: false, label: 'Statistics' },
                    { name: 'relatedProjects', type: 'multiselect', required: false, label: 'Related Projects', source: 'projects' },
                    { name: 'active', type: 'checkbox', required: false, label: 'Active Focus Area' }
                ]
            }
        };
        
        this.content = {
            projects: [],
            pages: [],
            focusAreas: []
        };
        
        this.init();
    }

    init() {
        this.loadContent();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Content type navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-content-type]')) {
                const contentType = e.target.dataset.contentType;
                this.showContentType(contentType);
            }
            
            if (e.target.matches('[data-action="add"]')) {
                const contentType = e.target.dataset.contentType;
                this.showAddForm(contentType);
            }
            
            if (e.target.matches('[data-action="edit"]')) {
                const contentType = e.target.dataset.contentType;
                const itemId = e.target.dataset.itemId;
                this.showEditForm(contentType, itemId);
            }
            
            if (e.target.matches('[data-action="delete"]')) {
                const contentType = e.target.dataset.contentType;
                const itemId = e.target.dataset.itemId;
                this.deleteItem(contentType, itemId);
            }
            
            if (e.target.matches('[data-action="preview"]')) {
                const contentType = e.target.dataset.contentType;
                const itemId = e.target.dataset.itemId;
                this.previewItem(contentType, itemId);
            }
        });
    }

    loadContent() {
        try {
            const stored = localStorage.getItem('cms_content');
            if (stored) {
                this.content = { ...this.content, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    saveContent() {
        try {
            localStorage.setItem('cms_content', JSON.stringify(this.content));
            localStorage.setItem('cms_last_updated', new Date().toISOString());
            this.showNotification('Content saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification('Error saving content', 'error');
        }
    }

    showContentType(contentType) {
        const config = this.contentTypes[contentType];
        if (!config) return;

        let container = document.getElementById('content-manager-container');
        if (contentType === 'focusAreas') {
            container = document.getElementById('content-manager-container-focus');
        }
        if (!container) return;

        const items = this.content[contentType] || [];
        
        container.innerHTML = `
            <div class="content-type-header">
                <div class="content-type-info">
                    <h2><i class="${config.icon}"></i> ${config.name}</h2>
                    <p>Manage ${config.name.toLowerCase()} content</p>
                </div>
                <button class="btn btn-primary" data-action="add" data-content-type="${contentType}">
                    <i class="fas fa-plus"></i> Add New ${config.name.slice(0, -1)}
                </button>
            </div>
            
            <div class="content-list">
                ${items.length === 0 ? 
                    `<div class="empty-state">
                        <i class="${config.icon}"></i>
                        <h3>No ${config.name} Yet</h3>
                        <p>Start by adding your first ${config.name.toLowerCase().slice(0, -1)}</p>
                        <button class="btn btn-primary" data-action="add" data-content-type="${contentType}">
                            <i class="fas fa-plus"></i> Add ${config.name.slice(0, -1)}
                        </button>
                    </div>` :
                    items.map(item => this.renderContentItem(contentType, item)).join('')
                }
            </div>
        `;
    }

    renderContentItem(contentType, item) {
        const config = this.contentTypes[contentType];
        const title = item.title || item.name || 'Untitled';
        const status = item.status || (item.published ? 'Published' : 'Draft');
        const lastModified = item.lastModified ? new Date(item.lastModified).toLocaleDateString() : 'Never';
        
        return `
            <div class="content-item">
                <div class="content-item-info">
                    <h3>${title}</h3>
                    <div class="content-item-meta">
                        <span class="status status-${status.toLowerCase().replace(' ', '-')}">${status}</span>
                        <span class="last-modified">Modified: ${lastModified}</span>
                    </div>
                    ${item.summary || item.description ? 
                        `<p class="content-summary">${(item.summary || item.description).substring(0, 150)}...</p>` : 
                        ''
                    }
                </div>
                <div class="content-item-actions">
                    <button class="btn btn-outline" data-action="preview" data-content-type="${contentType}" data-item-id="${item.id}" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary" data-action="edit" data-content-type="${contentType}" data-item-id="${item.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" data-action="delete" data-content-type="${contentType}" data-item-id="${item.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    showAddForm(contentType) {
        const config = this.contentTypes[contentType];
        if (!config) return;

        const modal = this.createFormModal(contentType, null, 'Add New ' + config.name.slice(0, -1));
        document.body.appendChild(modal);
    }

    showEditForm(contentType, itemId) {
        const config = this.contentTypes[contentType];
        const items = this.content[contentType] || [];
        const item = items.find(i => i.id === itemId);
        
        if (!config || !item) return;

        const modal = this.createFormModal(contentType, item, 'Edit ' + config.name.slice(0, -1));
        document.body.appendChild(modal);
    }

    createFormModal(contentType, item, title) {
        const config = this.contentTypes[contentType];
        const isEdit = !!item;
        
        const modal = document.createElement('div');
        modal.className = 'content-modal active';
        
        modal.innerHTML = `
            <div class="content-modal-content">
                <div class="content-modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.content-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="content-modal-body">
                    <form id="content-form" class="content-form">
                        ${config.fields.map(field => this.renderFormField(field, item)).join('')}
                    </form>
                </div>
                <div class="content-modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.content-modal').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="contentManager.saveItem('${contentType}', ${isEdit ? `'${item.id}'` : 'null'})">
                        ${isEdit ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    renderFormField(field, item) {
        const value = item ? (item[field.name] || '') : '';
        const required = field.required ? 'required' : '';
        const readonly = field.readonly ? 'readonly' : '';
        
        switch (field.type) {
            case 'text':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <input type="text" id="${field.name}" name="${field.name}" value="${value}" ${required} ${readonly} class="form-control">
                    </div>
                `;
                
            case 'textarea':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <textarea id="${field.name}" name="${field.name}" ${required} ${readonly} class="form-control" rows="4">${value}</textarea>
                    </div>
                `;
                
            case 'richtext':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <div id="${field.name}" class="richtext-editor">${value}</div>
                        <input type="hidden" name="${field.name}" value="${value}">
                    </div>
                `;
                
            case 'select':
                const options = field.options.map(opt => 
                    `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <select id="${field.name}" name="${field.name}" ${required} class="form-control">
                            <option value="">Select ${field.label}</option>
                            ${options}
                        </select>
                    </div>
                `;
                
            case 'checkbox':
                return `
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="${field.name}" name="${field.name}" ${value ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            ${field.label}
                        </label>
                    </div>
                `;
                
            case 'date':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <input type="date" id="${field.name}" name="${field.name}" value="${value}" ${required} class="form-control">
                    </div>
                `;
                
            case 'number':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <input type="number" id="${field.name}" name="${field.name}" value="${value}" ${required} class="form-control">
                    </div>
                `;
                
            case 'url':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <input type="url" id="${field.name}" name="${field.name}" value="${value}" ${required} class="form-control">
                    </div>
                `;
                
            case 'color':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <input type="color" id="${field.name}" name="${field.name}" value="${value || '#3b82f6'}" ${required} class="form-control color-input">
                    </div>
                `;
                
            case 'image':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <div class="image-upload">
                            <input type="file" id="${field.name}" name="${field.name}" accept="image/*" class="file-input">
                            <div class="image-preview" ${value ? `style="background-image: url(${value})"` : ''}>
                                ${value ? '' : '<i class="fas fa-image"></i><span>Click to upload image</span>'}
                            </div>
                        </div>
                        <input type="hidden" name="${field.name}_url" value="${value}">
                    </div>
                `;
                
            case 'list':
                const listItems = Array.isArray(value) ? value : (value ? value.split('\n') : []);
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <div class="list-editor" data-field="${field.name}">
                            <div class="list-items">
                                ${listItems.map((item, index) => `
                                    <div class="list-item">
                                        <input type="text" value="${item}" class="form-control">
                                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-outline btn-sm" onclick="contentManager.addListItem(this)">
                                <i class="fas fa-plus"></i> Add Item
                            </button>
                        </div>
                        <input type="hidden" name="${field.name}" value="${JSON.stringify(listItems)}">
                    </div>
                `;
                
            default:
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
                        <input type="text" id="${field.name}" name="${field.name}" value="${value}" ${required} class="form-control">
                    </div>
                `;
        }
    }

    addListItem(button) {
        const listItems = button.previousElementSibling;
        const newItem = document.createElement('div');
        newItem.className = 'list-item';
        newItem.innerHTML = `
            <input type="text" value="" class="form-control">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        listItems.appendChild(newItem);
    }

    saveItem(contentType, itemId) {
        const form = document.getElementById('content-form');
        const formData = new FormData(form);
        const data = {};
        
        // Process form data
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('_url')) continue; // Skip URL fields for images
            data[key] = value;
        }
        
        // Process list fields
        const listEditors = form.querySelectorAll('.list-editor');
        listEditors.forEach(editor => {
            const fieldName = editor.dataset.field;
            const items = Array.from(editor.querySelectorAll('.list-item input')).map(input => input.value).filter(v => v.trim());
            data[fieldName] = items;
        });
        
        // Process checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });
        
        // Set metadata
        if (!itemId) {
            data.id = this.generateId();
            data.createdAt = new Date().toISOString();
        }
        data.lastModified = new Date().toISOString();
        
        // Save to content array
        if (!this.content[contentType]) {
            this.content[contentType] = [];
        }
        
        if (itemId) {
            // Update existing item
            const index = this.content[contentType].findIndex(item => item.id === itemId);
            if (index !== -1) {
                this.content[contentType][index] = { ...this.content[contentType][index], ...data };
            }
        } else {
            // Add new item
            this.content[contentType].push(data);
        }
        
        this.saveContent();
        
        // Close modal and refresh view
        document.querySelector('.content-modal').remove();
        this.showContentType(contentType);
    }

    deleteItem(contentType, itemId) {
        const config = this.contentTypes[contentType];
        const items = this.content[contentType] || [];
        const item = items.find(i => i.id === itemId);
        
        if (!item) return;
        
        const confirmed = confirm(`Are you sure you want to delete "${item.title || item.name || 'this item'}"? This action cannot be undone.`);
        
        if (confirmed) {
            this.content[contentType] = items.filter(i => i.id !== itemId);
            this.saveContent();
            this.showContentType(contentType);
        }
    }

    previewItem(contentType, itemId) {
        const items = this.content[contentType] || [];
        const item = items.find(i => i.id === itemId);
        
        if (!item) return;
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'content-modal active preview-modal';
        
        modal.innerHTML = `
            <div class="content-modal-content large">
                <div class="content-modal-header">
                    <h3>Preview: ${item.title || item.name || 'Untitled'}</h3>
                    <button class="modal-close" onclick="this.closest('.content-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="content-modal-body">
                    <div class="preview-content">
                        ${this.renderPreview(contentType, item)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    renderPreview(contentType, item) {
        switch (contentType) {
            case 'projects':
                return `
                    <div class="project-preview">
                        ${item.heroImage ? `<img src="${item.heroImage}" alt="${item.title}" class="preview-hero">` : ''}
                        <h1>${item.title}</h1>
                        <div class="project-meta">
                            <span class="status">${item.status}</span>
                            <span class="focus-area">${item.focusArea}</span>
                            <span class="location">${item.location}</span>
                        </div>
                        <div class="project-summary">${item.summary}</div>
                        <div class="project-description">${item.description}</div>
                        ${item.outcomes && item.outcomes.length ? `
                            <h3>Key Outcomes</h3>
                            <ul>${item.outcomes.map(outcome => `<li>${outcome}</li>`).join('')}</ul>
                        ` : ''}
                    </div>
                `;
                
            case 'pages':
                return `
                    <div class="page-preview">
                        ${item.heroImage ? `<div class="hero" style="background-image: url(${item.heroImage})">` : '<div class="hero">'}
                            <h1>${item.heroTitle || item.title}</h1>
                            ${item.heroSubtitle ? `<p>${item.heroSubtitle}</p>` : ''}
                        </div>
                        <div class="page-content">${item.content}</div>
                    </div>
                `;
                
            case 'focusAreas':
                return `
                    <div class="focus-area-preview">
                        <div class="focus-header">
                            <i class="${item.icon}" style="color: ${item.color || '#3b82f6'}"></i>
                            <h1>${item.name}</h1>
                        </div>
                        <div class="focus-description">${item.description}</div>
                        <div class="focus-detailed">${item.detailedDescription}</div>
                        ${item.goals && item.goals.length ? `
                            <h3>Goals</h3>
                            <ul>${item.goals.map(goal => `<li>${goal}</li>`).join('')}</ul>
                        ` : ''}
                    </div>
                `;
                
            default:
                return '<p>Preview not available for this content type.</p>';
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    exportContent() {
        const exportData = {
            timestamp: new Date().toISOString(),
            content: this.content,
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `cms-content-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showNotification('Content exported successfully!', 'success');
    }

    importContent(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                if (importData.content) {
                    this.content = { ...this.content, ...importData.content };
                    this.saveContent();
                    this.showNotification('Content imported successfully!', 'success');
                } else {
                    this.showNotification('Invalid import file format', 'error');
                }
            } catch (error) {
                this.showNotification('Error importing content: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    showNotification(message, type) {
        // Use existing toast system if available
        if (window.adminDashboard && window.adminDashboard.showToast) {
            window.adminDashboard.showToast(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize content manager
document.addEventListener('DOMContentLoaded', () => {
    window.contentManager = new ContentManager();
});