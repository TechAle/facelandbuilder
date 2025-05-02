var slider = document.getElementById('level-range');

noUiSlider.create(slider, {
    start: [0, 100],      // Valori iniziali: minimo e massimo
    connect: true,         // Colora l'area tra i due cursori
    range: {
        'min': 0,
        'max': 100
    },
    step: 1,               // Muove di 1 alla volta
    tooltips: true,        // Mostra i tooltip sopra i cursori
    format: {
        to: function(value) {
            return Math.round(value);
        },
        from: function(value) {
            return Number(value);
        }
    }
});

var dropRange = document.getElementById('drop-range');

noUiSlider.create(dropRange, {
    start: [0, 100],      // Valori iniziali: minimo e massimo
    connect: true,         // Colora l'area tra i due cursori
    range: {
        'min': 0,
        'max': 100
    },
    step: 1,               // Muove di 1 alla volta
    tooltips: true,        // Mostra i tooltip sopra i cursori
    format: {
        to: function(value) {
            return Math.round(value);
        },
        from: function(value) {
            return Number(value);
        }
    }
});