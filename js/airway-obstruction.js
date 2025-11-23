// Airway Obstruction Calculator
// Based on Cotton-Myer Grading System

// Data structure for obstruction percentages
const obstructionData = {
    'preterm1': {
        '2.0': { percent: 40, grade: 'I' },
        '2.5': { percent: null, grade: 'No obstruction' },
        '3.0': { percent: null, grade: 'No obstruction' },
        '3.5': { percent: null, grade: 'No obstruction' },
        '4.0': { percent: null, grade: 'No obstruction' },
        '4.5': { percent: null, grade: 'No obstruction' },
        '5.0': { percent: null, grade: 'No obstruction' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    'preterm2': {
        '2.0': { percent: 58, grade: 'II' },
        '2.5': { percent: 30, grade: 'I' },
        '3.0': { percent: null, grade: 'No obstruction' },
        '3.5': { percent: null, grade: 'No obstruction' },
        '4.0': { percent: null, grade: 'No obstruction' },
        '4.5': { percent: null, grade: 'No obstruction' },
        '5.0': { percent: null, grade: 'No obstruction' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    '0-3mo': {
        '2.0': { percent: 68, grade: 'II' },
        '2.5': { percent: 48, grade: 'I' },
        '3.0': { percent: 26, grade: 'I' },
        '3.5': { percent: null, grade: 'No obstruction' },
        '4.0': { percent: null, grade: 'No obstruction' },
        '4.5': { percent: null, grade: 'No obstruction' },
        '5.0': { percent: null, grade: 'No obstruction' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    '3-9mo': {
        '2.0': { percent: 75, grade: 'III' },
        '2.5': { percent: 59, grade: 'II' },
        '3.0': { percent: 41, grade: 'I' },
        '3.5': { percent: 22, grade: 'I' },
        '4.0': { percent: null, grade: 'No obstruction' },
        '4.5': { percent: null, grade: 'No obstruction' },
        '5.0': { percent: null, grade: 'No obstruction' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    '9mo-2yr': {
        '2.0': { percent: 80, grade: 'III' },
        '2.5': { percent: 67, grade: 'II' },
        '3.0': { percent: 53, grade: 'II' },
        '3.5': { percent: 38, grade: 'I' },
        '4.0': { percent: 20, grade: 'I' },
        '4.5': { percent: null, grade: 'No obstruction' },
        '5.0': { percent: null, grade: 'No obstruction' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    '2yr': {
        '2.0': { percent: 84, grade: 'III' },
        '2.5': { percent: 74, grade: 'III' },
        '3.0': { percent: 62, grade: 'II' },
        '3.5': { percent: 50, grade: 'I' },
        '4.0': { percent: 35, grade: 'I' },
        '4.5': { percent: 19, grade: 'I' },
        '5.0': { percent: null, grade: 'No obstruction' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    '4yr': {
        '2.0': { percent: 86, grade: 'III' },
        '2.5': { percent: 78, grade: 'III' },
        '3.0': { percent: 68, grade: 'II' },
        '3.5': { percent: 57, grade: 'II' },
        '4.0': { percent: 45, grade: 'I' },
        '4.5': { percent: 32, grade: 'I' },
        '5.0': { percent: 17, grade: 'I' },
        '5.5': { percent: null, grade: 'No obstruction' }
    },
    '6yr': {
        '2.0': { percent: 98, grade: 'III' },
        '2.5': { percent: 81, grade: 'III' },
        '3.0': { percent: 73, grade: 'III' },
        '3.5': { percent: 64, grade: 'II' },
        '4.0': { percent: 54, grade: 'II' },
        '4.5': { percent: 43, grade: 'I' },
        '5.0': { percent: 30, grade: 'I' },
        '5.5': { percent: 16, grade: 'I' }
    }
};

// Function to determine grade based on percentage
function determineGrade(percent) {
    if (percent === null) {
        return 'No obstruction';
    } else if (percent <= 50) {
        return 'Grade I (0-50% obstruction)';
    } else if (percent <= 70) {
        return 'Grade II (51-70% obstruction)';
    } else if (percent < 100) {
        return 'Grade III (71-99% obstruction)';
    } else {
        return 'Grade IV (No detectable lumen)';
    }
}

// Function to get grade color class
function getGradeClass(percent) {
    if (percent === null) {
        return 'grade-none';
    } else if (percent <= 50) {
        return 'grade-1';
    } else if (percent <= 70) {
        return 'grade-2';
    } else if (percent < 100) {
        return 'grade-3';
    } else {
        return 'grade-4';
    }
}

// Main calculation function
function calculateObstruction() {
    const ageSelect = document.getElementById('patient-age-select');
    const ettSelect = document.getElementById('ett-size-select');
    const resultBox = document.getElementById('obstruction-result');
    const obstructionValue = document.getElementById('obstruction-value');
    const gradeValue = document.getElementById('grade-value');
    
    const age = ageSelect.value;
    const ettSize = ettSelect.value;
    
    // Check if both values are selected
    if (!age || !ettSize) {
        resultBox.style.display = 'none';
        return;
    }
    
    // Get obstruction data
    const data = obstructionData[age][ettSize];
    const percent = data.percent;
    const grade = determineGrade(percent);
    const gradeClass = getGradeClass(percent);
    
    // Display results
    if (percent === null) {
        obstructionValue.textContent = 'No Obstruction';
        obstructionValue.className = 'result-value grade-none';
        gradeValue.textContent = 'Age-appropriate ETT size';
    } else {
        obstructionValue.textContent = percent + '% Obstruction';
        obstructionValue.className = 'result-value ' + gradeClass;
        gradeValue.textContent = grade;
    }
    
    resultBox.style.display = 'block';
    
    // Smooth scroll to result
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize AOS and other functionality
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinksItems.forEach(item => {
            item.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (hamburger && navLinks) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        }
    });
});
