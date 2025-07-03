let db;
let myChart;


// Render chart
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
        label: 'CPK',
        data: [],
        backgroundColor: 'rgba(0, 102, 204, 0.6)'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
        x: { title: { display: true, text: 'Label' } , ticks: { font: { size: 10 } }},
        y: { beginAtZero: true, title: { display: true, text: 'CPK' } }
        }
    }
    });
});


// Get DB data
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
        if (name != 'sqlite_sequence') {
            tableSelect.appendChild(opt);
        }
    });

    renderTable();
});


// Render the table
function renderTable() {
    const tableName = document.getElementById('tableSelect').value;
    if (!tableName || !db) return;

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

    const table = document.createElement('table');
    table.border = 1;

    // Create header row
    const headerRow = document.createElement('tr');
    results[0].columns.forEach((col, colIndex) => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.cursor = 'pointer';

        let ascending = true;

        th.addEventListener('click', () => {
            // Clear arrows from all headers first
            headerRow.querySelectorAll('th').forEach(header => {
                header.textContent = header.textContent.replace(/ ▲| ▼/, '');
            });

            // Add arrow to current header
            th.textContent = col + (ascending ? ' ▲' : ' ▼');

            sortTableByColumn(table, colIndex, ascending);
            ascending = !ascending; // Toggle for next click
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
        input.oninput = () => filterTable(table, results[0].columns.length);
        td.appendChild(input);
        filterRow.appendChild(td);
    });
    table.appendChild(filterRow);

    // Store full data for later filtering
    const fullData = results[0].values;
    table.fullData = fullData;

    const daughterboardIndex = results[0].columns.findIndex(c => c.toLowerCase() === 'daughterboard');
    const daughterboardSelect = document.getElementById('daughterboardSelect');
    if (daughterboardIndex !== -1 && daughterboardSelect) {
        const uniqueDbs = [...new Set(fullData.map(row => row[daughterboardIndex]))];
        daughterboardSelect.innerHTML = '<option value="ALL">All Daughterboards</option>';
        uniqueDbs.forEach(db => {
            const opt = document.createElement('option');
            opt.value = db;
            opt.textContent = db;
            daughterboardSelect.appendChild(opt);
        });
    }

    fullData.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    output.appendChild(table);

    // Update chart data (get x and y axis values)
    const labels = [];
    const values = [];
    fullData.forEach(row => {
        labels.push(String(row[1])); // x-axis
        values.push(parseFloat(row[12])); // y-axis
    });

    if (myChart) {
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = values;
        myChart.update();
    }
}


// Adds filtering functionality to table
function filterTable(table, colCount) {
    const filters = Array.from(table.querySelectorAll('tr:nth-child(2) input'))
    .map(input => input.value.toLowerCase());

    // Remove all rows after filter row
    while (table.rows.length > 2) {
        table.deleteRow(2);
    }

    // Add only matching rows
    table.fullData.forEach(row => {
        const matches = filters.every((filter, i) => {
            return !filter || String(row[i]).toLowerCase().includes(filter);
        });

        if (matches) {
            const tr = document.createElement('tr');
            row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
            });
            table.appendChild(tr);
        }
    });
}


// Filter chart by selected daughterboard
function filterByDaughterboard() {
    const selected = document.getElementById('daughterboardSelect').value;
    const table = document.querySelector('#tableOutput table');
    const headerCells = table.querySelectorAll('tr:first-child th');

    let daughterboardIndex = -1;
    let xIndex = 1;   // assuming column 1 is for labels
    let yIndex = 12;  // assuming column 12 is for chart data

    headerCells.forEach((th, i) => {
        const name = th.textContent.toLowerCase();
        if (name === 'daughterboard') daughterboardIndex = i;
        if (i === 1) xIndex = i;
        if (i === 12) yIndex = i;
    });

    if (daughterboardIndex === -1) return;

    const rows = table.querySelectorAll('tr');
    const newLabels = [];
    const newValues = [];

    for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].children;
        const cellText = cells[daughterboardIndex].textContent;

        const show = (selected === "ALL" || cellText === selected);
        rows[i].style.display = show ? '' : 'none';

        if (show) {
            const x = cells[xIndex].textContent;
            const y = parseFloat(cells[yIndex].textContent);
            if (!isNaN(y)) {
            newLabels.push(x);
            newValues.push(y);
            }
        }
    }

    // Update the chart
    if (myChart) {
        myChart.data.labels = newLabels;
        myChart.data.datasets[0].data = newValues;
        myChart.update();
    }
}

function sortTableByColumn(table, colIndex, ascending) {
    const dataRows = table.fullData.slice(); // Clone the array

    dataRows.sort((a, b) => {
        const valA = a[colIndex];
        const valB = b[colIndex];

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        const isNumeric = !isNaN(numA) && !isNaN(numB);

        if (isNumeric) {
            return ascending ? numA - numB : numB - numA;
        } 
        
        else {
            return ascending
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        }
    });

    // Update the table display
    while (table.rows.length > 2) {
        table.deleteRow(2);
    }

    dataRows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    table.fullData = dataRows;

    // Re-apply daughterboard filter if needed
    filterByDaughterboard();
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
