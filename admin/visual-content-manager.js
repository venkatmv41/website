// Enhanced Content Management System with Visual Forms
class VisualContentManager {
    constructor() {
        this.mediaLibrary = [];
        this.contentTypes = {
            pages: {
                name: 'Pages',
                icon: 'fas fa-file-alt',
                description: 'Manage website pages and content',
                fields: [
                    { name: 'title', type: 'text', label: 'Page Title', required: true, placeholder: 'Enter page title' },
                    { name: 'slug', type: 'text', label: 'URL Slug', required: true, placeholder: 'page-url-slug' },
                    { name: 'metaDescription', type: 'textarea', label: 'Meta Description', placeholder: 'SEO description for search engines' },
                    { name: 'heroImage', type: 'media', label: 'Hero Image', mediaType: 'image' },
                    { name: 'heroTitle', type: 'text', label: 'Hero Title', placeholder: 'Main headline for the page' },
                    { name: 'heroSubtitle', type: 'textarea', label: 'Hero Subtitle', placeholder: 'Supporting text for the hero section' },
                    { name: 'content', type: 'richtext', label: 'Main Content', required: true },
                    { name: 'sidebar', type: 'richtext', label: 'Sidebar Content' },
                    { name: 'ctaButton', type: 'cta', label: 'Call-to-Action Button' },
                    { name: 'published', type: 'checkbox', label: 'Published' },
                    { name: 'featured', type: 'checkbox', label: 'Featured Page' }
                ]
            },
            projects: {
                name: 'Projects',
                icon: 'fas fa-project-diagram',
                description: 'Manage project information and showcase',
                fields: [
                    { name: 'title', type: 'text', label: 'Project Title', required: true, placeholder: 'Enter project name' },
                    { name: 'summary', type: 'textarea', label: 'Project Summary', required: true, placeholder: 'Brief description of the project' },
                    { name: 'description', type: 'richtext', label: 'Full Description', required: true },
                    { name: 'status', type: 'select', label: 'Project Status', required: true, options: ['Ongoing', 'Completed', 'Planned', 'On Hold'] },
                    { name: 'focusArea', type: 'select', label: 'Focus Area', required: true, options: ['Agriculture & Food Security', 'Water & WASH', 'Watershed & NRM', 'Climate & Renewable Energy', 'Livelihoods & Skills'] },
                    { name: 'location', type: 'location', label: 'Project Location', required: true },
                    { name: 'startDate', type: 'date', label: 'Start Date', required: true },
                    { name: 'endDate', type: 'date', label: 'End Date' },
                    { name: 'budget', type: 'currency', label: 'Project Budget' },
                    { name: 'beneficiaries', type: 'number', label: 'Number of Beneficiaries' },
                    { name: 'heroImage', type: 'media', label: 'Hero Image', mediaType: 'image' },
                    { name: 'gallery', type: 'gallery', label: 'Project Gallery' },
                    { name: 'outcomes', type: 'list', label: 'Key Outcomes & Results' },
                    { name: 'partners', type: 'list', label: 'Project Partners' },
                    { name: 'ctaButton', type: 'cta', label: 'Call-to-Action Button' }
                ]
            },
            focusAreas: {
                name: 'Focus Areas',
                icon: 'fas fa-bullseye',
                description: 'Manage focus areas and strategic priorities',
                fields: [
                    { name: 'name', type: 'text', label: 'Focus Area Name', required: true, placeholder: 'e.g., Agriculture & Food Security' },
                    { name: 'description', type: 'textarea', label: 'Short Description', required: true, placeholder: 'Brief overview of this focus area' },
                    { name: 'detailedDescription', type: 'richtext', label: 'Detailed Description', required: true },
                    { name: 'icon', type: 'icon', label: 'Icon', required: true, placeholder: 'fas fa-seedling' },
                    { name: 'color', type: 'color', label: 'Theme Color', default: '#2E7D32' },
                    { name: 'heroImage', type: 'media', label: 'Hero Image', mediaType: 'image' },
                    { name: 'goals', type: 'list', label: 'Key Goals & Objectives' },
                    { name: 'achievements', type: 'list', label: 'Major Achievements' },
                    { name: 'statistics', type: 'statistics', label: 'Key Statistics' },
                    { name: 'relatedProjects', type: 'multiselect', label: 'Related Projects', source: 'projects' },
                    { name: 'active', type: 'checkbox', label: 'Active Focus Area', default: true }
                ]
            }
        };
        
        this.content = {
            pages: [],
            projects: [],
            focusAreas: []
        };
        
        this.currentItem = null;
        this.currentType = null;
        
        this.init();
    }

    init() {
        this.loadContent();
        this.loadMediaLibrary();
        this.setupEventListeners();
        this.initializeRichTextEditor();
    }

    setupEventListeners() {
        // Content type navigation
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const contentType = target.dataset.contentType;
            const itemId = target.dataset.itemId;

            switch (action) {
                case 'show-content-type':
                    this.showContentType(contentType);
                    break;
                case 'add-item':
                    this.showAddForm(contentType);
                    break;
                case 'edit-item':
                    this.showEditForm(contentType, itemId);
                    break;
                case 'delete-item':
                    this.deleteItem(contentType, itemId);
                    break;
                case 'preview-item':
                    this.previewItem(contentType, itemId);
                    break;
                case 'save-form':
                    this.saveCurrentForm();
                    break;
                case 'cancel-form':
                    this.cancelForm();
                    break;
                case 'add-list-item':
                    this.addListItem(target);
                    break;
                case 'remove-list-item':
                    this.removeListItem(target);
                    break;
                case 'select-media':
                    this.openMediaSelector(target);
                    break;
                case 'upload-media':
                    this.uploadMedia(target);
                    break;
            }
        });

        // Form input handlers
        document.addEventListener('input', (e) => {
            if (e.target.matches('.auto-slug')) {
                this.generateSlug(e.target);
            }
            
            if (e.target.matches('.form-field')) {
                this.validateField(e.target);
            }
        });

        // Drag and drop for galleries
        document.addEventListener('dragover', (e) => {
            if (e.target.matches('.gallery-dropzone')) {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.matches('.gallery-dropzone')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                this.handleGalleryDrop(e);
            }
        });
    }

    showContentType(contentType) {
        const container = this.getContentContainer();
        const config = this.contentTypes[contentType];
        const items = this.content[contentType] || [];

        container.innerHTML = this.renderContentTypeView(contentType, config, items);
        this.currentType = contentType;
    }

    renderContentTypeView(contentType, config, items) {
        return `
            <div class="content-manager">
                <div class="content-header">
                    <div class="content-header-info">
                        <h1><i class="${config.icon}"></i> ${config.name}</h1>
                        <p class="content-description">${config.description}</p>
                        <div class="content-stats">
                            <span class="stat-item">
                                <i class="fas fa-file"></i>
                                ${items.length} ${items.length === 1 ? 'item' : 'items'}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-calendar"></i>
                                Last updated: ${this.getLastUpdateTime(contentType)}
                            </span>
                        </div>
                    </div>
                    <div class="content-actions">
                        <button class="btn btn-primary" data-action="add-item" data-content-type="${contentType}">
                            <i class="fas fa-plus"></i>
                            Add New ${config.name.slice(0, -1)}
                        </button>
                    </div>
                </div>

                <div class="content-body">
                    ${items.length === 0 ? this.renderEmptyState(contentType, config) : this.renderContentList(contentType, items)}
                </div>
            </div>
        `;
    }

    renderEmptyState(contentType, config) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="${config.icon}"></i>
                </div>
                <h3>No ${config.name} Yet</h3>
                <p>Get started by creating your first ${config.name.toLowerCase().slice(0, -1)}</p>
                <button class="btn btn-primary btn-large" data-action="add-item" data-content-type="${contentType}">
                    <i class="fas fa-plus"></i>
                    Create ${config.name.slice(0, -1)}
                </button>
            </div>
        `;
    }

    renderContentList(contentType, items) {
        return `
            <div class="content-grid">
                ${items.map(item => this.renderContentCard(contentType, item)).join('')}
            </div>
        `;
    }

    renderContentCard(contentType, item) {
        const config = this.contentTypes[contentType];
        const title = item.title || item.name || 'Untitled';
        const summary = item.summary || item.description || '';
        const status = this.getItemStatus(item);
        const lastModified = item.lastModified ? new Date(item.lastModified).toLocaleDateString() : 'Never';
        
        return `
            <div class="content-card" data-item-id="${item.id}">
                ${item.heroImage ? `
                    <div class="content-card-image">
                        <img src="${item.heroImage}" alt="${title}">
                        <div class="content-card-overlay">
                            <button class="btn btn-outline btn-sm" data-action="preview-item" data-content-type="${contentType}" data-item-id="${item.id}">
                                <i class="fas fa-eye"></i>
                                Preview
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="content-card-placeholder">
                        <i class="${config.icon}"></i>
                    </div>
                `}
                
                <div class="content-card-body">
                    <div class="content-card-header">
                        <h3 class="content-card-title">${title}</h3>
                        <span class="content-status status-${status.class}">${status.label}</span>
                    </div>
                    
                    ${summary ? `<p class="content-card-summary">${this.truncateText(summary, 120)}</p>` : ''}
                    
                    <div class="content-card-meta">
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${lastModified}
                        </span>
                        ${item.location ? `
                            <span class="meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                ${item.location}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="content-card-actions">
                    <button class="btn btn-outline btn-sm" data-action="edit-item" data-content-type="${contentType}" data-item-id="${item.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" data-action="preview-item" data-content-type="${contentType}" data-item-id="${item.id}" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" data-action="delete-item" data-content-type="${contentType}" data-item-id="${item.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    showAddForm(contentType) {
        const config = this.contentTypes[contentType];
        const container = this.getContentContainer();
        
        this.currentItem = null;
        this.currentType = contentType;
        
        container.innerHTML = this.renderForm(config, null, 'Add New ' + config.name.slice(0, -1));
        this.initializeFormElements();
    }

    showEditForm(contentType, itemId) {
        const config = this.contentTypes[contentType];
        const item = this.content[contentType]?.find(i => i.id === itemId);
        
        if (!item) {
            this.showToast('Item not found', 'error');
            return;
        }
        
        const container = this.getContentContainer();
        
        this.currentItem = item;
        this.currentType = contentType;
        
        container.innerHTML = this.renderForm(config, item, 'Edit ' + config.name.slice(0, -1));
        this.initializeFormElements();
    }

    renderForm(config, item, title) {
        const isEdit = !!item;
        
        return `
            <div class="content-form-container">
                <div class="form-header">
                    <div class="form-header-info">
                        <h1><i class="${config.icon}"></i> ${title}</h1>
                        <p>Fill in the details below. Fields marked with * are required.</p>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" data-action="cancel-form">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                        <button class="btn btn-primary" data-action="save-form">
                            <i class="fas fa-save"></i>
                            ${isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>

                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-main">
                            ${config.fields.map(field => this.renderFormField(field, item)).join('')}
                        </div>
                        
                        <div class="form-sidebar">
                            <div class="form-sidebar-section">
                                <h3><i class="fas fa-info-circle"></i> Publishing</h3>
                                <div class="publishing-controls">
                                    <label class="checkbox-field">
                                        <input type="checkbox" name="published" ${item?.published ? 'checked' : ''}>
                                        <span class="checkmark"></span>
                                        <span class="label">Published</span>
                                    </label>
                                    <label class="checkbox-field">
                                        <input type="checkbox" name="featured" ${item?.featured ? 'checked' : ''}>
                                        <span class="checkmark"></span>
                                        <span class="label">Featured</span>
                                    </label>
                                </div>
                                
                                ${isEdit ? `
                                    <div class="meta-info">
                                        <div class="meta-item">
                                            <label>Created:</label>
                                            <span>${new Date(item.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div class="meta-item">
                                            <label>Last Modified:</label>
                                            <span>${new Date(item.lastModified).toLocaleString()}</span>
                                        </div>
                                        <div class="meta-item">
                                            <label>ID:</label>
                                            <span>${item.id}</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="form-sidebar-section">
                                <h3><i class="fas fa-eye"></i> Preview</h3>
                                <button class="btn btn-outline btn-block" onclick="this.previewCurrentForm()">
                                    <i class="fas fa-eye"></i>
                                    Preview Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFormField(field, item) {
        const value = item?.[field.name] || field.default || '';
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder || '';
        
        switch (field.type) {
            case 'text':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <input 
                            type="text" 
                            id="${field.name}" 
                            name="${field.name}" 
                            value="${value}" 
                            placeholder="${placeholder}"
                            class="form-control ${field.name === 'title' ? 'auto-slug' : ''}" 
                            ${required}
                        >
                    </div>
                `;
                
            case 'textarea':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <textarea 
                            id="${field.name}" 
                            name="${field.name}" 
                            placeholder="${placeholder}"
                            class="form-control" 
                            rows="4"
                            ${required}
                        >${value}</textarea>
                        <div class="field-help">Character count: <span class="char-count">0</span></div>
                    </div>
                `;
                
            case 'richtext':
                return `
                    <div class="form-field richtext-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="richtext-container">
                            <div id="${field.name}_editor" class="richtext-editor"></div>
                            <input type="hidden" name="${field.name}" value="${value}">
                        </div>
                    </div>
                `;
                
            case 'select':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <select id="${field.name}" name="${field.name}" class="form-control" ${required}>
                            <option value="">Select ${field.label}</option>
                            ${field.options.map(option => 
                                `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                
            case 'date':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <input 
                            type="date" 
                            id="${field.name}" 
                            name="${field.name}" 
                            value="${value}" 
                            class="form-control" 
                            ${required}
                        >
                    </div>
                `;
                
            case 'number':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <input 
                            type="number" 
                            id="${field.name}" 
                            name="${field.name}" 
                            value="${value}" 
                            placeholder="${placeholder}"
                            class="form-control" 
                            ${required}
                        >
                    </div>
                `;
                
            case 'currency':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">₹</span>
                            <input 
                                type="number" 
                                id="${field.name}" 
                                name="${field.name}" 
                                value="${value}" 
                                placeholder="0.00"
                                class="form-control" 
                                step="0.01"
                                ${required}
                            >
                        </div>
                    </div>
                `;
                
            case 'color':
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="color-input-group">
                            <input 
                                type="color" 
                                id="${field.name}" 
                                name="${field.name}" 
                                value="${value || '#2E7D32'}" 
                                class="color-input"
                                ${required}
                            >
                            <input 
                                type="text" 
                                class="form-control color-text" 
                                value="${value || '#2E7D32'}" 
                                placeholder="#FFFFFF"
                            >
                        </div>
                    </div>
                `;
                
            case 'media':
                return `
                    <div class="form-field media-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="media-selector">
                            ${value ? `
                                <div class="media-preview">
                                    <img src="${value}" alt="Selected media">
                                    <div class="media-preview-overlay">
                                        <button type="button" class="btn btn-sm btn-danger" onclick="this.clearMedia('${field.name}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <div class="media-placeholder">
                                    <i class="fas fa-image"></i>
                                    <p>No ${field.mediaType || 'media'} selected</p>
                                </div>
                            `}
                            <div class="media-actions">
                                <button type="button" class="btn btn-outline" data-action="select-media" data-field="${field.name}" data-media-type="${field.mediaType || 'all'}">
                                    <i class="fas fa-images"></i>
                                    Choose ${field.mediaType || 'Media'}
                                </button>
                                <button type="button" class="btn btn-primary" data-action="upload-media" data-field="${field.name}" data-media-type="${field.mediaType || 'all'}">
                                    <i class="fas fa-upload"></i>
                                    Upload New
                                </button>
                            </div>
                        </div>
                        <input type="hidden" name="${field.name}" value="${value}">
                    </div>
                `;
                
            case 'gallery':
                const galleryItems = Array.isArray(value) ? value : [];
                return `
                    <div class="form-field gallery-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="gallery-manager">
                            <div class="gallery-grid" id="${field.name}_gallery">
                                ${galleryItems.map((item, index) => `
                                    <div class="gallery-item" data-index="${index}">
                                        <img src="${item.url}" alt="${item.alt}">
                                        <div class="gallery-item-controls">
                                            <button type="button" class="btn btn-sm btn-outline" onclick="this.editGalleryItem('${field.name}', ${index})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-danger" onclick="this.removeGalleryItem('${field.name}', ${index})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <div class="gallery-item-info">
                                            <input type="text" placeholder="Alt text" value="${item.alt}" class="alt-text">
                                            <input type="text" placeholder="Caption" value="${item.caption || ''}" class="caption">
                                        </div>
                                    </div>
                                `).join('')}
                                <div class="gallery-add-item gallery-dropzone" data-field="${field.name}">
                                    <i class="fas fa-plus"></i>
                                    <p>Add Images</p>
                                    <small>Drag & drop or click to upload</small>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" name="${field.name}" value="${JSON.stringify(galleryItems)}">
                    </div>
                `;
                
            case 'list':
                const listItems = Array.isArray(value) ? value : (value ? value.split('\n') : []);
                return `
                    <div class="form-field list-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="list-manager" data-field="${field.name}">
                            <div class="list-items" id="${field.name}_list">
                                ${listItems.map((item, index) => `
                                    <div class="list-item">
                                        <div class="list-item-handle">
                                            <i class="fas fa-grip-vertical"></i>
                                        </div>
                                        <input type="text" value="${item}" class="form-control list-item-input" placeholder="Enter item">
                                        <button type="button" class="btn btn-sm btn-danger" data-action="remove-list-item">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-outline btn-sm" data-action="add-list-item" data-field="${field.name}">
                                <i class="fas fa-plus"></i>
                                Add Item
                            </button>
                        </div>
                        <input type="hidden" name="${field.name}" value="${JSON.stringify(listItems)}">
                    </div>
                `;
                
            case 'cta':
                const ctaValue = typeof value === 'object' ? value : { label: '', url: '' };
                return `
                    <div class="form-field cta-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="cta-inputs">
                            <div class="form-field">
                                <label>Button Text</label>
                                <input 
                                    type="text" 
                                    name="${field.name}_label" 
                                    value="${ctaValue.label}" 
                                    placeholder="e.g., Learn More"
                                    class="form-control"
                                >
                            </div>
                            <div class="form-field">
                                <label>Button Link</label>
                                <input 
                                    type="url" 
                                    name="${field.name}_url" 
                                    value="${ctaValue.url}" 
                                    placeholder="https://example.com"
                                    class="form-control"
                                >
                            </div>
                        </div>
                        <input type="hidden" name="${field.name}" value="${JSON.stringify(ctaValue)}">
                    </div>
                `;
                
            case 'icon':
                return `
                    <div class="form-field icon-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="icon-selector">
                            <div class="icon-preview">
                                <i class="${value || 'fas fa-question'}" id="${field.name}_preview"></i>
                            </div>
                            <input 
                                type="text" 
                                id="${field.name}" 
                                name="${field.name}" 
                                value="${value}" 
                                placeholder="${placeholder}"
                                class="form-control icon-input"
                                ${required}
                            >
                            <button type="button" class="btn btn-outline" onclick="this.openIconPicker('${field.name}')">
                                <i class="fas fa-search"></i>
                                Browse Icons
                            </button>
                        </div>
                    </div>
                `;
                
            case 'location':
                return `
                    <div class="form-field location-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="location-inputs">
                            <input 
                                type="text" 
                                id="${field.name}" 
                                name="${field.name}" 
                                value="${value}" 
                                placeholder="Enter location (e.g., Mumbai, Maharashtra)"
                                class="form-control location-search"
                                ${required}
                            >
                            <button type="button" class="btn btn-outline" onclick="this.getCurrentLocation('${field.name}')">
                                <i class="fas fa-map-marker-alt"></i>
                                Current Location
                            </button>
                        </div>
                        <div class="location-suggestions" id="${field.name}_suggestions"></div>
                    </div>
                `;
                
            case 'statistics':
                const statsValue = typeof value === 'object' ? value : {};
                return `
                    <div class="form-field statistics-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <div class="statistics-manager" data-field="${field.name}">
                            <div class="statistics-list" id="${field.name}_stats">
                                ${Object.entries(statsValue).map(([key, stat]) => `
                                    <div class="statistic-item">
                                        <div class="stat-inputs">
                                            <input type="text" placeholder="Statistic Label" value="${key}" class="form-control stat-label">
                                            <input type="text" placeholder="Value" value="${stat.value}" class="form-control stat-value">
                                            <input type="text" placeholder="Unit" value="${stat.unit || ''}" class="form-control stat-unit">
                                        </div>
                                        <button type="button" class="btn btn-sm btn-danger" onclick="this.removeStatistic(this)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-outline btn-sm" onclick="this.addStatistic('${field.name}')">
                                <i class="fas fa-plus"></i>
                                Add Statistic
                            </button>
                        </div>
                        <input type="hidden" name="${field.name}" value="${JSON.stringify(statsValue)}">
                    </div>
                `;
                
            default:
                return `
                    <div class="form-field">
                        <label for="${field.name}">
                            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                        </label>
                        <input 
                            type="text" 
                            id="${field.name}" 
                            name="${field.name}" 
                            value="${value}" 
                            placeholder="${placeholder}"
                            class="form-control" 
                            ${required}
                        >
                    </div>
                `;
        }
    }

    // Helper methods
    getContentContainer() {
        return document.getElementById('content-manager-container') || 
               document.getElementById('content-manager-container-focus') || 
               document.querySelector('#projects-section') ||
               document.querySelector('#focus-areas-section');
    }

    getItemStatus(item) {
        if (item.status) {
            const status = item.status.toLowerCase();
            switch (status) {
                case 'published':
                case 'completed':
                case 'ongoing':
                    return { label: item.status, class: 'active' };
                case 'draft':
                case 'planned':
                    return { label: item.status, class: 'pending' };
                case 'on hold':
                    return { label: item.status, class: 'warning' };
                default:
                    return { label: item.status, class: 'default' };
            }
        }
        
        if (item.published) {
            return { label: 'Published', class: 'active' };
        }
        
        return { label: 'Draft', class: 'pending' };
    }

    getLastUpdateTime(contentType) {
        const items = this.content[contentType] || [];
        if (items.length === 0) return 'Never';
        
        const lastUpdate = Math.max(...items.map(item => 
            new Date(item.lastModified || item.createdAt || 0).getTime()
        ));
        
        return new Date(lastUpdate).toLocaleDateString();
    }

    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'info') {
        // Implementation depends on the toast system
        if (window.adminDashboard && window.adminDashboard.showToast) {
            window.adminDashboard.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Additional methods would be implemented here...
    initializeFormElements() {
        // Initialize rich text editors, date pickers, etc.
    }

    initializeRichTextEditor() {
        // Initialize Quill or similar rich text editor
    }

    loadContent() {
        // Load content from localStorage or API
    }

    loadMediaLibrary() {
        // Load media library
    }

    saveCurrentForm() {
        // Save form data
    }

    cancelForm() {
        // Cancel form and return to list
    }

    // ... more methods
}

// Initialize the enhanced content manager
document.addEventListener('DOMContentLoaded', () => {
    window.visualContentManager = new VisualContentManager();
});