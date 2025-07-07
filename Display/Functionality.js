// Warning: a lot of this is vibe code

const LABEL_INDEX = 1;
const CPK_INDEX = 12;

let db;
let myChart;
let currentSortColumn = null;
let currentSortAscending = true;
let cpkCutoff = 4; // CPK Cutoff - change as desired


// Get data and render table any time DB changes
document.getElementById('dbfile').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });
    db = new SQL.Database(new Uint8Array(buffer));
    
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' OR type='view';")[0];
    const tableSelect = document.getElementById('tableSelect');
    tableSelect.innerHTML = '';

    tables.values.forEach(([name]) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        if (name != 'sqlite_sequence' && name != 'Components') {
            tableSelect.appendChild(opt);
        }
    });

    renderTable();
});


// Render the table (and chart if conditions are met)
function renderTable() {
    const tableName = document.getElementById('tableSelect').value;
    if (!tableName || !db) return;

    const chartWrapper = document.getElementById('chartWrapper');
    const tableWrapper = document.getElementById('tableOutput')
    currentSortAscending = true;
    currentSortColumn = null;

    // Show chart only for "CPKView"
    if (chartWrapper) {
        chartWrapper.style.display = (tableName === 'CPKView') ? 'block' : 'none';
        tableWrapper.style.maxHeight = (tableName === 'CPKView') ? '48vh' : '82vh'
    }

    // Get data table data 
    let results;
    try {
        results = db.exec(`SELECT * FROM "${tableName}"`);
    } 
    catch (err) {
        document.getElementById('tableOutput').textContent = 'Query error: ' + err.message;
        return;
    }
    const output = document.getElementById('tableOutput');
    output.innerHTML = '';
    if (!results || results.length === 0) {
        output.textContent = 'No data.';
        return;
    }

    // Create table
    const table = document.createElement('table');
    table.border = 1;

    // Create header row
    const headerRow = document.createElement('tr');
    results[0].columns.forEach((col, colIndex) => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.cursor = 'pointer';

        th.addEventListener('click', () => {
            // Clear arrows from all headers first
            headerRow.querySelectorAll('th').forEach(header => {
                header.textContent = header.textContent.replace(/ ▲| ▼/, '');
            });

            // Toggle sort direction if same column, else default to ascending
            if (currentSortColumn === colIndex) {
                currentSortAscending = !currentSortAscending;
            } 
            else {
                currentSortColumn = colIndex;
                currentSortAscending = true;
            }

            // Add arrow to current header
            th.textContent = col + (currentSortAscending ? ' ▲' : ' ▼');

            // Sort with current sort state
            sortTableByColumn(table, currentSortColumn, currentSortAscending);
        });

        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // Create filter input row
    const filterRow = document.createElement('tr');
    results[0].columns.forEach((_, colIndex) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.dataset.col = colIndex;
        input.placeholder = 'Filter...';
        input.oninput = () => filterTable(table);
        td.appendChild(input);
        filterRow.appendChild(td);
    });
    table.appendChild(filterRow);

    // Store full data for later filtering
    const fullData = results[0].values;
    table.fullData = fullData;

    fullData.forEach(row => {
        table.appendChild(createTableRow(row));
    });

    output.appendChild(table);

    // Update chart data (get x and y axis values)
    const labels = [];
    const values = [];
    fullData.forEach(row => {
        labels.push(String(row[LABEL_INDEX])); // x-axis
        values.push(parseFloat(row[CPK_INDEX])); // y-axis
    });

    if (myChart) {
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = values;
        myChart.update();
    }
}


// Render the chart
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Instantiate chart
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                hoverBackgroundColor: 'rgba(133, 133, 133, 0.6)',
                data: [],

                // Dynamically change colour of bars depending on whether they meet CPK requirements
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value >= cpkCutoff 
                        ? 'rgba(0, 102, 204, 0.7)' 
                        : 'rgba(248, 29, 0, 0.6)';
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Label' } , ticks: { font: { size: 10 } }},
                y: { max: 5, beginAtZero: true, title: { display: true, text: 'CPK' } }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Initially hide chart
    const chartWrapper = document.getElementById('chartWrapper');
    if (chartWrapper) {
        chartWrapper.style.display = 'none';
    }
});


// Adds filtering functionality to table
function filterTable(table) {
    const filters = Array.from(table.querySelectorAll('tr:nth-child(2) input'))
        .map(input => input.value.trim().toLowerCase());

    // Remove all rows after filter row
    while (table.rows.length > 2) {
        table.deleteRow(2);
    }

    const filteredRows = [];

    // Add only matching rows
    table.fullData.forEach(row => {
        const matches = filters.every((filter, i) => {
            if (!filter) return true;

            const cellValue = row[i];
            const cellStr = String(cellValue).toLowerCase();

            if (i === 1) return cellStr.includes(filter);

            const numValue = parseFloat(cellValue);
            if (filter.startsWith('>') || filter.startsWith('<')) {
                const cmpValue = parseFloat(filter.slice(1).trim());
                if (isNaN(cmpValue) || isNaN(numValue)) return false;
                return filter.startsWith('>') ? numValue > cmpValue : numValue < cmpValue;
            }

            return cellStr.includes(filter);
        });

        if (matches) {
            filteredRows.push(row);
            table.appendChild(createTableRow(row));
        }
    });

    // Sort filteredRows if sort state is set
    if (currentSortColumn !== null) {
        filteredRows.sort((a, b) => {
            const valA = a[currentSortColumn];
            const valB = b[currentSortColumn];

            const numA = parseFloat(valA);
            const numB = parseFloat(valB);

            const isNumeric = !isNaN(numA) && !isNaN(numB);

            if (isNumeric) {
                return currentSortAscending ? numA - numB : numB - numA;
            } 
            else {
                return currentSortAscending
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            }
        });
    }

    // Clear all rows after filter row
    while (table.rows.length > 2) {
        table.deleteRow(2);
    }

    // Render filtered + sorted rows
    filteredRows.forEach(row => {
        table.appendChild(createTableRow(row));
    });

    // Update chart based on filtered rows
    if (myChart) {
        const labels = filteredRows.map(r => String(r[1]));
        const values = filteredRows.map(r => parseFloat(r[12]));
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = values;
        myChart.update();
    }

}


// Sort Table
function sortTableByColumn(table, colIndex, ascending) {
    // Get current filter values from inputs
    const filters = Array.from(table.querySelectorAll('tr:nth-child(2) input'))
        .map(input => input.value.trim().toLowerCase());

    // First, filter the full data according to current filters
    const filteredRows = table.fullData.filter(row => {
        return filters.every((filter, i) => {
            if (!filter) return true;

            const cellValue = row[i];
            const cellStr = String(cellValue).toLowerCase();

            if (i === 1) {
                return cellStr.includes(filter);
            }

            const numValue = parseFloat(cellValue);
            if (filter.startsWith('>') || filter.startsWith('<')) {
                const cmpValue = parseFloat(filter.slice(1).trim());
                if (isNaN(cmpValue) || isNaN(numValue)) return false;
                return filter.startsWith('>') ? numValue > cmpValue : numValue < cmpValue;
            }

            return cellStr.includes(filter);
        });
    });

    // Then sort filtered rows
    filteredRows.sort((a, b) => {
        const valA = a[colIndex];
        const valB = b[colIndex];

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        const isNumeric = !isNaN(numA) && !isNaN(numB);

        if (isNumeric) {
            return ascending ? numA - numB : numB - numA;
        } else {
            return ascending
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        }
    });

    // Clear all data rows (keep header + filter row)
    while (table.rows.length > 2) {
        table.deleteRow(2);
    }

    // Render filtered + sorted rows
    filteredRows.forEach(row => {
        table.appendChild(createTableRow(row));
    });

    // Update chart based on filtered & sorted rows
    if (myChart) {
        const labels = filteredRows.map(r => String(r[1]));
        const values = filteredRows.map(r => parseFloat(r[12]));
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = values;
        myChart.update();
    }
}


// Create table row
function createTableRow(row) {
    const tr = document.createElement('tr');
    const cpkValue = parseFloat(row[CPK_INDEX]);
    if (!isNaN(cpkValue) && cpkValue < cpkCutoff) {
        tr.classList.add('cpk-low');
    }

    row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
    });

    return tr;
}


// Export to pdf
async function exportToPDF() {
    const { jsPDF } = window.jspdf;

    // Temporarily expand the table output to show everything
    const tableOutput = document.getElementById('tableOutput');
    const originalMaxHeight = tableOutput.style.maxHeight;
    const originalOverflow = tableOutput.style.overflow;

    tableOutput.style.maxHeight = 'none';
    tableOutput.style.overflow = 'visible';

    // Wait a moment for reflow
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capture full content
    const canvas = await html2canvas(document.body, {
        scale: 2,
        useCORS: true
    });

    // Restore original tableOutput styles
    tableOutput.style.maxHeight = originalMaxHeight;
    tableOutput.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    // Handle multipage PDF if content is taller than one page
    let position = 0;
    while (position < imgHeight) {
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        position += pageHeight;
        if (position < imgHeight) pdf.addPage();
    }

    pdf.save('cpk_statistics.pdf');
}


// Export to CSV
function exportToCSV() {
    if (!db) {
        alert("No database loaded.");
        return;
    }

    const tableName = document.getElementById('tableSelect').value;
    if (!tableName) {
        alert("No table selected.");
        return;
    }

    let result;
    try {
        result = db.exec(`SELECT * FROM "${tableName}"`);
    } 
    
    catch (err) {
        alert("Query error: " + err.message);
        return;
    }

    if (!result || result.length === 0) {
        alert("No data to export.");
        return;
    }

    const columns = result[0].columns;
    const values = result[0].values;

    // Convert to CSV format
    const csvRows = [];
    csvRows.push(columns.join(',')); // header
    values.forEach(row => {
        const escaped = row.map(cell =>
            `"${String(cell).replace(/"/g, '""')}"`
        );
        csvRows.push(escaped.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

