// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Show splash screen for 2.5 seconds
    setTimeout(function() {
        const splashScreen = document.getElementById('splashScreen');
        const appContainer = document.getElementById('appContainer');
        
        // Hide splash screen
        splashScreen.style.opacity = '0';
        
        // Show main app after fade out
        setTimeout(function() {
            splashScreen.style.display = 'none';
            appContainer.style.display = 'flex';
            
            // Initialize the app
            initApp();
        }, 1000);
    }, 2500);
});

// Initialize the app
function initApp() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Set current year in fee form
    document.getElementById('feeYear').value = new Date().getFullYear();
    
    // Initialize data if not exists
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('fees')) {
        localStorage.setItem('fees', JSON.stringify([]));
    }
    
    // Show dashboard by default
    showDashboard();
    
    // Set up form submissions
    document.getElementById('studentForm').addEventListener('submit', addStudent);
    document.getElementById('feeForm').addEventListener('submit', addFee);
    document.getElementById('feeRecordFilter').addEventListener('change', updateFeeRecords);
    document.getElementById('studentSearch').addEventListener('input', searchStudents);
    
    // Initialize chart
    updateIncomeChart();
}

// Navigation functions
function showDashboard() {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('dashboard').style.display = 'block';
}

function showSection(sectionId) {
    document.getElementById('dashboard').style.display = 'none';
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    // Update specific section content if needed
    if (sectionId === 'addFee') {
        updateStudentDropdown();
    } else if (sectionId === 'feeRecord') {
        updateFeeRecords();
    } else if (sectionId === 'allStudents') {
        displayAllStudents();
    } else if (sectionId === 'monthlyIncome') {
        updateIncomeChart();
    }
}

// Student functions
function addStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const phone = document.getElementById('studentPhone').value.trim();
    
    if (!name || !studentClass) {
        alert('Please fill in all required fields');
        return;
    }
    
    const students = JSON.parse(localStorage.getItem('students'));
    const newStudent = {
        id: Date.now(),
        name,
        class: studentClass,
        phone: phone || null
    };
    
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    
    // Clear form
    document.getElementById('studentForm').reset();
    
    // Show success message
    alert('Student added successfully!');
    
    // Update student dropdown in fee section
    updateStudentDropdown();
}

function updateStudentDropdown() {
    const students = JSON.parse(localStorage.getItem('students'));
    const dropdown = document.getElementById('feeStudent');
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a student';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dropdown.appendChild(defaultOption);
    
    // Add student options
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.class})`;
        dropdown.appendChild(option);
    });
}

function displayAllStudents() {
    const students = JSON.parse(localStorage.getItem('students'));
    const tableBody = document.querySelector('#studentsTable tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add student rows
    students.forEach(student => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.phone || '-'}</td>
            <td>
                <button class="action-icon edit-student" data-id="${student.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-icon delete-student" data-id="${student.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-student').forEach(btn => {
        btn.addEventListener('click', function() {
            editStudent(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.delete-student').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteStudent(parseInt(this.getAttribute('data-id')));
        });
    });
}

function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTable tbody tr');
    
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const studentClass = row.cells[1].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || studentClass.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function editStudent(studentId) {
    const students = JSON.parse(localStorage.getItem('students'));
    const student = students.find(s => s.id === studentId);
    
    if (!student) return;
    
    // Populate form with student data
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentClass').value = student.class;
    document.getElementById('studentPhone').value = student.phone || '';
    
    // Change form to update mode
    const form = document.getElementById('studentForm');
    form.removeEventListener('submit', addStudent);
    form.dataset.editId = studentId;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateStudent(studentId);
    });
    
    // Change button text
    form.querySelector('.submit-btn').textContent = 'Update Student';
    
    // Show the add student section
    showSection('addStudent');
}

function updateStudent(studentId) {
    const name = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const phone = document.getElementById('studentPhone').value.trim();
    
    if (!name || !studentClass) {
        alert('Please fill in all required fields');
        return;
    }
    
    const students = JSON.parse(localStorage.getItem('students'));
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex !== -1) {
        students[studentIndex] = {
            id: studentId,
            name,
            class: studentClass,
            phone: phone || null
        };
        
        localStorage.setItem('students', JSON.stringify(students));
        
        // Reset form
        document.getElementById('studentForm').reset();
        delete document.getElementById('studentForm').dataset.editId;
        
        // Restore original event listener
        const form = document.getElementById('studentForm');
        form.removeEventListener('submit', updateStudent);
        form.addEventListener('submit', addStudent);
        form.querySelector('.submit-btn').textContent = 'Add Student';
        
        // Show success message
        alert('Student updated successfully!');
        
        // Update displays
        updateStudentDropdown();
        displayAllStudents();
    }
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        let students = JSON.parse(localStorage.getItem('students'));
        students = students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(students));
        
        // Also remove any fees associated with this student
        let fees = JSON.parse(localStorage.getItem('fees'));
        fees = fees.filter(f => f.studentId !== studentId);
        localStorage.setItem('fees', JSON.stringify(fees));
        
        // Update displays
        updateStudentDropdown();
        displayAllStudents();
        updateFeeRecords();
        updateIncomeChart();
        
        alert('Student deleted successfully!');
    }
}

// Fee functions
function addFee(e) {
    e.preventDefault();
    
    const studentId = parseInt(document.getElementById('feeStudent').value);
    const amount = parseFloat(document.getElementById('feeAmount').value);
    const month = document.getElementById('feeMonth').value;
    const year = parseInt(document.getElementById('feeYear').value);
    
    if (!studentId || isNaN(amount) || !month || !year) {
        alert('Please fill in all required fields');
        return;
    }
    
    const fees = JSON.parse(localStorage.getItem('fees'));
    const newFee = {
        id: Date.now(),
        studentId,
        amount,
        month,
        year,
        datePaid: new Date().toLocaleDateString()
    };
    
    fees.push(newFee);
    localStorage.setItem('fees', JSON.stringify(fees));
    
    // Clear form
    document.getElementById('feeForm').reset();
    document.getElementById('feeYear').value = new Date().getFullYear();
    
    // Show success message
    alert('Fee recorded successfully!');
    
    // Update displays
    updateFeeRecords();
    updateIncomeChart();
}

function updateFeeRecords() {
    const filter = document.getElementById('feeRecordFilter').value;
    const fees = JSON.parse(localStorage.getItem('fees'));
    const students = JSON.parse(localStorage.getItem('students'));
    const tableBody = document.querySelector('#feeTable tbody');
    const now = new Date();
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Filter fees
    let filteredFees = [...fees];
    
    if (filter === 'monthly') {
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        filteredFees = fees.filter(fee => 
            fee.month === currentMonth && 
            fee.year === now.getFullYear()
        );
    } else if (filter === 'yearly') {
        filteredFees = fees.filter(fee => fee.year === now.getFullYear());
    }
    
    // Sort by date paid (newest first)
    filteredFees.sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));
    
    // Add fee rows
    filteredFees.forEach(fee => {
        const student = students.find(s => s.id === fee.studentId);
        const studentName = student ? `${student.name} (${student.class})` : 'Unknown Student';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${studentName}</td>
            <td>PKR ${fee.amount.toFixed(2)}</td>
            <td>${fee.month}</td>
            <td>${fee.year}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Income functions
function updateIncomeChart() {
    const fees = JSON.parse(localStorage.getItem('fees'));
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Calculate monthly income for current year
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthlyIncome = months.map(month => {
        return fees
            .filter(fee => fee.month === month && fee.year === currentYear)
            .reduce((sum, fee) => sum + fee.amount, 0);
    });
    
    // Calculate totals
    const thisMonthIncome = monthlyIncome[now.getMonth()];
    const thisYearIncome = monthlyIncome.reduce((sum, income) => sum + income, 0);
    const totalIncome = fees.reduce((sum, fee) => sum + fee.amount, 0);
    
    // Update summary cards
    document.getElementById('thisMonthIncome').textContent = `PKR ${thisMonthIncome.toFixed(2)}`;
    document.getElementById('thisYearIncome').textContent = `PKR ${thisYearIncome.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `PKR ${totalIncome.toFixed(2)}`;
    
    // Update chart
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.incomeChart) {
        window.incomeChart.destroy();
    }
    
    window.incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Income (PKR)',
                data: monthlyIncome,
                backgroundColor: 'rgba(110, 142, 251, 0.7)',
                borderColor: 'rgba(110, 142, 251, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'PKR ' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'PKR ' + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}
