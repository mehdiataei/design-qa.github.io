document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.buttons button');
    const links = {
        'Paper': '#', // @annie please update this link
        'Code': 'https://github.com/anniedoris/design_qa/',
        'Data': '#', // @annie please update this link
    };

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const buttonText = this.textContent.trim().split(' ')[1];
            if (links[buttonText]) {
                window.open(links[buttonText], '_blank');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const leaderboardButton = document.getElementById('leaderboardButton');
    leaderboardButton.addEventListener('click', function () {
        const leaderboardStart = document.getElementById('leaderboardStart');
        if (leaderboardStart) {
            leaderboardStart.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

$(document).ready(function () {
    // Fetch the table data
    fetch('public/data.json')
        .then(response => response.json())
        .then(data => {
            data.extraction.forEach(item => {
                $('#extractionTable tbody').append(`<tr><td>${item.modelName}</td><td>${item.retrievalF1BoW}</td><td>${item.compilationF1Rules}</td></tr>`);
            });

            data.comprehension.forEach(item => {
                $('#comprehensionTable tbody').append(`<tr><td>${item.modelName}</td><td>${item.definitionF1BoC}</td><td>${item.presenceACC}</td></tr>`);
            });

            data.compliance.forEach(item => {
                $('#complianceTable tbody').append(`<tr><td>${item.modelName}</td><td>${item.dimensionACC}</td><td>${item.dimensionBleu}</td><td>${item.dimensionRouge}</td><td>${item.functionalPerformanceACC}</td><td>${item.functionalPerformanceBleu}</td><td>${item.functionalPerformanceRouge}</td></tr>`);
            });

            $('#extractionTable, #comprehensionTable, #complianceTable').DataTable({
                "paging": true,
                "info": true,
                "searching": true,
                "columnDefs": [
                    { "orderable": true, "targets": "_all" }
                ]
            });

        })
        .catch(error => console.error('Error loading table data:', error));
});