// Airway Balloon Dilation Sizing Calculator
// Data structure for balloon dilation sizing guidelines

const balloonSizingData = {
    'premature-30': {
        age: 'Premature < 30 weeks',
        ettSize: '2.5mm',
        odEtt: '3.6 mm',
        larynxDiameter: '-',
        tracheaDiameter: '5 mm'
    },
    'premature-30-plus': {
        age: 'Premature > 30 weeks',
        ettSize: '3.0mm',
        odEtt: '4.3 mm',
        larynxDiameter: '5 mm',
        tracheaDiameter: '6 mm'
    },
    'newborn': {
        age: 'Newborn',
        ettSize: '3.5mm',
        odEtt: '4.9 mm',
        larynxDiameter: '6 mm',
        tracheaDiameter: '7 mm'
    },
    '1-year': {
        age: '1 year',
        ettSize: '4.0mm',
        odEtt: '5.6 mm',
        larynxDiameter: '6 mm',
        tracheaDiameter: '7 mm'
    },
    '2-years': {
        age: '2 years',
        ettSize: '4.5mm',
        odEtt: '6.2 mm',
        larynxDiameter: '7 mm',
        tracheaDiameter: '8-8.5 mm'
    },
    '4-years': {
        age: '4 years',
        ettSize: '5.0mm',
        odEtt: '6.9 mm',
        larynxDiameter: '8-8.5 mm',
        tracheaDiameter: '8.5-9 mm'
    },
    '6-years': {
        age: '6 years',
        ettSize: '5.5mm',
        odEtt: '7.5 mm',
        larynxDiameter: '8-9 mm',
        tracheaDiameter: '8.5-10 mm'
    },
    '8-years': {
        age: '8 years',
        ettSize: '6.0mm',
        odEtt: '8.2 mm',
        larynxDiameter: '8-9 mm',
        tracheaDiameter: '10 mm'
    },
    '10-years': {
        age: '10 years',
        ettSize: '6.5mm',
        odEtt: '8.9 mm',
        larynxDiameter: '10 mm',
        tracheaDiameter: '10-12 mm'
    },
    '12-years': {
        age: '12 years',
        ettSize: '7.0mm',
        odEtt: '9.5 mm',
        larynxDiameter: '10-12 mm',
        tracheaDiameter: '12-14 mm'
    },
    '14-years': {
        age: '14 years',
        ettSize: '7.5mm',
        odEtt: '10.2 mm',
        larynxDiameter: '12 mm',
        tracheaDiameter: '12-14 mm'
    },
    '16-years': {
        age: '16 years',
        ettSize: '8.0mm',
        odEtt: '11.0 mm',
        larynxDiameter: '12 mm',
        tracheaDiameter: '14-16 mm'
    },
    'adult-female': {
        age: 'Adult Female',
        ettSize: '7.0-8.0mm',
        odEtt: '-',
        larynxDiameter: '12-14 mm',
        tracheaDiameter: '14-16 mm'
    },
    'adult-male': {
        age: 'Adult Male',
        ettSize: '7.5-8.5mm',
        odEtt: '-',
        larynxDiameter: '14-16 mm',
        tracheaDiameter: '16-18 mm'
    }
};

function calculateBalloonSizing() {
    const ageSelect = document.getElementById('patient-age-select');
    const selectedAge = ageSelect.value;
    
    if (!selectedAge) {
        document.getElementById('balloon-result').style.display = 'none';
        return;
    }
    
    const data = balloonSizingData[selectedAge];
    
    if (data) {
        // Update result fields
        document.getElementById('ett-size').textContent = data.ettSize;
        document.getElementById('od-ett').textContent = data.odEtt;
        document.getElementById('larynx-diameter').textContent = data.larynxDiameter;
        document.getElementById('trachea-diameter').textContent = data.tracheaDiameter;
        
        // Show result box with animation
        const resultBox = document.getElementById('balloon-result');
        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Initialize AOS animations
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
});
