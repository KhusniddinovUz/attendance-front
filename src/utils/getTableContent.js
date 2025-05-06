export function getTableContent(gridEl) {
  const {head, body, foot} = getGridContent(gridEl);
  return [...head, ...body, ...foot].map((cells) => cells.map(serialiseCellValue).join(',')).join('\n');
}

function getGridContent(gridEl) {
  return {
    head: getRows('.rdg-header-row'),
    body: getRows('.rdg-row:not(.rdg-summary-row)'),
    foot: getRows('.rdg-summary-row'),
  };

  function getRows(selector) {
    return Array.from(gridEl.querySelectorAll(selector)).map((gridRow) => {
      return Array.from(gridRow.querySelectorAll('.rdg-cell')).map((gridCell) => gridCell.innerText);
    });
  }
}

function serialiseCellValue(value) {
  if (typeof value === 'string') {
    const formattedValue = value.replace(/"/g, '""');
    return formattedValue.includes(',') ? `"${formattedValue}"` : formattedValue;
  }
  return value;
}
