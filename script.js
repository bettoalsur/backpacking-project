
// create the map and the marker
var map = L.map('map').setView([0, 0], 2);
//var marker = L.marker([0,0]).addTo(map);

// download the map image
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


async function getData(nomeArquivo) {

    let xs = [], ys = [];

    const url = "geolocationsCSV/"+nomeArquivo;
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

async function renderMap(nomeArquivo,color){

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

        // calcula o centroide 
        centroideX += xs[i];
        centroideX += ys[i];
    }

    centroideX = centroideX / xs.length;
    centroideY = centroideY / ys.length;

    // centra o mapa no centroide
    map.setView([ centroideY , centroideX ]);
}


// resize map when window size changes
setSizeMap();

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

////
////
////

function renderSelected() {
    const check1 = document.getElementById("Brasil_2017");
    if (check1.checked) renderMap('Brasil_2017.csv','green');
}










