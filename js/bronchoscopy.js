// Rigid Bronchoscopy Sizing Tool

// Equipment sizing data based on patient age
const bronchoscopySizing = {
    'premature': {
        bronchoscope: '2.5 mm',
        telescope: '2.5 mm (0°)',
        ett: '2.5',
        forceps: '1.2 mm',
        suction: '5 Fr',
        ventilating: 'Not recommended',
        weightRange: '<1.5 kg',
        notes: {
            bronchoscope: 'Smallest available size',
            telescope: 'Limited optical quality',
            forceps: 'Very limited working channel',
            ventilating: 'Use standard scope with careful ventilation'
        }
    },
    '0-6mo': {
        bronchoscope: '2.5-3.0 mm',
        telescope: '2.5-3.0 mm (0° or 30°)',
        ett: '3.0-3.5',
        forceps: '1.2-1.7 mm',
        suction: '5-6 Fr',
        ventilating: '2.5-3.0 mm',
        weightRange: '1.5-6 kg',
        notes: {
            bronchoscope: 'Choose based on airway size',
            telescope: '30° provides better visualization',
            forceps: 'Optical grasping forceps available',
            ventilating: 'Allows continuous oxygenation'
        }
    },
    '6-18mo': {
        bronchoscope: '3.5 mm',
        telescope: '2.7-3.5 mm (0°, 30°, or 70°)',
        ett: '3.5-4.0',
        forceps: '1.7-2.0 mm',
        suction: '6-8 Fr',
        ventilating: '3.5 mm',
        weightRange: '6-10 kg',
        notes: {
            bronchoscope: 'Good working channel',
            telescope: 'Multiple angles available',
            forceps: 'Adequate for most procedures',
            ventilating: 'Recommended for longer procedures'
        }
    },
    '18mo-3yr': {
        bronchoscope: '3.5-4.0 mm',
        telescope: '2.7-4.0 mm (0°, 30°, or 70°)',
        ett: '4.0-4.5',
        forceps: '1.7-2.3 mm',
        suction: '8-10 Fr',
        ventilating: '3.5-4.0 mm',
        weightRange: '10-15 kg',
        notes: {
            bronchoscope: '4.0 mm preferred for interventions',
            telescope: 'Excellent visualization',
            forceps: 'Good for foreign body removal',
            ventilating: 'Standard for this age group'
        }
    },
    '3-5yr': {
        bronchoscope: '4.0-5.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '4.5-5.0',
        forceps: '2.3-3.0 mm',
        suction: '10 Fr',
        ventilating: '4.0-5.0 mm',
        weightRange: '15-20 kg',
        notes: {
            bronchoscope: '5.0 mm for therapeutic procedures',
            telescope: 'High-quality optics',
            forceps: 'Larger working instruments',
            ventilating: 'Excellent ventilation capacity'
        }
    },
    '5-8yr': {
        bronchoscope: '5.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '5.0-5.5',
        forceps: '3.0 mm',
        suction: '10-12 Fr',
        ventilating: '5.0 mm',
        weightRange: '20-30 kg',
        notes: {
            bronchoscope: 'Adult-sized instruments compatible',
            telescope: 'Full range of angles',
            forceps: 'Standard adult forceps fit',
            ventilating: 'Optimal for all procedures'
        }
    },
    '8-12yr': {
        bronchoscope: '5.0-6.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '5.5-6.5',
        forceps: '3.0-3.5 mm',
        suction: '12-14 Fr',
        ventilating: '5.0-6.0 mm',
        weightRange: '30-50 kg',
        notes: {
            bronchoscope: '6.0 mm for complex procedures',
            telescope: 'Adult equipment standard',
            forceps: 'Full adult instrument set',
            ventilating: 'Adult ventilation parameters'
        }
    },
    'adult': {
        bronchoscope: '6.0-8.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '6.5-8.0',
        forceps: '3.5-5.0 mm',
        suction: '14-16 Fr',
        ventilating: '6.0-8.0 mm',
        weightRange: '>50 kg',
        notes: {
            bronchoscope: 'Standard adult sizes',
            telescope: 'High-definition available',
            forceps: 'Full range of instruments',
            ventilating: 'Standard adult ventilation'
        }
    }
};

// Update recommendations based on patient age
function updateRecommendations() {
    const age = document.getElementById('patient-age').value;
    const weight = parseFloat(document.getElementById('patient-weight').value);
    const recommendationsDiv = document.getElementById('recommendations');
    
    if (!age) {
        recommendationsDiv.style.display = 'none';
        return;
    }
    
    const sizing = bronchoscopySizing[age];
    
    // Update equipment sizes
    document.getElementById('bronchoscope-size').textContent = sizing.bronchoscope;
    document.getElementById('bronchoscope-note').textContent = sizing.notes.bronchoscope;
    
    document.getElementById('telescope-size').textContent = sizing.telescope;
    document.getElementById('telescope-note').textContent = sizing.notes.telescope;
    
    document.getElementById('ett-size').textContent = sizing.ett;
    
    document.getElementById('forceps-size').textContent = sizing.forceps;
    document.getElementById('forceps-note').textContent = sizing.notes.forceps;
    
    document.getElementById('suction-size').textContent = sizing.suction;
    
    document.getElementById('ventilating-size').textContent = sizing.ventilating;
    document.getElementById('ventilating-note').textContent = sizing.notes.ventilating;
    
    // Show recommendations
    recommendationsDiv.style.display = 'block';
    
    // Scroll to recommendations
    setTimeout(() => {
        recommendationsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    // Weight validation (optional)
    if (weight && !isNaN(weight)) {
        validateWeight(age, weight, sizing.weightRange);
    }
}

// Validate weight against expected range
function validateWeight(age, weight, expectedRange) {
    // Parse expected range
    let minWeight = 0;
    let maxWeight = Infinity;
    
    if (expectedRange.includes('-')) {
        const parts = expectedRange.split('-');
        minWeight = parseFloat(parts[0]);
        maxWeight = parseFloat(parts[1]);
    } else if (expectedRange.startsWith('<')) {
        maxWeight = parseFloat(expectedRange.substring(1));
    } else if (expectedRange.startsWith('>')) {
        minWeight = parseFloat(expectedRange.substring(1));
    }
    
    // Check if weight is outside expected range
    if (weight < minWeight || weight > maxWeight) {
        showWeightWarning(weight, expectedRange);
    }
}

// Show warning if weight is outside expected range
function showWeightWarning(weight, expectedRange) {
    const recommendationsDiv = document.getElementById('recommendations');
    
    // Check if warning already exists
    let warningDiv = document.getElementById('weight-warning');
    if (!warningDiv) {
        warningDiv = document.createElement('div');
        warningDiv.id = 'weight-warning';
        warningDiv.className = 'tool-card clinical-notes';
        warningDiv.style.background = 'linear-gradient(135deg, #ffe5e5 0%, #ffd0d0 100%)';
        warningDiv.style.borderLeft = '5px solid #ff6b6b';
        recommendationsDiv.insertBefore(warningDiv, recommendationsDiv.firstChild);
    }
    
    warningDiv.innerHTML = `
        <h2><i class="fas fa-exclamation-triangle"></i> Weight Alert</h2>
        <div class="notes-content">
            <div class="note-item">
                <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
                <p><strong>Weight Consideration:</strong> Patient weight (${weight} kg) is outside the typical range for this age group (${expectedRange}). Consider using equipment sized for actual patient size rather than age.</p>
            </div>
        </div>
    `;
}

// Print function
function printRecommendations() {
    window.print();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add print button if recommendations are visible
    const patientAge = document.getElementById('patient-age');
    if (patientAge) {
        patientAge.addEventListener('change', function() {
            if (this.value) {
                addPrintButton();
            }
        });
    }
});

// Add print button to recommendations
function addPrintButton() {
    const recommendationsDiv = document.getElementById('recommendations');
    if (recommendationsDiv && !document.getElementById('print-button')) {
        const printBtn = document.createElement('button');
        printBtn.id = 'print-button';
        printBtn.className = 'calc-button';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Recommendations';
        printBtn.onclick = printRecommendations;
        printBtn.style.marginTop = '2rem';
        recommendationsDiv.appendChild(printBtn);
    }
}

// Export function for future use
function exportRecommendations() {
    const age = document.getElementById('patient-age').value;
    const weight = document.getElementById('patient-weight').value;
    const sizing = bronchoscopySizing[age];
    
    const data = {
        patientAge: age,
        patientWeight: weight || 'Not specified',
        recommendations: sizing
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bronchoscopy-sizing-${age}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
