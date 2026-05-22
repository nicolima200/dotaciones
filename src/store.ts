import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AppState, Agent, Infrastructure, Schedule, Shift, RoleType, InfrastructureItem } from './types';

export const defaultState: AppState = {
  "agents": [
    {
      "id": "1",
      "name": "SGTO. CARDOZO SUSANA",
      "turno": 1
    },
    {
      "id": "2",
      "name": "SGTO. CONTHE SUSANA",
      "turno": 1
    },
    {
      "id": "3",
      "name": "SGTO. MARTINEZ TAMARA",
      "turno": 1
    },
    {
      "id": "4",
      "name": "SGTO. ELIZAUL MARIANA",
      "turno": 1
    },
    {
      "id": "5",
      "name": "SGTO. PEREYRA DAIANA",
      "turno": 1
    },
    {
      "id": "6",
      "name": "SGTO. RODRIGUEZ NOELIA",
      "turno": 1
    },
    {
      "id": "7",
      "name": "SGTO. LEON PABLO",
      "turno": 1
    },
    {
      "id": "8",
      "name": "SGTO. SANCHEZ JAVIER",
      "turno": 1
    },
    {
      "id": "9",
      "name": "SGTO. DIAZ ROMINA",
      "turno": 1
    },
    {
      "id": "10",
      "name": "SGTO. LEDESMA FLORENCIA",
      "turno": 1
    },
    {
      "id": "11",
      "name": "SGTO. ROMERO DAIANA",
      "turno": 1
    },
    {
      "id": "12",
      "name": "SGTO. LAPRIETA MARTIN",
      "turno": 1
    },
    {
      "id": "13",
      "name": "SGTO. ROA MARIANA",
      "turno": 1
    },
    {
      "id": "14",
      "name": "SGTO. POLLIFRONI CINTHIA",
      "turno": 1
    },
    {
      "id": "15",
      "name": "SGTO. LOPEZ WALTER",
      "turno": 1
    },
    {
      "id": "16",
      "name": "SGTO. RAMIREZ LEONARDO",
      "turno": 1
    },
    {
      "id": "17",
      "name": "SGTO. CARIELLE EZEQUIEL",
      "turno": 1
    },
    {
      "id": "18",
      "name": "SGTO. OVIEDO JUAN",
      "turno": 1
    },
    {
      "id": "19",
      "name": "SGTO. RAMIREZ JULIAN",
      "turno": 1
    },
    {
      "id": "20",
      "name": "SGTO. BUSTOS JUAN",
      "turno": 1
    },
    {
      "id": "21",
      "name": "SGTO. CASTRO YANINA",
      "turno": 1
    },
    {
      "id": "22",
      "name": "SGTO. RODRIGUEZ YESICA",
      "turno": 1
    },
    {
      "id": "23",
      "name": "SGTO. ACUÑA SILVIA",
      "turno": 1
    },
    {
      "id": "24",
      "name": "SGTO. ALVAREZ BRENDA",
      "turno": 1
    },
    {
      "id": "25",
      "name": "SGTO. VALLEJOS MARIA",
      "turno": 1
    },
    {
      "id": "26",
      "name": "SGTO. PINEDA MARIA",
      "turno": 1
    },
    {
      "id": "27",
      "name": "SGTO. RUIZ SOLEDAD",
      "turno": 1
    },
    {
      "id": "28",
      "name": "SGTO. SPADA LUCIA",
      "turno": 1
    },
    {
      "id": "29",
      "name": "SGTO. CANTO LAURA",
      "turno": 1
    },
    {
      "id": "30",
      "name": "SGTO. MORGADO ANDRES",
      "turno": 1
    },
    {
      "id": "31",
      "name": "SGTO. OCAMPO ROCIO",
      "turno": 1
    },
    {
      "id": "32",
      "name": "SGTO. BARZOLA JULIO",
      "turno": 1
    },
    {
      "id": "33",
      "name": "SGTO. ALBARRACIN BRAHIAN",
      "turno": 1
    },
    {
      "id": "34",
      "name": "SGTO. MARENSSI NAHUEL",
      "turno": 1
    },
    {
      "id": "35",
      "name": "SGTO. PALACIOS HECTOR",
      "turno": 1
    },
    {
      "id": "36",
      "name": "SGTO. MESA ALEJANDRO",
      "turno": 1
    },
    {
      "id": "37",
      "name": "SGTO. BARRENECHE GABRIEL",
      "turno": 1
    },
    {
      "id": "38",
      "name": "SGTO. CENA PAOLA",
      "turno": 1
    },
    {
      "id": "39",
      "name": "SGTO. GAUNA GABRIELA",
      "turno": 1
    },
    {
      "id": "40",
      "name": "SGTO. PONCE SERGIO",
      "turno": 1
    },
    {
      "id": "41",
      "name": "SGTO. IBAÑEZ GASTON",
      "turno": 1
    },
    {
      "id": "42",
      "name": "SGTO. VAZQUEZ JOSE",
      "turno": 1
    },
    {
      "id": "43",
      "name": "OSA CARABAJAL SERGIO",
      "turno": 1
    },
    {
      "id": "44",
      "name": "SGTO. NOCIONI SOLEDAD",
      "turno": 1
    },
    {
      "id": "45",
      "name": "SGTO. WIERNEZ SOLEDAD",
      "turno": 1
    },
    {
      "id": "46",
      "name": "SGTO. WEINBENDER MARIA",
      "turno": 1
    },
    {
      "id": "47",
      "name": "SGTO. CARNIEL CINTIA",
      "turno": 1
    },
    {
      "id": "48",
      "name": "SGTO. SANDOVAL VALERIA",
      "turno": 1
    },
    {
      "id": "49",
      "name": "SGTO. ROCHA HECTOR",
      "turno": 1
    },
    {
      "id": "50",
      "name": "SGTO. ESCOBAR SONIA",
      "turno": 1
    },
    {
      "id": "51",
      "name": "SGTO. JUAREZ ARIEL",
      "turno": 1
    },
    {
      "id": "52",
      "name": "SGTO. DEL AMO FACUNDO",
      "turno": 1
    },
    {
      "id": "53",
      "name": "OSA BELIERA ROMINA",
      "turno": 1
    },
    {
      "id": "54",
      "name": "SGTO. SILVA CRISTIAN",
      "turno": 1
    },
    {
      "id": "55",
      "name": "SGTO. ASTUENA ARIEL",
      "turno": 1
    },
    {
      "id": "56",
      "name": "SGTO. VILLALBA YANINA",
      "turno": 1
    },
    {
      "id": "57",
      "name": "SGTO. BRAO LUCERO",
      "turno": 1
    },
    {
      "id": "58",
      "name": "OSA FUENTES SOLEDAD",
      "turno": 1
    },
    {
      "id": "59",
      "name": "SGTO. RAMOA DENIS",
      "turno": 1
    },
    {
      "id": "60",
      "name": "SGTO. GONZALEZ DAMIAN",
      "turno": 1
    },
    {
      "id": "61",
      "name": "OSA SOSA DAVID",
      "turno": 1
    },
    {
      "id": "62",
      "name": "ROMERO LUCIO",
      "turno": 1
    },
    {
      "id": "63",
      "name": "SGTO. ORTIZ LUIS",
      "turno": 1
    },
    {
      "id": "64",
      "name": "OSA RUIZ JOSE",
      "turno": 1
    },
    {
      "id": "65",
      "name": "OFL. PPL ACOSTA JORGE",
      "legajo": "",
      "turno": 2
    },
    {
      "id": "66",
      "name": "SGTO PAVON DEBORA",
      "legajo": "497944",
      "turno": 2
    },
    {
      "id": "67",
      "name": "OSA OJEDA ANDREA",
      "legajo": "497929",
      "turno": 2
    },
    {
      "id": "68",
      "name": "SGTO TORRENT DANIEL",
      "legajo": "483831",
      "turno": 2
    },
    {
      "id": "69",
      "name": "SGTO CEPEDA MATIAS",
      "legajo": "470111",
      "turno": 2
    },
    {
      "id": "70",
      "name": "OSA MONTENEGRO ALEJANDRO",
      "legajo": "470322",
      "turno": 2
    },
    {
      "id": "71",
      "name": "SGTO RUIZ DIAZ LUIS",
      "legajo": "498001",
      "turno": 2
    },
    {
      "id": "72",
      "name": "SGTO ROCHA ARISPE HERNAN",
      "legajo": "496069",
      "turno": 2
    },
    {
      "id": "73",
      "name": "OFL MONTANI JONATHAN",
      "legajo": "496032",
      "turno": 2
    },
    {
      "id": "74",
      "name": "SGTO GARCIA BRIAN",
      "legajo": "497914",
      "turno": 2
    },
    {
      "id": "75",
      "name": "SGTO LAZARTE JESICA",
      "legajo": "493547",
      "turno": 2
    },
    {
      "id": "76",
      "name": "SGTO CORBALAN JORGE",
      "legajo": "470136",
      "turno": 2
    },
    {
      "id": "77",
      "name": "SGTO AYALA MELINA",
      "legajo": "470046",
      "turno": 2
    },
    {
      "id": "78",
      "name": "SGTO ESCARABELLO BRENDA",
      "legajo": "470145",
      "turno": 2
    },
    {
      "id": "79",
      "name": "OFL MALDONADO GONZALO",
      "legajo": "430552",
      "turno": 2
    },
    {
      "id": "80",
      "name": "SGTO CASTILLO MARTIN",
      "legajo": "470104",
      "turno": 2
    },
    {
      "id": "81",
      "name": "SGTO GONZALEZ FLORENCIA",
      "legajo": "470205",
      "turno": 2
    },
    {
      "id": "82",
      "name": "SGTO VILLACORTA DIEGO",
      "legajo": "483839",
      "turno": 2
    },
    {
      "id": "83",
      "name": "SGTO PINTOS NATALIA",
      "legajo": "470382",
      "turno": 2
    },
    {
      "id": "84",
      "name": "SGTO TILLERIA ROMINA",
      "legajo": "470477",
      "turno": 2
    },
    {
      "id": "85",
      "name": "SGTO GOMEZ NARA",
      "legajo": "470200",
      "turno": 2
    },
    {
      "id": "86",
      "name": "SGTO PINTOS NANCY",
      "legajo": "497956",
      "turno": 2
    },
    {
      "id": "87",
      "name": "SGTO OLIVIERI IGNACIO",
      "legajo": "497334",
      "turno": 2
    },
    {
      "id": "88",
      "name": "SGTO MARTINEZ VICTOR",
      "legajo": "470299",
      "turno": 2
    },
    {
      "id": "89",
      "name": "SGTO LEIS YAMILA",
      "legajo": "483745",
      "turno": 2
    },
    {
      "id": "90",
      "name": "SGTO RODRÍGUEZ MELINA",
      "legajo": "470411",
      "turno": 2
    },
    {
      "id": "91",
      "name": "SUBTTE PEREYRA DAMIAN",
      "legajo": "402391",
      "turno": 2
    },
    {
      "id": "92",
      "name": "SGTO ROMERO MÍRIAM",
      "legajo": "483810",
      "turno": 2
    },
    {
      "id": "93",
      "name": "OFL PEREYRA NOELIA",
      "legajo": "483792",
      "turno": 2
    },
    {
      "id": "94",
      "name": "OFL SEPULVEDA CARLA",
      "legajo": "470458",
      "turno": 2
    },
    {
      "id": "95",
      "name": "SUBTTE ZARATE BELEN",
      "legajo": "190686",
      "turno": 2
    },
    {
      "id": "96",
      "name": "O.A GODOY PATRICIA",
      "legajo": "493515",
      "turno": 2
    },
    {
      "id": "97",
      "name": "SGTO LOBO NOELIA",
      "legajo": "470271",
      "turno": 2
    },
    {
      "id": "98",
      "name": "SGTO PAIS GUILLERMO",
      "legajo": "483783",
      "turno": 2
    },
    {
      "id": "99",
      "name": "SGTO GARCÍA MARCELA",
      "legajo": "470174",
      "turno": 2
    },
    {
      "id": "100",
      "name": "SGTO MONASTERIO JOHANA",
      "legajo": "470321",
      "turno": 2
    },
    {
      "id": "101",
      "name": "OFL FERNANDEZ BUSTOS DAMIAN",
      "legajo": "427989",
      "turno": 2
    },
    {
      "id": "102",
      "name": "SGTO YFRAN LAURA",
      "legajo": "470512",
      "turno": 2
    },
    {
      "id": "103",
      "name": "SGTO COSTA VALERIA",
      "legajo": "493471",
      "turno": 2
    },
    {
      "id": "104",
      "name": "SGTO VALENZUELA MACARENA",
      "legajo": "419659",
      "turno": 2
    },
    {
      "id": "105",
      "name": "SGTO AYALA ALDO",
      "legajo": "483668",
      "turno": 2
    },
    {
      "id": "106",
      "name": "SGTO AGUILAR JULIANA",
      "legajo": "470008",
      "turno": 2
    },
    {
      "id": "107",
      "name": "SGTO RODRIGUEZ NICOLAS",
      "legajo": "470412",
      "turno": 2
    },
    {
      "id": "108",
      "name": "SGTO FERRER JUAN",
      "legajo": "470159",
      "turno": 2
    },
    {
      "id": "109",
      "name": "OSA SERNA CARLOS",
      "legajo": "498014",
      "turno": 2
    },
    {
      "id": "110",
      "name": "SGTO TOJA PABLO",
      "legajo": "483830",
      "turno": 2
    },
    {
      "id": "111",
      "name": "OFL SOSA BRIAN",
      "legajo": "498123",
      "turno": 2
    },
    {
      "id": "112",
      "name": "SGTO TORRELLES MAXIMILIANO",
      "legajo": "498025",
      "turno": 2
    },
    {
      "id": "113",
      "name": "SGTO FLEYTA BRIAN",
      "legajo": "470165",
      "turno": 2
    },
    {
      "id": "114",
      "name": "SGTO ROMANY MAYRA",
      "legajo": "470420",
      "turno": 2
    },
    {
      "id": "115",
      "name": "SGTO ALBARRACIN GASTON",
      "legajo": "470016",
      "turno": 2
    },
    {
      "id": "116",
      "name": "OFL LUGONES FACUNDO",
      "legajo": "470277",
      "turno": 2
    },
    {
      "id": "117",
      "name": "OSA MEZA RODRIGO",
      "legajo": "483769",
      "turno": 2
    },
    {
      "id": "118",
      "name": "SGTO GARCÍA ROCÍO",
      "legajo": "493508",
      "turno": 2
    },
    {
      "id": "119",
      "name": "SGTO LEIVA MARIA",
      "legajo": "497921",
      "turno": 2
    },
    {
      "id": "120",
      "name": "OSA AZUAGA JESICA",
      "legajo": "470049",
      "turno": 2
    },
    {
      "id": "121",
      "name": "SGTO RUIZ YÉSICA",
      "legajo": "483814",
      "turno": 2
    },
    {
      "id": "122",
      "name": "SGTO VILLALBA MAURO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "123",
      "name": "SGTO GOMEZ CARLA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "124",
      "name": "SGTO ACOSTA LUCAS",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "125",
      "name": "SGTO MARTINEZ SERGIO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "126",
      "name": "SGTO SANDOBAL MARIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "127",
      "name": "SGTO RODRIGUEZ DANIELA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "128",
      "name": "SGTO GONZALEZ NOELIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "129",
      "name": "SGTO AMAYA NELSON",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "130",
      "name": "SGTO LIENDO LEONARDO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "131",
      "name": "SGTO LOPEZ GERMAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "132",
      "name": "SGTO AREVALO ANGEL",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "133",
      "name": "SGTO BERNALLA MATIAS",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "134",
      "name": "OSA FERNANDEZ FLAVIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "135",
      "name": "OSA BILLORDO DORA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "136",
      "name": "SGTO BORRELIMAXMILIANO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "137",
      "name": "OFL MAIBRODA MICAELA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "138",
      "name": "CAPITAN ORTIZ MARCELO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "139",
      "name": "SGTO MARQUEZ DAMIAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "140",
      "name": "SGTO BENITEZ DAMIAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "141",
      "name": "SGTO PEREZ PINTO JOEL",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "142",
      "name": "SGTO VARGAS MIRIAM",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "143",
      "name": "SGTO QUINTEROS HERNAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "144",
      "name": "SGTO HEREÑU FACUNDO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "145",
      "name": "SGTO LAZARTE CLAUDIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "146",
      "name": "SGTO OLMAR ROMINA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "147",
      "name": "SGTO AGUIRRE LEONELA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "148",
      "name": "SGTO CRUZ ROMINA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "149",
      "name": "SGTO AGUILAR DEBORA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "150",
      "name": "OFL CIBER ROSANA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "151",
      "name": "SGTO GONZALEZ VICTORIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "152",
      "name": "SGTO BERLE DANIEL",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "153",
      "name": "SGTO ECHAVARRIA CAMILA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "154",
      "name": "SGTO ZENIQUEL NOELIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "155",
      "name": "SGTO BAEZ LEONARDO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "156",
      "name": "SGTO BENITEZ MIGUEL",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "157",
      "name": "SGTO ROMERO MARCELA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "158",
      "name": "SGTO TORRES SILVANA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "159",
      "name": "SGTO GALARZA MICAELA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "160",
      "name": "SGTO HENRIQUEZ DAJANA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "161",
      "name": "SGTO MORAN JULIAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "162",
      "name": "SGTO BARRIENTO KEVIN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "163",
      "name": "SGTO VERON BRIAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "164",
      "name": "SGTO OJEDA RODRIGO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "165",
      "name": "SGTO GODOY NATALIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "166",
      "name": "SGTO. MARTINEZ MARIANA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "167",
      "name": "OFL FRANCO JULIETA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "168",
      "name": "OFL FERREYRA CLAUDIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "169",
      "name": "SGTO MEDINA DEBORA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "170",
      "name": "SGTO DIAZ CARLA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "171",
      "name": "SGTO SILVA DIEGO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "172",
      "name": "SGTO SALINAS CAMILA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "173",
      "name": "SGTO SOSA CECILIA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "174",
      "name": "SGTO LEDESMA ELVIRA",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "175",
      "name": "SGTO NUÑEZ NANCY",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "176",
      "name": "SGTO GUERRA LIONEL",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "177",
      "name": "OFL ALBORNOZ MARIANO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "178",
      "name": "SGTO LACUNZA HERNAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "179",
      "name": "OSA GAURISSO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "180",
      "name": "SGTO MONTIEL DIEGO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "181",
      "name": "SGTO GAURISSO",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "182",
      "name": "SGTO MANSILLA CRISTIAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "183",
      "name": "SGTO BROCOLI A",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "184",
      "name": "SGTO RODRIGUEZ ESTEBAN",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "185",
      "name": "OFL CUELLO L",
      "legajo": "",
      "turno": 3
    },
    {
      "id": "186",
      "name": "OSI CARDOZO WALTER",
      "legajo": "180.735",
      "turno": 4
    },
    {
      "id": "187",
      "name": "OSA AGUIRRE MELINA",
      "legajo": "470.013",
      "turno": 4
    },
    {
      "id": "188",
      "name": "SGTO MERELES CARLA",
      "legajo": "470.311",
      "turno": 4
    },
    {
      "id": "189",
      "name": "SGTO ROLON DAVID",
      "legajo": "470.419",
      "turno": 4
    },
    {
      "id": "190",
      "name": "SGTO CARRIZO MARIO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "191",
      "name": "SGTO GODOY ROCIO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "192",
      "name": "SGTO ALMIRON MARCELO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "193",
      "name": "SGTO SOTO CEJAS SONIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "194",
      "name": "SGTO SPANHAKE JUAN",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "195",
      "name": "SGTO GOMEZ KARINA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "196",
      "name": "STTE NAVARRO RICARDO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "197",
      "name": "SGTO ALBA LEON JONATHAN",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "198",
      "name": "SGTO CABRERA CECILIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "199",
      "name": "SGTO CASTILLO CELIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "200",
      "name": "OFL BLANCO LUCAS",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "201",
      "name": "SGTO GÓMEZ JULIANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "202",
      "name": "SGTO FIGOLI ADRIANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "203",
      "name": "SGTO GONZALEZ CLAUDIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "204",
      "name": "SGTO TORRES MAXIMILIANO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "205",
      "name": "SGTO CABRERA SILVIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "206",
      "name": "SGTO CARBALLO ELIANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "207",
      "name": "AYTE GAMARRA MARIANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "208",
      "name": "OSA RAMOS LUCIANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "209",
      "name": "OFL HERRERA VALERIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "210",
      "name": "SGTO CELEDON ETHEL",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "211",
      "name": "SGTO VELEZ SARA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "212",
      "name": "SGTO BELIERA MARIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "213",
      "name": "SGTO SEGOVIA SONIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "214",
      "name": "SGTO ROMERO JAQUELINE",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "215",
      "name": "SGTO SALAS FLORENCIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "216",
      "name": "OFL GAUTO SILVANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "217",
      "name": "SGTO BRITEZ DAIANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "218",
      "name": "OFL AMARILLO JONATHAN",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "219",
      "name": "STTE AMAYA CINTIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "220",
      "name": "SGTO ALVARENGA DANIELA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "221",
      "name": "SGTO MEDINA YESICA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "222",
      "name": "SGTO RIVAROLA YESICA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "223",
      "name": "SGTO NIEVA MARTA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "224",
      "name": "SGTO FERREYRA CINTIA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "225",
      "name": "SGTO RAMIREZ BECERRA JANET",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "226",
      "name": "SGTO BURGUETE VERONICA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "227",
      "name": "SGTO CASCO JIMENA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "228",
      "name": "SGTO CABRAL IVAN",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "229",
      "name": "SGTO SCORSA PABLO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "230",
      "name": "SGTO CORONEL EMMANUEL",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "231",
      "name": "SGTO BISCOCHEA YANINA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "232",
      "name": "SGTO TARASIUK IVANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "233",
      "name": "SGTO PEINADO ANA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "234",
      "name": "OSA MARTIN PAMELA",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "235",
      "name": "OFL HONNEKER MARCELO",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "236",
      "name": "OFL LEGUIZAMON JONATHAN",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "237",
      "name": "SGTO MAYDANA SAMUEL",
      "legajo": "",
      "turno": 4
    },
    {
      "id": "238",
      "name": "SGTO MARTINEZ SONIA",
      "legajo": "",
      "turno": 4
    }
  ],
  "infrastructure": {
    "garitas": [
      {
        "id": "g1",
        "name": "Adrogué: AV. YRIGOYEN Y PINO"
      },
      {
        "id": "g2",
        "name": "Adrogué: JUNCAL Y PAZ"
      },
      {
        "id": "g3",
        "name": "Burzaco: AV ESPORA Y PODESTA"
      },
      {
        "id": "g4",
        "name": "Burzaco: JOSE INGENIEROS Y BLAS PARERA"
      },
      {
        "id": "g5",
        "name": "San José: SANTA ANA Y AMENEDO"
      },
      {
        "id": "g6",
        "name": "Rafael Calzada: ARIAS Y GUEMES"
      },
      {
        "id": "g7",
        "name": "Rafael Calzada: CARRILLO Y RAMIREZ"
      },
      {
        "id": "g8",
        "name": "Claypole: 17 DE OCTUBRE Y TORRES"
      },
      {
        "id": "g9",
        "name": "Claypole: 17 DE OCTUBRE Y LACAZE"
      },
      {
        "id": "g10",
        "name": "Glew: RUTA 210 Y CAP. OLIVERA"
      },
      {
        "id": "g11",
        "name": "Glew: ESPORA Y REP. ARGENTINA"
      },
      {
        "id": "g12",
        "name": "José Mármol: CANALE Y MOLINA"
      },
      {
        "id": "g13",
        "name": "José Mármol: EREZCANO Y 30 DE SEPTIEMBRE"
      },
      {
        "id": "g14",
        "name": "Solano: Av. SAN MARTIN Y EL CONDOR"
      },
      {
        "id": "g15",
        "name": "Solano: CHARCAS Y SALABERRY"
      },
      {
        "id": "g16",
        "name": "Solano: AV LACAZE Y LIRIO"
      },
      {
        "id": "g17",
        "name": "Malvinas: GUATAMBU Y SERRANO"
      },
      {
        "id": "g18",
        "name": "Malvinas: MADARIAGA Y PORTUGAL"
      },
      {
        "id": "ga_1776349746415_chmfurbn3",
        "name": "OÑATIVIA"
      },
      {
        "id": "ga_1776349746415_bu9gklxe4",
        "name": "POLIDEPORTIVO"
      },
      {
        "id": "ga_1776349746416_99chq163f",
        "name": "EREZCANO Y 30 SEPTIEMBRE"
      },
      {
        "id": "ga_1776349746416_rkotemj6q",
        "name": "SAN MARTIN Y CONDOR"
      },
      {
        "id": "ga_1776349746416_a176izq05",
        "name": "M. MONTEVERDE Y 24"
      },
      {
        "id": "ga_1776349746416_f33vggdrp",
        "name": "COLECTORA CLAYPOLE"
      },
      {
        "id": "ga_1776349746416_yj479olwc",
        "name": "M. PARQUE INDUSTRIAL"
      },
      {
        "id": "ga_1776349746416_fot7zmw9m",
        "name": "MOLINA Y CANALE"
      },
      {
        "id": "ga_1776349746416_bduxv0t7r",
        "name": "M. ESPORA Y PODESTA"
      },
      {
        "id": "ga_1776349746416_b21lpzkb7",
        "name": "CAPITAN OLIVERA Y RUTA 210"
      },
      {
        "id": "ga_1776349746416_9zncz8kl7",
        "name": "HIDRAULICA"
      },
      {
        "id": "ga_1776349746417_49b9iqjk0",
        "name": "ESPORA Y REPUBLICA"
      },
      {
        "id": "ga_1776349746418_gd9tooekh",
        "name": "BLAS PAREDA Y JOSE INGENIEROS"
      },
      {
        "id": "ga_1776349746418_wabr7c9zk",
        "name": "RUTA 210 Y CAP. OLMERA"
      }
    ],
    "moviles": [
      {
        "id": "m1",
        "name": "ZONA 4",
        "ro": "25.051"
      },
      {
        "id": "m2",
        "name": "ZONA 6",
        "ro": "25.057"
      },
      {
        "id": "m3",
        "name": "ZONA 18",
        "ro": "25.059"
      },
      {
        "id": "m4",
        "name": "ZONA 29",
        "ro": "25.055"
      },
      {
        "id": "m5",
        "name": "ZONA 30",
        "ro": "25.052"
      },
      {
        "id": "m6",
        "name": "ZONA 42",
        "ro": "31.699"
      },
      {
        "id": "m7",
        "name": "CUADRANTE 3",
        "ro": "25.040"
      },
      {
        "id": "mo_1776349746415_wutbne1zv",
        "name": "CUADRANTE 5 ADROGUE",
        "ro": "25059"
      },
      {
        "id": "mo_1776349746415_0g86mx3vc",
        "name": "CUADRANTE ZONA 10",
        "ro": "25037"
      },
      {
        "id": "mo_1776349746415_h1nj3yy26",
        "name": "CUADRANTE ZONA 11",
        "ro": "25039"
      },
      {
        "id": "mo_1776349746418_7p3idwfkh",
        "name": "OS undefined",
        "ro": "25037"
      },
      {
        "id": "mo_1776349746418_qizxjq7py",
        "name": "Cuadrante 1",
        "ro": "25038"
      },
      {
        "id": "mo_1776349746418_f89ddydls",
        "name": "Movil control",
        "ro": "25058"
      },
      {
        "id": "mo_1776349746420_fxcsc8wds",
        "name": "REFUERZO 10 (LONGCHAMPS)",
        "ro": "25.037"
      },
      {
        "id": "mo_1776349746420_2krz07te2",
        "name": "REFUERZO 11 (LONGCHAMPS)",
        "ro": "25.038"
      }
    ],
    "motos": [
      {
        "id": "mo1",
        "name": "José Mármol (06:00 a 18:00)",
        "ro": "32.502"
      },
      {
        "id": "mo2",
        "name": "(sin localidad) (11:00 a 23:00)",
        "ro": "32.510"
      },
      {
        "id": "mo3",
        "name": "(sin localidad)",
        "ro": "23.498"
      },
      {
        "id": "mo4",
        "name": "(sin localidad)",
        "ro": "32.506"
      },
      {
        "id": "mo_1776349746417_i3s3trf4l",
        "name": "TOJA PABLO"
      },
      {
        "id": "mo_1776349746417_op4nsne5b",
        "name": "SOSA BRIAN"
      },
      {
        "id": "mo_1776349746420_s1kpoj4j2",
        "name": "R.CALZADA",
        "ro": "32.504"
      },
      {
        "id": "mo_1776349746420_ne32l95ag",
        "name": "32.502",
        "ro": "32.502"
      },
      {
        "id": "mo_1776349746420_lcrsbtrww",
        "name": "ADROGUE",
        "ro": "32.510"
      },
      {
        "id": "mo_1776349746421_f9dzvapgk",
        "name": "BISCOCHEA YANINA"
      }
    ],
    "qths": [
      {
        "id": "q1",
        "name": "Adrogué: E. de Adrogué y Macias"
      },
      {
        "id": "q2",
        "name": "Adrogué: E. de Adrogué y Mitre // Mitre 1100"
      },
      {
        "id": "q3",
        "name": "Adrogué: E. de Adrogué e/Spiro y Av Espora"
      },
      {
        "id": "q4",
        "name": "Adrogué: Quintana - Rosales - Pellegrini - Nother"
      },
      {
        "id": "q5",
        "name": "Burzaco: E. de Burzaco y Roca"
      },
      {
        "id": "q6",
        "name": "Burzaco: 9 de Julio y Roca"
      },
      {
        "id": "q7",
        "name": "Burzaco: 25 de Mayo y Lezcano"
      },
      {
        "id": "q8",
        "name": "San José: Altamira y Colón"
      },
      {
        "id": "q9",
        "name": "Rafael Calzada: 20 de Septiembre y San Martín"
      },
      {
        "id": "q10",
        "name": "José Mármol: Kellertas y Davel"
      },
      {
        "id": "q11",
        "name": "Logchamps: Aviación e/ Rivadavia y Bolívar"
      },
      {
        "id": "q12",
        "name": "Logchamps: Sarmiento y Lorenzini"
      },
      {
        "id": "q13",
        "name": "Logchamps: Alsina e/ Rivadavia y Aviación"
      },
      {
        "id": "q14",
        "name": "Logchamps: Belgrano y Chiesa"
      },
      {
        "id": "q15",
        "name": "Logchamps: Burgwardt e/ Chiesa y Diehl"
      },
      {
        "id": "q16",
        "name": "Glew: Patria y Justicia"
      },
      {
        "id": "qt_1776349746417_h64fyf7kn",
        "name": "LORENZZINI Y SARMIENTO"
      },
      {
        "id": "qt_1776349746417_jd6yoyins",
        "name": "HOGAR ISRAELITA"
      },
      {
        "id": "qt_1776349746417_jbqy3aanb",
        "name": "UPC"
      },
      {
        "id": "qt_1776349746417_jfgh55zcv",
        "name": "PERSONAL RADIO / GABINETE"
      },
      {
        "id": "qt_1776349746418_hvz3pbd5d",
        "name": "E. de Adrogue y Macias"
      },
      {
        "id": "qt_1776349746418_v6uryq7m3",
        "name": "E. de Adrogue 1100"
      },
      {
        "id": "qt_1776349746418_4sc90k05z",
        "name": "Somellera y Spiro"
      },
      {
        "id": "qt_1776349746418_3orw9dm9n",
        "name": "E. de Adrogue y Mitre"
      },
      {
        "id": "qt_1776349746418_sgwfps6dh",
        "name": "E. de Adrogue Spiro y Espora"
      },
      {
        "id": "qt_1776349746418_ty369xfw3",
        "name": "Solier y Nother"
      },
      {
        "id": "qt_1776349746418_6u1mhjdxt",
        "name": "Nother y Somellera"
      },
      {
        "id": "qt_1776349746418_kr874ygs1",
        "name": "Plaza Brown"
      },
      {
        "id": "qt_1776349746419_4v2wf68lz",
        "name": "Quintana Rosales Pellegrini Nother"
      },
      {
        "id": "qt_1776349746419_dhnfocp4c",
        "name": "Pte Peron Illia Obligado"
      },
      {
        "id": "qt_1776349746419_4144ztmoy",
        "name": "Spiro Cordero Avellaneda Segui"
      },
      {
        "id": "qt_1776349746419_z5mvrdaqy",
        "name": "Mitre Espora Sanchez Estrada"
      },
      {
        "id": "qt_1776349746419_zf12rqhd3",
        "name": "R. Rojas Y Pellegrini Y Espora"
      },
      {
        "id": "qt_1776349746419_ckaym5mzz",
        "name": "Alsina roca y 25 de Mayo"
      },
      {
        "id": "qt_1776349746419_ae7b60mt2",
        "name": "17 de Octubre y Rucci"
      },
      {
        "id": "qt_1776349746419_2zwsxw697",
        "name": "Alsina y Garibaldi"
      },
      {
        "id": "qt_1776349746419_5bkmq0lpo",
        "name": "20 de Septiembre y San Martin"
      },
      {
        "id": "qt_1776349746419_3fq1vrlxk",
        "name": "Salta y Vertiz"
      },
      {
        "id": "qt_1776349746419_8om0ycahx",
        "name": "Aviacion y davel"
      },
      {
        "id": "qt_1776349746419_vvg6exps8",
        "name": "Ruta 210, Yrigoyen, Gob. Arias, Francia y La Aviacion (Zona 10)"
      },
      {
        "id": "qt_1776349746419_l5rykfpip",
        "name": "Dr. Chiesa, Gral. San Martín, C. Bregi, Simon Bolivar, Pcia de Buenos Aires, M. Belgrano (Zona 11)"
      },
      {
        "id": "qt_1776349746419_46whuznm7",
        "name": "O.S 132/26 Centro Comunitario"
      },
      {
        "id": "qt_1776349746420_2maejlr4m",
        "name": "Calle Garibaldi Nro1856"
      }
    ],
    "ordenes": [
      {
        "id": "os_1776349746417_2jxz96hw5",
        "name": "OS 66/26",
        "numero": "66/26",
        "description": "PREVENCION DE DELITOS PREDIO PRES. PERON Y OBLIGADO - ADROGUE"
      },
      {
        "id": "os_1776349746417_6ipqtw7s8",
        "name": "OS 005/26",
        "numero": "005/26",
        "description": "OPERATIVO DINAMICO RUTA 4",
        "horario": "19 a 23 HS"
      },
      {
        "id": "os_1776349746417_0taz2wrh6",
        "name": "OS 132/26",
        "numero": "132/26",
        "description": "CENTRO COMUNITARIO GLEW GARIBALDI 1856"
      },
      {
        "id": "os_1776349746421_w4545v5s5",
        "name": "OS 1119/25",
        "numero": "1119/25",
        "description": "CUSTODIA PREDIO, PREVENCION DE SEGURIDAD ANTES HECHOS ILICITOS Y POSIBLE USURPACION, EN LAS ARTERIAS PETIRIBI, LAPACHO, AV. ARGENTINA Y ARENALES (BURZACO)"
      },
      {
        "id": "os_1776349746421_isctjcq88",
        "name": "OS RAD 31/26",
        "numero": "RAD 31/26",
        "description": "EFECTIVO (CHOFER) LOS M, M, J Y D. 19:00 HS., AL ASIENTO DE LA ESTACION DE POLICÍA DE SEGURIDAD DEPARTAMENTAL ALTE. BROWN, CALLE RICA N°969, BURZACO"
      }
    ],
    "comisiones": [
      {
        "id": "co_1776349746417_cqfwlxmqs",
        "name": "CRIA 1RA ADROGUE"
      },
      {
        "id": "co_1776349746417_1nhtyqwhx",
        "name": "CRIA 2DA BURZACO"
      },
      {
        "id": "co_1776349746417_ud4xrw6h8",
        "name": "CRIA 5TA CALZADA"
      },
      {
        "id": "co_1776349746417_k6nvulk04",
        "name": "DESTACAMENTO MINISTRO RIVADAVIA"
      },
      {
        "id": "co_1776349746421_gers5m2vq",
        "name": "H. LUCIO MELENDEZ"
      }
    ]
  },
  "schedules": [
    {
      "id": "1",
      "agentId": "1",
      "role": "caminante",
      "targetId": "q1",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "2",
      "agentId": "2",
      "role": "caminante",
      "targetId": "q1",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "3",
      "agentId": "3",
      "role": "caminante",
      "targetId": "q2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "4",
      "agentId": "4",
      "role": "caminante",
      "targetId": "q2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "5",
      "agentId": "5",
      "role": "caminante",
      "targetId": "q3",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "6",
      "agentId": "6",
      "role": "caminante",
      "targetId": "q3",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "7",
      "agentId": "7",
      "role": "caminante",
      "targetId": "q4",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "8",
      "agentId": "8",
      "role": "caminante",
      "targetId": "q5",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "9",
      "agentId": "9",
      "role": "caminante",
      "targetId": "q5",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "10",
      "agentId": "10",
      "role": "caminante",
      "targetId": "q6",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "11",
      "agentId": "11",
      "role": "caminante",
      "targetId": "q6",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "12",
      "agentId": "12",
      "role": "caminante",
      "targetId": "q7",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "13",
      "agentId": "13",
      "role": "caminante",
      "targetId": "q8",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "14",
      "agentId": "14",
      "role": "caminante",
      "targetId": "q9",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "15",
      "agentId": "15",
      "role": "caminante",
      "targetId": "q10",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "16",
      "agentId": "16",
      "role": "caminante",
      "targetId": "q11",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "17",
      "agentId": "17",
      "role": "caminante",
      "targetId": "q11",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "18",
      "agentId": "18",
      "role": "caminante",
      "targetId": "q12",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "19",
      "agentId": "19",
      "role": "caminante",
      "targetId": "q13",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "20",
      "agentId": "20",
      "role": "caminante",
      "targetId": "q13",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "21",
      "agentId": "21",
      "role": "caminante",
      "targetId": "q14",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "22",
      "agentId": "22",
      "role": "caminante",
      "targetId": "q14",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "23",
      "agentId": "23",
      "role": "caminante",
      "targetId": "q15",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "24",
      "agentId": "24",
      "role": "caminante",
      "targetId": "q15",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "25",
      "agentId": "25",
      "role": "caminante",
      "targetId": "q16",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "26",
      "agentId": "26",
      "role": "caminante",
      "targetId": "q16",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "27",
      "agentId": "27",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "28",
      "agentId": "28",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "29",
      "agentId": "29",
      "role": "movil",
      "targetId": "m2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "30",
      "agentId": "30",
      "role": "movil",
      "targetId": "m2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "31",
      "agentId": "31",
      "role": "movil",
      "targetId": "m3",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "32",
      "agentId": "32",
      "role": "movil",
      "targetId": "m3",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "33",
      "agentId": "33",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "34",
      "agentId": "34",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "35",
      "agentId": "35",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "36",
      "agentId": "36",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "37",
      "agentId": "37",
      "role": "movil",
      "targetId": "m6",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "38",
      "agentId": "38",
      "role": "movil",
      "targetId": "m6",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "39",
      "agentId": "39",
      "role": "movil",
      "targetId": "m7",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "40",
      "agentId": "40",
      "role": "movil",
      "targetId": "m7",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "41",
      "agentId": "41",
      "role": "garita",
      "targetId": "g1",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "42",
      "agentId": "42",
      "role": "garita",
      "targetId": "g2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "43",
      "agentId": "43",
      "role": "garita",
      "targetId": "g3",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "44",
      "agentId": "44",
      "role": "garita",
      "targetId": "g4",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "45",
      "agentId": "45",
      "role": "garita",
      "targetId": "g5",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "46",
      "agentId": "46",
      "role": "garita",
      "targetId": "g6",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "47",
      "agentId": "47",
      "role": "garita",
      "targetId": "g7",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "48",
      "agentId": "48",
      "role": "garita",
      "targetId": "g8",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "49",
      "agentId": "49",
      "role": "garita",
      "targetId": "g9",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "50",
      "agentId": "50",
      "role": "garita",
      "targetId": "g10",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "51",
      "agentId": "51",
      "role": "garita",
      "targetId": "g11",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "52",
      "agentId": "52",
      "role": "garita",
      "targetId": "g12",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "53",
      "agentId": "53",
      "role": "garita",
      "targetId": "g13",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "54",
      "agentId": "54",
      "role": "garita",
      "targetId": "g14",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "55",
      "agentId": "55",
      "role": "garita",
      "targetId": "g15",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "56",
      "agentId": "56",
      "role": "garita",
      "targetId": "g16",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "57",
      "agentId": "57",
      "role": "garita",
      "targetId": "g16",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "58",
      "agentId": "58",
      "role": "garita",
      "targetId": "g17",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "59",
      "agentId": "59",
      "role": "garita",
      "targetId": "g18",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "60",
      "agentId": "60",
      "role": "motorizada",
      "targetId": "mo1",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "61",
      "agentId": "61",
      "role": "motorizada",
      "targetId": "mo2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "62",
      "agentId": "62",
      "role": "motorizada",
      "targetId": "mo2",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "63",
      "agentId": "63",
      "role": "motorizada",
      "targetId": "mo3",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "64",
      "agentId": "64",
      "role": "motorizada",
      "targetId": "mo4",
      "shift": "turno1",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "65",
      "agentId": "68",
      "role": "movil",
      "targetId": "mo_1776349746415_wutbne1zv",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "66",
      "agentId": "69",
      "role": "movil",
      "targetId": "mo_1776349746415_wutbne1zv",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "67",
      "agentId": "70",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "68",
      "agentId": "71",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "69",
      "agentId": "72",
      "role": "movil",
      "targetId": "m2",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "70",
      "agentId": "73",
      "role": "movil",
      "targetId": "m2",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "71",
      "agentId": "74",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "72",
      "agentId": "75",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "73",
      "agentId": "76",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "74",
      "agentId": "77",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "75",
      "agentId": "78",
      "role": "movil",
      "targetId": "mo_1776349746415_0g86mx3vc",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "76",
      "agentId": "79",
      "role": "movil",
      "targetId": "mo_1776349746415_0g86mx3vc",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "77",
      "agentId": "80",
      "role": "movil",
      "targetId": "mo_1776349746415_h1nj3yy26",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "78",
      "agentId": "81",
      "role": "movil",
      "targetId": "mo_1776349746415_h1nj3yy26",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "79",
      "agentId": "82",
      "role": "garita",
      "targetId": "ga_1776349746415_chmfurbn3",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "80",
      "agentId": "83",
      "role": "garita",
      "targetId": "ga_1776349746415_bu9gklxe4",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "81",
      "agentId": "84",
      "role": "garita",
      "targetId": "ga_1776349746415_bu9gklxe4",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "82",
      "agentId": "85",
      "role": "garita",
      "targetId": "ga_1776349746416_99chq163f",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "83",
      "agentId": "86",
      "role": "garita",
      "targetId": "ga_1776349746416_99chq163f",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "84",
      "agentId": "87",
      "role": "garita",
      "targetId": "ga_1776349746416_rkotemj6q",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "85",
      "agentId": "88",
      "role": "garita",
      "targetId": "ga_1776349746416_a176izq05",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "86",
      "agentId": "89",
      "role": "garita",
      "targetId": "g15",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "87",
      "agentId": "90",
      "role": "garita",
      "targetId": "g8",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "88",
      "agentId": "91",
      "role": "garita",
      "targetId": "ga_1776349746416_f33vggdrp",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "89",
      "agentId": "92",
      "role": "garita",
      "targetId": "g5",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "90",
      "agentId": "93",
      "role": "garita",
      "targetId": "g5",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "91",
      "agentId": "94",
      "role": "garita",
      "targetId": "g17",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "92",
      "agentId": "95",
      "role": "garita",
      "targetId": "g17",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "93",
      "agentId": "96",
      "role": "garita",
      "targetId": "g18",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "94",
      "agentId": "97",
      "role": "garita",
      "targetId": "ga_1776349746416_yj479olwc",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "95",
      "agentId": "98",
      "role": "garita",
      "targetId": "ga_1776349746416_fot7zmw9m",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "96",
      "agentId": "99",
      "role": "garita",
      "targetId": "g1",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "97",
      "agentId": "100",
      "role": "garita",
      "targetId": "ga_1776349746416_bduxv0t7r",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "98",
      "agentId": "101",
      "role": "garita",
      "targetId": "ga_1776349746416_bduxv0t7r",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "99",
      "agentId": "102",
      "role": "garita",
      "targetId": "ga_1776349746416_b21lpzkb7",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "100",
      "agentId": "103",
      "role": "garita",
      "targetId": "ga_1776349746416_b21lpzkb7",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "101",
      "agentId": "104",
      "role": "garita",
      "targetId": "ga_1776349746416_b21lpzkb7",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "102",
      "agentId": "105",
      "role": "garita",
      "targetId": "ga_1776349746416_9zncz8kl7",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "103",
      "agentId": "106",
      "role": "garita",
      "targetId": "ga_1776349746417_49b9iqjk0",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "104",
      "agentId": "107",
      "role": "caminante",
      "targetId": "qt_1776349746417_h64fyf7kn",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "105",
      "agentId": "108",
      "role": "caminante",
      "targetId": "qt_1776349746417_jd6yoyins",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "106",
      "agentId": "109",
      "role": "caminante",
      "targetId": "qt_1776349746417_jbqy3aanb",
      "shift": "turno2",
      "startTime": "20:00",
      "endTime": "08:00"
    },
    {
      "id": "107",
      "agentId": "110",
      "role": "motorizada",
      "targetId": "mo_1776349746417_i3s3trf4l",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "108",
      "agentId": "111",
      "role": "motorizada",
      "targetId": "mo_1776349746417_op4nsne5b",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "109",
      "agentId": "112",
      "role": "comision",
      "targetId": "co_1776349746417_cqfwlxmqs",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "110",
      "agentId": "113",
      "role": "comision",
      "targetId": "co_1776349746417_1nhtyqwhx",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "111",
      "agentId": "114",
      "role": "comision",
      "targetId": "co_1776349746417_1nhtyqwhx",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "112",
      "agentId": "115",
      "role": "comision",
      "targetId": "co_1776349746417_ud4xrw6h8",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "113",
      "agentId": "116",
      "role": "comision",
      "targetId": "co_1776349746417_k6nvulk04",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "114",
      "agentId": "117",
      "role": "orden_servicio",
      "targetId": "os_1776349746417_2jxz96hw5",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "115",
      "agentId": "118",
      "role": "orden_servicio",
      "targetId": "os_1776349746417_0taz2wrh6",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "116",
      "agentId": "119",
      "role": "orden_servicio",
      "targetId": "os_1776349746417_0taz2wrh6",
      "shift": "turno2",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "117",
      "agentId": "120",
      "role": "caminante",
      "targetId": "qt_1776349746417_jfgh55zcv",
      "shift": "turno2",
      "startTime": "19:00",
      "endTime": "07:00"
    },
    {
      "id": "118",
      "agentId": "121",
      "role": "caminante",
      "targetId": "qt_1776349746417_jfgh55zcv",
      "shift": "turno2",
      "startTime": "19:00",
      "endTime": "07:00"
    },
    {
      "id": "119",
      "agentId": "122",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "120",
      "agentId": "123",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "121",
      "agentId": "124",
      "role": "movil",
      "targetId": "m2",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "122",
      "agentId": "125",
      "role": "movil",
      "targetId": "m2",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "123",
      "agentId": "126",
      "role": "movil",
      "targetId": "m3",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "124",
      "agentId": "127",
      "role": "movil",
      "targetId": "m3",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "125",
      "agentId": "128",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "126",
      "agentId": "129",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "127",
      "agentId": "130",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "128",
      "agentId": "131",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "129",
      "agentId": "132",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "130",
      "agentId": "133",
      "role": "movil",
      "targetId": "m1",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "131",
      "agentId": "134",
      "role": "movil",
      "targetId": "mo_1776349746418_7p3idwfkh",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "132",
      "agentId": "135",
      "role": "movil",
      "targetId": "mo_1776349746418_7p3idwfkh",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "133",
      "agentId": "136",
      "role": "movil",
      "targetId": "mo_1776349746418_qizxjq7py",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "134",
      "agentId": "137",
      "role": "movil",
      "targetId": "mo_1776349746418_qizxjq7py",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "135",
      "agentId": "138",
      "role": "movil",
      "targetId": "mo_1776349746418_f89ddydls",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "136",
      "agentId": "139",
      "role": "movil",
      "targetId": "mo_1776349746418_f89ddydls",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "137",
      "agentId": "140",
      "role": "garita",
      "targetId": "g1",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "138",
      "agentId": "141",
      "role": "garita",
      "targetId": "g2",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "139",
      "agentId": "142",
      "role": "garita",
      "targetId": "g3",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "140",
      "agentId": "143",
      "role": "garita",
      "targetId": "ga_1776349746418_gd9tooekh",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "141",
      "agentId": "144",
      "role": "garita",
      "targetId": "g5",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "142",
      "agentId": "145",
      "role": "garita",
      "targetId": "g6",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "143",
      "agentId": "146",
      "role": "garita",
      "targetId": "g7",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "144",
      "agentId": "147",
      "role": "garita",
      "targetId": "g8",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "145",
      "agentId": "148",
      "role": "garita",
      "targetId": "g9",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "146",
      "agentId": "149",
      "role": "garita",
      "targetId": "ga_1776349746418_wabr7c9zk",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "147",
      "agentId": "150",
      "role": "garita",
      "targetId": "g11",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "148",
      "agentId": "151",
      "role": "garita",
      "targetId": "g12",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "149",
      "agentId": "152",
      "role": "garita",
      "targetId": "g13",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "150",
      "agentId": "153",
      "role": "garita",
      "targetId": "g14",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "151",
      "agentId": "154",
      "role": "garita",
      "targetId": "g15",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "152",
      "agentId": "155",
      "role": "garita",
      "targetId": "g16",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "153",
      "agentId": "156",
      "role": "garita",
      "targetId": "g17",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "154",
      "agentId": "157",
      "role": "garita",
      "targetId": "g18",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "155",
      "agentId": "158",
      "role": "caminante",
      "targetId": "qt_1776349746418_hvz3pbd5d",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "156",
      "agentId": "159",
      "role": "caminante",
      "targetId": "qt_1776349746418_hvz3pbd5d",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "157",
      "agentId": "158",
      "role": "caminante",
      "targetId": "qt_1776349746418_v6uryq7m3",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "158",
      "agentId": "159",
      "role": "caminante",
      "targetId": "qt_1776349746418_v6uryq7m3",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "159",
      "agentId": "160",
      "role": "caminante",
      "targetId": "qt_1776349746418_3orw9dm9n",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "160",
      "agentId": "161",
      "role": "caminante",
      "targetId": "qt_1776349746418_3orw9dm9n",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "161",
      "agentId": "160",
      "role": "caminante",
      "targetId": "qt_1776349746418_sgwfps6dh",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "162",
      "agentId": "161",
      "role": "caminante",
      "targetId": "qt_1776349746418_sgwfps6dh",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "163",
      "agentId": "162",
      "role": "caminante",
      "targetId": "qt_1776349746419_dhnfocp4c",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "164",
      "agentId": "163",
      "role": "caminante",
      "targetId": "q7",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "165",
      "agentId": "164",
      "role": "caminante",
      "targetId": "q10",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "166",
      "agentId": "165",
      "role": "caminante",
      "targetId": "qt_1776349746419_vvg6exps8",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "167",
      "agentId": "166",
      "role": "caminante",
      "targetId": "qt_1776349746419_vvg6exps8",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "168",
      "agentId": "167",
      "role": "caminante",
      "targetId": "qt_1776349746419_vvg6exps8",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "169",
      "agentId": "168",
      "role": "caminante",
      "targetId": "qt_1776349746419_vvg6exps8",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "170",
      "agentId": "169",
      "role": "caminante",
      "targetId": "qt_1776349746419_l5rykfpip",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "171",
      "agentId": "170",
      "role": "caminante",
      "targetId": "qt_1776349746419_l5rykfpip",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "172",
      "agentId": "171",
      "role": "caminante",
      "targetId": "qt_1776349746419_l5rykfpip",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "173",
      "agentId": "172",
      "role": "caminante",
      "targetId": "qt_1776349746419_l5rykfpip",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "174",
      "agentId": "173",
      "role": "caminante",
      "targetId": "q12",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "175",
      "agentId": "174",
      "role": "caminante",
      "targetId": "qt_1776349746419_46whuznm7",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "176",
      "agentId": "175",
      "role": "caminante",
      "targetId": "qt_1776349746420_2maejlr4m",
      "shift": "turno3",
      "startTime": "09:00",
      "endTime": "21:00"
    },
    {
      "id": "177",
      "agentId": "176",
      "role": "motorizada",
      "targetId": "mo_1776349746420_s1kpoj4j2",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "178",
      "agentId": "177",
      "role": "motorizada",
      "targetId": "mo_1776349746420_ne32l95ag",
      "shift": "turno3",
      "startTime": "06:00",
      "endTime": "00:00"
    },
    {
      "id": "179",
      "agentId": "178",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "180",
      "agentId": "179",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "181",
      "agentId": "180",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "182",
      "agentId": "181",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "183",
      "agentId": "182",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "184",
      "agentId": "183",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "185",
      "agentId": "184",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "186",
      "agentId": "185",
      "role": "motorizada",
      "targetId": "mo_1776349746420_lcrsbtrww",
      "shift": "turno3",
      "startTime": "11:00",
      "endTime": "00:00"
    },
    {
      "id": "187",
      "agentId": "190",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "188",
      "agentId": "191",
      "role": "movil",
      "targetId": "m4",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "189",
      "agentId": "192",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "190",
      "agentId": "193",
      "role": "movil",
      "targetId": "m5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "191",
      "agentId": "194",
      "role": "movil",
      "targetId": "mo_1776349746420_fxcsc8wds",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "192",
      "agentId": "195",
      "role": "movil",
      "targetId": "mo_1776349746420_fxcsc8wds",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "193",
      "agentId": "196",
      "role": "movil",
      "targetId": "mo_1776349746420_2krz07te2",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "194",
      "agentId": "197",
      "role": "movil",
      "targetId": "mo_1776349746420_2krz07te2",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "195",
      "agentId": "198",
      "role": "garita",
      "targetId": "ga_1776349746415_chmfurbn3",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "196",
      "agentId": "199",
      "role": "garita",
      "targetId": "ga_1776349746415_bu9gklxe4",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "197",
      "agentId": "200",
      "role": "garita",
      "targetId": "ga_1776349746415_bu9gklxe4",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "198",
      "agentId": "201",
      "role": "garita",
      "targetId": "ga_1776349746416_fot7zmw9m",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "199",
      "agentId": "202",
      "role": "garita",
      "targetId": "ga_1776349746416_99chq163f",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "200",
      "agentId": "203",
      "role": "garita",
      "targetId": "g14",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "201",
      "agentId": "204",
      "role": "garita",
      "targetId": "g14",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "202",
      "agentId": "205",
      "role": "garita",
      "targetId": "ga_1776349746416_a176izq05",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "203",
      "agentId": "206",
      "role": "garita",
      "targetId": "g15",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "204",
      "agentId": "207",
      "role": "garita",
      "targetId": "g15",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "205",
      "agentId": "208",
      "role": "garita",
      "targetId": "g8",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "206",
      "agentId": "209",
      "role": "garita",
      "targetId": "g8",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "207",
      "agentId": "210",
      "role": "garita",
      "targetId": "g9",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "208",
      "agentId": "211",
      "role": "garita",
      "targetId": "g9",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "209",
      "agentId": "212",
      "role": "garita",
      "targetId": "g5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "210",
      "agentId": "213",
      "role": "garita",
      "targetId": "g5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "211",
      "agentId": "214",
      "role": "garita",
      "targetId": "g17",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "212",
      "agentId": "215",
      "role": "garita",
      "targetId": "g17",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "213",
      "agentId": "216",
      "role": "garita",
      "targetId": "g18",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "214",
      "agentId": "217",
      "role": "garita",
      "targetId": "g18",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "215",
      "agentId": "218",
      "role": "garita",
      "targetId": "ga_1776349746416_yj479olwc",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "216",
      "agentId": "219",
      "role": "garita",
      "targetId": "g1",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "217",
      "agentId": "220",
      "role": "garita",
      "targetId": "ga_1776349746416_bduxv0t7r",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "218",
      "agentId": "221",
      "role": "garita",
      "targetId": "ga_1776349746416_bduxv0t7r",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "219",
      "agentId": "222",
      "role": "garita",
      "targetId": "ga_1776349746416_bduxv0t7r",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "220",
      "agentId": "223",
      "role": "garita",
      "targetId": "ga_1776349746416_b21lpzkb7",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "221",
      "agentId": "224",
      "role": "garita",
      "targetId": "ga_1776349746416_b21lpzkb7",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "222",
      "agentId": "225",
      "role": "garita",
      "targetId": "ga_1776349746416_9zncz8kl7",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "223",
      "agentId": "226",
      "role": "garita",
      "targetId": "ga_1776349746417_49b9iqjk0",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "224",
      "agentId": "227",
      "role": "garita",
      "targetId": "ga_1776349746417_49b9iqjk0",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "225",
      "agentId": "228",
      "role": "caminante",
      "targetId": "qt_1776349746417_h64fyf7kn",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "226",
      "agentId": "229",
      "role": "caminante",
      "targetId": "qt_1776349746417_jd6yoyins",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "227",
      "agentId": "230",
      "role": "caminante",
      "targetId": "qt_1776349746417_jbqy3aanb",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "228",
      "agentId": "231",
      "role": "motorizada",
      "targetId": "mo_1776349746421_f9dzvapgk",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "229",
      "agentId": "232",
      "role": "comision",
      "targetId": "co_1776349746421_gers5m2vq",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "230",
      "agentId": "233",
      "role": "orden_servicio",
      "targetId": "os_1776349746417_2jxz96hw5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "231",
      "agentId": "234",
      "role": "orden_servicio",
      "targetId": "os_1776349746421_w4545v5s5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "232",
      "agentId": "235",
      "role": "orden_servicio",
      "targetId": "os_1776349746421_w4545v5s5",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "233",
      "agentId": "236",
      "role": "orden_servicio",
      "targetId": "os_1776349746417_0taz2wrh6",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "234",
      "agentId": "237",
      "role": "orden_servicio",
      "targetId": "os_1776349746417_0taz2wrh6",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    },
    {
      "id": "235",
      "agentId": "238",
      "role": "orden_servicio",
      "targetId": "os_1776349746421_isctjcq88",
      "shift": "turno4",
      "startTime": "21:00",
      "endTime": "09:00"
    }
  ]
};

import { collection, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

export function useStore() {
  const [state, setLocalState] = useState<AppState>({
    agents: [],
    infrastructure: {
      garitas: [],
      moviles: [],
      motos: [],
      qths: [],
      ordenes: [],
      comisiones: []
    },
    schedules: []
  });

  useEffect(() => {
    const unsubAgents = onSnapshot(collection(db, 'agents'), (snapshot) => {
      const agents = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Agent))
        .filter(agent => !agent.isDeleted);
      setLocalState(s => ({ ...s, agents }));
    });

    const unsubInfra = onSnapshot(collection(db, 'infrastructure'), (snapshot) => {
      const newInfra: Infrastructure = {
        garitas: [],
        moviles: [],
        motos: [],
        qths: [],
        ordenes: [],
        comisiones: []
      };
      snapshot.docs.forEach(docSnap => {
        const item = { id: docSnap.id, ...docSnap.data() } as any;
        if (item.type && newInfra[item.type as keyof Infrastructure] && !item.isDeleted) {
          const type = item.type as keyof Infrastructure;
          const { type: _, ...itemWithoutType } = item;
          newInfra[type].push(itemWithoutType as InfrastructureItem);
        }
      });
      setLocalState(s => ({ ...s, infrastructure: newInfra }));
    });

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
      setLocalState(s => ({ ...s, schedules }));
    });

    return () => {
      unsubAgents();
      unsubInfra();
      unsubSchedules();
    };
  }, []);

  const addAgent = (
    name: string, 
    telefono?: string, 
    legajo?: string, 
    turno?: 1 | 2 | 3 | 4,
    hasLicense?: boolean,
    licenseType?: 'auto' | 'moto' | 'ambas',
    licenseCategory?: 'comun' | 'profesional',
    licenseExpiration?: string,
    hasDAEO?: boolean,
    daeoExpiration?: string,
    domicilio?: string,
    marcaChaleco?: string,
    modeloChaleco?: string,
    nroSerieChaleco?: string,
    marcaArmamento?: string,
    modeloArmamento?: string,
    nroSerieArmamento?: string
  ) => {
    const id = Date.now().toString();
    const newAgent = { 
      id, name, telefono, legajo, turno: turno || 1,
      hasLicense, licenseType, licenseCategory, licenseExpiration,
      hasDAEO, daeoExpiration,
      domicilio,
      marcaChaleco,
      modeloChaleco,
      nroSerieChaleco,
      marcaArmamento,
      modeloArmamento,
      nroSerieArmamento
    };
    setDoc(doc(db, 'agents', id), newAgent).catch(console.error);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    updateDoc(doc(db, 'agents', id), updates).catch(console.error);
  };

  const removeAgent = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'agents', id));
      
      const schedulesToRemove = state.schedules.filter(sch => sch.agentId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const addInfra = (type: keyof Infrastructure, item: Omit<InfrastructureItem, 'id'>) => {
    const id = Date.now().toString();
    setDoc(doc(db, 'infrastructure', id), { ...item, type, id }).catch(console.error);
  };
  
  const removeInfra = async (type: keyof Infrastructure, id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'infrastructure', id));
      
      const schedulesToRemove = state.schedules.filter(sch => sch.targetId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const updateInfra = (type: keyof Infrastructure, id: string, updates: Partial<InfrastructureItem>) => {
    updateDoc(doc(db, 'infrastructure', id), updates).catch(console.error);
  };

  const assignAgent = (agentId: string, shift: Shift, role: RoleType, targetId?: string, startTime?: string, endTime?: string, scheduleIdToMove?: string) => {
    let defStart = '09:00';
    let defEnd = '21:00';
    if (shift === 'turno2' || shift === 'turno4') { defStart = '21:00'; defEnd = '09:00'; }

    const st = startTime || defStart;
    const et = endTime || defEnd;
    const isStandard = (st === '09:00' && et === '21:00') || (st === '21:00' && et === '09:00');

    const batch = writeBatch(db);

    if (scheduleIdToMove) {
      batch.delete(doc(db, 'schedules', scheduleIdToMove));
    } else if (isStandard) {
      const stdSchedules = state.schedules.filter(sch => {
        if (sch.agentId !== agentId || sch.shift !== shift) return false;
        return (sch.startTime === '09:00' && sch.endTime === '21:00') || (sch.startTime === '21:00' && sch.endTime === '09:00');
      });
      stdSchedules.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
    }

    if (role !== 'disponible') {
      const newSchId = Date.now().toString();
      const newSch: any = {
        id: newSchId,
        agentId,
        role,
        shift,
        startTime: st,
        endTime: et
      };
      if (targetId !== undefined && targetId !== null && targetId !== '') {
        newSch.targetId = targetId;
      }
      batch.set(doc(db, 'schedules', newSchId), newSch);
    }
    
    batch.commit().catch(console.error);
  };

  const removeSchedule = (id: string) => {
    deleteDoc(doc(db, 'schedules', id)).catch(console.error);
  };

  const clearRoleSchedules = (role: RoleType, shift: Shift) => {
    const batch = writeBatch(db);
    const schedulesToRemove = state.schedules.filter(sch => sch.role === role && sch.shift === shift);
    schedulesToRemove.forEach(sch => {
      batch.delete(doc(db, 'schedules', sch.id));
    });
    batch.commit().catch(console.error);
  };

  const restoreSchedules = (schedules: Schedule[]) => {
    const batch = writeBatch(db);
    schedules.forEach(sch => {
      batch.set(doc(db, 'schedules', sch.id), sch);
    });
    batch.commit().catch(console.error);
  };

  const softRemoveAgent = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'agents', id), { isDeleted: true });
      
      const schedulesToRemove = state.schedules.filter(sch => sch.agentId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const softRemoveInfra = async (type: keyof Infrastructure, id: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'infrastructure', id), { isDeleted: true });
      
      const schedulesToRemove = state.schedules.filter(sch => sch.targetId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const loadState = (newState: AppState) => {
    console.warn("loadState is deprecated with decoupled DB");
  };

  return { state, addAgent, updateAgent, removeAgent, softRemoveAgent, softRemoveInfra, addInfra, removeInfra, updateInfra, assignAgent, removeSchedule, clearRoleSchedules, restoreSchedules, loadState };
}
