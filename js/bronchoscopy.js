// Enhanced Pediatric Airway & Bronchoscopy Sizing Tool
// Integrated with GOSH (Great Ormond Street Hospital) Charts
// Supports both age-based and weight-based views

// Note: currentView and switchView are defined in inline script in HTML
// This ensures immediate availability and avoids caching issues

// Weight-to-age mapping for recommendations
function getAgeFromWeight(weight) {
    if (weight < 1) return 'premature';
    if (weight < 6) return '0-6mo';
    if (weight < 10) return '6-18mo';
    if (weight < 15) return '18mo-3yr';
    if (weight < 20) return '3-5yr';
    if (weight < 30) return '5-8yr';
    if (weight < 45) return '8-12yr';
    return 'adult';
}

// Comprehensive GOSH equipment sizing data
const goshAirwaySizing = {
    'premature': {
        // Basic Equipment
        bronchoscope: '2.5 mm (ID) / 3.5 mm (OD)',
        telescope: '2.5 mm (0°) / 3.6 mm (OD)',
        ett: '2.5',
        ettOD: '3.5-3.6',
        forceps: 'None',
        suction: 'None',
        ventilating: 'Not recommended',
        
        // Anatomical
        cricoidDiameter: '3.6-4.8 mm',
        tracheaDiameter: '5 mm',
        
        // GOSH Equipment
        shileyTube: '3.0 ID / 4.5 OD',
        portexCuffed: '3.0 ID / 4.2 OD',
        portexUncuffed: '2.5 ID / 3.4 OD',
        bronchoscopeStorz: 'Size 2.5 / ID 3.5 / OD 4.2',
        alderHeySuction: '12-14 FG',
        npa: '2.5 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: 'OOO (2.5 ID / 4.0 OD)',
        tracheostomyISO: '2.0-3.0',
        
        // Laryngoscope
        millerBlade: '0',
        macintoshBlade: '-',
        
        // Balloon Dilation
        balloonLarynx: '-',
        balloonTrachea: '5 mm',
        
        weightRange: '<1 kg',
        ageRange: 'Preterm-1 month',
        notes: {
            bronchoscope: 'Smallest available size - Preterm < 1kg',
            telescope: 'Limited optical quality',
            forceps: 'None available for this size',
            ventilating: 'Use standard scope with careful ventilation',
            tracheostomy: 'Rarely required, consult neonatology',
            laryngoscope: 'Miller blade preferred for visualization'
        }
    },
    '0-6mo': {
        // Basic Equipment
        bronchoscope: '3.0 mm (ID) / 4.3 mm (OD)',
        telescope: '2.7-3.0 mm (0° or 30°)',
        ett: '3.0-3.5',
        ettOD: '4.1-5.0',
        forceps: 'Optical peanut/alligator/coin',
        suction: '4F, 5F, 6F',
        ventilating: '2.5-3.0 mm',
        
        // Anatomical
        cricoidDiameter: '4.8-5.8 mm',
        tracheaDiameter: '5-6 mm',
        
        // GOSH Equipment
        shileyTube: '3.5 ID / 5.2 OD',
        portexCuffed: '3.5 ID / 4.9 OD',
        portexUncuffed: '3.0-3.5 ID / 4.2-4.8 OD',
        bronchoscopeStorz: 'Size 3.0 / ID 4.3 / OD 5.0',
        alderHeySuction: '16 FG',
        npa: '3.0 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: 'O (3.5 ID / 4.3 OD)',
        tracheostomyISO: '3.0',
        
        // Laryngoscope
        millerBlade: '0-1',
        macintoshBlade: '-',
        
        // Balloon Dilation
        balloonLarynx: '5-6 mm',
        balloonTrachea: '6-7 mm',
        
        weightRange: '1-6 kg',
        ageRange: '1-6 months',
        notes: {
            bronchoscope: 'Choose based on airway size',
            telescope: '30° provides better visualization',
            forceps: 'Optical grasping forceps available',
            ventilating: 'Allows continuous oxygenation',
            tracheostomy: 'Jackson O most common',
            laryngoscope: 'Miller 0-1 depending on size'
        }
    },
    '6-18mo': {
        // Basic Equipment
        bronchoscope: '3.5 mm (ID) / 5.0 mm (OD)',
        telescope: '2.7-3.5 mm (0°, 30°, or 70°)',
        ett: '4.0',
        ettOD: '5.4-5.6',
        forceps: 'Optical forceps (all types)',
        suction: '6F, 8F',
        ventilating: '3.0-3.5 mm',
        
        // Anatomical
        cricoidDiameter: '5.8-6.5 mm',
        tracheaDiameter: '6-7 mm',
        
        // GOSH Equipment
        shileyTube: '4.0 ID / 5.9 OD',
        portexCuffed: '4.0 ID / 5.5 OD',
        portexUncuffed: '4.0 ID / 5.4 OD',
        bronchoscopeStorz: 'Size 3.5 / ID 5.0 / OD 5.7',
        alderHeySuction: '18 FG',
        npa: '3.5 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: '1 (4.0 ID / 5.0 OD)',
        tracheostomyISO: '3.5-4.0',
        
        // Laryngoscope
        millerBlade: '1',
        macintoshBlade: '-',
        
        // Balloon Dilation
        balloonLarynx: '6 mm',
        balloonTrachea: '7 mm',
        
        weightRange: '6-10 kg',
        ageRange: '6-18 months',
        notes: {
            bronchoscope: '3.5mm scope provides good visualization',
            telescope: '70° useful for difficult anatomy',
            forceps: 'Full range of optical forceps available',
            ventilating: 'Recommended for longer procedures',
            tracheostomy: 'Jackson 1 or ISO 3.5-4.0',
            laryngoscope: 'Miller 1 standard'
        }
    },
    '18mo-3yr': {
        // Basic Equipment
        bronchoscope: '4.0 mm (ID) / 6.0 mm (OD)',
        telescope: '2.7-4.0 mm (0°, 30°, 70°)',
        ett: '4.5',
        ettOD: '6.2',
        forceps: 'All optical forceps',
        suction: '8F, 10F',
        ventilating: '3.5-4.0 mm',
        
        // Anatomical
        cricoidDiameter: '6.5-7.4 mm',
        tracheaDiameter: '7-8 mm',
        
        // GOSH Equipment
        shileyTube: '4.5 ID / 6.5 OD',
        portexCuffed: '4.5 ID / 6.2 OD',
        portexUncuffed: '4.5 ID / 6.2 OD',
        bronchoscopeStorz: 'Size 4.0 / ID 6.0 / OD 6.7',
        alderHeySuction: '18-20 FG',
        npa: '4.0 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: '2 (5.0 ID / 6.0 OD)',
        tracheostomyISO: '4.0',
        
        // Laryngoscope
        millerBlade: '1',
        macintoshBlade: '2',
        
        // Balloon Dilation
        balloonLarynx: '7 mm',
        balloonTrachea: '8-8.5 mm',
        
        weightRange: '10-15 kg',
        ageRange: '18 months - 3 years',
        notes: {
            bronchoscope: '4.0mm scope standard for this age',
            telescope: 'Multiple angles available',
            forceps: 'Full instrumentation possible',
            ventilating: 'Standard for procedures',
            tracheostomy: 'Jackson 2 or ISO 4.0',
            laryngoscope: 'Miller 1 or Macintosh 2'
        }
    },
    '3-5yr': {
        // Basic Equipment
        bronchoscope: '4.5 mm (ID) / 6.6 mm (OD)',
        telescope: '2.7-4.0 mm (all angles)',
        ett: '5.0',
        ettOD: '6.8',
        forceps: 'All optical forceps + larger instruments',
        suction: '10F, 12F',
        ventilating: '4.0-4.5 mm',
        
        // Anatomical
        cricoidDiameter: '7.4-8.2 mm',
        tracheaDiameter: '8-9 mm',
        
        // GOSH Equipment
        shileyTube: '5.0 ID / 7.1 OD',
        portexCuffed: '5.0 ID / 6.9 OD',
        portexUncuffed: '5.0 ID / 6.8 OD',
        bronchoscopeStorz: 'Size 4.5 / ID 6.6 / OD 7.3',
        alderHeySuction: '20-22 FG',
        npa: '4.5 mm ID / 5.0-5.5 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: '2 (5.0 ID / 6.0 OD)',
        tracheostomyISO: '4.5-5.0',
        
        // Laryngoscope
        millerBlade: '2',
        macintoshBlade: '2',
        
        // Balloon Dilation
        balloonLarynx: '8-8.5 mm',
        balloonTrachea: '8.5-9 mm',
        
        weightRange: '15-20 kg',
        ageRange: '3-6 years',
        notes: {
            bronchoscope: '4.5mm allows better working channel',
            telescope: 'All angles readily available',
            forceps: 'Adult-sized instruments can be used',
            ventilating: 'Excellent ventilation possible',
            tracheostomy: 'Jackson 2 or ISO 4.5-5.0',
            laryngoscope: 'Miller 2 or Macintosh 2'
        }
    },
    '5-8yr': {
        // Basic Equipment
        bronchoscope: '5.0 mm (ID) / 7.1 mm (OD)',
        telescope: '2.7-4.0 mm (all angles)',
        ett: '5.5-6.0',
        ettOD: '7.5-8.2',
        forceps: 'All instruments',
        suction: '12F, 14F',
        ventilating: '4.5-5.0 mm',
        
        // Anatomical
        cricoidDiameter: '8.2-9.0 mm',
        tracheaDiameter: '9-10 mm',
        
        // GOSH Equipment
        shileyTube: '5.5 ID / 7.7 OD',
        portexCuffed: '5.0-6.0 ID / 6.9-8.3 OD',
        portexUncuffed: '6.0 ID / 8.2 OD',
        bronchoscopeStorz: 'Size 5.0-6.0 / ID 7.1-7.5 / OD 7.8-8.2',
        alderHeySuction: '22-24 FG',
        npa: '5.0-5.5 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: '2-3 (5.0-6.0 ID)',
        tracheostomyISO: '5.0-5.5',
        
        // Laryngoscope
        millerBlade: '2',
        macintoshBlade: '2',
        
        // Balloon Dilation
        balloonLarynx: '8-9 mm',
        balloonTrachea: '8.5-10 mm',
        
        weightRange: '20-30 kg',
        ageRange: '6-9 years',
        notes: {
            bronchoscope: 'Approaching adult sizes',
            telescope: 'Full adult instrumentation',
            forceps: 'All adult instruments compatible',
            ventilating: 'Excellent working space',
            tracheostomy: 'Jackson 2-3 or ISO 5.0-5.5',
            laryngoscope: 'Miller 2 or Macintosh 2'
        }
    },
    '8-12yr': {
        // Basic Equipment
        bronchoscope: '6.0 mm (ID) / 7.5 mm (OD)',
        telescope: '2.7-4.0 mm (all angles)',
        ett: '6.5-7.0',
        ettOD: '8.9-9.6',
        forceps: 'All adult instruments',
        suction: '14F, 16F',
        ventilating: '5.0-6.0 mm',
        
        // Anatomical
        cricoidDiameter: '9.0-10.7 mm',
        tracheaDiameter: '10-13 mm',
        
        // GOSH Equipment
        shileyTube: '6.0 ID / 8.3 OD',
        portexCuffed: '6.0-7.0 ID / 8.3-9.7 OD',
        portexUncuffed: '7.0 ID / 9.6 OD',
        bronchoscopeStorz: 'Size 6.0 / ID 7.5 / OD 8.2',
        alderHeySuction: '24-28 FG',
        npa: '6.0-6.5 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: '3 (6.0 ID / 7.0 OD)',
        tracheostomyISO: '6.0-7.0',
        
        // Laryngoscope
        millerBlade: '2-3',
        macintoshBlade: '2-3',
        
        // Balloon Dilation
        balloonLarynx: '10 mm',
        balloonTrachea: '10-12 mm',
        
        weightRange: '30-45 kg',
        ageRange: '9-12 years',
        notes: {
            bronchoscope: 'Adult-sized equipment',
            telescope: 'Full adult range',
            forceps: 'All adult instruments',
            ventilating: 'Adult ventilation techniques',
            tracheostomy: 'Jackson 3 or ISO 6.0-7.0',
            laryngoscope: 'Miller 2-3 or Macintosh 2-3'
        }
    },
    'adult': {
        // Basic Equipment
        bronchoscope: '7.0-8.0 mm (ID) / 9.0-10.0 mm (OD)',
        telescope: '4.0 mm (all angles)',
        ett: '7.5-8.5',
        ettOD: '10.2-11.6',
        forceps: 'All adult instruments',
        suction: '16F, 18F',
        ventilating: '6.0-7.0 mm',
        
        // Anatomical
        cricoidDiameter: '>10.8 mm',
        tracheaDiameter: '13+ mm',
        
        // GOSH Equipment
        shileyTube: '6.5 ID / 9.0 OD',
        portexCuffed: '7.0-8.0 ID / 9.6-10.8 OD',
        portexUncuffed: '8.0 ID / 10.8 OD',
        bronchoscopeStorz: 'Size 6.0+ / ID 7.5+ / OD 8.2+',
        alderHeySuction: '28 FG',
        npa: '7.0-9.0 mm ID',
        
        // Tracheostomy
        tracheostomyJackson: '4-5 (7.0-8.0 ID)',
        tracheostomyISO: '7.0-9.0',
        
        // Laryngoscope
        millerBlade: '3',
        macintoshBlade: '3-4',
        
        // Balloon Dilation
        balloonLarynx: '12-14 mm',
        balloonTrachea: '12-16 mm',
        
        weightRange: '>45 kg',
        ageRange: '12-14+ years',
        notes: {
            bronchoscope: 'Full adult equipment',
            telescope: 'Standard adult scopes',
            forceps: 'Full adult instrumentation',
            ventilating: 'Adult techniques',
            tracheostomy: 'Adult sizing',
            laryngoscope: 'Adult blades'
        }
    }
};

// Main update function
function updateRecommendations() {
    const ageSelect = document.getElementById('patient-age');
    const weightInput = document.getElementById('patient-weight');
    const recommendationsDiv = document.getElementById('recommendations');
    
    let selectedAge = '';
    
    if (currentView === 'age') {
        selectedAge = ageSelect.value;
        if (!selectedAge) {
            recommendationsDiv.style.display = 'none';
            return;
        }
    } else {
        // Weight-based view
        const weight = parseFloat(weightInput.value);
        if (!weight || weight <= 0) {
            recommendationsDiv.style.display = 'none';
            return;
        }
        selectedAge = getAgeFromWeight(weight);
    }
    
    const sizing = goshAirwaySizing[selectedAge];
    if (!sizing) {
        recommendationsDiv.style.display = 'none';
        return;
    }
    
    // Update all equipment fields
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
    
    // Update GOSH Equipment
    document.getElementById('shiley-tube').textContent = sizing.shileyTube;
    document.getElementById('portex-cuffed').textContent = sizing.portexCuffed;
    document.getElementById('portex-uncuffed').textContent = sizing.portexUncuffed;
    document.getElementById('bronchoscope-storz').textContent = sizing.bronchoscopeStorz;
    document.getElementById('alder-hey-suction').textContent = sizing.alderHeySuction;
    document.getElementById('npa-size').textContent = sizing.npa;
    
    // Update Tracheostomy Tubes
    document.getElementById('trach-jackson').textContent = sizing.tracheostomyJackson;
    document.getElementById('trach-iso').textContent = sizing.tracheostomyISO;
    document.getElementById('trach-note').textContent = sizing.notes.tracheostomy;
    
    // Update Laryngoscope Blades
    document.getElementById('miller-blade').textContent = sizing.millerBlade;
    document.getElementById('macintosh-blade').textContent = sizing.macintoshBlade;
    document.getElementById('laryngoscope-note').textContent = sizing.notes.laryngoscope;
    
    // Update Balloon Dilation
    document.getElementById('balloon-larynx').textContent = sizing.balloonLarynx;
    document.getElementById('balloon-trachea').textContent = sizing.balloonTrachea;
    
    // Display recommendations
    recommendationsDiv.style.display = 'block';
    
    // Smooth scroll to recommendations
    recommendationsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
});
