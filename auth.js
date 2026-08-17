// ============================================
// EXCEL INSTITUTE DRIVING SCHOOL - AUTH.JS
// ============================================

// ============================================
// USER MANAGEMENT
// ============================================

// Get current user from localStorage
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
        return null;
    }
}

// Get all users from localStorage
function getAllUsers() {
    try {
        return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        return [];
    }
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Get user role
function getUserRole() {
    var user = getCurrentUser();
    return user ? user.role : null;
}

// Get user name
function getUserName() {
    var user = getCurrentUser();
    return user ? user.name : 'Guest';
}

// Get user email
function getUserEmail() {
    var user = getCurrentUser();
    return user ? user.email : null;
}

// ============================================
// ROLE CHECKS
// ============================================

// Check if user is Admin
function isAdmin() {
    return getUserRole() === 'admin';
}

// Check if user is Instructor
function isInstructor() {
    return getUserRole() === 'instructor';
}

// Check if user is Receptionist
function isReceptionist() {
    return getUserRole() === 'receptionist';
}

// Check if user is Student
function isStudent() {
    return getUserRole() === 'student';
}

// Check if user is Admin or Receptionist
function isAdminOrReceptionist() {
    var role = getUserRole();
    return role === 'admin' || role === 'receptionist';
}

// Check if user is Admin or Instructor
function isAdminOrInstructor() {
    var role = getUserRole();
    return role === 'admin' || role === 'instructor';
}

// Check if user is staff (Admin, Instructor, or Receptionist)
function isStaff() {
    var role = getUserRole();
    return role === 'admin' || role === 'instructor' || role === 'receptionist';
}

// ============================================
// ROLE-BASED PERMISSIONS
// ============================================

// Role permissions mapping
var ROLE_PERMISSIONS = {
    admin: {
        pages: [
            'dashboard', 'students', 'instructors', 'vehicles', 
            'lessons', 'payments', 'inquiries', 'reports', 
            'change-password', 'student-inquiry', 'student-portal',
            'student-add', 'student-edit', 'instructor-add',
            'vehicle-add', 'vehicle-edit', 'lesson-add',
            'payment-add', 'receipt'
        ],
        actions: ['view_all', 'add', 'edit', 'delete', 'export', 'print']
    },
    instructor: {
        pages: [
            'dashboard', 'lessons', 'student-inquiry', 
            'student-portal', 'change-password'
        ],
        actions: ['view_lessons', 'view_students', 'submit_inquiry']
    },
    receptionist: {
        pages: [
            'dashboard', 'students', 'payments', 'inquiries',
            'student-inquiry', 'student-portal', 'change-password',
            'student-add', 'payment-add', 'receipt'
        ],
        actions: ['view_students', 'add_students', 'view_payments', 
                  'add_payments', 'view_inquiries', 'print_receipt']
    },
    student: {
        pages: [
            'dashboard', 'student-portal', 'student-inquiry', 
            'change-password'
        ],
        actions: ['view_own_profile', 'submit_inquiry', 'view_own_lessons']
    }
};

// Get allowed pages for a role
function getAllowedPages(role) {
    if (!role) return [];
    var permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.pages : [];
}

// Get allowed actions for a role
function getAllowedActions(role) {
    if (!role) return [];
    var permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.actions : [];
}

// Check if user can access a specific page
function canAccessPage(pageName) {
    var role = getUserRole();
    if (!role) return false;
    
    // Admin can access everything
    if (role === 'admin') return true;
    
    var allowedPages = getAllowedPages(role);
    return allowedPages.indexOf(pageName) !== -1;
}

// Check if user can perform a specific action
function canPerformAction(action) {
    var role = getUserRole();
    if (!role) return false;
    
    // Admin can do everything
    if (role === 'admin') return true;
    
    var allowedActions = getAllowedActions(role);
    return allowedActions.indexOf(action) !== -1;
}

// ============================================
// PAGE PROTECTION
// ============================================

// Protect a page - redirect if not authorized
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

// Protect page with custom redirect
function protectPageWithRedirect(pageName, redirectUrl) {
    var user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!canAccessPage(pageName)) {
        alert('⛔ Access Denied! You do not have permission to view this page.');
        window.location.href = redirectUrl || 'dashboard.html';
        return false;
    }
    
    return true;
}

// ============================================
// UI VISIBILITY FUNCTIONS
// ============================================

// Update UI elements based on user role
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
    
    // Admin + Receptionist elements
    document.querySelectorAll('.admin-receptionist').forEach(function(el) {
        el.style.display = (isAdminUser || isReceptionistUser) ? '' : 'none';
    });
    
    // Admin + Instructor elements
    document.querySelectorAll('.admin-instructor').forEach(function(el) {
        el.style.display = (isAdminUser || isInstructorUser) ? '' : 'none';
    });
    
    // Admin only - for table actions
    document.querySelectorAll('.admin-action').forEach(function(el) {
        el.style.display = isAdminUser ? '' : 'none';
    });
    
    // Hide from students
    document.querySelectorAll('.not-student').forEach(function(el) {
        el.style.display = isStudentUser ? 'none' : '';
    });
    
    // Hide from instructors
    document.querySelectorAll('.not-instructor').forEach(function(el) {
        el.style.display = isInstructorUser ? 'none' : '';
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

// Update user profile display
function updateUserProfile() {
    var user = getCurrentUser();
    var avatar = document.getElementById('userAvatar');
    var nameSpan = document.getElementById('userNameDisplay');
    var roleDisplay = document.getElementById('userRoleDisplay');

    if (user) {
        var roleNames = {
            'admin': 'Admin',
            'instructor': 'Instructor',
            'receptionist': 'Receptionist',
            'student': 'Student'
        };
        var displayRole = roleNames[user.role] || user.role;
        if (avatar) avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'A';
        if (nameSpan) nameSpan.textContent = user.name + ' (' + displayRole + ')';
        if (roleDisplay) roleDisplay.textContent = displayRole;
    }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Login function
function loginUser(email, password) {
    var users = getAllUsers();
    var user = users.find(function(u) {
        return u.email === email && u.password === password && u.status === 'active';
    });
    
    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        return { success: true, user: user };
    }
    
    return { success: false, error: 'Invalid email or password' };
}

// Logout function
function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// Register new user
function registerUser(name, email, password, role) {
    var users = getAllUsers();
    
    // Check if email already exists
    if (users.find(function(u) { return u.email === email; })) {
        return { success: false, error: 'Email already registered!' };
    }
    
    // Check password length
    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters!' };
    }
    
    var newUser = {
        id: users.length > 0 ? Math.max.apply(null, users.map(function(u) { return u.id; })) + 1 : 1,
        name: name,
        email: email,
        password: password,
        role: role || 'student',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, user: newUser };
}

// Change password
function changePassword(email, currentPassword, newPassword) {
    var users = getAllUsers();
    var userIndex = users.findIndex(function(u) {
        return u.email === email && u.password === currentPassword;
    });
    
    if (userIndex === -1) {
        return { success: false, error: 'Current password is incorrect!' };
    }
    
    if (newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters!' };
    }
    
    if (currentPassword === newPassword) {
        return { success: false, error: 'New password must be different from current!' };
    }
    
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user if logged in
    var currentUser = getCurrentUser();
    if (currentUser && currentUser.email === email) {
        currentUser.password = newPassword;
        localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    return { success: true, message: 'Password changed successfully!' };
}

// ============================================
// DEFAULT USERS SETUP
// ============================================

function setupDefaultUsers() {
    var users = getAllUsers();
    
    if (users.length === 0) {
        var defaultUsers = [
            {
                id: 1,
                name: "Admin User",
                email: "admin@school.com",
                password: "admin123",
                role: "admin",
                status: "active",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Instructor John",
                email: "instructor@school.com",
                password: "instr123",
                role: "instructor",
                status: "active",
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: "Receptionist Jane",
                email: "reception@school.com",
                password: "recep123",
                role: "receptionist",
                status: "active",
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: "Student Peter",
                email: "student@school.com",
                password: "stud123",
                role: "student",
                status: "active",
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('✅ Default users created!');
        console.log('📋 Admin: admin@school.com / admin123');
        console.log('📋 Instructor: instructor@school.com / instr123');
        console.log('📋 Receptionist: reception@school.com / recep123');
        console.log('📋 Student: student@school.com / stud123');
        return true;
    }
    return false;
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize auth system
function initAuth() {
    // Setup default users if none exist
    setupDefaultUsers();
    
    // Check if user is logged in
    if (isLoggedIn()) {
        console.log('✅ User logged in:', getUserName(), '(', getUserRole(), ')');
    } else {
        console.log('ℹ️ No user logged in');
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================

// Make functions globally available
window.getCurrentUser = getCurrentUser;
window.getAllUsers = getAllUsers;
window.isLoggedIn = isLoggedIn;
window.getUserRole = getUserRole;
window.getUserName = getUserName;
window.getUserEmail = getUserEmail;
window.isAdmin = isAdmin;
window.isInstructor = isInstructor;
window.isReceptionist = isReceptionist;
window.isStudent = isStudent;
window.isAdminOrReceptionist = isAdminOrReceptionist;
window.isAdminOrInstructor = isAdminOrInstructor;
window.isStaff = isStaff;
window.canAccessPage = canAccessPage;
window.canPerformAction = canPerformAction;
window.protectPage = protectPage;
window.protectPageWithRedirect = protectPageWithRedirect;
window.updateUIByRole = updateUIByRole;
window.showRoleWelcome = showRoleWelcome;
window.updateUserProfile = updateUserProfile;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.registerUser = registerUser;
window.changePassword = changePassword;
window.setupDefaultUsers = setupDefaultUsers;
window.initAuth = initAuth;
window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
window.getAllowedPages = getAllowedPages;
window.getAllowedActions = getAllowedActions;

console.log('🔐 Auth system loaded successfully!');
console.log('📋 Current user:', getCurrentUser() ? getUserName() : 'None');
