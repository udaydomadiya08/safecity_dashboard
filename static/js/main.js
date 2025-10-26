// Fetch incidents and render map + chart
let map = L.map('map').setView([12.9721,77.5933], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let markers = [];
let incidentsData = [];

async function loadData(){
  const res = await fetch('/api/incidents');
  incidentsData = await res.json();
  renderMarkers(incidentsData);
  renderChart(incidentsData);
}

function clearMarkers(){ markers.forEach(m=>map.removeLayer(m)); markers=[]; }

function renderMarkers(data){
  clearMarkers();
  const category = document.getElementById('categoryFilter').value;
  const severityCut = parseInt(document.getElementById('severityRange').value);
  document.getElementById('sevVal').innerText = severityCut;
  data.filter(d=> (category==='all' || d.category===category) && d.severity>=severityCut)
      .forEach(d=>{
        const c = (d.category==='Crime')? '#d9534f' : (d.category==='Accident')? '#f0ad4e' : '#5cb85c';
        const circle = L.circle([d.lat,d.lon],{radius: 40+ d.severity*30, color:c, fillColor:c, fillOpacity:0.5})
          .bindPopup(`<b>${d.category}</b><br>${d.description}<br><i>${d.date}</i><br>Severity: ${d.severity}`)
          .addTo(map);
        markers.push(circle);
      });
}

function renderChart(data){
  // count per date
  const counts = {};
  data.forEach(d=>{ counts[d.date] = (counts[d.date]||0)+1; });
  const labels = Object.keys(counts).sort();
  const values = labels.map(l=>counts[l]);
  const ctx = document.getElementById('trendChart').getContext('2d');
  if(window.trendChart) window.trendChart.destroy();
  window.trendChart = new Chart(ctx, {
    type:'line',
    data:{ labels: labels, datasets:[{ label:'Incidents', data: values, fill:true, tension:0.4 }]},
    options:{ responsive:true, maintainAspectRatio:false }
  });
}

document.getElementById('categoryFilter').addEventListener('change', ()=>renderMarkers(incidentsData));
document.getElementById('severityRange').addEventListener('input', ()=>renderMarkers(incidentsData));

async function loadComplaints(){
  const res = await fetch('/api/complaints');
  const complaints = await res.json();
  const ul = document.getElementById('complaintsList');
  ul.innerHTML='';
  complaints.forEach(c=>{
    const li = document.createElement('li');
    li.innerHTML = `<b>${c.title}</b> — ${c.date} <br><small>Status: ${c.status}</small>`;
    ul.appendChild(li);
  });
}

// initial load
loadData();
loadComplaints();
