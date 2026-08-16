// ============================================
// EXCEL INSTITUTE DRIVING SCHOOL - APP.JS
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'https://your-app-name.onrender.com/api'; // Update with your backend URL
const APP_NAME = 'Excel Institute Driving School';

// ============================================
// API CLIENT
// ============================================
class ApiClient {
    constructor() {
        this.baseURL = API_URL;
        this.token = localStorage.getItem('access_token');
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('access_token', token);
            this.headers['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('access_token');
            delete this.headers['Authorization'];
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.setToken(null);
                    window.location.href = '/login.html';
                }
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async upload(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);

        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': this.headers['Authorization'] || ''
            },
            body: formData
        });

        return response.json();
    }
}

// ============================================
// AUTHENTICATION SERVICE
// ============================================
class AuthService {
    constructor(api) {
        this.api = api;
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    async login(email, password) {
        try {
            const response = await this.api.post('/login', { email, password });
            this.api.setToken(response.access_token);
            this.currentUser = response.user;
            this.isAuthenticated = true;

            localStorage.setItem('user', JSON.stringify(response.user));

            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.api.setToken(null);
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }

    checkAuth() {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                this.api.setToken(token);
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                return true;
            } catch (e) {
                this.logout();
                return false;
            }
        }
        return false;
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    this.currentUser = JSON.parse(userData);
                } catch (e) {
                    return null;
                }
            }
        }
        return this.currentUser;
    }

    async register(userData) {
        try {
            const response = await this.api.post('/register', userData);
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            await this.api.post('/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// ============================================
// STUDENT SERVICE
// ============================================
class StudentService {
    constructor(api) {
        this.api = api;
    }

    async getAll() {
        try {
            return await this.api.get('/students');
        } catch (error) {
            console.error('Failed to fetch students:', error);
            return [];
        }
    }

    async add(studentData) {
        try {
            return await this.api.post('/students', studentData);
        } catch (error) {
            throw new Error(error.message || 'Failed to add student');
        }
    }

    async update(id, studentData) {
        try {
            return await this.api.put(`/students/${id}`, studentData);
        } catch (error) {
            throw new Error(error.message || 'Failed to update student');
        }
    }

    async delete(id) {
        try {
            await this.api.delete(`/students/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Failed to delete student');
        }
    }

    async search(query) {
        const students = await this.getAll();
        if (!query) return students;
        const search = query.toLowerCase();
        return students.filter(s =>
            s.full_name.toLowerCase().includes(search) ||
            s.student_no.toLowerCase().includes(search) ||
            s.phone.includes(search) ||
            (s.email && s.email.toLowerCase().includes(search))
        );
    }
}

// ============================================
// INSTRUCTOR SERVICE
// ============================================
class InstructorService {
    constructor(api) {
        this.api = api;
    }

    async getAll() {
        try {
            return await this.api.get('/instructors');
        } catch (error) {
            console.error('Failed to fetch instructors:', error);
            return [];
        }
    }

    async add(instructorData) {
        try {
            return await this.api.post('/instructors', instructorData);
        } catch (error) {
            throw new Error(error.message || 'Failed to add instructor');
        }
    }

    async update(id, instructorData) {
        try {
            return await this.api.put(`/instructors/${id}`, instructorData);
        } catch (error) {
            throw new Error(error.message || 'Failed to update instructor');
        }
    }

    async delete(id) {
        try {
            await this.api.delete(`/instructors/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Failed to delete instructor');
        }
    }
}

// ============================================
// VEHICLE SERVICE
// ============================================
class VehicleService {
    constructor(api) {
        this.api = api;
    }

    async getAll() {
        try {
            return await this.api.get('/vehicles');
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            return [];
        }
    }

    async add(vehicleData) {
        try {
            return await this.api.post('/vehicles', vehicleData);
        } catch (error) {
            throw new Error(error.message || 'Failed to add vehicle');
        }
    }

    async update(id, vehicleData) {
        try {
            return await this.api.put(`/vehicles/${id}`, vehicleData);
        } catch (error) {
            throw new Error(error.message || 'Failed to update vehicle');
        }
    }

    async delete(id) {
        try {
            await this.api.delete(`/vehicles/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Failed to delete vehicle');
        }
    }

    getAvailable() {
        return this.getAll().then(vehicles =>
            vehicles.filter(v => v.status === 'available')
        );
    }
}

// ============================================
// LESSON SERVICE
// ============================================
class LessonService {
    constructor(api) {
        this.api = api;
    }

    async getAll() {
        try {
            return await this.api.get('/lessons');
        } catch (error) {
            console.error('Failed to fetch lessons:', error);
            return [];
        }
    }

    async add(lessonData) {
        try {
            return await this.api.post('/lessons', lessonData);
        } catch (error) {
            throw new Error(error.message || 'Failed to schedule lesson');
        }
    }

    async update(id, lessonData) {
        try {
            return await this.api.put(`/lessons/${id}`, lessonData);
        } catch (error) {
            throw new Error(error.message || 'Failed to update lesson');
        }
    }

    async delete(id) {
        try {
            await this.api.delete(`/lessons/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Failed to delete lesson');
        }
    }

    async getByStudent(studentId) {
        const lessons = await this.getAll();
        return lessons.filter(l => l.student_id === studentId);
    }

    async getByInstructor(instructorId) {
        const lessons = await this.getAll();
        return lessons.filter(l => l.instructor_id === instructorId);
    }

    async getScheduled() {
        const lessons = await this.getAll();
        return lessons.filter(l => l.status === 'scheduled');
    }

    async complete(id, result, notes) {
        try {
            return await this.api.put(`/lessons/${id}`, {
                status: 'completed',
                result: result,
                notes: notes
            });
        } catch (error) {
            throw new Error(error.message || 'Failed to complete lesson');
        }
    }
}

// ============================================
// PAYMENT SERVICE
// ============================================
class PaymentService {
    constructor(api) {
        this.api = api;
    }

    async getAll() {
        try {
            return await this.api.get('/payments');
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            return [];
        }
    }

    async add(paymentData) {
        try {
            return await this.api.post('/payments', paymentData);
        } catch (error) {
            throw new Error(error.message || 'Failed to add payment');
        }
    }

    async getByStudent(studentId) {
        const payments = await this.getAll();
        return payments.filter(p => p.student_id === studentId);
    }

    async getTotalByStudent(studentId) {
        const payments = await this.getByStudent(studentId);
        return payments.reduce((total, p) => total + parseFloat(p.amount), 0);
    }

    async generateReceipt(paymentId) {
        try {
            return await this.api.get(`/payments/${paymentId}/receipt`);
        } catch (error) {
            throw new Error(error.message || 'Failed to generate receipt');
        }
    }
}

// ============================================
// INQUIRY SERVICE
// ============================================
class InquiryService {
    constructor(api) {
        this.api = api;
    }

    async getAll() {
        try {
            return await this.api.get('/inquiries');
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
            return [];
        }
    }

    async add(inquiryData) {
        try {
            return await this.api.post('/inquiries', inquiryData);
        } catch (error) {
            throw new Error(error.message || 'Failed to submit inquiry');
        }
    }

    async markRead(id) {
        try {
            return await this.api.put(`/inquiries/${id}`, { read: true });
        } catch (error) {
            throw new Error(error.message || 'Failed to mark inquiry as read');
        }
    }

    async delete(id) {
        try {
            await this.api.delete(`/inquiries/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Failed to delete inquiry');
        }
    }

    getUnread() {
        return this.getAll().then(inquiries =>
            inquiries.filter(i => !i.read)
        );
    }
}

// ============================================
// REPORT SERVICE
// ============================================
class ReportService {
    constructor(studentService, instructorService, vehicleService, lessonService, paymentService) {
        this.students = studentService;
        this.instructors = instructorService;
        this.vehicles = vehicleService;
        this.lessons = lessonService;
        this.payments = paymentService;
    }

    async getDashboardStats() {
        const [students, instructors, vehicles, lessons, payments] = await Promise.all([
            this.students.getAll(),
            this.instructors.getAll(),
            this.vehicles.getAll(),
            this.lessons.getAll(),
            this.payments.getAll()
        ]);

        const totalStudents = students.length;
        const totalInstructors = instructors.length;
        const totalVehicles = vehicles.length;
        const activeLessons = lessons.filter(l => l.status === 'scheduled').length;
        const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Calculate pass rate
        const completedLessons = lessons.filter(l => l.status === 'completed');
        const passedLessons = completedLessons.filter(l => l.result === 'pass');
        const passRate = completedLessons.length > 0
            ? Math.round((passedLessons.length / completedLessons.length) * 100)
            : 0;

        return {
            totalStudents,
            totalInstructors,
            totalVehicles,
            activeLessons,
            totalRevenue,
            passRate,
            payments: payments.length
        };
    }

    async getStudentReport(studentId) {
        const [lessons, payments] = await Promise.all([
            this.lessons.getByStudent(studentId),
            this.payments.getByStudent(studentId)
        ]);

        const totalLessons = lessons.length;
        const completedLessons = lessons.filter(l => l.status === 'completed');
        const passedLessons = completedLessons.filter(l => l.result === 'pass');
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        return {
            totalLessons,
            completedLessons: completedLessons.length,
            passedLessons: passedLessons.length,
            totalPaid,
            lessons: lessons,
            payments: payments
        };
    }

    async getInstructorReport(instructorId) {
        const lessons = await this.lessons.getByInstructor(instructorId);
        const totalLessons = lessons.length;
        const completedLessons = lessons.filter(l => l.status === 'completed');
        const passedLessons = completedLessons.filter(l => l.result === 'pass');

        return {
            totalLessons,
            completedLessons: completedLessons.length,
            passedLessons: passedLessons.length,
            passRate: completedLessons.length > 0
                ? Math.round((passedLessons.length / completedLessons.length) * 100)
                : 0,
            lessons: lessons
        };
    }

    async getFinancialReport(startDate, endDate) {
        const payments = await this.payments.getAll();
        const filtered = payments.filter(p => {
            const date = new Date(p.payment_date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const totalRevenue = filtered.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const byMethod = {};
        filtered.forEach(p => {
            const method = p.payment_method || 'cash';
            byMethod[method] = (byMethod[method] || 0) + parseFloat(p.amount);
        });

        return {
            totalRevenue,
            paymentMethods: byMethod,
            transactionCount: filtered.length,
            payments: filtered
        };
    }
}

// ============================================
// UI HELPERS
// ============================================
class UIHelpers {
    static showToast(message, type = 'success', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) {
            const div = document.createElement('div');
            div.id = 'toast-container';
            div.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(div);
        }

        const toast = document.createElement('div');
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.style.cssText = `
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
            font-family: Arial, sans-serif;
        `;

        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static showLoading(elementId = null) {
        if (elementId) {
            const el = document.getElementById(elementId);
            if (el) {
                el.innerHTML = '<div class="spinner"></div>';
                el.style.display = 'block';
            }
        }
        return true;
    }

    static hideLoading(elementId = null) {
        if (elementId) {
            const el = document.getElementById(elementId);
            if (el) {
                el.style.display = 'none';
                el.innerHTML = '';
            }
        }
        return true;
    }

    static formatCurrency(amount, currency = 'KES') {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    }

    static formatDate(date, format = 'MM/DD/YYYY') {
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return d.toLocaleDateString('en-US', options);
    }

    static formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static generateStudentNo() {
        const year = new Date().getFullYear();
        return `ST${year}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    static generateReceiptNo() {
        return `RCPT${Date.now().toString().slice(-8)}`;
    }

    static getStatusBadge(status) {
        const badges = {
            active: '<span class="badge badge-success">Active</span>',
            inactive: '<span class="badge badge-danger">Inactive</span>',
            scheduled: '<span class="badge badge-primary">Scheduled</span>',
            completed: '<span class="badge badge-success">Completed</span>',
            cancelled: '<span class="badge badge-danger">Cancelled</span>',
            pending: '<span class="badge badge-warning">Pending</span>',
            paid: '<span class="badge badge-success">Paid</span>',
            new: '<span class="badge badge-info">New</span>'
        };
        return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
    }

    static downloadCSV(data, filename) {
        if (!data || data.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Export successful!', 'success');
    }

    static printPage() {
        window.print();
    }

    static modal(html, title = 'Modal') {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;

        modal.innerHTML = `
            <h2 style="margin-top: 0;">${title}</h2>
            ${html}
            <button onclick="this.closest('div[style]').remove()" 
                    style="margin-top: 15px; padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        return overlay;
    }
}

// ============================================
// MAIN APP CLASS
// ============================================
class DrivingSchoolApp {
    constructor() {
        // Initialize API and services
        this.api = new ApiClient();
        this.auth = new AuthService(this.api);
        this.studentService = new StudentService(this.api);
        this.instructorService = new InstructorService(this.api);
        this.vehicleService = new VehicleService(this.api);
        this.lessonService = new LessonService(this.api);
        this.paymentService = new PaymentService(this.api);
        this.inquiryService = new InquiryService(this.api);
        this.reportService = new ReportService(
            this.studentService,
            this.instructorService,
            this.vehicleService,
            this.lessonService,
            this.paymentService
        );

        // Check authentication
        this.auth.checkAuth();

        // Initialize
        this.init();
    }

    init() {
        // Set up navigation
        this.setupNavigation();

        // Load data based on current page
        this.loadPageData();

        // Set up event listeners
        this.setupEventListeners();
    }

    setupNavigation() {
        // Update nav with user info
        const user = this.auth.getCurrentUser();
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = user ? user.name : 'Guest';
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.auth.logout();
            });
        }

        // Active nav links
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    loadPageData() {
        const page = this.getCurrentPage();
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'students':
                this.loadStudents();
                break;
            case 'instructors':
                this.loadInstructors();
                break;
            case 'vehicles':
                this.loadVehicles();
                break;
            case 'lessons':
                this.loadLessons();
                break;
            case 'payments':
                this.loadPayments();
                break;
            case 'inquiries':
                this.loadInquiries();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('students')) return 'students';
        if (path.includes('instructors')) return 'instructors';
        if (path.includes('vehicles')) return 'vehicles';
        if (path.includes('lessons')) return 'lessons';
        if (path.includes('payments')) return 'payments';
        if (path.includes('inquiries')) return 'inquiries';
        if (path.includes('reports')) return 'reports';
        return 'dashboard';
    }

    // ============================================
    // DASHBOARD
    // ============================================
    async loadDashboard() {
        try {
            UIHelpers.showLoading('dashboard-content');
            const stats = await this.reportService.getDashboardStats();

            const container = document.getElementById('dashboard-content');
            if (container) {
                container.innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Students</h3>
                            <p class="stat-number">${stats.totalStudents}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Instructors</h3>
                            <p class="stat-number">${stats.totalInstructors}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Vehicles</h3>
                            <p class="stat-number">${stats.totalVehicles}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Active Lessons</h3>
                            <p class="stat-number">${stats.activeLessons}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Total Revenue</h3>
                            <p class="stat-number">${UIHelpers.formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Pass Rate</h3>
                            <p class="stat-number">${stats.passRate}%</p>
                        </div>
                    </div>
                    <div class="recent-activity">
                        <h3>Recent Activity</h3>
                        <div class="activity-list">
                            <p>Latest transactions and updates will appear here</p>
                        </div>
                    </div>
                `;
            }
            UIHelpers.hideLoading('dashboard-content');
        } catch (error) {
            UIHelpers.showToast('Failed to load dashboard: ' + error.message, 'error');
        }
    }

    // ============================================
    // STUDENTS
    // ============================================
    async loadStudents() {
        try {
            const students = await this.studentService.getAll();
            const container = document.getElementById('students-list');
            if (container) {
                if (students.length === 0) {
                    container.innerHTML = '<p class="empty-state">No students registered yet.</p>';
                    return;
                }

                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Student No</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>License Class</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => `
                                <tr>
                                    <td>${s.student_no}</td>
                                    <td>${s.full_name}</td>
                                    <td>${s.phone}</td>
                                    <td>${s.license_class}</td>
                                    <td>${UIHelpers.getStatusBadge(s.status)}</td>
                                    <td>
                                        <button class="btn-sm btn-primary" onclick="app.editStudent(${s.id})">Edit</button>
                                        <button class="btn-sm btn-danger" onclick="app.deleteStudent(${s.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load students: ' + error.message, 'error');
        }
    }

    // ============================================
    // INSTRUCTORS
    // ============================================
    async loadInstructors() {
        try {
            const instructors = await this.instructorService.getAll();
            const container = document.getElementById('instructors-list');
            if (container) {
                if (instructors.length === 0) {
                    container.innerHTML = '<p class="empty-state">No instructors registered.</p>';
                    return;
                }

                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Staff No</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>License</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${instructors.map(i => `
                                <tr>
                                    <td>${i.staff_no}</td>
                                    <td>${i.full_name}</td>
                                    <td>${i.phone}</td>
                                    <td>${i.license_number}</td>
                                    <td>${UIHelpers.getStatusBadge(i.status)}</td>
                                    <td>
                                        <button class="btn-sm btn-primary" onclick="app.editInstructor(${i.id})">Edit</button>
                                        <button class="btn-sm btn-danger" onclick="app.deleteInstructor(${i.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load instructors: ' + error.message, 'error');
        }
    }

    // ============================================
    // VEHICLES
    // ============================================
    async loadVehicles() {
        try {
            const vehicles = await this.vehicleService.getAll();
            const container = document.getElementById('vehicles-list');
            if (container) {
                if (vehicles.length === 0) {
                    container.innerHTML = '<p class="empty-state">No vehicles registered.</p>';
                    return;
                }

                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Registration</th>
                                <th>Model</th>
                                <th>Year</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vehicles.map(v => `
                                <tr>
                                    <td>${v.registration_no}</td>
                                    <td>${v.model}</td>
                                    <td>${v.year}</td>
                                    <td>${UIHelpers.getStatusBadge(v.status)}</td>
                                    <td>
                                        <button class="btn-sm btn-primary" onclick="app.editVehicle(${v.id})">Edit</button>
                                        <button class="btn-sm btn-danger" onclick="app.deleteVehicle(${v.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load vehicles: ' + error.message, 'error');
        }
    }

    // ============================================
    // LESSONS
    // ============================================
    async loadLessons() {
        try {
            const lessons = await this.lessonService.getAll();
            const container = document.getElementById('lessons-list');
            if (container) {
                if (lessons.length === 0) {
                    container.innerHTML = '<p class="empty-state">No lessons scheduled.</p>';
                    return;
                }

                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Student</th>
                                <th>Instructor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lessons.map(l => `
                                <tr>
                                    <td>${UIHelpers.formatDate(l.lesson_date)}</td>
                                    <td>${l.start_time} - ${l.end_time}</td>
                                    <td>Student ID: ${l.student_id}</td>
                                    <td>Instructor ID: ${l.instructor_id}</td>
                                    <td>${UIHelpers.getStatusBadge(l.status)}</td>
                                    <td>
                                        ${l.status === 'scheduled' ? `
                                            <button class="btn-sm btn-success" onclick="app.completeLesson(${l.id})">Complete</button>
                                        ` : ''}
                                        <button class="btn-sm btn-danger" onclick="app.deleteLesson(${l.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load lessons: ' + error.message, 'error');
        }
    }

    // ============================================
    // PAYMENTS
    // ============================================
    async loadPayments() {
        try {
            const payments = await this.paymentService.getAll();
            const container = document.getElementById('payments-list');
            if (container) {
                if (payments.length === 0) {
                    container.innerHTML = '<p class="empty-state">No payments recorded.</p>';
                    return;
                }

                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Receipt No</th>
                                <th>Student</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Method</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr>
                                    <td>${p.receipt_no}</td>
                                    <td>Student ID: ${p.student_id}</td>
                                    <td>${UIHelpers.formatCurrency(p.amount)}</td>
                                    <td>${UIHelpers.formatDate(p.payment_date)}</td>
                                    <td>${p.payment_method}</td>
                                    <td>
                                        <button class="btn-sm btn-primary" onclick="app.viewReceipt(${p.id})">Receipt</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load payments: ' + error.message, 'error');
        }
    }

    // ============================================
    // INQUIRIES
    // ============================================
    async loadInquiries() {
        try {
            const inquiries = await this.inquiryService.getAll();
            const container = document.getElementById('inquiries-list');
            if (container) {
                if (inquiries.length === 0) {
                    container.innerHTML = '<p class="empty-state">No inquiries received.</p>';
                    return;
                }

                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inquiries.map(i => `
                                <tr>
                                    <td>${UIHelpers.formatDate(i.date)}</td>
                                    <td>${i.name}</td>
                                    <td>${i.phone}</td>
                                    <td>${i.subject}</td>
                                    <td>${i.read ? '✓ Read' : '● New'}</td>
                                    <td>
                                        <button class="btn-sm btn-info" onclick="app.viewInquiry(${i.id})">View</button>
                                        ${!i.read ? `<button class="btn-sm btn-primary" onclick="app.markInquiryRead(${i.id})">Mark Read</button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load inquiries: ' + error.message, 'error');
        }
    }

    // ============================================
    // REPORTS
    // ============================================
    async loadReports() {
        try {
            const stats = await this.reportService.getDashboardStats();
            const container = document.getElementById('reports-content');
            if (container) {
                container.innerHTML = `
                    <div class="report-filters">
                        <h3>Generate Report</h3>
                        <div class="filter-group">
                            <label>Report Type</label>
                            <select id="report-type">
                                <option value="students">Students Report</option>
                                <option value="financial">Financial Report</option>
                                <option value="instructors">Instructors Report</option>
                                <option value="lessons">Lessons Report</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Date From</label>
                            <input type="date" id="report-date-from">
                        </div>
                        <div class="filter-group">
                            <label>Date To</label>
                            <input type="date" id="report-date-to">
                        </div>
                        <button class="btn-primary" onclick="app.generateReport()">Generate Report</button>
                        <button class="btn-secondary" onclick="app.exportReport()">Export CSV</button>
                    </div>
                    <div id="report-results" class="report-results">
                        <p>Select report type and click Generate to view report.</p>
                    </div>
                `;
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load reports: ' + error.message, 'error');
        }
    }

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    // Student CRUD
    async addStudent(studentData) {
        try {
            const student = await this.studentService.add(studentData);
            UIHelpers.showToast('Student added successfully!', 'success');
            this.loadStudents();
            return student;
        } catch (error) {
            UIHelpers.showToast('Failed to add student: ' + error.message, 'error');
            throw error;
        }
    }

    async editStudent(id) {
        // Implement edit modal
        UIHelpers.showToast('Edit functionality coming soon', 'info');
    }

    async deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                await this.studentService.delete(id);
                UIHelpers.showToast('Student deleted successfully!', 'success');
                this.loadStudents();
            } catch (error) {
                UIHelpers.showToast('Failed to delete student: ' + error.message, 'error');
            }
        }
    }

    // Instructor CRUD
    async addInstructor(instructorData) {
        try {
            const instructor = await this.instructorService.add(instructorData);
            UIHelpers.showToast('Instructor added successfully!', 'success');
            this.loadInstructors();
            return instructor;
        } catch (error) {
            UIHelpers.showToast('Failed to add instructor: ' + error.message, 'error');
            throw error;
        }
    }

    async editInstructor(id) {
        UIHelpers.showToast('Edit functionality coming soon', 'info');
    }

    async deleteInstructor(id) {
        if (confirm('Are you sure you want to delete this instructor?')) {
            try {
                await this.instructorService.delete(id);
                UIHelpers.showToast('Instructor deleted successfully!', 'success');
                this.loadInstructors();
            } catch (error) {
                UIHelpers.showToast('Failed to delete instructor: ' + error.message, 'error');
            }
        }
    }

    // Vehicle CRUD
    async addVehicle(vehicleData) {
        try {
            const vehicle = await this.vehicleService.add(vehicleData);
            UIHelpers.showToast('Vehicle added successfully!', 'success');
            this.loadVehicles();
            return vehicle;
        } catch (error) {
            UIHelpers.showToast('Failed to add vehicle: ' + error.message, 'error');
            throw error;
        }
    }

    async editVehicle(id) {
        UIHelpers.showToast('Edit functionality coming soon', 'info');
    }

    async deleteVehicle(id) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await this.vehicleService.delete(id);
                UIHelpers.showToast('Vehicle deleted successfully!', 'success');
                this.loadVehicles();
            } catch (error) {
                UIHelpers.showToast('Failed to delete vehicle: ' + error.message, 'error');
            }
        }
    }

    // Lesson CRUD
    async addLesson(lessonData) {
        try {
            const lesson = await this.lessonService.add(lessonData);
            UIHelpers.showToast('Lesson scheduled successfully!', 'success');
            this.loadLessons();
            return lesson;
        } catch (error) {
            UIHelpers.showToast('Failed to schedule lesson: ' + error.message, 'error');
            throw error;
        }
    }

    async completeLesson(id) {
        const result = confirm('Was this lesson successful (pass/fail)?');
        if (result) {
            try {
                await this.lessonService.complete(id, 'pass', 'Lesson completed');
                UIHelpers.showToast('Lesson marked as completed!', 'success');
                this.loadLessons();
            } catch (error) {
                UIHelpers.showToast('Failed to complete lesson: ' + error.message, 'error');
            }
        }
    }

    async deleteLesson(id) {
        if (confirm('Are you sure you want to delete this lesson?')) {
            try {
                await this.lessonService.delete(id);
                UIHelpers.showToast('Lesson deleted successfully!', 'success');
                this.loadLessons();
            } catch (error) {
                UIHelpers.showToast('Failed to delete lesson: ' + error.message, 'error');
            }
        }
    }

    // Payment CRUD
    async addPayment(paymentData) {
        try {
            const payment = await this.paymentService.add(paymentData);
            UIHelpers.showToast('Payment recorded successfully!', 'success');
            this.loadPayments();
            return payment;
        } catch (error) {
            UIHelpers.showToast('Failed to record payment: ' + error.message, 'error');
            throw error;
        }
    }

    async viewReceipt(id) {
        try {
            const receipt = await this.paymentService.generateReceipt(id);
            UIHelpers.modal(`
                <div class="receipt">
                    <h3>Payment Receipt</h3>
                    <p><strong>Receipt No:</strong> ${receipt.receipt_no}</p>
                    <p><strong>Amount:</strong> ${UIHelpers.formatCurrency(receipt.amount)}</p>
                    <p><strong>Date:</strong> ${UIHelpers.formatDate(receipt.payment_date)}</p>
                    <p><strong>Student:</strong> ${receipt.student_name || 'N/A'}</p>
                    <p><strong>Method:</strong> ${receipt.payment_method}</p>
                </div>
            `, 'Payment Receipt');
        } catch (error) {
            UIHelpers.showToast('Failed to load receipt: ' + error.message, 'error');
        }
    }

    // Inquiry CRUD
    async addInquiry(inquiryData) {
        try {
            const inquiry = await this.inquiryService.add(inquiryData);
            UIHelpers.showToast('Inquiry submitted successfully!', 'success');
            return inquiry;
        } catch (error) {
            UIHelpers.showToast('Failed to submit inquiry: ' + error.message, 'error');
            throw error;
        }
    }

    async viewInquiry(id) {
        try {
            const inquiries = await this.inquiryService.getAll();
            const inquiry = inquiries.find(i => i.id === id);
            if (inquiry) {
                UIHelpers.modal(`
                    <div class="inquiry-detail">
                        <p><strong>Name:</strong> ${inquiry.name}</p>
                        <p><strong>Phone:</strong> ${inquiry.phone}</p>
                        <p><strong>Email:</strong> ${inquiry.email}</p>
                        <p><strong>Subject:</strong> ${inquiry.subject}</p>
                        <p><strong>Date:</strong> ${UIHelpers.formatDateTime(inquiry.date)}</p>
                        <p><strong>Message:</strong></p>
                        <p style="background: #f3f4f6; padding: 15px; border-radius: 4px;">${inquiry.message}</p>
                    </div>
                `, 'Inquiry Details');
            }
        } catch (error) {
            UIHelpers.showToast('Failed to load inquiry: ' + error.message, 'error');
        }
    }

    async markInquiryRead(id) {
        try {
            await this.inquiryService.markRead(id);
            UIHelpers.showToast('Inquiry marked as read', 'success');
            this.loadInquiries();
        } catch (error) {
            UIHelpers.showToast('Failed to mark inquiry as read: ' + error.message, 'error');
        }
    }

    // Report functions
    async generateReport() {
        const type = document.getElementById('report-type')?.value;
        const from = document.getElementById('report-date-from')?.value;
        const to = document.getElementById('report-date-to')?.value;
        const container = document.getElementById('report-results');

        if (!container) return;

        try {
            UIHelpers.showLoading('report-results');
            let data = [];
            let title = '';

            switch (type) {
                case 'students':
                    data = await this.studentService.getAll();
                    title = 'Students Report';
                    break;
                case 'financial':
                    if (from && to) {
                        data = await this.reportService.getFinancialReport(from, to);
                        title = `Financial Report (${from} to ${to})`;
                    } else {
                        UIHelpers.showToast('Please select date range for financial report', 'warning');
                        return;
                    }
                    break;
                case 'instructors':
                    data = await this.instructorService.getAll();
                    title = 'Instructors Report';
                    break;
                case 'lessons':
                    data = await this.lessonService.getAll();
                    title = 'Lessons Report';
                    break;
                default:
                    data = [];
            }

            if (data.length > 0) {
                container.innerHTML = `
                    <h4>${title}</h4>
                    <p>Total Records: ${data.length}</p>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(row => `
                                    <tr>
                                        ${Object.values(row).map(val => `<td>${val || ''}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                container.innerHTML = '<p>No data found for the selected criteria.</p>';
            }
            UIHelpers.hideLoading('report-results');
        } catch (error) {
            UIHelpers.showToast('Failed to generate report: ' + error.message, 'error');
            UIHelpers.hideLoading('report-results');
        }
    }

    async exportReport() {
        const container = document.getElementById('report-results');
        if (!container) return;

        const table = container.querySelector('table');
        if (!table) {
            UIHelpers.showToast('No report data to export', 'warning');
            return;
        }

        const rows = table.querySelectorAll('tr');
        const data = [];
        const headers = [];

        // Get headers
        const headerRow = rows[0];
        headerRow.querySelectorAll('th').forEach(th => {
            headers.push(th.textContent.trim());
        });

        // Get data rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowData = {};
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                rowData[headers[index]] = cell.textContent.trim();
            });
            data.push(rowData);
        }

        UIHelpers.downloadCSV(data, 'report_' + new Date().toISOString().slice(0, 10));
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Search functionality
        document.querySelectorAll('.search-input').forEach(input => {
            input.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        });

        // Form submissions
        document.querySelectorAll('form[data-submit]').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    }

    async handleSearch(query) {
        const page = this.getCurrentPage();
        switch (page) {
            case 'students':
                const students = await this.studentService.search(query);
                // Update table with filtered results
                break;
            default:
                break;
        }
    }

    handleFormSubmit(form) {
        const action = form.dataset.action;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        switch (action) {
            case 'add-student':
                this.addStudent(data);
                break;
            case 'add-instructor':
                this.addInstructor(data);
                break;
            case 'add-vehicle':
                this.addVehicle(data);
                break;
            case 'add-lesson':
                this.addLesson(data);
                break;
            case 'add-payment':
                this.addPayment(data);
                break;
            case 'add-inquiry':
                this.addInquiry(data);
                break;
            default:
                UIHelpers.showToast('Unknown form action: ' + action, 'error');
        }

        form.reset();
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ============================================
// INITIALIZE APP
// ============================================
// Add toast styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-primary { background: #dbeafe; color: #1e40af; }
    .badge-info { background: #e0e7ff; color: #3730a3; }
    .badge-secondary { background: #e5e7eb; color: #1f2937; }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }
    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-number {
        font-size: 28px;
        font-weight: bold;
        margin: 10px 0 0;
        color: #1f2937;
    }
    .table-wrapper {
        overflow-x: auto;
    }
    .table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .table th {
        background: #f3f4f6;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #374151;
    }
    .table td {
        padding: 12px;
        border-top: 1px solid #e5e7eb;
    }
    .table tr:hover {
        background: #f9fafb;
    }
    .btn-sm {
        padding: 4px 10px;
        font-size: 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 0 2px;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-success { background: #10b981; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-info { background: #6366f1; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .empty-state {
        text-align: center;
        padding: 40px;
        color: #6b7280;
    }
    .filter-group {
        display: inline-block;
        margin: 0 10px 10px 0;
    }
    .filter-group label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
    }
    .filter-group input,
    .filter-group select {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 14px;
    }
    .report-filters {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
    }
    .report-results {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        min-height: 200px;
    }
    .receipt {
        font-family: monospace;
        padding: 20px;
    }
`;

document.head.appendChild(style);

// Initialize the app
const app = new DrivingSchoolApp();

// Make app globally available for onclick handlers
window.app = app;
window.UIHelpers = UIHelpers;

console.log(`${APP_NAME} initialized successfully!`);
console.log('Version: 2.0.0 (Backend Connected)');