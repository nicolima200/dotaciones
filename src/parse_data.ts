import fs from 'fs';

const data = `SGTO.,CARDOZO,SUSANA,Caminante,—,Adrogué: E. de Adrogué y Macias
SGTO.,CONTHE,SUSANA,Caminante,—,Adrogué: E. de Adrogué y Macias
SGTO.,MARTINEZ,TAMARA,Caminante,—,Adrogué: E. de Adrogué y Mitre // Mitre 1100
SGTO.,ELIZAUL,MARIANA,Caminante,—,Adrogué: E. de Adrogué y Mitre // Mitre 1100
SGTO.,PEREYRA,DAIANA,Caminante,—,Adrogué: E. de Adrogué e/Spiro y Av Espora
SGTO.,RODRIGUEZ,NOELIA,Caminante,—,Adrogué: E. de Adrogué e/Spiro y Av Espora
SGTO.,LEON,PABLO,Caminante,—,Adrogué: Quintana - Rosales - Pellegrini - Nother
SGTO.,SANCHEZ,JAVIER,Caminante,—,Burzaco: E. de Burzaco y Roca
SGTO.,DIAZ,ROMINA,Caminante,—,Burzaco: E. de Burzaco y Roca
SGTO.,LEDESMA,FLORENCIA,Caminante,—,Burzaco: 9 de Julio y Roca
SGTO.,ROMERO,DAIANA,Caminante,—,Burzaco: 9 de Julio y Roca
SGTO.,LAPRIETA,MARTIN,Caminante,—,Burzaco: 25 de Mayo y Lezcano
SGTO.,ROA,MARIANA,Caminante,—,San José: Altamira y Colón
SGTO.,POLLIFRONI,CINTHIA,Caminante,—,Rafael Calzada: 20 de Septiembre y San Martín
SGTO.,LOPEZ,WALTER,Caminante,—,José Mármol: Kellertas y Davel
SGTO.,RAMIREZ,LEONARDO,Caminante,—,Logchamps: Aviación e/ Rivadavia y Bolívar
SGTO.,CARIELLE,EZEQUIEL,Caminante,—,Logchamps: Aviación e/ Rivadavia y Bolívar
SGTO.,OVIEDO,JUAN,Caminante,—,Logchamps: Sarmiento y Lorenzini
SGTO.,RAMIREZ,JULIAN,Caminante,—,Logchamps: Alsina e/ Rivadavia y Aviación
SGTO.,BUSTOS,JUAN,Caminante,—,Logchamps: Alsina e/ Rivadavia y Aviación
SGTO.,CASTRO,YANINA,Caminante,—,Logchamps: Belgrano y Chiesa
SGTO.,RODRIGUEZ,YESICA,Caminante,—,Logchamps: Belgrano y Chiesa
SGTO.,ACUÑA,SILVIA,Caminante,—,Logchamps: Burgwardt e/ Chiesa y Diehl
SGTO.,ALVAREZ,BRENDA,Caminante,—,Logchamps: Burgwardt e/ Chiesa y Diehl
SGTO.,VALLEJOS,MARIA,Caminante,—,Glew: Patria y Justicia
SGTO.,PINEDA,MARIA,Caminante,—,Glew: Patria y Justicia
SGTO.,RUIZ,SOLEDAD,Móvil,25.051,ZONA 4
SGTO.,SPADA,LUCIA,Móvil,25.051,ZONA 4
SGTO.,CANTO,LAURA,Móvil,25.057,ZONA 6
SGTO.,MORGADO,ANDRES,Móvil,25.057,ZONA 6
SGTO.,OCAMPO,ROCIO,Móvil,25.059,ZONA 18
SGTO.,BARZOLA,JULIO,Móvil,25.059,ZONA 18
SGTO.,ALBARRACIN,BRAHIAN,Móvil,25.055,ZONA 29
SGTO.,MARENSKI,NAHUEL,Móvil,25.055,ZONA 29
SGTO.,PALACIOS,HECTOR,Móvil,25.052,ZONA 30
SGTO.,MESA,ALEJANDRO,Móvil,25.052,ZONA 30
SGTO.,BARRENECHE,GABRIEL,Móvil,31.699,ZONA 42
SGTO.,CENA,PAOLA,Móvil,31.699,ZONA 42
SGTO.,GAUNA,GABRIELA,Móvil,25.040,CUADRANTE 3
SGTO.,PONCE,SERGIO,Móvil,25.040,CUADRANTE 3
SGTO.,IBAÑEZ,GASTON,Módulo,—,Adrogué: AV. YRIGOYEN Y PINO
SGTO.,VAZQUEZ,JOSE,Módulo,—,Adrogué: JUNCAL Y PAZ
OSA,CARABAJAL,SERGIO,Módulo,—,Burzaco: AV ESPORA Y PODESTA
SGTO.,NOCIONI,SOLEDAD,Módulo,—,Burzaco: JOSE INGENIEROS Y BLAS PARERA
SGTO.,WIERNEZ,SOLEDAD,Módulo,—,San José: SANTA ANA Y AMENEDO
SGTO.,WEINBENDER,MARIA,Módulo,—,Rafael Calzada: ARIAS Y GUEMES
SGTO.,CARNIEL,CINTIA,Módulo,—,Rafael Calzada: CARRILLO Y RAMIREZ
SGTO.,SANDOVAL,VALERIA,Módulo,—,Claypole: 17 DE OCTUBRE Y TORRES
SGTO.,ROCHA,HECTOR,Módulo,—,Claypole: 17 DE OCTUBRE Y LACAZE
SGTO.,ESCOBAR,SONIA,Módulo,—,Glew: RUTA 210 Y CAP. OLIVERA
SGTO.,JUAREZ,ARIEL,Módulo,—,Glew: ESPORA Y REP. ARGENTINA
SGTO.,DEL AMO,FACUNDO,Módulo,—,José Mármol: CANALE Y MOLINA
OSA,BELIERA,ROMINA,Módulo,—,José Mármol: EREZCANO Y 30 DE SEPTIEMBRE
SGTO.,SILVA,CRISTIAN,Módulo,—,Solano: Av. SAN MARTIN Y EL CONDOR
SGTO.,ASTUENA,ARIEL,Módulo,—,Solano: CHARCAS Y SALABERRY
SGTO.,VILLALBA,YANINA,Módulo,—,Solano: AV LACAZE Y LIRIO
SGTO.,BRAO,LUCERO,Módulo,—,Solano: AV LACAZE Y LIRIO
OSA,FUENTES,SOLEDAD,Módulo,—,Malvinas: GUATAMBU Y SERRANO
SGTO.,RAMOA,DENIS,Módulo,—,Malvinas: MADARIAGA Y PORTUGAL
SGTO.,GONZALEZ,DAMIAN,Moto,32.502,José Mármol (06:00 a 18:00)
OSA,SOSA,DAVID,Moto,32.510,(sin localidad) (11:00 a 23:00)
—,ROMERO,LUCIO,Moto,32.510,(sin localidad) (11:00 a 23:00)
SGTO.,ORTIZ,LUIS,Moto,23.498,(sin localidad)
OSA,RUIZ,JOSE,Moto,32.506,(sin localidad)`;

const lines = data.split('\n');
const agents = [];
const qths = new Map();
const moviles = new Map();
const motos = new Map();
const garitas = new Map();
const schedules = [];

let agentIdCounter = 1;
let qthIdCounter = 1;
let movilIdCounter = 1;
let motoIdCounter = 1;
let garitaIdCounter = 1;
let scheduleIdCounter = 1;

lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length < 6) return;
    
    const jerarquia = parts[0].trim() === '—' ? '' : parts[0].trim();
    const apellido = parts[1].trim();
    const nombre = parts[2].trim();
    const funcion = parts[3].trim();
    const ro = parts[4].trim() === '—' ? '' : parts[4].trim();
    const qth = parts[5].trim();
    
    const agentName = `${jerarquia} ${apellido} ${nombre}`.trim();
    const agentId = String(agentIdCounter++);
    
    agents.push({
        id: agentId,
        name: agentName,
        turno: 1
    });
    
    let role = '';
    let targetId = '';
    
    if (funcion === 'Caminante') {
        role = 'caminante';
        if (!qths.has(qth)) {
            qths.set(qth, `q${qthIdCounter++}`);
        }
        targetId = qths.get(qth);
    } else if (funcion === 'Móvil') {
        role = 'movil';
        const movilKey = `${qth}-${ro}`;
        if (!moviles.has(movilKey)) {
            moviles.set(movilKey, { id: `m${movilIdCounter++}`, name: qth, ro: ro });
        }
        targetId = moviles.get(movilKey).id;
    } else if (funcion === 'Módulo') {
        role = 'garita';
        if (!garitas.has(qth)) {
            garitas.set(qth, `g${garitaIdCounter++}`);
        }
        targetId = garitas.get(qth);
    } else if (funcion === 'Moto') {
        role = 'motorizada';
        const motoKey = `${qth}-${ro}`;
        if (!motos.has(motoKey)) {
            motos.set(motoKey, { id: `mo${motoIdCounter++}`, name: qth, ro: ro });
        }
        targetId = motos.get(motoKey).id;
    }
    
    if (role && targetId) {
        schedules.push({
            id: String(scheduleIdCounter++),
            agentId: agentId,
            role: role,
            targetId: targetId,
            shift: 'turno1',
            startTime: '09:00',
            endTime: '21:00'
        });
    }
});

const defaultState = {
    agents: agents,
    infrastructure: {
        garitas: Array.from(garitas.entries()).map(([name, id]) => ({ id, name })),
        moviles: Array.from(moviles.values()),
        motos: Array.from(motos.values()),
        qths: Array.from(qths.entries()).map(([name, id]) => ({ id, name })),
        ordenes: [],
        comisiones: []
    },
    schedules: schedules
};

fs.writeFileSync('defaultState.json', JSON.stringify(defaultState, null, 2));
