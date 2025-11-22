// Enhanced Rigid Bronchoscopy and Airway Sizing Tool
// Integrated with GOSH Tracheal Size Charts

// Comprehensive equipment sizing data based on patient age
const airwaySizing = {
    'premature': {
        // Bronchoscopy Equipment
        bronchoscope: '2.5 mm',
        telescope: '2.5 mm (0°)',
        ett: '2.5',
        forceps: '1.2 mm',
        suction: '5 Fr',
        ventilating: 'Not recommended',
        
        // Anatomical Measurements
        cricoidDiameter: '3.6-4.8 mm',
        tracheaDiameter: '5 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '00',
        tracheostomyISO: '2.0-3.0',
        
        // Laryngoscope Blades
        millerBlade: '0',
        macintoshBlade: '-',
        
        // NPA (Nasopharyngeal Airway)
        npa: '2.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '-',
        balloonTrachea: '5 mm',
        
        weightRange: '<1.5 kg',
        notes: {
            bronchoscope: 'Smallest available size',
            telescope: 'Limited optical quality',
            forceps: 'Very limited working channel',
            ventilating: 'Use standard scope with careful ventilation',
            tracheostomy: 'Rarely required, consult neonatology',
            laryngoscope: 'Miller blade preferred for visualization'
        }
    },
    '0-6mo': {
        // Bronchoscopy Equipment
        bronchoscope: '2.5-3.0 mm',
        telescope: '2.5-3.0 mm (0° or 30°)',
        ett: '3.0-3.5',
        forceps: '1.2-1.7 mm',
        suction: '5-6 Fr',
        ventilating: '2.5-3.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '4.8-5.8 mm',
        tracheaDiameter: '5-6 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '0',
        tracheostomyISO: '3.0',
        
        // Laryngoscope Blades
        millerBlade: '0-1',
        macintoshBlade: '-',
        
        // NPA
        npa: '3.0 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '5-6 mm',
        balloonTrachea: '6-7 mm',
        
        weightRange: '1.5-6 kg',
        notes: {
            bronchoscope: 'Choose based on airway size',
            telescope: '30° provides better visualization',
            forceps: 'Optical grasping forceps available',
            ventilating: 'Allows continuous oxygenation',
            tracheostomy: 'Jackson 0 or ISO 3.0 most common',
            laryngoscope: 'Miller 0-1 for term newborns'
        }
    },
    '6-18mo': {
        // Bronchoscopy Equipment
        bronchoscope: '3.5 mm',
        telescope: '2.7-3.5 mm (0°, 30°, or 70°)',
        ett: '3.5-4.0',
        forceps: '1.7-2.0 mm',
        suction: '6-8 Fr',
        ventilating: '3.5 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '5.8-6.5 mm',
        tracheaDiameter: '6-7 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '1',
        tracheostomyISO: '3.5-4.0',
        
        // Laryngoscope Blades
        millerBlade: '1',
        macintoshBlade: '-',
        
        // NPA
        npa: '3.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '6-7 mm',
        balloonTrachea: '7 mm',
        
        weightRange: '6-10 kg',
        notes: {
            bronchoscope: 'Good working channel',
            telescope: 'Multiple angles available',
            forceps: 'Adequate for most procedures',
            ventilating: 'Recommended for longer procedures',
            tracheostomy: 'Jackson 1 standard for this age',
            laryngoscope: 'Miller 1 blade adequate'
        }
    },
    '18mo-3yr': {
        // Bronchoscopy Equipment
        bronchoscope: '3.5-4.0 mm',
        telescope: '2.7-4.0 mm (0°, 30°, or 70°)',
        ett: '4.0-4.5',
        forceps: '1.7-2.3 mm',
        suction: '8-10 Fr',
        ventilating: '3.5-4.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '6.5-7.4 mm',
        tracheaDiameter: '7-8 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '1-2',
        tracheostomyISO: '4.0-4.5',
        
        // Laryngoscope Blades
        millerBlade: '1',
        macintoshBlade: '1.5-2',
        
        // NPA
        npa: '4.0 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '7-8.5 mm',
        balloonTrachea: '8-8.5 mm',
        
        weightRange: '10-15 kg',
        notes: {
            bronchoscope: '4.0 mm preferred for interventions',
            telescope: 'Excellent visualization',
            forceps: 'Good for foreign body removal',
            ventilating: 'Standard for this age group',
            tracheostomy: 'Jackson 1-2 or ISO 4.0-4.5',
            laryngoscope: 'Miller 1 or Macintosh 1.5-2'
        }
    },
    '3-5yr': {
        // Bronchoscopy Equipment
        bronchoscope: '4.0-5.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '4.5-5.0',
        forceps: '2.3-3.0 mm',
        suction: '10 Fr',
        ventilating: '4.0-5.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '7.4-8.2 mm',
        tracheaDiameter: '8-9 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '2',
        tracheostomyISO: '4.5-5.0',
        
        // Laryngoscope Blades
        millerBlade: '2',
        macintoshBlade: '2',
        
        // NPA
        npa: '4.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '8.5-9 mm',
        balloonTrachea: '8.5-9 mm',
        
        weightRange: '15-20 kg',
        notes: {
            bronchoscope: '5.0 mm for therapeutic procedures',
            telescope: 'High-quality optics',
            forceps: 'Larger working instruments',
            ventilating: 'Excellent ventilation capacity',
            tracheostomy: 'Jackson 2 or ISO 4.5-5.0',
            laryngoscope: 'Miller 2 or Macintosh 2'
        }
    },
    '5-8yr': {
        // Bronchoscopy Equipment
        bronchoscope: '5.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '5.0-5.5',
        forceps: '3.0 mm',
        suction: '10-12 Fr',
        ventilating: '5.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '8.2-9.0 mm',
        tracheaDiameter: '9-10 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '2-3',
        tracheostomyISO: '5.0-5.5',
        
        // Laryngoscope Blades
        millerBlade: '2',
        macintoshBlade: '2',
        
        // NPA
        npa: '5.0-5.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '8.9-10 mm',
        balloonTrachea: '8.5-10 mm',
        
        weightRange: '20-30 kg',
        notes: {
            bronchoscope: 'Adult-sized instruments compatible',
            telescope: 'Full range of angles',
            forceps: 'Standard adult forceps fit',
            ventilating: 'Optimal for all procedures',
            tracheostomy: 'Jackson 2-3 or ISO 5.0-5.5',
            laryngoscope: 'Miller 2 or Macintosh 2'
        }
    },
    '8-12yr': {
        // Bronchoscopy Equipment
        bronchoscope: '5.0-6.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '5.5-6.5',
        forceps: '3.0-3.5 mm',
        suction: '12-14 Fr',
        ventilating: '5.0-6.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '9.0-10.7 mm',
        tracheaDiameter: '10-13 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '3',
        tracheostomyISO: '6.0-6.5',
        
        // Laryngoscope Blades
        millerBlade: '2-3',
        macintoshBlade: '2-3',
        
        // NPA
        npa: '6.0-6.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '10-12 mm',
        balloonTrachea: '10-12 mm',
        
        weightRange: '30-50 kg',
        notes: {
            bronchoscope: '6.0 mm for complex procedures',
            telescope: 'Adult equipment standard',
            forceps: 'Full adult instrument set',
            ventilating: 'Adult ventilation parameters',
            tracheostomy: 'Jackson 3 or ISO 6.0-6.5',
            laryngoscope: 'Miller 2-3 or Macintosh 2-3'
        }
    },
    'adult': {
        // Bronchoscopy Equipment
        bronchoscope: '6.0-8.0 mm',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        ett: '6.5-8.0',
        forceps: '3.5-5.0 mm',
        suction: '14-16 Fr',
        ventilating: '6.0-8.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '>10.8 mm',
        tracheaDiameter: '13+ mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '3-5',
        tracheostomyISO: '7.0-9.0',
        
        // Laryngoscope Blades
        millerBlade: '3',
        macintoshBlade: '3',
        
        // NPA
        npa: '7.0-9.0 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '12-14 mm',
        balloonTrachea: '12-14 mm',
        
        weightRange: '>50 kg',
        notes: {
            bronchoscope: 'Standard adult sizes',
            telescope: 'High-definition available',
            forceps: 'Full range of instruments',
            ventilating: 'Standard adult ventilation',
            tracheostomy: 'Jackson 3-5 or ISO 7.0-9.0 based on anatomy',
            laryngoscope: 'Miller 3 or Macintosh 3 standard'
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
    
    const sizing = airwaySizing[age];
    
    // Update Bronchoscopy Equipment
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
    
    // Update Anatomical Measurements
    document.getElementById('cricoid-diameter').textContent = sizing.cricoidDiameter;
    document.getElementById('trachea-diameter').textContent = sizing.tracheaDiameter;
    
    // Update Tracheostomy Tubes
    document.getElementById('trach-jackson').textContent = sizing.tracheostomyJackson;
    document.getElementById('trach-iso').textContent = sizing.tracheostomyISO;
    document.getElementById('trach-note').textContent = sizing.notes.tracheostomy;
    
    // Update Laryngoscope Blades
    document.getElementById('miller-blade').textContent = sizing.millerBlade;
    document.getElementById('macintosh-blade').textContent = sizing.macintoshBlade;
    document.getElementById('laryngoscope-note').textContent = sizing.notes.laryngoscope;
    
    // Update NPA
    document.getElementById('npa-size').textContent = sizing.npa;
    
    // Update Balloon Dilation
    document.getElementById('balloon-larynx').textContent = sizing.balloonLarynx;
    document.getElementById('balloon-trachea').textContent = sizing.balloonTrachea;
    
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
    } else {
        // Remove warning if weight is now in range
        const warningDiv = document.getElementById('weight-warning');
        if (warningDiv) {
            warningDiv.remove();
        }
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
        warningDiv.className = 'weight-warning';
        recommendationsDiv.insertBefore(warningDiv, recommendationsDiv.firstChild);
    }
    
    warningDiv.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
            <strong>Weight Alert:</strong> Patient weight (${weight} kg) is outside the typical range for this age group (${expectedRange}). 
            Consider using equipment sized for actual anatomy rather than age alone.
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    document.getElementById('patient-age').addEventListener('change', updateRecommendations);
    document.getElementById('patient-weight').addEventListener('input', updateRecommendations);
});
