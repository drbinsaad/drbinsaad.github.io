// Enhanced Rigid Bronchoscopy and Airway Sizing Tool
// Integrated with GOSH Tracheal Size Charts and Comprehensive Equipment Data

// Comprehensive equipment sizing data based on patient age
const airwaySizing = {
    'premature': {
        // Bronchoscopy Equipment
        bronchoscope: '2.5 mm (ID) / 3.5 mm (OD)',
        bronchoscopeID: '2.5',
        bronchoscopeOD: '3.5',
        telescope: '2.5 mm (0°) / 3.6 mm (OD)',
        telescopeID: '2.5',
        telescopeOD: '3.6',
        ett: '2.5',
        ettOD: '3.5-3.6',
        forceps: 'None',
        suction: 'None',
        ventilating: 'Not recommended',
        
        // Anatomical Measurements
        cricoidDiameter: '3.6-4.8 mm',
        tracheaDiameter: '5 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: 'OOO (2.5 ID / 4.0 OD)',
        tracheostomyISO: '2.0-3.0',
        tracheostomyBivona: '2.5 (ID) / 4.0 (OD) / 38mm (L)',
        tracheostomyTracoe: '2.5 (ID) / 3.6 (OD) / 32mm (L)',
        
        // Laryngoscope Blades
        millerBlade: '0',
        macintoshBlade: '-',
        
        // NPA (Nasopharyngeal Airway)
        npa: '2.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '-',
        balloonTrachea: '5 mm',
        
        // Scope Fits in ETT
        scopeFitsETT: '27017 (1.9-2.2 OD)',
        
        weightRange: '<1 kg',
        notes: {
            bronchoscope: 'Smallest available size - Preterm < 1kg',
            telescope: 'Limited optical quality',
            forceps: 'None available for this size',
            ventilating: 'Use standard scope with careful ventilation',
            tracheostomy: 'Rarely required, consult neonatology - Holinger-Fearon OOO available',
            laryngoscope: 'Miller blade preferred for visualization'
        }
    },
    '0-6mo': {
        // Bronchoscopy Equipment
        bronchoscope: '3.0 mm (ID) / 4.3 mm (OD)',
        bronchoscopeID: '3.0',
        bronchoscopeOD: '4.3',
        telescope: '2.7-3.0 mm (0° or 30°)',
        telescopeID: '2.7-3.0',
        telescopeOD: '2.7-4.3',
        ett: '3.0-3.5',
        ettOD: '4.1-5.0',
        forceps: 'Optical peanut/alligator/coin (without flexible suction)',
        suction: '4F, 5F, 6F (tight)',
        ventilating: '2.5-3.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '4.8-5.8 mm',
        tracheaDiameter: '5-6 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: 'O (3.5 ID / 4.3 OD) or OOO (2.5 ID / 4.0 OD)',
        tracheostomyISO: '3.0',
        tracheostomyBivona: '2.5-3.0 (ID) / 4.0-4.7 (OD)',
        tracheostomyTracoe: '2.5-3.0 (ID) / 3.6-4.3 (OD)',
        tracheostomyHolingerFearon: 'OOO (2.5/4.0), OO (3.5/4.3)',
        
        // Laryngoscope Blades
        millerBlade: '0-1',
        macintoshBlade: '-',
        
        // NPA
        npa: '3.0 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '5-6 mm',
        balloonTrachea: '6-7 mm',
        balloonOptions: 'Boston Scientific Multilane 4.0mm (24 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '27017 (1.9-2.2 OD) or 27018 (2.7 OD)',
        
        weightRange: '1-6 kg',
        notes: {
            bronchoscope: 'Choose based on airway size - Preterm 1-2.5kg range',
            telescope: '30° provides better visualization, 27020 scope (2.9 OD) fits 3.5 ETT',
            forceps: 'Optical grasping forceps available, Fetal (10374) for smaller sizes',
            ventilating: 'Allows continuous oxygenation',
            tracheostomy: 'Jackson O or Holinger-Fearon OO/OOO most common, Tracoe Mini available',
            laryngoscope: 'Miller 0-1 for term newborns'
        }
    },
    '6-18mo': {
        // Bronchoscopy Equipment
        bronchoscope: '3.5 mm (ID) / 5.0 mm (OD)',
        bronchoscopeID: '3.5',
        bronchoscopeOD: '5.0',
        telescope: '2.9 mm (0°, 30°, or 70°)',
        telescopeID: '2.9',
        telescopeOD: '2.9',
        ett: '3.5-4.0',
        ettOD: '4.9-5.6',
        forceps: 'Optical peanut/alligator/coin (without flexible suction)',
        suction: 'None (tight fit)',
        ventilating: '3.5 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '5.8-6.5 mm',
        tracheaDiameter: '6-7 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '1 (3.0 ID / 5.0 OD / 44mm L)',
        tracheostomyISO: '3.5-4.0',
        tracheostomyBivona: '3.5-4.0 (ID) / 5.3-6.0 (OD)',
        tracheostomyTracoe: '3.5-4.0 (ID) / 4.4-6.0 (OD)',
        tracheostomyHolingerFearon: 'O (3.8/4.9)',
        
        // Laryngoscope Blades
        millerBlade: '1',
        macintoshBlade: '-',
        
        // NPA
        npa: '3.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '6-7 mm',
        balloonTrachea: '7 mm',
        balloonOptions: 'Boston Scientific Multilane 4.0-6.0mm (24 atm) or CRE 5.0mm (20 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '27020 (2.9 OD) fits 3.5-4.0 ETT',
        
        weightRange: '6-10 kg',
        notes: {
            bronchoscope: 'Good working channel - 0-6 months range',
            telescope: 'Multiple angles available, 27020 scope optimal',
            forceps: 'Adequate for most procedures',
            ventilating: 'Recommended for longer procedures',
            tracheostomy: 'Jackson 1 standard for this age, Tracoe Mini/Silcosoft available',
            laryngoscope: 'Miller 1 blade adequate'
        }
    },
    '18mo-3yr': {
        // Bronchoscopy Equipment
        bronchoscope: '4.0 mm (ID) / 6.0 mm (OD)',
        bronchoscopeID: '4.0',
        bronchoscopeOD: '6.0',
        telescope: '2.9 mm (0°, 30°, or 70°)',
        telescopeID: '2.9',
        telescopeOD: '2.9',
        ett: '4.0-4.5',
        ettOD: '5.6-6.3',
        forceps: 'Optical peanut/alligator/coin (without flexible suction)',
        suction: 'None',
        ventilating: '4.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '6.5-7.4 mm',
        tracheaDiameter: '7-8 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '1-2 (3.0-3.4 ID / 5.0-6.0 OD)',
        tracheostomyISO: '4.0-4.5',
        tracheostomyBivona: '4.0 (ID) / 6.0 (OD) / 36mm (L)',
        tracheostomyTracoe: '4.0 (ID) / 5.6-6.0 (OD)',
        
        // Laryngoscope Blades
        millerBlade: '1',
        macintoshBlade: '1.5-2',
        
        // NPA
        npa: '4.0 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '7-8.5 mm',
        balloonTrachea: '8-8.5 mm',
        balloonOptions: 'Boston Scientific Multilane 6.0-8.0mm (24 atm) or CRE 6.0-8.0mm (18-14 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '27020 (2.9 OD) fits 4.0 ETT, 27005 (4.0 OD) fits 4.5 ETT',
        
        weightRange: '10-15 kg',
        notes: {
            bronchoscope: '4.0 mm preferred for interventions - 6 months to 3 years range',
            telescope: 'Excellent visualization with 27020 or 27005 scopes',
            forceps: 'Good for foreign body removal',
            ventilating: 'Standard for this age group',
            tracheostomy: 'Jackson 1-2 or ISO 4.0-4.5, Tracoe Pediatric available',
            laryngoscope: 'Miller 1 or Macintosh 1.5-2'
        }
    },
    '3-5yr': {
        // Bronchoscopy Equipment
        bronchoscope: '4.0-4.5 mm (ID) / 6.0-6.6 mm (OD)',
        bronchoscopeID: '4.0-4.5',
        bronchoscopeOD: '6.0-6.6',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        telescopeID: '4.0',
        telescopeOD: '4.0',
        ett: '4.5-5.0',
        ettOD: '6.3-7.0',
        forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)',
        suction: '4F, 5F, 6F',
        ventilating: '4.0-5.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '7.4-8.2 mm',
        tracheaDiameter: '8-9 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '2 (3.4 ID / 6.0 OD / 51mm L)',
        tracheostomyISO: '4.5-5.0',
        tracheostomyBivona: '5.0 (ID) / 7.3 (OD) / 60mm (L)',
        tracheostomyTracoe: '4.5-5.0 (ID) / 6.5-7.1 (OD)',
        
        // Laryngoscope Blades
        millerBlade: '2',
        macintoshBlade: '2',
        
        // NPA
        npa: '4.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '8.5-9 mm',
        balloonTrachea: '8.5-9 mm',
        balloonOptions: 'Boston Scientific Multilane 8.0mm (24 atm) or CRE 8.0-9.0mm (14-8 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '27005 (4.0 OD) fits 4.5-5.0 ETT',
        
        weightRange: '15-20 kg',
        notes: {
            bronchoscope: '4.5 mm for therapeutic procedures - 3-6 years range',
            telescope: 'High-quality optics with 27005 scope',
            forceps: 'Larger working instruments with flexible suction capability',
            ventilating: 'Excellent ventilation capacity',
            tracheostomy: 'Jackson 2 or ISO 4.5-5.0, Tracoe Pediatric Long (PDL) available',
            laryngoscope: 'Miller 2 or Macintosh 2'
        }
    },
    '5-8yr': {
        // Bronchoscopy Equipment
        bronchoscope: '5.0 mm (ID) / 7.1 mm (OD)',
        bronchoscopeID: '5.0',
        bronchoscopeOD: '7.1',
        telescope: '4.0 mm (0°, 30°, or 70°)',
        telescopeID: '4.0',
        telescopeOD: '4.0',
        ett: '5.0-5.5',
        ettOD: '7.0-7.8',
        forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)',
        suction: '4F, 5F, 6F',
        ventilating: '5.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '8.2-9.0 mm',
        tracheaDiameter: '9-10 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '2-3 (3.4-4.3 ID / 6.0-8.0 OD)',
        tracheostomyISO: '5.0-5.5',
        tracheostomyBivona: '5.0-6.0 (ID) / 7.3-8.7 (OD)',
        tracheostomyTracoe: '5.0-5.5 (ID) / 7.1-7.7 (OD)',
        tracheostomyShiley: 'Pediatric Long (PDL) 5.0-5.5',
        
        // Laryngoscope Blades
        millerBlade: '2',
        macintoshBlade: '2',
        
        // NPA
        npa: '5.0-5.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '8.9-10 mm',
        balloonTrachea: '8.5-10 mm',
        balloonOptions: 'Boston Scientific CRE 9.0-10.0mm (8-7 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '27005 (4.0 OD) or 8712 (5.0 OD) fits 5.0-5.5 ETT',
        
        weightRange: '20-30 kg',
        notes: {
            bronchoscope: 'Adult-sized instruments compatible - 6-12 years range',
            telescope: 'Full range of angles with 27005 or 8712 scopes',
            forceps: 'Standard adult forceps fit',
            ventilating: 'Optimal for all procedures',
            tracheostomy: 'Jackson 2-3 or ISO 5.0-5.5, Shiley Pediatric available',
            laryngoscope: 'Miller 2 or Macintosh 2'
        }
    },
    '8-12yr': {
        // Bronchoscopy Equipment
        bronchoscope: '5.0-6.0 mm (ID) / 7.1-8.9 mm (OD)',
        bronchoscopeID: '5.0-6.5',
        bronchoscopeOD: '7.1-8.9',
        telescope: '4.0-5.0 mm (0°, 30°, or 70°)',
        telescopeID: '4.0-5.0',
        telescopeOD: '4.0-5.0',
        ett: '5.5-6.5',
        ettOD: '7.8-8.9',
        forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)',
        suction: '4F, 5F, 6F',
        ventilating: '5.0-6.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '9.0-10.7 mm',
        tracheaDiameter: '10-13 mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '3-4 (4.3-5.3 ID / 8.0-9.0 OD)',
        tracheostomyISO: '6.0-6.5',
        tracheostomyBivona: '6.0-7.0 (ID) / 8.7-10.0 (OD)',
        tracheostomyTracoe: '6.0-7.0 (ID) / 8.3-10.4 (OD)',
        tracheostomyShiley: 'Pediatric Long (PDL) 6.0-6.5',
        
        // Laryngoscope Blades
        millerBlade: '2-3',
        macintoshBlade: '2-3',
        
        // NPA
        npa: '6.0-6.5 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '10-12 mm',
        balloonTrachea: '10-12 mm',
        balloonOptions: 'Boston Scientific CRE 10.0-12.0mm (7-14 atm) or Multilane 8.0mm (24 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '8712 (5.0 OD) fits 5.5-6.0 ETT',
        
        weightRange: '30-50 kg',
        notes: {
            bronchoscope: '6.0 mm for complex procedures - 8-12 years range',
            telescope: 'Adult equipment standard with 8712 scope',
            forceps: 'Full adult instrument set',
            ventilating: 'Adult ventilation parameters',
            tracheostomy: 'Jackson 3-4 or ISO 6.0-6.5, Shiley Pediatric Long available',
            laryngoscope: 'Miller 2-3 or Macintosh 2-3'
        }
    },
    'adult': {
        // Bronchoscopy Equipment
        bronchoscope: '6.0-8.0 mm (ID) / 8.9-9.8 mm (OD)',
        bronchoscopeID: '6.0-8.0',
        bronchoscopeOD: '8.9-9.8',
        telescope: '4.0-5.0 mm (0°, 30°, or 70°)',
        telescopeID: '4.0-5.0',
        telescopeOD: '4.0-5.0',
        ett: '6.5-10.0',
        ettOD: '8.4-13.8',
        forceps: 'Full range available',
        suction: '4F, 5F, 6F',
        ventilating: '6.0-8.0 mm',
        
        // Anatomical Measurements
        cricoidDiameter: '>10.8 mm',
        tracheaDiameter: '13+ mm',
        
        // Tracheostomy Tubes
        tracheostomyJackson: '3-5 (4.3-6.2 ID / 8.0-10.0 OD)',
        tracheostomyISO: '7.0-10.0',
        tracheostomyBivona: '7.0-9.5 (ID) / 10.0-13.3 (OD)',
        tracheostomyTracoe: '7.0-10.0 (ID) / 10.4-13.8 (OD)',
        tracheostomyShiley: 'Adult 4 (5.0 ID / 9.4 OD / 62mm L)',
        
        // Laryngoscope Blades
        millerBlade: '3',
        macintoshBlade: '3',
        
        // NPA
        npa: '7.0-9.0 mm ID',
        
        // Balloon Dilation
        balloonLarynx: '12-20 mm',
        balloonTrachea: '12-20 mm',
        balloonOptions: 'Boston Scientific CRE 12.0-20.0mm (14-6 atm) or Multilane 8.0mm (24 atm)',
        
        // Scope Fits in ETT
        scopeFitsETT: '8712 (5.0 OD) fits 6.0+ ETT, 10.0 scope fits 10.0 ETT',
        
        weightRange: '>50 kg',
        notes: {
            bronchoscope: 'Standard adult sizes - 7.0-9.8 mm range available',
            telescope: 'High-definition available',
            forceps: 'Full range of instruments',
            ventilating: 'Standard adult ventilation',
            tracheostomy: 'Jackson 3-5 or ISO 7.0-10.0 based on anatomy, Tracoe Adult available',
            laryngoscope: 'Miller 3 or Macintosh 3 standard'
        }
    }
};

// Additional detailed equipment data
const detailedEquipmentData = {
    // Scope models and their specifications
    scopes: {
        '27017': { od: '1.9-2.2', fitsETT: ['2.5', '3.0'], description: 'Ultra-thin scope for premature/neonates' },
        '27018': { od: '2.7', fitsETT: ['3.0'], description: 'Thin scope for neonates' },
        '27020': { od: '2.9', fitsETT: ['3.5', '4.0'], description: 'Standard pediatric scope' },
        '27005': { od: '4.0', fitsETT: ['4.5', '5.0'], description: 'Larger pediatric scope' },
        '8712': { od: '5.0', fitsETT: ['5.5', '6.0'], description: 'Adolescent/adult scope' }
    },
    
    // Tracheostomy tube brands and models
    tracheostomyBrands: {
        jackson: {
            name: 'Jackson Teleflex - Pilling Metal',
            sizes: [
                { size: '1', id: '3.0', od: '5.0', length: '44', maxPress: '17 atm' },
                { size: '2', id: '3.4', od: '6.0', length: '51', maxPress: '17 atm' },
                { size: '3', id: '4.3', od: '8.0', length: '58', maxPress: '17 atm' },
                { size: '4', id: '5.3', od: '9.0', length: '62', maxPress: '17 atm' },
                { size: '5', id: '6.2', od: '10.0', length: '68', maxPress: '17 atm' }
            ]
        },
        holingerFearon: {
            name: 'Holinger-Fearon (Original Metal)',
            sizes: [
                { size: 'OOO', id: '2.5', od: '4.0', lengths: '26,33,40,46' },
                { size: 'OO', id: '3.5', od: '4.3', lengths: '26,33,40,46' },
                { size: 'O', id: '3.8', od: '4.9', lengths: '26,33,40,46' }
            ]
        },
        bivona: {
            name: 'Bivona Tracheostomy Tubes',
            pediatric: [
                { size: '2.5', id: '2.5', od: '4.0', length: '38' },
                { size: '3.0', id: '3.0', od: '4.7', length: '39' },
                { size: '3.5', id: '3.5', od: '5.3', length: '40' },
                { size: '4.0', id: '4.0', od: '6.0', length: '36' }
            ],
            adult: [
                { size: '5.0', id: '5.0', od: '7.3', length: '60' },
                { size: '6.0', id: '6.0', od: '8.7', length: '70' },
                { size: '7.0', id: '7.0', od: '10.0', length: '80' },
                { size: '8.0', id: '8.0', od: '11.0', length: '80' },
                { size: '9.0', id: '9.0', od: '12.0', length: '86' },
                { size: '9.5', id: '9.5', od: '13.3', length: '88' }
            ]
        },
        tracoe: {
            name: 'Tracoe Tracheostomy Tubes',
            mini: [
                { size: '2.5', id: '2.5', od: '3.6', length: '32', type: 'Mini' },
                { size: '3.0', id: '3.0', od: '4.3', length: '36', type: 'Mini' },
                { size: '3.5', id: '3.5', od: '5.0', length: '40', type: 'Mini' },
                { size: '4.0', id: '4.0', od: '5.6', length: '44', type: 'Mini' }
            ],
            silcosoft: [
                { size: '2.5', id: '2.5', od: '4.4', length: '38', type: 'Silcosoft' },
                { size: '3.0', id: '3.0', od: '4.9', length: '39', type: 'Silcosoft' },
                { size: '3.5', id: '3.5', od: '5.4', length: '40', type: 'Silcosoft' },
                { size: '4.0', id: '4.0', od: '6.0', length: '41', type: 'Silcosoft' },
                { size: '4.5', id: '4.5', od: '6.5', length: '39', type: 'Silcosoft PED' }
            ],
            pediatricLong: [
                { size: '5.0', id: '5.0', od: '7.1', length: '50', type: 'PDL' },
                { size: '5.5', id: '5.5', od: '7.7', length: '52', type: 'PDL' },
                { size: '6.0', id: '6.0', od: '8.3', length: '54', type: 'PDL' },
                { size: '6.5', id: '6.5', od: '9.0', length: '56', type: 'PDL' }
            ],
            adult: [
                { size: '4.0', id: '4.0', od: '7.2', length: '58', type: 'Adult' },
                { size: '5.0', id: '5.0', od: '8.6', length: '66', type: 'Adult' },
                { size: '6.0', id: '6.0', od: '9.2', length: '72', type: 'Adult' },
                { size: '7.0', id: '7.0', od: '10.4', length: '74', type: 'Adult' },
                { size: '8.0', id: '8.0', od: '11.4', length: '78', type: 'Adult' },
                { size: '9.0', id: '9.0', od: '12.5', length: '76', type: 'Adult' },
                { size: '10.0', id: '10.0', od: '13.8', length: '80', type: 'Adult' }
            ]
        },
        shiley: {
            name: 'Shiley Tracheostomy Tubes',
            pediatric: [
                { id: '3.0', od: '3.0', length: '4.5', od2: '30', type: 'Pediatric' },
                { id: '3.5', od: '3.5', length: '5.2', od2: '32', type: 'Pediatric' },
                { id: '4.0', od: '4.0', length: '5.9', od2: '34', type: 'Pediatric' }
            ],
            pediatricPED: [
                { id: '3.0', od: '3.0', length: '4.5', od2: '30', type: 'Pediatric (PED)' },
                { id: '3.5', od: '3.5', length: '5.2', od2: '40', type: 'Pediatric (PED)' },
                { id: '4.0', od: '4.0', length: '5.9', od2: '41', type: 'Pediatric (PED)' }
            ],
            pediatricLong: [
                { size: '5.0', id: '5.0', od: '7.1', length: '50', type: 'PDL' },
                { size: '5.5', id: '5.5', od: '7.7', length: '52', type: 'PDL' },
                { size: '6.0', id: '6.0', od: '8.3', length: '54', type: 'PDL' },
                { size: '6.5', id: '6.5', od: '9.0', length: '56', type: 'PDL' }
            ],
            adult: [
                { size: '4', id: '5.0', od: '9.4', length: '62', type: 'Adult' }
            ]
        }
    },
    
    // Balloon dilation equipment
    balloons: {
        bostonScientificMultilane: {
            name: 'Boston Scientific Multilane',
            sizes: [
                { od: '4.0', length: '40', maxPressure: '24 atm' },
                { od: '6.0', length: '40', maxPressure: '24 atm' },
                { od: '8.0', length: '40', maxPressure: '24 atm' }
            ]
        },
        bostonScientificCRE: {
            name: 'Boston Scientific CRE',
            sizes: [
                { size: '5', od: '5.0', length: '55', maxPressure: '8.0', od2: '40', length2: '20 atm' },
                { size: '6', od: '6.0', length: '40', maxPressure: '9.0', od2: '40', length2: '18 atm' },
                { size: '7', od: '7.0', length: '40', maxPressure: '10.0', od2: '40', length2: '14 atm' },
                { size: '8', od: '8.0', length: '40', maxPressure: '12.0', od2: '40', length2: '14 atm' },
                { size: '9', od: '9.0', length: '40', maxPressure: '15.0', od2: '30 or 55', length2: '8 atm' },
                { size: '10', od: '10.0', length: '40', maxPressure: '18.0', od2: '65', length2: '7 atm' },
                { size: '12', od: '12.0', length: '40', maxPressure: '20.0', od2: '55', length2: '6 atm' }
            ]
        },
        bryanMedicalAeris: {
            name: 'Bryan Medical Aeris',
            sizes: [
                { pressure: '17 atm', description: 'Standard pressure rating' }
            ]
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
    
    // Update Additional Equipment
    document.getElementById('npa-size').textContent = sizing.npa;
    
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
