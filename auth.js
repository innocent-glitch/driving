// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check user role
function getUserRole() {
    var user = getCurrentUser();
    return user ? user.role : null;
}

// Check if user is admin
function isAdmin() {
    return getUserRole() === 'admin';
}

// Check if user is instructor
function isInstructor() {
    return getUserRole() === 'instructor';
}

// Check if user is receptionist
function isReceptionist() {
    return getUserRole() === 'receptionist';
}

// Check if user is student
function isStudent() {
    return getUserRole() === 'student';
}

// ============================================
// PAGE ACCESS RULES
// ============================================

// Role permissions mapping
var ROLE_PERMISSIONS = {
    admin: {
        pages: ['dashboard', 'students', 'instructors', 'vehicles', 'lessons', 'payments', 'inquiries', 'reports', 'change-password', 'student-inquiry', 'student-portal'],
        actions: ['view_all', 'add', 'edit', 'delete', 'export']
    },
    instructor: {
        pages: ['dashboard', 'lessons', 'student-inquiry', 'student-portal', 'change-password'],
        actions: ['view_lessons', 'view_students']
    },
    receptionist: {
        pages: ['dashboard', 'students', 'payments', 'inquiries', 'student-inquiry', 'student-portal', 'change-password'],
        actions: ['view_students', 'add_students', 'view_payments', 'add_payments', 'view_inquiries']
    },
    student: {
        pages: ['dashboard', 'student-portal', 'student-inquiry', 'change-password'],
        actions: ['view_own_profile', 'submit_inquiry']
    }
};

// Check if user can access a page
function canAccessPage(pageName) {
    var role = getUserRole();
    if (!role) return false;
    var permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.pages.indexOf(pageName) !== -1;
}

// Check if user can perform an action
function canPerformAction(action) {
    var role = getUserRole();
    if (!role) return false;
    var permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    // Admin can do everything
    if (role === 'admin') return true;
    return permissions.actions.indexOf(action) !== -1;
}

// ============================================
// PAGE PROTECTION FUNCTION
// ============================================

function protectPage(pageName) {
    var user = getCurrentUser();
    
    // If not logged in, go to login
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Check if user can access this page
    if (!canAccessPage(pageName)) {
        alert('⛔ Access Denied! You do not have permission to view this page.');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// ============================================
// UI VISIBILITY FUNCTIONS
// ============================================

// Hide/show elements based on role
function updateUIByRole() {
    var role = getUserRole();
    var isAdminUser = role === 'admin';
    var isInstructorUser = role === 'instructor';
    var isReceptionistUser = role === 'receptionist';
    var isStudentUser = role === 'student';
    
    // Admin-only elements
    document.querySelectorAll('.admin-only').forEach(function(el) {
        el.style.display = isAdminUser ? '' : 'none';
    });
    
    // Instructor-only elements
    document.querySelectorAll('.instructor-only').forEach(function(el) {
        el.style.display = isInstructorUser ? '' : 'none';
    });
    
    // Receptionist-only elements
    document.querySelectorAll('.receptionist-only').forEach(function(el) {
        el.style.display = isReceptionistUser ? '' : 'none';
    });
    
    // Student-only elements
    document.querySelectorAll('.student-only').forEach(function(el) {
        el.style.display = isStudentUser ? '' : 'none';
    });
    
    // Admin + Receptionist elements (can manage students)
    document.querySelectorAll('.admin-receptionist').forEach(function(el) {
        el.style.display = (isAdminUser || isReceptionistUser) ? '' : 'none';
    });
    
    // Admin + Instructor elements
    document.querySelectorAll('.admin-instructor').forEach(function(el) {
        el.style.display = (isAdminUser || isInstructorUser) ? '' : 'none';
    });
    
    // Hide from students
    document.querySelectorAll('.not-student').forEach(function(el) {
        el.style.display = isStudentUser ? 'none' : '';
    });
}

// Show role-specific welcome message
function showRoleWelcome() {
    var user = getCurrentUser();
    var roleDisplay = document.getElementById('userRoleDisplay');
    var welcomeMsg = document.getElementById('roleWelcomeMessage');
    
    if (user && roleDisplay) {
        var roleNames = {
            'admin': 'Admin',
            'instructor': 'Instructor',
            'receptionist': 'Receptionist',
            'student': 'Student'
        };
        roleDisplay.textContent = roleNames[user.role] || user.role;
    }
    
    if (user && welcomeMsg) {
        var messages = {
            'admin': 'You have full access to the system.',
            'instructor': 'You can view lessons and manage your schedule.',
            'receptionist': 'You can manage students and payments.',
            'student': 'You can view your profile and submit inquiries.'
        };
        welcomeMsg.textContent = messages[user.role] || 'Welcome to the system.';
    }
}
