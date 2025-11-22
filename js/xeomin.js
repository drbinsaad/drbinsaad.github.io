// XEOMIN Dose Calculator JavaScript

// Dosing table based on body weight
const xeominDosing = {
    '12-15': {
        range: '≥ 12 to < 15 kg',
        parotidDose: 6,
        parotidVolume: 0.24,
        submandibularDose: 4,
        submandibularVolume: 0.16,
        totalDose: 20
    },
    '15-19': {
        range: '≥ 15 to < 19 kg',
        parotidDose: 9,
        parotidVolume: 0.36,
        submandibularDose: 6,
        submandibularVolume: 0.24,
        totalDose: 30
    },
    '19-23': {
        range: '≥ 19 to < 23 kg',
        parotidDose: 12,
        parotidVolume: 0.48,
        submandibularDose: 8,
        submandibularVolume: 0.32,
        totalDose: 40
    },
    '23-27': {
        range: '≥ 23 to < 27 kg',
        parotidDose: 15,
        parotidVolume: 0.60,
        submandibularDose: 10,
        submandibularVolume: 0.40,
        totalDose: 50
    },
    '27-30': {
        range: '≥ 27 to < 30 kg',
        parotidDose: 18,
        parotidVolume: 0.72,
        submandibularDose: 12,
        submandibularVolume: 0.48,
        totalDose: 60
    },
    '30+': {
        range: '≥ 30 kg',
        parotidDose: 22.5,
        parotidVolume: 0.90,
        submandibularDose: 15,
        submandibularVolume: 0.60,
        totalDose: 75
    }
};

function calculateXeominDose() {
    const weightInput = document.getElementById('patient-weight');
    const weight = parseFloat(weightInput.value);
    const resultsDiv = document.getElementById('dose-results');
    
    // Validation
    if (!weight || isNaN(weight)) {
        alert('Please enter a valid patient weight');
        return;
    }
    
    if (weight < 12) {
        alert('XEOMIN is indicated for patients weighing ≥ 12 kg. Please verify patient weight.');
        return;
    }
    
    // Determine dosing category
    let dosing;
    if (weight >= 12 && weight < 15) {
        dosing = xeominDosing['12-15'];
    } else if (weight >= 15 && weight < 19) {
        dosing = xeominDosing['15-19'];
    } else if (weight >= 19 && weight < 23) {
        dosing = xeominDosing['19-23'];
    } else if (weight >= 23 && weight < 27) {
        dosing = xeominDosing['23-27'];
    } else if (weight >= 27 && weight < 30) {
        dosing = xeominDosing['27-30'];
    } else {
        dosing = xeominDosing['30+'];
    }
    
    // Display results
    document.getElementById('total-dose').textContent = `${dosing.totalDose} units`;
    document.getElementById('parotid-dose').textContent = `${dosing.parotidDose} units`;
    document.getElementById('parotid-volume').textContent = `${dosing.parotidVolume} ml`;
    document.getElementById('submandibular-dose').textContent = `${dosing.submandibularDose} units`;
    document.getElementById('submandibular-volume').textContent = `${dosing.submandibularVolume} ml`;
    
    // Show results
    resultsDiv.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    const weightInput = document.getElementById('patient-weight');
    
    if (weightInput) {
        weightInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateXeominDose();
            }
        });
    }
});
