
var map;
var userPosition;
var userPositionMarker;
var points = [];

const filesName = [
    "Argentina_2019",
    "Bolivia_Argentina_2018",
    "Bolivia_Peru_2020",
    "Brasil_2017",
    "Brasil_2019",
    "Brasil_2021",
    "Colombia_2016",
    "Ecuador_2014"
];
    
const colors = ["blue","purple","orange","green","darkolivegreen","seagreen","orangered","red"];

function createMap(){
    
    // crete the map
    map = L.map('map');

    // download the map image
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
}

function getUserPosition() {

    if ('geolocation' in navigator){
        console.log('geolocation available');
        navigator.geolocation.getCurrentPosition(position => {
            userPosition = position.coords;
            let lat = userPosition.latitude;
            let lng = userPosition.longitude;
            map.setView([ lat,lng ]);

            if (userPositionMarker != undefined) userPositionMarker.remove();
            userPositionMarker = L.marker([lat,lng]).addTo(map);
        });
    } else {
        alert('geolocation not available');
    }
}

async function getData(nomeArquivo) {

    let xs = [], ys = [];

    const url = `geolocationsCSV/${nomeArquivo}.csv`;
    const response = await fetch(url);
    const data = await response.text();
    const rows = data.split('\n');

    for (let row of rows){
        const cols = row.split(',');
        xs.push( parseFloat( cols[0] ));
        ys.push( parseFloat( cols[1] ));
    }

    return { xs: xs , ys: ys};
}

async function renderPoints(nomeArquivo,color){

    const data = await getData(nomeArquivo);
    const xs = data.xs;
    const ys = data.ys;
    
    let centroideX = 0;
    let centroideY = 0;

    for (let i = 0 ; i < xs.length ; i ++){

        // cria ponto sobre o mapa
        var circle = L.circle([ ys[i] , xs[i] ], {
            color: color,
            radius: 10
        }).addTo(map);

        points.push(circle);

        // calcula o centroide 
        centroideX += xs[i];
        centroideY += ys[i];
    }

    return { 
        centroideX: centroideX,
        centroideY: centroideY,
        numberPoints: xs.length
    };
    
}


// resize map when window size changes

window.addEventListener("resize", () => {
    setSizeMap();
});

function setSizeMap() {
    if (window.innerWidth < 530) {
        if (window.innerWidth < window.innerHeight) { 
            // vertical position
            document.querySelector("#map").style.width = "calc( 100% )";
            document.querySelector("#map").style.height = "calc( ( 100vw - 30px ) * 3 / 5 )";
        } else {
            // landed
            document.querySelector("#map").style.width = "calc( 100% - 30px )";
            document.querySelector("#map").style.height = "calc( ( 100vw - 30px - 30px ) * 3 / 5 )";
        }
    } else {
        document.querySelector("#map").style.width = "calc( 500px )";
        document.querySelector("#map").style.height = "calc( 300px )";
    }
}

// criar checkboxes criarOpcoesHTML
function criarOpcoesHTML() {
    const elemento = document.querySelector(".opcoes");

    for (let i = 0 ; i < filesName.length ; i++) {
        let file = filesName[i];
        let color = colors[i];

        elemento.innerHTML += `
        <div class="opcao">
            <input type="checkbox" id="${file}" name="${file}">
            <label style="color: ${color};" for="${file}">${file.replace(/_/g," ")}</label>
        </div>
        `;
    }
}


////
////
////

criarOpcoesHTML();
setSizeMap();
createMap();
map.setView([ 51.509865 , -0.118092 ], 13 );

async function renderSelected() {

    let filesSelected = 0;

    for (let file of filesName){
        let checkbox = document.getElementById(file);
        if (checkbox.checked) filesSelected++;
    }

    if ( points.length == 0 && filesSelected == 0 ) return;

    // remover pontos se houver 
    if ( points.length > 0 ) {
        points.map(el => el.remove());
        points = [];
    }

    if (filesSelected == 0) return;

    // se ha pontos para plotar...

    let centroideX = 0;
    let centroideY = 0;
    let numberPoints = 0;

    for (let i = 0 ; i < filesName.length ; i++){
        let checkbox = document.getElementById(filesName[i]);
        if (checkbox.checked) {
            let info = await renderPoints(filesName[i],colors[i]);
            centroideX += info.centroideX;
            centroideY += info.centroideY;
            numberPoints += info.numberPoints;
        }
    }

    if (numberPoints!=0) {
        centroideX = centroideX / numberPoints;
        centroideY = centroideY / numberPoints;
        map.setView([ centroideY , centroideX ],3);
    }

}










