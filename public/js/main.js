// Configuração da API
const API_BASE_URL = '/php-backend/api';

// Estado da aplicação
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupSmoothScrolling();
});

// Funções de navegação
function toggleMenu() {
    const menu = document.getElementById('headerMenu');
    menu.classList.toggle('menu-open');
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Funções de modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal(userType = '') {
    const modal = document.getElementById('registerModal');
    modal.style.display = 'block';
    
    if (userType) {
        document.getElementById('registerUserType').value = userType;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modal clicando fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Funções de autenticação
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            updateUIForLoggedInUser();
            closeModal('loginModal');
            showNotification('Login realizado com sucesso!', 'success');
            
            // Redirecionar para dashboard baseado no tipo de usuário
            setTimeout(() => {
                if (currentUser.user_type === 'barista') {
                    window.location.href = 'dashboard-barista.html';
                } else {
                    window.location.href = 'dashboard-establishment.html';
                }
            }, 1000);
        } else {
            showNotification(result.message || 'Erro ao fazer login', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        user_type: formData.get('user_type')
    };
    
    // Validação básica
    if (registerData.password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeModal('registerModal');
            showNotification('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
            setTimeout(() => {
                showLoginModal();
            }, 1000);
        } else {
            showNotification(result.message || 'Erro ao fazer cadastro', 'error');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST'
        });
        
        if (response.ok) {
            currentUser = null;
            updateUIForLoggedOutUser();
            showNotification('Logout realizado com sucesso!', 'success');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Erro no logout:', error);
        showNotification('Erro ao fazer logout', 'error');
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`);
        
        if (response.ok) {
            const result = await response.json();
            currentUser = result.profile;
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.innerHTML = `
            <span class="user-greeting">Olá, ${currentUser.name}</span>
            <button class="btn btn-ghost" onclick="goToDashboard()">Dashboard</button>
            <button class="btn btn-primary" onclick="handleLogout()">Sair</button>
        `;
    }
}

function updateUIForLoggedOutUser() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.innerHTML = `
            <button class="btn btn-ghost" onclick="showLoginModal()">Entrar</button>
            <button class="btn btn-primary" onclick="showRegisterModal()">Começar</button>
        `;
    }
}

function goToDashboard() {
    if (currentUser) {
        if (currentUser.user_type === 'barista') {
            window.location.href = 'dashboard-barista.html';
        } else {
            window.location.href = 'dashboard-establishment.html';
        }
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Adicionar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Cores baseadas no tipo
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10B981';
            break;
        case 'error':
            notification.style.backgroundColor = '#EF4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#F59E0B';
            break;
        default:
            notification.style.backgroundColor = '#3B82F6';
    }
    
    // Botão de fechar
    const closeBtn = notification.querySelector('button');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: 12px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Adicionar animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .user-greeting {
        color: #6B7280;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Funções utilitárias para API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// Funções específicas da API
async function getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/jobs?${queryString}`);
}

async function createJob(jobData) {
    return apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
    });
}

async function applyToJob(jobId, message) {
    return apiRequest(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ message })
    });
}

async function getUserProfile() {
    return apiRequest('/users/profile');
}

async function updateUserProfile(profileData) {
    return apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
}

async function getBaristas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users/baristas?${queryString}`);
}

// Exportar funções para uso global
window.BarSittingApp = {
    showLoginModal,
    showRegisterModal,
    closeModal,
    handleLogin,
    handleRegister,
    handleLogout,
    showNotification,
    apiRequest,
    getJobs,
    createJob,
    applyToJob,
    getUserProfile,
    updateUserProfile,
    getBaristas
};