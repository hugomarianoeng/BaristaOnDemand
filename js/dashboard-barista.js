// Dashboard Barista JavaScript
let currentJobs = [];
let currentPage = 1;
let totalPages = 1;
let selectedJobId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRedirect();
    loadUserProfile();
    loadJobs();
});

async function checkAuthAndRedirect() {
    try {
        const profile = await getUserProfile();
        if (!profile || profile.profile.user_type !== 'barista') {
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
        document.getElementById('userRating').textContent = currentUser.rating || '0.0';
        document.getElementById('totalJobs').textContent = currentUser.total_jobs || '0';
        document.getElementById('hourlyRate').textContent = `€${currentUser.hourly_rate || '0'}`;
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
    document.getElementById('profileExperience').value = currentUser.experience_years || '';
    document.getElementById('profileHourlyRate').value = currentUser.hourly_rate || '';
    document.getElementById('profileSkills').value = currentUser.skills || '';
    document.getElementById('profileAvailability').value = currentUser.availability || '';
    document.getElementById('profileBio').value = currentUser.bio || '';
    document.getElementById('profileCertifications').value = currentUser.certifications || '';
    document.getElementById('profileLanguages').value = currentUser.languages || '';
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        experience_years: parseInt(formData.get('experience_years')) || 0,
        hourly_rate: parseFloat(formData.get('hourly_rate')) || 0,
        skills: formData.get('skills'),
        availability: formData.get('availability'),
        bio: formData.get('bio'),
        certifications: formData.get('certifications'),
        languages: formData.get('languages')
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

async function loadJobs(page = 1) {
    const container = document.getElementById('jobsContainer');
    container.innerHTML = '<div class="loading">Carregando jobs...</div>';
    
    try {
        const city = document.getElementById('cityFilter').value;
        const skills = document.getElementById('skillsFilter').value;
        
        const params = {
            page: page,
            limit: 9,
            city: city
        };
        
        if (skills) {
            params.skills = skills;
        }
        
        const response = await getJobs(params);
        currentJobs = response.jobs;
        currentPage = response.pagination.page;
        totalPages = response.pagination.pages;
        
        displayJobs();
        updatePagination();
        
    } catch (error) {
        console.error('Erro ao carregar jobs:', error);
        container.innerHTML = '<div class="empty-state"><h3>Erro ao carregar jobs</h3><p>Tente novamente mais tarde.</p></div>';
    }
}

function displayJobs() {
    const container = document.getElementById('jobsContainer');
    
    if (currentJobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum job encontrado</h3>
                <p>Tente ajustar os filtros ou verifique novamente mais tarde.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentJobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.business_name}</p>
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
                    <span>${job.address}, ${job.city}</span>
                </div>
                <div class="job-detail">
                    <span>🏢</span>
                    <span>${job.business_type}</span>
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
                <button class="btn btn-primary btn-sm" onclick="showApplicationModal(${job.id})">
                    Aplicar
                </button>
                <button class="btn btn-ghost btn-sm" onclick="viewJobDetails(${job.id})">
                    Ver Detalhes
                </button>
            </div>
        </div>
    `).join('');
}

function updatePagination() {
    const container = document.getElementById('jobsPagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botão anterior
    paginationHTML += `
        <button onclick="loadJobs(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ← Anterior
        </button>
    `;
    
    // Números das páginas
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        paginationHTML += `
            <button onclick="loadJobs(${i})" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }
    
    // Botão próximo
    paginationHTML += `
        <button onclick="loadJobs(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Próximo →
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

function showApplicationModal(jobId) {
    selectedJobId = jobId;
    const job = currentJobs.find(j => j.id === jobId);
    
    if (!job) return;
    
    const jobDetails = document.getElementById('jobDetails');
    jobDetails.innerHTML = `
        <div class="job-details">
            <h3>${job.title}</h3>
            <p><strong>Estabelecimento:</strong> ${job.business_name}</p>
            <p><strong>Data:</strong> ${formatDate(job.date_needed)}</p>
            <p><strong>Horário:</strong> ${job.start_time} - ${job.end_time}</p>
            <p><strong>Taxa:</strong> €${job.hourly_rate}/hora</p>
            <p><strong>Local:</strong> ${job.address}, ${job.city}</p>
            ${job.skills_required ? `<p><strong>Habilidades:</strong> ${job.skills_required}</p>` : ''}
            <p><strong>Descrição:</strong> ${job.description}</p>
        </div>
    `;
    
    document.getElementById('applicationModal').style.display = 'block';
}

async function handleJobApplication(event) {
    event.preventDefault();
    
    if (!selectedJobId) return;
    
    const formData = new FormData(event.target);
    const message = formData.get('message');
    
    try {
        await applyToJob(selectedJobId, message);
        showNotification('Aplicação enviada com sucesso!', 'success');
        closeModal('applicationModal');
        
        // Limpar formulário
        document.getElementById('applicationForm').reset();
        
        // Recarregar jobs para atualizar status
        loadJobs(currentPage);
        
    } catch (error) {
        console.error('Erro ao aplicar para job:', error);
        showNotification(error.message || 'Erro ao enviar aplicação', 'error');
    }
}

function viewJobDetails(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;
    
    showNotification(`Detalhes do job: ${job.title} - ${job.business_name}`, 'info');
}

function showProfileModal() {
    document.getElementById('profileModal').style.display = 'block';
}

// Funções utilitárias
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Event listeners para filtros
document.getElementById('cityFilter').addEventListener('change', () => loadJobs(1));
document.getElementById('skillsFilter').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadJobs(1);
    }
});

// Atualizar jobs a cada 30 segundos
setInterval(() => {
    if (document.visibilityState === 'visible') {
        loadJobs(currentPage);
    }
}, 30000);