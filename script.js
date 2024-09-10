document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.buttons button');
    const links = {
        'Paper': 'https://arxiv.org/abs/2404.07917',
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

    fetch('public/data.json')
        .then(response => response.json())
        .then(data => {
            createTable("extractionTable", data.extraction, [
                {title: "Model Name", field: "modelName"},
                {title: "Retrieval (F1 BoW)", field: "retrievalF1BoW", type: "number"},
                {title: "Compilation (F1 rules)", field: "compilationF1Rules", type: "number"}
            ]);

            createTable("comprehensionTable", data.comprehension, [
                {title: "Model Name", field: "modelName"},
                {title: "Definition (F1 BoC)", field: "definitionF1BoC", type: "number"},
                {title: "Presence (ACC)", field: "presenceACC", type: "number"}
            ]);

            createTable("complianceTable", data.compliance, [
                {title: "Model Name", field: "modelName"},
                {title: "Dimension (ACC)", field: "dimensionACC", type: "number"},
                {title: "Dimension (Bleu)", field: "dimensionBleu", type: "number"},
                {title: "Dimension (Rouge)", field: "dimensionRouge", type: "number"},
                {title: "Functional Performance (ACC)", field: "functionalPerformanceACC", type: "number"},
                {title: "Functional Performance (Bleu)", field: "functionalPerformanceBleu", type: "number"},
                {title: "Functional Performance (Rouge)", field: "functionalPerformanceRouge", type: "number"}
            ]);

            // Create charts
            createChart("extractionChart", data.extraction, [
                {title: "Model Name", field: "modelName"},
                {title: "Retrieval (F1 BoW)", field: "retrievalF1BoW"},
                {title: "Compilation (F1 rules)", field: "compilationF1Rules"}
            ]);

            createChart("comprehensionChart", data.comprehension, [
                {title: "Model Name", field: "modelName"},
                {title: "Definition (F1 BoC)", field: "definitionF1BoC"},
                {title: "Presence (ACC)", field: "presenceACC"}
            ]);

            createChart("complianceChart", data.compliance, [
                {title: "Model Name", field: "modelName"},
                {title: "Dimension (ACC)", field: "dimensionACC"},
                {title: "Dimension (Bleu)", field: "dimensionBleu"},
                {title: "Dimension (Rouge)", field: "dimensionRouge"},
                {title: "Functional Performance (ACC)", field: "functionalPerformanceACC"},
                {title: "Functional Performance (Bleu)", field: "functionalPerformanceBleu"},
                {title: "Functional Performance (Rouge)", field: "functionalPerformanceRouge"}
            ]);
        })
        .catch(error => console.error('Error loading table data:', error));
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

function createTable(elementId, data, columns) {
    const table = document.getElementById(elementId);
    table.innerHTML = '';

    const controls = document.createElement('div');
    controls.className = 'table-controls';

    const search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Search...';
    search.className = 'table-search';
    controls.appendChild(search);

    const exportButtons = document.createElement('div');
    exportButtons.className = 'export-buttons';
    ['CSV', 'JSON'].forEach(format => {
        const button = document.createElement('button');
        button.textContent = `Export ${format}`;
        button.addEventListener('click', () => exportTable(data, format));
        exportButtons.appendChild(button);
    });
    controls.appendChild(exportButtons);

    table.parentNode.insertBefore(controls, table);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach((column, index) => {
        const th = document.createElement('th');
        th.innerHTML = `${column.title} <span class="sort-icon">&#8597;</span>`;
        th.addEventListener('click', () => sortTable(table, index));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column.field];
            if (column.type === 'number') {
                td.className = 'number';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    search.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        Array.from(tbody.querySelectorAll('tr')).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const th = table.querySelector(`th:nth-child(${columnIndex + 1})`);
    const isNumeric = table.querySelector(`td:nth-child(${columnIndex + 1})`).classList.contains('number');
    
    const currentDirection = th.getAttribute('data-sort') || 'none';
    let newDirection = 'asc';
    if (currentDirection === 'asc') newDirection = 'desc';
    
    table.querySelectorAll('th').forEach(header => {
        header.setAttribute('data-sort', 'none');
        header.querySelector('.sort-icon').innerHTML = '&#8597;';
    });
    th.setAttribute('data-sort', newDirection);
    th.querySelector('.sort-icon').innerHTML = newDirection === 'asc' ? '&#9650;' : '&#9660;';

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent;
        const bValue = b.cells[columnIndex].textContent;
        
        if (isNumeric) {
            return newDirection === 'asc' 
                ? parseFloat(aValue) - parseFloat(bValue)
                : parseFloat(bValue) - parseFloat(aValue);
        } else {
            return newDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
    });

    rows.forEach(row => tbody.appendChild(row));
}

function exportTable(data, format) {
    let content;
    let filename;
    let mimeType;

    if (format === 'CSV') {
        content = data.map(row => Object.values(row).join(',')).join('\n');
        filename = 'export.csv';
        mimeType = 'text/csv;charset=utf-8;';
    } else if (format === 'JSON') {
        content = JSON.stringify(data, null, 2);
        filename = 'export.json';
        mimeType = 'application/json;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function createChart(elementId, data, columns) {
    const ctx = document.getElementById(elementId).getContext('2d');
    const labels = data.map(item => item[columns[0].field]);
    const datasets = columns.slice(1).map(column => ({
        label: column.title,
        data: data.map(item => item[column.field]),
        backgroundColor: getRandomColor(),
    }));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Model Performance Comparison'
                }
            }
        }
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}