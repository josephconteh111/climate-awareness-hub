// This file contains JavaScript code specifically for the report page, including form validation and submission handling.

document.addEventListener('DOMContentLoaded', function() {
    const reportForm = document.getElementById('report-form');
    const successMessage = document.getElementById('success-message');

    reportForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validateForm()) {
            saveReport();
            showSuccessMessage();
            reportForm.reset();
        }
    });

    function validateForm() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const location = document.getElementById('location').value;
        const issueType = document.getElementById('issue-type').value;
        const description = document.getElementById('description').value;

        if (!name || !email || !location || !issueType || !description) {
            alert('Please fill in all fields.');
            return false;
        }

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return false;
        }

        return true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function saveReport() {
        const reportData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            location: document.getElementById('location').value,
            issueType: document.getElementById('issue-type').value,
            description: document.getElementById('description').value,
        };

        // Simulating saving to localStorage
        let reports = JSON.parse(localStorage.getItem('reports')) || [];
        reports.push(reportData);
        localStorage.setItem('reports', JSON.stringify(reports));
    }

    function showSuccessMessage() {
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
});