const queryInput = document.querySelector("#query");      
const typeSelect = document.querySelector("#projectType");
const searchBtn  = document.querySelector("#searchBtn");   
const statusEl   = document.querySelector("#status");      
const resultsEl  = document.querySelector("#results");    

searchBtn.addEventListener("click", () => {              
  const query = queryInput.value.trim();                  
  const kind  = typeSelect.value;                         

  if (!query) {                                           
    statusEl.textContent = "Please type a city"; 
    resultsEl.innerHTML = "";                             
    return;                                               
  }

  statusEl.textContent = "Loading live data...";          
  resultsEl.innerHTML = "";                               

  fetchLiveData(kind, query);                             
});                                                        

function buildUrl(kind, query) {                            
  const trimmed = query.trim();                           
  if (kind === "weather") {                                
    const apiKey = "3ca3661fbb66dfc3df1b40c23ea3cc17";           
    return "https://api.openweathermap.org/data/2.5/weather?q=" 
           + encodeURIComponent(trimmed)                   
           + "&units=metric&appid="                
           + apiKey;                                      
  }
}

async function fetchLiveData(kind, query) {                
  try {                                                    
    const url = buildUrl(kind, query);                     

    if (!url) {                                            
      statusEl.textContent = "Unknown project type selected."; 
      return;                                              
    }

    const response = await fetch(url);                     

    if (!response.ok) {                                    
      statusEl.textContent = "The server responded with an error (" + response.status + "). Please try again.";
      return;                                              
    }

    let rawData;                                           

    if (kind === "weather") { 
      rawData = await response.json();                     
    } else {                                              
      rawData = await response.text();                     
    }

    handleApiResponse(kind, rawData);                     
  } catch (err) {                                         
    console.error(err);                                 
    statusEl.textContent = "Network problem. Check your connection or API key."; 
  }                                                   
}

function handleApiResponse(kind, rawData) {                
  let items = [];                                          

  if (kind === "weather") {                                
    items = [{                                             
      title: rawData.name || "Unknown city",               
      line1: "Temperature: " + rawData.main.temp + " °C",  
      line2: rawData.weather[0].description,               
      extra: "Humidity: " + rawData.main.humidity + "%"    
    }];
  }

  if (!items.length) {                                     
    statusEl.textContent = "No results found for that search."; 
    resultsEl.innerHTML = "";                              
    return;                                                
  }

  statusEl.textContent = "Showing " + items.length + " result(s)."; 
  renderCards(items);                                      
}

function renderCards(items) {                              
  const html = items.map(item => {                         
    return (                                               
      '<article class="result-card">' +                 
        '<h3>' + item.title + '</h3>' +        
        '<p>' + item.line1 + '</p>' +          
        '<p>' + item.line2 + '</p>' +          
        '<p class="muted">' + item.extra + '</p>' + 
      '</article>'                                   
    );
  }).join("");                                             

  resultsEl.innerHTML = html;                              
}

const apiKey = "3ca3661fbb66dfc3df1b40c23ea3cc17";
const city = "London"; 

fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    showForecast(data);
  });

  function showForecast(data) {
    const daily = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0]; 
      if (!daily[date]) daily[date] = [];
      daily[date].push(item);
    });
  
    renderForecast(daily);
  }

  function renderForecast(daily) {
    const forecastEl = document.getElementById("forecast");
    forecastEl.innerHTML = "";
  
    Object.keys(daily).slice(0, 5).forEach(date => {
      const dayData = daily[date][0]; 
      const iconUrl = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;
  
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <h3>${date}</h3>
        <img src="${iconUrl}" alt="${dayData.weather[0].description}">
        <p>Temp: ${dayData.main.temp}°C</p>
        <p>${dayData.weather[0].description}</p>
        <p>Humidity: ${dayData.main.humidity}%</p>
      `;
      forecastEl.appendChild(card);
    });
  }