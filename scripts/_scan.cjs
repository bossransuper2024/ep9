const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
['news-grid','news-view-all','news-tbody','news-row','news-pagination','renderNewsToPage'].forEach(t => {
  const i = s.indexOf(t);
  console.log(t, i >= 0 ? 'FOUND at line ' + s.slice(0, i).split('\n').length : 'NOT FOUND');
});
