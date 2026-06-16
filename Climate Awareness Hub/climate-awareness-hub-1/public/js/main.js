// This file contains shared JavaScript functionality that is applicable across multiple pages.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any shared functionality here
    console.log("Climate Awareness Hub JavaScript loaded.");

    // Example: Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});