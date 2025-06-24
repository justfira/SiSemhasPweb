// public/js/utils.js

function createElement(tag, classes = [], textContent = '', attributes = {}) {
    const element = document.createElement(tag);
    if (classes.length > 0) {
        element.classList.add(...classes);
    }
    if (textContent) {
        element.textContent = textContent;
    }
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

function createTable(headers, data, renderCellContent) {
    const table = createElement('table', ['user-table']);
    const thead = createElement('thead');
    const tbody = createElement('tbody');

    const headerRow = createElement('tr');
    headers.forEach(headerText => {
        const th = createElement('th', [], headerText);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach((rowData, rowIndex) => {
        const tr = createElement('tr');
        rowData.forEach((cellData, colIndex) => {
            const td = createElement('td');
            const content = renderCellContent(cellData, rowIndex, colIndex, rowData);
            if (content instanceof Node) {
                td.appendChild(content);
            } else if (content !== null && content !== undefined) {
                td.textContent = String(content);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    return table;
}