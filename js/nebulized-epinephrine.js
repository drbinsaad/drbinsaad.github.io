// Initialize AOS
AOS.init({
    duration: 800,
    once: true
});

// Dosing data structure
const dosingData = {
    age: {
        '1month': { epi: 2, nacl: 2, weight: '4.5 kg' },
        '2months': { epi: 2.5, nacl: 2, weight: '5 kg' },
        '3months': { epi: 3, nacl: 1, weight: '6 kg' },
        '4-6months': { epi: 3.5, nacl: 1, weight: '7 kg' },
        '7-9months': { epi: 4, nacl: 0, weight: '8 kg' },
        '10-11months': { epi: 4.5, nacl: 0, weight: '9 kg' },
        '1-4years': { epi: 5, nacl: 0, weight: '10-17 kg' },
        '>4years': { epi: 5, nacl: 0, weight: '> 17 kg' }
    },
    weight: [
        { min: 4.5, max: 4.9, epi: 2, nacl: 2, age: '1 month' },
        { min: 5, max: 5.9, epi: 2.5, nacl: 2, age: '2 months' },
        { min: 6, max: 6.9, epi: 3, nacl: 1, age: '3 months' },
        { min: 7, max: 7.9, epi: 3.5, nacl: 1, age: '4-6 months' },
        { min: 8, max: 8.9, epi: 4, nacl: 0, age: '7-9 months' },
        { min: 9, max: 9.9, epi: 4.5, nacl: 0, age: '10-11 months' },
        { min: 10, max: 17, epi: 5, nacl: 0, age: '1-4 years' },
        { min: 17.1, max: 999, epi: 5, nacl: 0, age: '> 4 years' }
    ]
};

// Method selection
function selectMethod(method) {
    const ageBtn = document.getElementById('age-btn');
    const weightBtn = document.getElementById('weight-btn');
    const ageCalc = document.getElementById('age-calculator');
    const weightCalc = document.getElementById('weight-calculator');
    const ageResult = document.getElementById('age-result');
    const weightResult = document.getElementById('weight-result');

    if (method === 'age') {
        ageBtn.classList.add('active');
        weightBtn.classList.remove('active');
        ageCalc.style.display = 'block';
        weightCalc.style.display = 'none';
        ageResult.style.display = 'none';
        weightResult.style.display = 'none';
    } else {
        weightBtn.classList.add('active');
        ageBtn.classList.remove('active');
        weightCalc.style.display = 'block';
        ageCalc.style.display = 'none';
        ageResult.style.display = 'none';
        weightResult.style.display = 'none';
    }
}

// Calculate dose based on age
function calculateAgeDose() {
    const ageSelect = document.getElementById('patient-age-select');
    const ageValue = ageSelect.value;
    const resultBox = document.getElementById('age-result');
    const epiValue = document.getElementById('age-epi-value');
    const naclValue = document.getElementById('age-nacl-value');

    if (!ageValue) {
        alert('Please select an age range');
        return;
    }

    const dose = dosingData.age[ageValue];
    
    // Display epinephrine dose
    epiValue.innerHTML = `<strong>Epinephrine (1 mg/ml):</strong> ${dose.epi} ml`;
    
    // Display NaCl if needed
    if (dose.nacl > 0) {
        naclValue.innerHTML = `<strong>0.9% NaCl to add:</strong> ${dose.nacl} ml<br><strong>Approximate weight:</strong> ${dose.weight}`;
    } else {
        naclValue.innerHTML = `<strong>0.9% NaCl:</strong> Not needed<br><strong>Approximate weight:</strong> ${dose.weight}`;
    }
    
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Calculate dose based on weight
function calculateWeightDose() {
    const weightInput = document.getElementById('patient-weight-input');
    const weight = parseFloat(weightInput.value);
    const resultBox = document.getElementById('weight-result');
    const epiValue = document.getElementById('weight-epi-value');
    const naclValue = document.getElementById('weight-nacl-value');

    if (!weight || weight < 4) {
        alert('Please enter a valid weight (minimum 4 kg)');
        return;
    }

    // Find appropriate dose based on weight
    let dose = null;
    for (let range of dosingData.weight) {
        if (weight >= range.min && weight <= range.max) {
            dose = range;
            break;
        }
    }

    if (!dose) {
        alert('Weight out of range. Please check the input.');
        return;
    }

    // Display epinephrine dose
    epiValue.innerHTML = `<strong>Epinephrine (1 mg/ml):</strong> ${dose.epi} ml`;
    
    // Display NaCl if needed
    if (dose.nacl > 0) {
        naclValue.innerHTML = `<strong>0.9% NaCl to add:</strong> ${dose.nacl} ml<br><strong>Approximate age:</strong> ${dose.age}`;
    } else {
        naclValue.innerHTML = `<strong>0.9% NaCl:</strong> Not needed<br><strong>Approximate age:</strong> ${dose.age}`;
    }
    
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Allow Enter key to trigger calculation
document.addEventListener('DOMContentLoaded', function() {
    const weightInput = document.getElementById('patient-weight-input');
    
    if (weightInput) {
        weightInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateWeightDose();
            }
        });
    }
});
