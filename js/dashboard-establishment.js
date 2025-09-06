// Dashboard Establishment JavaScript
let myJobs = [];
let currentBaristas = [];
let selectedJobForApplications = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRedirect();
    loadUserProfile();
    loadMyJobs();
    setMinDate();
});

async function checkAuthAndRedirect() {
    try {
        const profile = await getUserProfile();
        if (!profile || profile.profile.user_type !== 'establishment') {
            window.location.href = 'index.html';
            return;
        }
        currentUser = profile.profile;
        updateUserGreeting();
        updateStats();
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = 'index.html';
    }
}

function updateUserGreeting() {
    const greeting = document.getElementById('userGreeting');
    if (greeting && currentUser) {
        greeting.textContent = `Olá, ${currentUser.name}`;
    }
}

function updateStats() {
    if (currentUser) {
        document.getElementById('establishmentRating').textContent = currentUser.rating || '0.0';
        document.getElementById('totalHires').textContent = currentUser.total_hires || '0';
        
        // Contar jobs e aplicações dos jobs carregados
        const openJobs = myJobs.filter(job => job.status === 'open').length;
        document.getElementById('totalJobs').textContent = openJobs.toString();
    }
}

async function loadUserProfile() {
    try {
        const response = await getUserProfile();
        currentUser = response.profile;
        populateProfileForm();
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showNotification('Erro ao carregar perfil', 'error');
    }
}

function populateProfileForm() {
    if (!currentUser) return;
    
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileBusinessName').value = currentUser.business_name || '';
    document.getElementById('profileBusinessType').value = currentUser.business_type || '';
    document.getElementById('profileAddress').value = currentUser.address || '';
    document.getElementById('profileCity').value = currentUser.city || '';
    document.getElementById('profilePostalCode').value = currentUser.postal_code || '';
    document.getElementById('profileWebsite').value = currentUser.website || '';
    document.getElementById('profileDescription').value = currentUser.description || '';
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        business_name: formData.get('business_name'),
        business_type: formData.get('business_type'),
        address: formData.get('address'),
        city: formData.get('city'),
        postal_code: formData.get('postal_code'),
        website: formData.get('website'),
        description: formData.get('description')
    };
    
    try {
        await updateUserProfile(profileData);
        showNotification('Perfil atualizado com sucesso!', 'success');
        closeModal('profileModal');
        await loadUserProfile();
        updateStats();
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showNotification('Erro ao atualizar perfil', 'error');
    }
}

async function loadMyJobs() {
    const container = document.getElementById('myJobsContainer');
    container.innerHTML = '<div class="loading">Carregando seus jobs...</div>';
    
    try {
        // Como não temos endpoint específico para jobs do estabelecimento,
        // vamos simular carregando todos os jobs e filtrando
        const response = await getJobs({ limit: 100 });
        
        // Em uma implementação real, você filtraria no backend
        myJobs = response.jobs || [];
        
        displayMyJobs();
        updateStats();
        
    } catch (error) {
        console.error('Erro ao carregar jobs:', error);
        container.innerHTML = '<div class="empty-state"><h3>Erro ao carregar jobs</h3><p>Tente novamente mais tarde.</p></div>';
    }
}

function displayMyJobs() {
    const container = document.getElementById('myJobsContainer');
    
    if (myJobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum job encontrado</h3>
                <p>Crie seu primeiro job para começar a encontrar baristas.</p>
                <button class="btn btn-primary" onclick="showCreateJobModal()">Criar Job</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = myJobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <span class="status-badge status-${job.status}">${getStatusText(job.status)}</span>
                </div>
                <div class="job-rate">€${job.hourly_rate}/h</div>
            </div>
            
            <div class="job-details">
                <div class="job-detail">
                    <span>📅</span>
                    <span>${formatDate(job.date_needed)}</span>
                </div>
                <div class="job-detail">
                    <span>🕐</span>
                    <span>${job.start_time} - ${job.end_time}</span>
                </div>
                <div class="job-detail">
                    <span>📍</span>
                    <span>${job.address}</span>
                </div>
            </div>
            
            <p class="job-description">${job.description}</p>
            
            ${job.skills_required ? `
                <div class="job-skills">
                    ${job.skills_required.split(',').map(skill => 
                        `<span class="skill-tag">${skill.trim()}</span>`
                    ).join('')}
                </div>
            ` : ''}
            
            <div class="job-actions">
                <button class="btn btn-primary btn-sm" onclick="viewApplications(${job.id})">
                    Ver Aplicações
                </button>
                <button class="btn btn-ghost btn-sm" onclick="editJob(${job.id})">
                    Editar
                </button>
                ${job.status === 'open' ? `
                    <button class="btn btn-secondary btn-sm" onclick="closeJob(${job.id})">
                        Fechar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showCreateJobModal() {
    document.getElementById('createJobModal').style.display = 'block';
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('jobDate').min = today;
}

async function handleCreateJob(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const jobData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date_needed: formData.get('date_needed'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
        hourly_rate: parseFloat(formData.get('hourly_rate')),
        skills_required: formData.get('skills_required')
    };
    
    // Validação básica
    if (jobData.start_time >= jobData.end_time) {
        showNotification('O horário de término deve ser posterior ao de início', 'error');
        return;
    }
    
    try {
        await createJob(jobData);
        showNotification('Job criado com sucesso!', 'success');
        closeModal('createJobModal');
        
        // Limpar formulário
        document.getElementById('createJobForm').reset();
        
        // Recarregar jobs
        loadMyJobs();
        
    } catch (error) {
        console.error('Erro ao criar job:', error);
        showNotification(error.message || 'Erro ao criar job', 'error');
    }
}

async function viewApplications(jobId) {
    selectedJobForApplications = jobId;
    const modal = document.getElementById('applicationsModal');
    const container = document.getElementById('applicationsContainer');
    
    modal.style.display = 'block';
    container.innerHTML = '<div class="loading">Carregando aplicações...</div>';
    
    try {
        const response = await apiRequest(`/jobs/${jobId}/applications`);
        const applications = response.applications;
        
        if (applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nenhuma aplicação ainda</h3>
                    <p>Aguarde baristas se candidatarem para este job.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = applications.map(app => `
            <div class="application-card">
                <div class="application-header">
                    <div class="applicant-info">
                        <h4>${app.barista_name}</h4>
                        <p>${app.barista_email}</p>
                    </div>
                    <div class="application-date">
                        ${formatDateTime(app.applied_at)}
                    </div>
                </div>
                
                <div class="application-details">
                    <div class="application-detail">
                        <strong>${app.experience_years || 0}</strong>
                        <span>Anos de Experiência</span>
                    </div>
                    <div class="application-detail">
                        <strong>€${app.barista_rate || 0}/h</strong>
                        <span>Taxa Desejada</span>
                    </div>
                    <div class="application-detail">
                        <strong>${app.rating || '0.0'}⭐</strong>
                        <span>Avaliação</span>
                    </div>
                </div>
                
                ${app.skills ? `
                    <div class="job-skills">
                        ${app.skills.split(',').map(skill => 
                            `<span class="skill-tag">${skill.trim()}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                
                ${app.message ? `
                    <div class="application-message">
                        <strong>Mensagem:</strong><br>
                        ${app.message}
                    </div>
                ` : ''}
                
                <div class="job-actions">
                    <button class="btn btn-primary btn-sm" onclick="contactBarista('${app.barista_email}')">
                        Entrar em Contato
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="viewBaristaProfile(${app.barista_id})">
                        Ver Perfil Completo
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar aplicações:', error);
        container.innerHTML = '<div class="empty-state"><h3>Erro ao carregar aplicações</h3><p>Tente novamente mais tarde.</p></div>';
    }
}

async function loadBaristas() {
    const container = document.getElementById('baristasContainer');
    container.innerHTML = '<div class="loading">Carregando baristas...</div>';
    
    try {
        const skills = document.getElementById('baristasSkillsFilter').value;
        const minRating = document.getElementById('baristasRatingFilter').value;
        
        const params = {
            limit: 20
        };
        
        if (skills) params.skills = skills;
        if (minRating) params.min_rating = minRating;
        
        const response = await getBaristas(params);
        currentBaristas = response.baristas;
        
        displayBaristas();
        
    } catch (error) {
        console.error('Erro ao carregar baristas:', error);
        container.innerHTML = '<div class="empty-state"><h3>Erro ao carregar baristas</h3><p>Tente novamente mais tarde.</p></div>';
    }
}

function displayBaristas() {
    const container = document.getElementById('baristasContainer');
    
    if (currentBaristas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum barista encontrado</h3>
                <p>Tente ajustar os filtros de busca.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentBaristas.map(barista => `
        <div class="barista-card">
            <div class="barista-avatar">
                ${barista.name.charAt(0).toUpperCase()}
            </div>
            
            <h4 class="barista-name">${barista.name}</h4>
            <div class="barista-rating">${barista.rating || '0.0'}⭐ (${barista.total_jobs || 0} jobs)</div>
            
            <div class="barista-info">
                <div class="barista-info-item">
                    <span>Experiência:</span>
                    <span>${barista.experience_years || 0} anos</span>
                </div>
                <div class="barista-info-item">
                    <span>Taxa:</span>
                    <span>€${barista.hourly_rate || 0}/h</span>
                </div>
            </div>
            
            ${barista.skills ? `
                <div class="barista-skills">
                    ${barista.skills.split(',').slice(0, 3).map(skill => 
                        `<span class="skill-tag">${skill.trim()}</span>`
                    ).join('')}
                    ${barista.skills.split(',').length > 3 ? '<span class="skill-tag">+mais</span>' : ''}
                </div>
            ` : ''}
            
            ${barista.bio ? `
                <p class="barista-bio">${barista.bio.substring(0, 100)}${barista.bio.length > 100 ? '...' : ''}</p>
            ` : ''}
            
            <div class="job-actions">
                <button class="btn btn-primary btn-sm" onclick="contactBarista('${barista.email}')">
                    Contatar
                </button>
            </div>
        </div>
    `).join('');
}

function showBaristasModal() {
    document.getElementById('baristasModal').style.display = 'block';
    loadBaristas();
}

function showProfileModal() {
    document.getElementById('profileModal').style.display = 'block';
}

function contactBarista(email) {
    window.location.href = `mailto:${email}?subject=Oportunidade de Trabalho - Bar Sitting`;
}

function viewBaristaProfile(baristaId) {
    showNotification('Funcionalidade de visualizar perfil completo em desenvolvimento', 'info');
}

function editJob(jobId) {
    showNotification('Funcionalidade de edição de job em desenvolvimento', 'info');
}

function closeJob(jobId) {
    if (confirm('Tem certeza que deseja fechar este job?')) {
        showNotification('Funcionalidade de fechar job em desenvolvimento', 'info');
    }
}

// Funções utilitárias
function getStatusText(status) {
    const statusMap = {
        'open': 'Aberto',
        'closed': 'Fechado',
        'completed': 'Completado'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Event listeners
document.getElementById('baristasSkillsFilter').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadBaristas();
    }
});

document.getElementById('baristasRatingFilter').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadBaristas();
    }
});