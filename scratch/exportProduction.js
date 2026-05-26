import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyBNTTOdNec5j5nPYAdi8wVxve21gQPbfjw",
  authDomain: "dotaciones-uppl.firebaseapp.com",
  projectId: "dotaciones-uppl",
  storageBucket: "dotaciones-uppl.firebasestorage.app",
  messagingSenderId: "310982242107",
  appId: "1:310982242107:web:208cb20bec30da4a86911e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Error: Debes proporcionar tu correo y contraseña de producción.");
  console.log('\nUso del comando:');
  console.log('  node scratch/exportProduction.js "tu_usuario@email.com" "tu_contraseña"');
  process.exit(1);
}

async function exportProduction() {
  console.log(`Intentando iniciar sesión con ${email} en producción...`);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("¡Sesión iniciada con éxito!");
  } catch (err) {
    console.error("Error de autenticación:", err.message);
    process.exit(1);
  }

  console.log("\nConectando a la base de datos de producción...");
  
  console.log("Obteniendo efectivos...");
  const agentsSnap = await getDocs(collection(db, 'agents'));
  const agents = agentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`- Encontrados ${agents.length} efectivos.`);
  
  console.log("Obteniendo infraestructura...");
  const infraSnap = await getDocs(collection(db, 'infrastructure'));
  
  // Agrupar infraestructura en el formato de AppState
  const infrastructure = {
    garitas: [],
    moviles: [],
    motos: [],
    qths: [],
    ordenes: [],
    comisiones: []
  };
  
  infraSnap.docs.forEach(docSnap => {
    const item = { id: docSnap.id, ...docSnap.data() };
    if (item.type && item.type in infrastructure && !item.isDeleted) {
      const type = item.type;
      const { type: _, ...itemWithoutType } = item;
      infrastructure[type].push(itemWithoutType);
    }
  });
  console.log("- Infraestructura procesada.");

  console.log("Obteniendo cronogramas/asignaciones...");
  const schedulesSnap = await getDocs(collection(db, 'schedules'));
  const schedules = schedulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`- Encontradas ${schedules.length} asignaciones.`);

  const backupData = {
    agents,
    infrastructure,
    schedules
  };

  const fileName = "production_backup_fixed.json";
  fs.writeFileSync(fileName, JSON.stringify(backupData, null, 2));
  console.log(`\n¡Éxito! Respaldo completo exportado con IDs correctos en: ${fileName}`);
  process.exit(0);
}

exportProduction().catch(err => {
  console.error("Error al exportar:", err);
  process.exit(1);
});
