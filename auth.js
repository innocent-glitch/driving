// ============================================
// AUTHENTICATION & ROLE MANAGEMENT
// ============================================

const ROLES = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student',
    RECEPTIONIST: 'receptionist'
};

// ============================================
// PERMISSIONS - RECEPTIONIST IS LIMITED!
// ============================================
const PERMISSIONS = {
    // 👑 ADMIN - FULL ACCESS TO EVERYTHING
    admin: {
        dashboard: true,
        students: { view: true, add: true, edit: true, delete: true },
        instructors: { view: true, add: true, edit: true, delete: true },
        vehicles: { view: true, add: true, edit: true, delete: true },
        lessons: { view: true, add: true, edit: true, delete: true },
        payments: { view: true, add: true, edit: true, delete: true },
        inquiries: { view: true, reply: true, delete: true, add: true },
        employees: { view: true, add: true, edit: true, delete: true },
        reports: { view: true, export: true },
        studentInquiry: true
    },

    // 👨‍🏫 INSTRUCTOR - LIMITED
    instructor: {
        dashboard: true,
        students: { view: true, add: false, edit: false, delete: false },
        instructors: { view: false, add: false, edit: false, delete: false },
        vehicles: { view: true, add: false, edit: false, delete: false },
        lessons: { view: true, add: true, edit: true, delete: false },
        payments: { view: false, add: false, edit: false, delete: false },
        inquiries: { view: false, reply: false, delete: false, add: false },
        employees: { view: false, add: false, edit: false, delete: false },
        reports: { view: false, export: false },
        studentInquiry: false
    },

    // 🎓 STUDENT - OWN DATA ONLY
    student: {
        dashboard: true,
        students: { view: false, add: false, edit: false, delete: false },
        instructors: { view: false, add: false, edit: false, delete: false },
        vehicles: { view: false, add: false, edit: false, delete: false },
        lessons: { view: 'own', add: false, edit: false, delete: false },
        payments: { view: 'own', add: false, edit: false, delete: false },
        inquiries: { view: false, reply: false, delete: false, add: false },
        employees: { view: false, add: false, edit: false, delete: false },
        reports: { view: false, export: false },
        studentInquiry: true
    },

    // 👩‍💼 RECEPTIONIST - VIEW ONLY! NO ADD/EDIT/DELETE!
    receptionist: {
        dashboard: true,
        students: { view: true, add: false, edit: false, delete: false },  // ✅ VIEW ONLY
        instructors: { view: true, add: false, edit: false, delete: false }, // ✅ VIEW ONLY
        vehicles: { view: true, add: false, edit: false, delete: false },    // ✅ VIEW ONLY
        lessons: { view: true, add: true, edit: false, delete: false },      // ✅ Can schedule lessons
        payments: { view: true, add: true, edit: false, delete: false },     // ✅ Can record payments
        inquiries: { view: true, reply: false, delete: false, add: false },
        employees: { view: false, add: false, edit: false, delete: false },
        reports: { view: false, export: false },
        studentInquiry: false
    }
};

// ---------- GET CURRENT USER ----------
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

function getUserRole() {
    var user = getCurrentUser();
    return user ? user.role : 'guest';
}

function getUserId() {
    var user = getCurrentUser();
    return user ? user.id : null;
}

function getUserName() {
    var user = getCurrentUser();
    return user ? user.name : 'Guest';
}

// ---------- CHECK PERMISSIONS ----------
function hasPermission(module, action) {
    var role = getUserRole();
    var permissions = PERMISSIONS[role];
    if (!permissions) return false;
    if (!permissions[module]) return false;
    if (typeof permissions[module] === 'boolean') {
        return permissions[module];
    }
    if (action) {
        return permissions[module][action] || false;
    }
    return true;
}

function canView(module) {
    return hasPermission(module, 'view');
}

function canAdd(module) {
    return hasPermission(module, 'add');
}

function canEdit(module) {
    return hasPermission(module, 'edit');
}

function canDelete(module) {
    return hasPermission(module, 'delete');
}

function canStudentInquiry() {
    return hasPermission('studentInquiry');
}

// ---------- CHECK AUTH ----------
function checkAuth() {
    var isLoggedIn = localStorage.getItem('isLoggedIn');
    var currentPage = window.location.pathname.split('/').pop();
    var publicPages = ['login.html', 'register.html', 'index.html', 'inquiry-public.html'];
    if (!isLoggedIn && publicPages.indexOf(currentPage) === -1) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ---------- APPLY PERMISSIONS ----------
function applyPermissions() {
    var role = getUserRole();
    var user = getCurrentUser();
    var currentPage = window.location.pathname.split('/').pop();
    
    // Update sidebar - hide links user can't see
    var sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href) return;
        var page = href.split('/').pop();
        var module = getModuleFromPage(page);
        
        // Special case for student inquiry
        if (page === 'student-inquiry.html') {
            if (!canStudentInquiry()) {
                link.style.display = 'none';
                var li = link.closest('li');
                if (li) li.style.display = 'none';
            }
            return;
        }
        
        if (module && !canView(module)) {
            link.style.display = 'none';
            var li = link.closest('li');
            if (li) li.style.display = 'none';
        }
    });
    
    // Update user info in top bar
    var avatar = document.querySelector('.user-avatar');
    var nameSpan = document.querySelector('.user-profile span');
    if (avatar && user) {
        avatar.textContent = user.name.charAt(0).toUpperCase();
    }
    if (nameSpan && user) {
        var roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
        nameSpan.textContent = user.name + ' (' + roleDisplay + ')';
    }
    
    // Hide action buttons based on permissions
    var addStudentBtn = document.querySelector('a[href="student-add.html"]');
    if (addStudentBtn && !canAdd('students')) addStudentBtn.style.display = 'none';
    
    var editStudentBtns = document.querySelectorAll('a[href*="student-edit.html"]');
    editStudentBtns.forEach(function(btn) {
        if (!canEdit('students')) btn.style.display = 'none';
    });
    
    var deleteStudentBtns = document.querySelectorAll('button[onclick*="deleteStudent"]');
    deleteStudentBtns.forEach(function(btn) {
        if (!canDelete('students')) btn.style.display = 'none';
    });
    
    var addInstructorBtn = document.querySelector('a[href="instructor-add.html"]');
    if (addInstructorBtn && !canAdd('instructors')) addInstructorBtn.style.display = 'none';
    
    var addVehicleBtn = document.querySelector('a[href="vehicle-add.html"]');
    if (addVehicleBtn && !canAdd('vehicles')) addVehicleBtn.style.display = 'none';
    
    var addLessonBtn = document.querySelector('a[href="lesson-add.html"]');
    if (addLessonBtn && !canAdd('lessons')) addLessonBtn.style.display = 'none';
    
    var addPaymentBtn = document.querySelector('a[href="payment-add.html"]');
    if (addPaymentBtn && !canAdd('payments')) addPaymentBtn.style.display = 'none';
}

function getModuleFromPage(page) {
    var map = {
        'students.html': 'students',
        'student-add.html': 'students',
        'student-edit.html': 'students',
        'student-profile.html': 'students',
        'instructors.html': 'instructors',
        'instructor-add.html': 'instructors',
        'vehicles.html': 'vehicles',
        'vehicle-add.html': 'vehicles',
        'vehicle-edit.html': 'vehicles',
        'lessons.html': 'lessons',
        'lesson-add.html': 'lessons',
        'payments.html': 'payments',
        'payment-add.html': 'payments',
        'inquiries.html': 'inquiries',
        'employees.html': 'employees',
        'reports.html': 'reports'
    };
    return map[page] || null;
}

// ---------- INITIALIZE ----------
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        applyPermissions();
    }
});