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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '1',
            od: '3.0',
            length: '5.5',
            size: '44',
            odMm: '5.0',
            lengthCm: '30',
            maxPressure: '17 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '4.0',
            length: '40',
            maxPressure: '24 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: { id: '2.5', od: '3.5' },
            mallinckrodt: { id: '2.5', od: '3.6' },
            karlStorz: { scope: '27017', size: '1.9 - 2.1' }
        },
        
        // Instruments That Fit Together
        instrumentsFit: [
            {
                bronchoscopeId: '2.5',
                bronchoscopeOd: '4.2',
                telescope: '1.9 - 2.1 (27017AA)',
                flexibleSuction: '4F',
                forceps: 'None'
            },
            {
                bronchoscopeId: '2.5',
                bronchoscopeOd: '4.2',
                telescope: '2.7',
                flexibleSuction: 'None',
                forceps: 'None'
            }
        ],
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '1-2',
            od: '3.4',
            length: '6.0',
            size: '51',
            odMm: '6.0-7.0',
            lengthCm: '30',
            maxPressure: '17 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '6.0',
            length: '40',
            maxPressure: '24 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: [{ id: '3.0', od: '4.1' }, { id: '3.5', od: '4.8' }],
            mallinckrodt: [{ id: '3.0', od: '4.3' }, { id: '3.5', od: '4.9' }],
            karlStorz: [{ scope: '27018', size: '2.7' }, { scope: '27020', size: '2.9' }]
        },
        
        // Instruments That Fit Together
        instrumentsFit: [
            {
                bronchoscopeId: '3.0',
                bronchoscopeOd: '5.0',
                telescope: '2.7',
                flexibleSuction: '4F',
                forceps: 'Fetal (10374)'
            },
            {
                bronchoscopeId: '3.5',
                bronchoscopeOd: '5.7',
                telescope: '2.9',
                flexibleSuction: '4F, 5F, 6F (tight)',
                forceps: 'Optical peanut/alligator/coin (without flexible suction)'
            },
            {
                bronchoscopeId: '3.5',
                bronchoscopeOd: '5.7',
                telescope: '4.0',
                flexibleSuction: 'None',
                forceps: 'Optical peanut/alligator/coin (without flexible suction)'
            }
        ],
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '3',
            od: '4.3',
            length: '7.0',
            size: '58',
            odMm: '8.0',
            lengthCm: '30',
            maxPressure: '17 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '8.0',
            length: '40',
            maxPressure: '20 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: [{ id: '4.0', od: '5.4' }, { id: '4.5', od: '6.1' }],
            mallinckrodt: [{ id: '4.0', od: '5.6' }, { id: '4.5', od: '6.2' }],
            halyardMicrocuff: [{ id: '3.0', od: '4.3' }, { id: '3.5', od: '5.0' }],
            karlStorz: { scope: '27005', size: '4.0' }
        },
        
        // Instruments That Fit Together
        instrumentsFit: [
            {
                bronchoscopeId: '4.0',
                bronchoscopeOd: '6.7',
                telescope: '2.9',
                flexibleSuction: '4F, 5F, 6F',
                forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)'
            },
            {
                bronchoscopeId: '4.0',
                bronchoscopeOd: '6.7',
                telescope: '4.0',
                flexibleSuction: '4F, 5F',
                forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)'
            }
        ],
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '3-4',
            od: '4.3-5.5',
            length: '7.0-8.0',
            size: '58-62',
            odMm: '8.0-9.0',
            lengthCm: '30',
            maxPressure: '17 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '8.0-9.0',
            length: '40',
            maxPressure: '18-20 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: [{ id: '5.0', od: '6.8' }, { id: '5.5', od: '7.5' }],
            mallinckrodt: [{ id: '5.0', od: '6.9' }, { id: '5.5', od: '7.5' }],
            halyardMicrocuff: [{ id: '4.0', od: '5.6' }, { id: '4.5', od: '6.3' }]
        },
        
        // Instruments That Fit Together
        instrumentsFit: {
            bronchoscopeId: '4.0',
            bronchoscopeOd: '6.7',
            telescope: '4.0',
            flexibleSuction: '4F, 5F',
            forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)'
        },
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '5',
            od: '6.2',
            length: '9.0',
            size: '68',
            odMm: '10.0',
            lengthCm: '30',
            maxPressure: '17 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '10.0',
            length: '30-40',
            maxPressure: '9-14 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: { id: '6.0', od: '8.2' },
            mallinckrodt: { id: '6.0', od: '8.2' },
            halyardMicrocuff: [{ id: '5.0', od: '6.7' }, { id: '5.5', od: '7.3' }, { id: '6.0', od: '8.0' }],
            karlStorz: { scope: '8712', size: '5.0' }
        },
        
        // Instruments That Fit Together
        instrumentsFit: {
            bronchoscopeId: '4.5',
            bronchoscopeOd: '7.3',
            telescope: '4.0',
            flexibleSuction: '4F, 5F, 6F',
            forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)'
        },
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '5',
            od: '6.2',
            length: '9.0',
            size: '68',
            odMm: '10.0',
            lengthCm: '30',
            maxPressure: '17 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '10.0',
            length: '30',
            maxPressure: '9 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: { id: '6.0', od: '8.2' },
            mallinckrodt: { id: '6.0', od: '8.2' },
            halyardMicrocuff: [{ id: '5.0', od: '6.7' }, { id: '5.5', od: '7.3' }, { id: '6.0', od: '8.0' }],
            karlStorz: { scope: '8712', size: '5.0' }
        },
        
        // Instruments That Fit Together
        instrumentsFit: {
            bronchoscopeId: '4.5',
            bronchoscopeOd: '7.3',
            telescope: '4.0',
            flexibleSuction: '4F, 5F, 6F',
            forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)'
        },
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '6-9',
            od: '7.2-9.8',
            length: '10.0-13.0',
            size: '69',
            odMm: '12.0-16.0',
            lengthCm: '40',
            maxPressure: '10 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '12.0-15.0',
            length: '30-55',
            maxPressure: '8-14 atm'
        },
        
        // Scope Fits in ETT
        scopeFitsETT: {
            portex: [{ id: '6.5', od: '8.9' }, { id: '7.0', od: '9.6' }],
            mallinckrodt: [{ id: '6.5', od: '8.9' }, { id: '7.0', od: '9.5' }],
            halyardMicrocuff: [{ id: '6.5', od: '8.7' }, { id: '7.0', od: '9.3' }]
        },
        
        // Instruments That Fit Together
        instrumentsFit: {
            bronchoscopeId: '5.0',
            bronchoscopeOd: '7.8',
            telescope: '4.0',
            flexibleSuction: '4F, 5F, 6F',
            forceps: 'Optical peanut/alligator/coin (with flexible suction 4F, 5F, 6F)'
        },
        
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
        
        // Airway Balloons - Bryan Medical Aeros
        bryanBalloon: {
            id: '6-9',
            od: '7.2-9.8',
            length: '10.0-13.0',
            size: '69',
            odMm: '12.0-16.0',
            lengthCm: '40',
            maxPressure: '10 atm'
        },
        
        // Airway Balloons - Boston Scientific Mustang/CRE
        bostonBalloon: {
            od: '12.0-20.0',
            length: '30-55',
            maxPressure: '6-14 atm'
        },
        
        // Scope Fits in ETT - Adult sizing varies widely
        scopeFitsETT: null,
        
        // Instruments That Fit Together - Adult sizing
        instrumentsFit: null,
        
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
    
    // Update Airway Balloons - Bryan Medical Aeros
    if (sizing.bryanBalloon) {
        document.getElementById('bryan-id').textContent = sizing.bryanBalloon.id || '-';
        document.getElementById('bryan-od').textContent = sizing.bryanBalloon.od || '-';
        document.getElementById('bryan-length').textContent = sizing.bryanBalloon.length || '-';
        document.getElementById('bryan-size').textContent = sizing.bryanBalloon.size || '-';
        document.getElementById('bryan-od-mm').textContent = sizing.bryanBalloon.odMm || '-';
        document.getElementById('bryan-length-cm').textContent = sizing.bryanBalloon.lengthCm || '-';
        document.getElementById('bryan-max-pressure').textContent = sizing.bryanBalloon.maxPressure || '-';
    } else {
        document.getElementById('bryan-id').textContent = '-';
        document.getElementById('bryan-od').textContent = '-';
        document.getElementById('bryan-length').textContent = '-';
        document.getElementById('bryan-size').textContent = '-';
        document.getElementById('bryan-od-mm').textContent = '-';
        document.getElementById('bryan-length-cm').textContent = '-';
        document.getElementById('bryan-max-pressure').textContent = '-';
    }
    
    // Update Airway Balloons - Boston Scientific Mustang/CRE
    if (sizing.bostonBalloon) {
        document.getElementById('boston-od').textContent = sizing.bostonBalloon.od || '-';
        document.getElementById('boston-length').textContent = sizing.bostonBalloon.length || '-';
        document.getElementById('boston-max-pressure').textContent = sizing.bostonBalloon.maxPressure || '-';
    } else {
        document.getElementById('boston-od').textContent = '-';
        document.getElementById('boston-length').textContent = '-';
        document.getElementById('boston-max-pressure').textContent = '-';
    }
    
    // Update Scope Fits in ETT
    if (sizing.scopeFitsETT) {
        // Portex ETT
        if (Array.isArray(sizing.scopeFitsETT.portex)) {
            const portexValues = sizing.scopeFitsETT.portex.map(p => `${p.id}/${p.od}`).join(', ');
            document.getElementById('scope-ett-portex').textContent = portexValues;
        } else if (sizing.scopeFitsETT.portex) {
            document.getElementById('scope-ett-portex').textContent = `${sizing.scopeFitsETT.portex.id}/${sizing.scopeFitsETT.portex.od}`;
        } else {
            document.getElementById('scope-ett-portex').textContent = '-';
        }
        
        // Mallinckrodt ETT
        if (Array.isArray(sizing.scopeFitsETT.mallinckrodt)) {
            const mallinckrodtValues = sizing.scopeFitsETT.mallinckrodt.map(m => `${m.id}/${m.od}`).join(', ');
            document.getElementById('scope-ett-mallinckrodt').textContent = mallinckrodtValues;
        } else if (sizing.scopeFitsETT.mallinckrodt) {
            document.getElementById('scope-ett-mallinckrodt').textContent = `${sizing.scopeFitsETT.mallinckrodt.id}/${sizing.scopeFitsETT.mallinckrodt.od}`;
        } else {
            document.getElementById('scope-ett-mallinckrodt').textContent = '-';
        }
        
        // Halyard Microcuff
        if (Array.isArray(sizing.scopeFitsETT.halyardMicrocuff)) {
            const halyardValues = sizing.scopeFitsETT.halyardMicrocuff.map(h => `${h.id}/${h.od}`).join(', ');
            document.getElementById('scope-ett-halyard').textContent = halyardValues;
        } else if (sizing.scopeFitsETT.halyardMicrocuff) {
            document.getElementById('scope-ett-halyard').textContent = `${sizing.scopeFitsETT.halyardMicrocuff.id}/${sizing.scopeFitsETT.halyardMicrocuff.od}`;
        } else {
            document.getElementById('scope-ett-halyard').textContent = '-';
        }
        
        // Karl Storz Scope
        if (Array.isArray(sizing.scopeFitsETT.karlStorz)) {
            const karlStorzValues = sizing.scopeFitsETT.karlStorz.map(k => `${k.scope} (${k.size})`).join(', ');
            document.getElementById('scope-ett-karlstorz').textContent = karlStorzValues;
        } else if (sizing.scopeFitsETT.karlStorz) {
            document.getElementById('scope-ett-karlstorz').textContent = `${sizing.scopeFitsETT.karlStorz.scope} (${sizing.scopeFitsETT.karlStorz.size})`;
        } else {
            document.getElementById('scope-ett-karlstorz').textContent = '-';
        }
    } else {
        document.getElementById('scope-ett-portex').textContent = '-';
        document.getElementById('scope-ett-mallinckrodt').textContent = '-';
        document.getElementById('scope-ett-halyard').textContent = '-';
        document.getElementById('scope-ett-karlstorz').textContent = '-';
    }
    
    // Update Instruments That Fit Together
    const instrumentsContainer = document.getElementById('instruments-fit-container');
    if (sizing.instrumentsFit) {
        let html = '';
        const instruments = Array.isArray(sizing.instrumentsFit) ? sizing.instrumentsFit : [sizing.instrumentsFit];
        
        instruments.forEach((inst, index) => {
            html += `
                <div class="equipment-grid" style="margin-bottom: ${index < instruments.length - 1 ? '2rem' : '0'}; padding-bottom: ${index < instruments.length - 1 ? '2rem' : '0'}; border-bottom: ${index < instruments.length - 1 ? '1px solid #e0e0e0' : 'none'};">
                    <div class="equipment-item">
                        <div class="equipment-icon"><i class="fas fa-microscope"></i></div>
                        <h3>Bronchoscope</h3>
                        <div class="equipment-value">${inst.bronchoscopeId} / ${inst.bronchoscopeOd}</div>
                        <div class="equipment-note">ID / OD (mm)</div>
                    </div>
                    <div class="equipment-item">
                        <div class="equipment-icon"><i class="fas fa-eye"></i></div>
                        <h3>Telescope</h3>
                        <div class="equipment-value">${inst.telescope}</div>
                        <div class="equipment-note">Size (mm)</div>
                    </div>
                    <div class="equipment-item">
                        <div class="equipment-icon"><i class="fas fa-syringe"></i></div>
                        <h3>Flexible Suction</h3>
                        <div class="equipment-value">${inst.flexibleSuction}</div>
                        <div class="equipment-note">French size</div>
                    </div>
                    <div class="equipment-item">
                        <div class="equipment-icon"><i class="fas fa-grip-lines"></i></div>
                        <h3>Forceps</h3>
                        <div class="equipment-value" style="font-size: 0.85rem;">${inst.forceps}</div>
                        <div class="equipment-note">Type</div>
                    </div>
                </div>
            `;
        });
        
        instrumentsContainer.innerHTML = html;
        instrumentsContainer.style.display = 'block';
    } else {
        instrumentsContainer.innerHTML = '<p style="text-align: center; color: #999;">No specific instrument combinations available for this age group</p>';
        instrumentsContainer.style.display = 'block';
    }
    
    // Display recommendations
    recommendationsDiv.style.display = 'block';
    
    // Show procedure actions section
    const procedureActionsDiv = document.getElementById('procedure-actions');
    if (procedureActionsDiv) {
        procedureActionsDiv.style.display = 'block';
    }
    
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


// PDF Generation Function
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get patient information
    const ageSelect = document.getElementById('patient-age');
    const weightInput = document.getElementById('patient-weight');
    const procedureSelect = document.getElementById('procedure-type');
    const notesTextarea = document.getElementById('additional-notes');
    
    let patientAge = '';
    let patientWeight = weightInput.value || 'Not specified';
    
    if (currentView === 'age') {
        const selectedOption = ageSelect.options[ageSelect.selectedIndex];
        patientAge = selectedOption ? selectedOption.text : '';
    } else {
        patientAge = getAgeFromWeight(parseFloat(weightInput.value));
        // Convert age code to readable format
        const ageMap = {
            'premature': 'Premature',
            '0-6mo': '0-6 months',
            '6-18mo': '6-18 months',
            '18mo-3yr': '18 months - 3 years',
            '3-5yr': '3-5 years',
            '5-8yr': '5-8 years',
            '8-12yr': '8-12 years',
            'adult': 'Adult (>12 years)'
        };
        patientAge = ageMap[patientAge] || patientAge;
    }
    
    const procedureText = procedureSelect.options[procedureSelect.selectedIndex].text;
    const additionalNotes = notesTextarea.value;
    
    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Header
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AIRWAY EQUIPMENT LIST', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Pediatric Airway & Bronchoscopy', 105, 23, { align: 'center' });
    doc.setFontSize(10);
    doc.text('shahrani.me', 105, 30, { align: 'center' });
    
    // Patient Information Section
    let yPos = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr}`, 20, yPos);
    doc.text(`Time: ${timeStr}`, 120, yPos);
    
    yPos += 6;
    doc.text(`Patient Age: ${patientAge}`, 20, yPos);
    doc.text(`Weight: ${patientWeight} kg`, 120, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Procedure: ${procedureText}`, 20, yPos);
    
    // Equipment List Section
    yPos += 12;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EQUIPMENT CHECKLIST', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Get equipment data
    const selectedAge = currentView === 'age' ? ageSelect.value : getAgeFromWeight(parseFloat(weightInput.value));
    const sizing = goshAirwaySizing[selectedAge];
    
    if (sizing) {
        const equipment = [
            { name: 'Rigid Bronchoscope', value: sizing.bronchoscope },
            { name: 'Telescope', value: sizing.telescope },
            { name: 'Endotracheal Tube (ETT)', value: sizing.ett + ' (OD: ' + sizing.ettOD + ')' },
            { name: 'Optical Forceps', value: sizing.forceps },
            { name: 'Suction Catheter', value: sizing.suction },
            { name: 'Ventilating Bronchoscope', value: sizing.ventilating },
            { name: 'Shiley Tube', value: sizing.shileyTube },
            { name: 'Portex Cuffed', value: sizing.portexCuffed },
            { name: 'Portex Uncuffed', value: sizing.portexUncuffed },
            { name: 'Storz Bronchoscope', value: sizing.bronchoscopeStorz },
            { name: 'Alder Hey Suction', value: sizing.alderHeySuction },
            { name: 'NPA (Nasopharyngeal Airway)', value: sizing.npa },
            { name: 'Tracheostomy (Jackson)', value: sizing.tracheostomyJackson },
            { name: 'Tracheostomy (ISO)', value: sizing.tracheostomyISO },
            { name: 'Miller Blade', value: sizing.millerBlade },
            { name: 'Macintosh Blade', value: sizing.macintoshBlade },
            { name: 'Balloon Dilation (Larynx)', value: sizing.balloonLarynx },
            { name: 'Balloon Dilation (Trachea)', value: sizing.balloonTrachea }
        ];
        
        equipment.forEach((item, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            // Checkbox
            doc.rect(20, yPos - 3, 4, 4);
            
            // Equipment name
            doc.setFont('helvetica', 'bold');
            doc.text(item.name, 28, yPos);
            
            // Equipment value
            doc.setFont('helvetica', 'normal');
            const valueText = item.value || 'N/A';
            doc.text(valueText, 120, yPos);
            
            yPos += 7;
        });
    }
    
    // Additional Notes Section
    if (additionalNotes) {
        yPos += 5;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('ADDITIONAL NOTES', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(additionalNotes, 170);
        doc.text(splitNotes, 20, yPos);
        yPos += splitNotes.length * 5;
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Generated by shahrani.me - Pediatric Airway Sizing Tool', 105, 285, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    // Save PDF
    const filename = `Equipment_List_${patientAge.replace(/\s+/g, '_')}_${dateStr.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
}

// Print Function
function printEquipmentList() {
    // Get patient information
    const ageSelect = document.getElementById('patient-age');
    const weightInput = document.getElementById('patient-weight');
    const procedureSelect = document.getElementById('procedure-type');
    const notesTextarea = document.getElementById('additional-notes');
    
    let patientAge = '';
    let patientWeight = weightInput.value || 'Not specified';
    
    if (currentView === 'age') {
        const selectedOption = ageSelect.options[ageSelect.selectedIndex];
        patientAge = selectedOption ? selectedOption.text : '';
    } else {
        patientAge = getAgeFromWeight(parseFloat(weightInput.value));
        const ageMap = {
            'premature': 'Premature',
            '0-6mo': '0-6 months',
            '6-18mo': '6-18 months',
            '18mo-3yr': '18 months - 3 years',
            '3-5yr': '3-5 years',
            '5-8yr': '5-8 years',
            '8-12yr': '8-12 years',
            'adult': 'Adult (>12 years)'
        };
        patientAge = ageMap[patientAge] || patientAge;
    }
    
    const procedureText = procedureSelect.options[procedureSelect.selectedIndex].text;
    const additionalNotes = notesTextarea.value;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Get equipment data
    const selectedAge = currentView === 'age' ? ageSelect.value : getAgeFromWeight(parseFloat(weightInput.value));
    const sizing = goshAirwaySizing[selectedAge];
    
    // Create print window
    const printWindow = window.open('', '', 'width=800,height=600');
    
    let equipmentHTML = '';
    if (sizing) {
        const equipment = [
            { name: 'Rigid Bronchoscope', value: sizing.bronchoscope },
            { name: 'Telescope', value: sizing.telescope },
            { name: 'Endotracheal Tube (ETT)', value: sizing.ett + ' (OD: ' + sizing.ettOD + ')' },
            { name: 'Optical Forceps', value: sizing.forceps },
            { name: 'Suction Catheter', value: sizing.suction },
            { name: 'Ventilating Bronchoscope', value: sizing.ventilating },
            { name: 'Shiley Tube', value: sizing.shileyTube },
            { name: 'Portex Cuffed', value: sizing.portexCuffed },
            { name: 'Portex Uncuffed', value: sizing.portexUncuffed },
            { name: 'Storz Bronchoscope', value: sizing.bronchoscopeStorz },
            { name: 'Alder Hey Suction', value: sizing.alderHeySuction },
            { name: 'NPA (Nasopharyngeal Airway)', value: sizing.npa },
            { name: 'Tracheostomy (Jackson)', value: sizing.tracheostomyJackson },
            { name: 'Tracheostomy (ISO)', value: sizing.tracheostomyISO },
            { name: 'Miller Blade', value: sizing.millerBlade },
            { name: 'Macintosh Blade', value: sizing.macintoshBlade },
            { name: 'Balloon Dilation (Larynx)', value: sizing.balloonLarynx },
            { name: 'Balloon Dilation (Trachea)', value: sizing.balloonTrachea }
        ];
        
        equipment.forEach(item => {
            equipmentHTML += `
                <tr>
                    <td style="width: 30px; text-align: center;">☐</td>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td>${item.value || 'N/A'}</td>
                </tr>
            `;
        });
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Equipment List - ${patientAge}</title>
            <style>
                @media print {
                    @page { margin: 1cm; }
                }
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    background: #6c5ce7;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 30px;
                    border-radius: 8px;
                }
                .header h1 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .info-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .info-label {
                    font-weight: 600;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th {
                    background: #6c5ce7;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                td {
                    padding: 10px;
                    border-bottom: 1px solid #dee2e6;
                }
                tr:hover {
                    background: #f8f9fa;
                }
                .notes-section {
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #ffc107;
                    margin-top: 20px;
                }
                .notes-section h3 {
                    margin-top: 0;
                }
                .footer {
                    text-align: center;
                    color: #6c757d;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #dee2e6;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AIRWAY EQUIPMENT LIST</h1>
                <p>Pediatric Airway & Bronchoscopy</p>
                <p>shahrani.me</p>
            </div>
            
            <div class="info-section">
                <div class="info-row">
                    <span><span class="info-label">Date:</span> ${dateStr}</span>
                    <span><span class="info-label">Time:</span> ${timeStr}</span>
                </div>
                <div class="info-row">
                    <span><span class="info-label">Patient Age:</span> ${patientAge}</span>
                    <span><span class="info-label">Weight:</span> ${patientWeight} kg</span>
                </div>
                <div class="info-row">
                    <span><span class="info-label">Procedure:</span> ${procedureText}</span>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 30px;">✓</th>
                        <th>Equipment</th>
                        <th>Size/Specification</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipmentHTML}
                </tbody>
            </table>
            
            ${additionalNotes ? `
                <div class="notes-section">
                    <h3>Additional Notes:</h3>
                    <p>${additionalNotes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p>Generated by shahrani.me - Pediatric Airway Sizing Tool</p>
                <p>This equipment list is for reference only. Always verify equipment availability and compatibility.</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
    }, 250);
}
