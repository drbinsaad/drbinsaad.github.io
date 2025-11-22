// ET Depth Calculator JavaScript

// Method selection
function selectMethod(method) {
    const ageBtn = document.getElementById('age-btn');
    const weightBtn = document.getElementById('weight-btn');
    const ageCalc = document.getElementById('age-calculator');
    const weightCalc = document.getElementById('weight-calculator');
    
    if (method === 'age') {
        ageBtn.classList.add('active');
        weightBtn.classList.remove('active');
        ageCalc.style.display = 'block';
        weightCalc.style.display = 'none';
        // Hide weight result
        document.getElementById('weight-result').style.display = 'none';
    } else {
        weightBtn.classList.add('active');
        ageBtn.classList.remove('active');
        weightCalc.style.display = 'block';
        ageCalc.style.display = 'none';
        // Hide age result
        document.getElementById('age-result').style.display = 'none';
    }
}

// Calculate depth using age-based formula
function calculateAgeDepth() {
    const ageInput = document.getElementById('patient-age-input');
    const age = parseFloat(ageInput.value);
    const resultDiv = document.getElementById('age-result');
    const depthValue = document.getElementById('age-depth-value');
    
    // Validation
    if (!age || isNaN(age) || age < 0) {
        alert('Please enter a valid age');
        return;
    }
    
    if (age > 18) {
        alert('This formula is designed for pediatric patients (0-18 years). For adults, use standard adult guidelines.');
        return;
    }
    
    // Calculate: Depth = 12 + (Age / 2)
    const depth = 12 + (age / 2);
    const depthRounded = Math.round(depth * 10) / 10; // Round to 1 decimal
    
    // Display result
    depthValue.textContent = `${depthRounded} cm`;
    resultDiv.style.display = 'flex';
    
    // Scroll to result
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Calculate depth using weight-based formula (Rule of Seven)
function calculateWeightDepth() {
    const weightInput = document.getElementById('patient-weight-input');
    const weight = parseFloat(weightInput.value);
    const resultDiv = document.getElementById('weight-result');
    const depthValue = document.getElementById('weight-depth-value');
    
    // Validation
    if (!weight || isNaN(weight) || weight <= 0) {
        alert('Please enter a valid weight');
        return;
    }
    
    if (weight < 0.5) {
        alert('Weight too low. Please verify patient weight.');
        return;
    }
    
    if (weight > 4) {
        alert('Rule of Seven is designed for infants 1-4 kg. For larger patients, please use the age-based formula.');
        return;
    }
    
    // Calculate: Depth = 6 + Weight
    // Rule of Seven: 1kg=7cm, 2kg=8cm, 3kg=9cm, 4kg=10cm
    const depth = 6 + weight;
    const depthRounded = Math.round(depth * 10) / 10; // Round to 1 decimal
    
    // Display result
    depthValue.textContent = `${depthRounded} cm`;
    resultDiv.style.display = 'flex';
    
    // Scroll to result
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    const ageInput = document.getElementById('patient-age-input');
    const weightInput = document.getElementById('patient-weight-input');
    
    if (ageInput) {
        ageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateAgeDepth();
            }
        });
    }
    
    if (weightInput) {
        weightInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateWeightDepth();
            }
        });
    }
});
