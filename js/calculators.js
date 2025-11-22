// Lidocaine Dose Calculator
function calculateLidocaine() {
    const weight = parseFloat(document.getElementById('lidocaine-weight').value);
    const resultsDiv = document.getElementById('lidocaine-results');
    
    if (isNaN(weight) || weight <= 0) {
        showError(resultsDiv, 'Please enter a valid weight.');
        return;
    }
    
    // Maximum doses: 3-5 mg/kg without epi, 7 mg/kg with epi
    // Absolute max: 300mg without epi, 500mg with epi
    const maxWithoutEpi = Math.min(weight * 4.5, 300);
    const maxWithEpi = Math.min(weight * 7, 500);
    
    // Calculate volumes for common concentrations
    const volume1Percent = maxWithoutEpi / 10; // 1% = 10mg/mL
    const volume2Percent = maxWithoutEpi / 20; // 2% = 20mg/mL
    const volumeWithEpi1Percent = maxWithEpi / 10;
    const volumeWithEpi2Percent = maxWithEpi / 20;
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Lidocaine WITHOUT Epinephrine</div>
            <div class="result-value">${maxWithoutEpi.toFixed(1)} mg</div>
            <div class="result-note">≈ ${volume1Percent.toFixed(1)} mL of 1% or ${volume2Percent.toFixed(1)} mL of 2%</div>
        </div>
        <div class="result-item">
            <div class="result-label">Lidocaine WITH Epinephrine</div>
            <div class="result-value">${maxWithEpi.toFixed(1)} mg</div>
            <div class="result-note">≈ ${volumeWithEpi1Percent.toFixed(1)} mL of 1% or ${volumeWithEpi2Percent.toFixed(1)} mL of 2%</div>
        </div>
        <div class="alert alert-warning">
            <strong>Warning:</strong> These are maximum recommended doses. Always consider patient factors and clinical context.
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Epinephrine Dilution Calculator
function calculateEpinephrine() {
    const startConc = parseFloat(document.getElementById('epi-concentration').value);
    const desiredConc = parseFloat(document.getElementById('epi-desired').value);
    const totalVolume = parseFloat(document.getElementById('epi-volume').value);
    const resultsDiv = document.getElementById('epinephrine-results');
    
    if (isNaN(totalVolume) || totalVolume <= 0) {
        showError(resultsDiv, 'Please enter a valid volume.');
        return;
    }
    
    if (startConc <= desiredConc) {
        showError(resultsDiv, 'Starting concentration must be higher than desired concentration.');
        return;
    }
    
    // Calculate volumes needed
    const epiVolume = (totalVolume * startConc) / desiredConc;
    const salineVolume = totalVolume - epiVolume;
    
    if (epiVolume > totalVolume) {
        showError(resultsDiv, 'Cannot achieve this dilution. Choose a different starting concentration.');
        return;
    }
    
    const startConcRatio = `1:${startConc.toLocaleString()}`;
    const desiredConcRatio = `1:${desiredConc.toLocaleString()}`;
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">To make ${totalVolume} mL of ${desiredConcRatio} epinephrine:</div>
        </div>
        <div class="result-item">
            <div class="result-label">Epinephrine (${startConcRatio})</div>
            <div class="result-value">${epiVolume.toFixed(2)} mL</div>
        </div>
        <div class="result-item">
            <div class="result-label">Normal Saline</div>
            <div class="result-value">${salineVolume.toFixed(2)} mL</div>
        </div>
        <div class="alert alert-info">
            <strong>Instructions:</strong> Draw up ${epiVolume.toFixed(2)} mL of ${startConcRatio} epinephrine and add ${salineVolume.toFixed(2)} mL of normal saline.
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Pure Tone Average Calculator
function calculatePTA() {
    const freq500 = parseFloat(document.getElementById('pta-500').value);
    const freq1000 = parseFloat(document.getElementById('pta-1000').value);
    const freq2000 = parseFloat(document.getElementById('pta-2000').value);
    const freq4000 = parseFloat(document.getElementById('pta-4000').value);
    const resultsDiv = document.getElementById('pta-results');
    
    if (isNaN(freq500) || isNaN(freq1000) || isNaN(freq2000)) {
        showError(resultsDiv, 'Please enter thresholds for 500, 1000, and 2000 Hz.');
        return;
    }
    
    let pta;
    let method;
    
    if (!isNaN(freq4000) && freq4000 > 0) {
        // 4-frequency average
        pta = (freq500 + freq1000 + freq2000 + freq4000) / 4;
        method = '4-frequency average (500, 1000, 2000, 4000 Hz)';
    } else {
        // 3-frequency average
        pta = (freq500 + freq1000 + freq2000) / 3;
        method = '3-frequency average (500, 1000, 2000 Hz)';
    }
    
    // Classify hearing loss
    let classification, classType;
    if (pta <= 25) {
        classification = 'Normal Hearing';
        classType = 'normal';
    } else if (pta <= 40) {
        classification = 'Mild Hearing Loss';
        classType = 'mild';
    } else if (pta <= 55) {
        classification = 'Moderate Hearing Loss';
        classType = 'moderate';
    } else if (pta <= 70) {
        classification = 'Moderately Severe Hearing Loss';
        classType = 'moderate';
    } else if (pta <= 90) {
        classification = 'Severe Hearing Loss';
        classType = 'severe';
    } else {
        classification = 'Profound Hearing Loss';
        classType = 'profound';
    }
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Pure Tone Average (PTA)</div>
            <div class="result-value">${pta.toFixed(1)} dB HL</div>
            <div class="result-note">${method}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Classification</div>
            <span class="result-classification classification-${classType}">${classification}</span>
        </div>
        <div class="alert alert-info">
            <strong>Note:</strong> This is a screening tool. Complete audiological evaluation is required for accurate diagnosis.
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Neck Dissection Classification
function classifyNeckDissection() {
    const levels = Array.from(document.querySelectorAll('.neck-level:checked')).map(cb => cb.value);
    const scmPreserved = document.getElementById('preserve-scm').checked;
    const ijvPreserved = document.getElementById('preserve-ijv').checked;
    const cn11Preserved = document.getElementById('preserve-cn11').checked;
    const resultsDiv = document.getElementById('neck-results');
    
    if (levels.length === 0) {
        showError(resultsDiv, 'Please select at least one neck level.');
        return;
    }
    
    let dissectionType = '';
    let description = '';
    
    // Check for Radical Neck Dissection
    if (levels.length === 5 && levels.includes('I') && levels.includes('II') && 
        levels.includes('III') && levels.includes('IV') && levels.includes('V') &&
        !scmPreserved && !ijvPreserved && !cn11Preserved) {
        dissectionType = 'Radical Neck Dissection (RND)';
        description = 'Removal of levels I-V with sacrifice of SCM, IJV, and CN XI.';
    }
    // Check for Modified Radical Neck Dissection
    else if (levels.length === 5 && levels.includes('I') && levels.includes('II') && 
             levels.includes('III') && levels.includes('IV') && levels.includes('V')) {
        const preserved = [];
        if (scmPreserved) preserved.push('SCM');
        if (ijvPreserved) preserved.push('IJV');
        if (cn11Preserved) preserved.push('CN XI');
        
        if (preserved.length > 0) {
            dissectionType = 'Modified Radical Neck Dissection (MRND)';
            description = `Removal of levels I-V with preservation of ${preserved.join(', ')}.`;
        } else {
            dissectionType = 'Radical Neck Dissection (RND)';
            description = 'Removal of levels I-V with sacrifice of SCM, IJV, and CN XI.';
        }
    }
    // Selective Neck Dissection
    else {
        dissectionType = 'Selective Neck Dissection (SND)';
        
        // Identify specific SND type
        const levelStr = levels.sort().join('');
        if (levelStr === 'IIIIIIV') {
            description = 'Supraomohyoid neck dissection (levels I-III) - typically for oral cavity cancers.';
        } else if (levelStr === 'IIIIIIIV') {
            description = 'Lateral neck dissection (levels II-IV) - typically for laryngeal/hypopharyngeal cancers.';
        } else if (levelStr === 'IIIIIIIVV') {
            description = 'Posterolateral neck dissection (levels II-V) - typically for cutaneous malignancies.';
        } else if (levelStr === 'VI') {
            description = 'Central compartment dissection (level VI) - typically for thyroid cancers.';
        } else {
            description = `Custom selective neck dissection of levels ${levels.join(', ')}.`;
        }
    }
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Classification</div>
            <div class="result-value" style="font-size: 1rem;">${dissectionType}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Levels Removed</div>
            <div class="result-value">${levels.join(', ')}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Description</div>
            <div class="result-note">${description}</div>
        </div>
        ${(scmPreserved || ijvPreserved || cn11Preserved) ? `
        <div class="alert alert-success">
            <strong>Structures Preserved:</strong> ${[
                scmPreserved ? 'SCM' : null,
                ijvPreserved ? 'IJV' : null,
                cn11Preserved ? 'CN XI' : null
            ].filter(Boolean).join(', ')}
        </div>` : ''}
    `;
    resultsDiv.classList.add('show');
}

// SNOT-22 Score Calculator
function calculateSNOT() {
    const inputs = document.querySelectorAll('.snot-input');
    const resultsDiv = document.getElementById('snot-results');
    let total = 0;
    let validInputs = 0;
    
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value >= 0 && value <= 5) {
            total += value;
            validInputs++;
        }
    });
    
    if (validInputs === 0) {
        showError(resultsDiv, 'Please rate at least one symptom.');
        return;
    }
    
    // For simplified version with 8 symptoms (full SNOT-22 has 22 items)
    const maxPossible = validInputs * 5;
    const percentage = (total / maxPossible) * 100;
    
    let severity, classType;
    if (total <= 10) {
        severity = 'Minimal Impact';
        classType = 'normal';
    } else if (total <= 20) {
        severity = 'Mild Impact';
        classType = 'mild';
    } else if (total <= 30) {
        severity = 'Moderate Impact';
        classType = 'moderate';
    } else {
        severity = 'Severe Impact';
        classType = 'severe';
    }
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Total Score (Simplified)</div>
            <div class="result-value">${total} / ${maxPossible}</div>
            <div class="result-note">${percentage.toFixed(1)}% of maximum</div>
        </div>
        <div class="result-item">
            <div class="result-label">Quality of Life Impact</div>
            <span class="result-classification classification-${classType}">${severity}</span>
        </div>
        <div class="alert alert-info">
            <strong>Note:</strong> This is a simplified 8-item version. The full SNOT-22 includes 22 items for comprehensive assessment. Higher scores indicate worse quality of life.
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Body Surface Area Calculator
function calculateBSA() {
    const weight = parseFloat(document.getElementById('bsa-weight').value);
    const height = parseFloat(document.getElementById('bsa-height').value);
    const resultsDiv = document.getElementById('bsa-results');
    
    if (isNaN(weight) || weight <= 0 || isNaN(height) || height <= 0) {
        showError(resultsDiv, 'Please enter valid weight and height values.');
        return;
    }
    
    // Mosteller formula: BSA (m²) = √[(height(cm) × weight(kg)) / 3600]
    const bsa = Math.sqrt((height * weight) / 3600);
    
    // Du Bois formula for comparison: BSA = 0.007184 × height^0.725 × weight^0.425
    const bsaDuBois = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Body Surface Area (Mosteller)</div>
            <div class="result-value">${bsa.toFixed(2)} m²</div>
        </div>
        <div class="result-item">
            <div class="result-label">Body Surface Area (Du Bois)</div>
            <div class="result-value">${bsaDuBois.toFixed(2)} m²</div>
            <div class="result-note">Alternative formula for comparison</div>
        </div>
        <div class="alert alert-info">
            <strong>Clinical Use:</strong> BSA is used for calculating medication dosages, especially for chemotherapy and other systemic treatments.
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Helper function to show errors
function showError(resultsDiv, message) {
    resultsDiv.innerHTML = `
        <div class="alert alert-warning">
            <strong>Error:</strong> ${message}
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Add enter key support for all calculators
document.addEventListener('DOMContentLoaded', function() {
    // Lidocaine calculator
    const lidocaineWeight = document.getElementById('lidocaine-weight');
    if (lidocaineWeight) {
        lidocaineWeight.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateLidocaine();
        });
    }
    
    // BSA calculator
    const bsaHeight = document.getElementById('bsa-height');
    if (bsaHeight) {
        bsaHeight.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateBSA();
        });
    }
    
    // PTA calculator
    const pta4000 = document.getElementById('pta-4000');
    if (pta4000) {
        pta4000.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculatePTA();
        });
    }
});
