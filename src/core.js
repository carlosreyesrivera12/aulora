/* ===== AULORA v4 — Mendoza, Argentina (ARS) ===== */
const DB_VERSION='6';
const AV_COLORS=['#0E7C66','#E0743B','#3B5BE0','#9B3BE0','#E03B7A','#0EA5B7','#8A6D1F','#D6453F'];
const today=new Date();
const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const PERMS=[
  ['ver_dashboard','Ver dashboard'],['ver_estadisticas','Ver estadísticas'],
  ['ver_alumnos','Ver alumnos'],['editar_alumnos','Editar alumnos'],
  ['editar_documentos','Gestionar fotos y documentos'],
  ['ver_inscripciones','Inscripciones y matrícula'],
  ['ver_pagos','Ver cuotas'],['editar_pagos','Registrar / editar cuotas'],['eliminar_pagos','Eliminar cuotas'],['importar_pagos','Importar / exportar'],
  ['ver_comedor','Gestionar comedor'],['ver_actividades','Gestionar actividades'],['ver_comunicaciones','Comunicaciones y plantillas'],
  ['ver_auditoria','Ver auditoría'],['gestionar_usuarios','Gestionar usuarios'],['editar_config','Configuración del colegio'],
  ['ver_contabilidad','Ver contabilidad'],['editar_contabilidad','Registrar movimientos contables'],
  ['ver_afa','Ver AFA / AMPA'],['editar_afa','Gestionar AFA / AMPA'],
  ['registrar_actividades','Registrar actividades (proveedor)'],
];
function rolePreset(r){const all=Object.fromEntries(PERMS.map(p=>[p[0],true]));const none=Object.fromEntries(PERMS.map(p=>[p[0],false]));const ON=(...k)=>{const o={...none};k.forEach(x=>o[x]=true);return o;};
  switch(r){
    case 'super_admin':return all;
    case 'supervisor':return {...all,gestionar_usuarios:false,editar_config:false};
    case 'admin':return {...all,eliminar_pagos:false,ver_auditoria:false,gestionar_usuarios:false,editar_config:false,editar_contabilidad:false,editar_afa:false};
    case 'auditor':return ON('ver_dashboard','ver_estadisticas','ver_alumnos','ver_pagos','ver_auditoria','ver_contabilidad','ver_afa');
    case 'contador':return ON('ver_dashboard','ver_estadisticas','ver_alumnos','ver_pagos','editar_pagos','eliminar_pagos','importar_pagos','ver_contabilidad','editar_contabilidad');
    case 'profesor':return ON('ver_dashboard','ver_estadisticas','ver_alumnos');
    case 'comedor':return ON('ver_dashboard','ver_comedor','ver_alumnos');
    case 'proveedor_actividades':return ON('ver_dashboard','ver_actividades','registrar_actividades');
    case 'afa':return ON('ver_dashboard','ver_afa','editar_afa','ver_comunicaciones','ver_actividades');
    default:return none;}}
const ROLE_LABEL={super_admin:'Super Admin',supervisor:'Supervisor',admin:'Administración',auditor:'Auditoría',contador:'Contaduría',profesor:'Profesorado',comedor:'Comedor',proveedor_actividades:'Proveedor actividades',afa:'AFA / AMPA',alumno:'Alumno/a',familia:'Familia'};

const SEED_USERS=[
  {id:'u1',nombre:'Marta Ferreyra',email:'admin@aulora.edu.ar',rol:'super_admin',activo:true,perms:rolePreset('super_admin'),demo:'super'},
  {id:'u2',nombre:'Jorge Puebla',email:'supervisor@aulora.edu.ar',rol:'supervisor',activo:true,perms:rolePreset('supervisor'),demo:'super2'},
  {id:'u3',nombre:'Noelia Sosa',email:'gestion@aulora.edu.ar',rol:'admin',activo:true,perms:rolePreset('admin'),demo:'admin'},
  {id:'u4',nombre:'Pablo Vidal',email:'recepcion@aulora.edu.ar',rol:'admin',activo:false,perms:rolePreset('admin')},
  {id:'u5',nombre:'Auditoría',email:'auditor@aulora.edu.ar',rol:'auditor',activo:true,perms:rolePreset('auditor'),demo:'auditor'},
  {id:'u6',nombre:'Contaduría',email:'contador@aulora.edu.ar',rol:'contador',activo:true,perms:rolePreset('contador'),demo:'contador'},
  {id:'u7',nombre:'Profesor/a',email:'profesor@aulora.edu.ar',rol:'profesor',activo:true,perms:rolePreset('profesor'),demo:'profesor'},
  {id:'u8',nombre:'Comedor',email:'comedor@aulora.edu.ar',rol:'comedor',activo:true,perms:rolePreset('comedor'),demo:'comedor'},
  {id:'u9',nombre:'Proveedor actividades',email:'actividades@aulora.edu.ar',rol:'proveedor_actividades',activo:true,perms:rolePreset('proveedor_actividades'),demo:'prov'},
  {id:'u10',nombre:'AFA / AMPA',email:'afa@aulora.edu.ar',rol:'afa',activo:true,perms:rolePreset('afa'),demo:'afa'},
];

/* ---- Materias / temarios por nivel ---- */
const MAT_TEMPLATES={
  Inicial:[['Prácticas del Lenguaje','Conversación, primeras letras, rimas y cuentos'],['Matemática','Números hasta 20, formas, series y conteo'],['Ambiente Natural y Social','Seres vivos, estaciones del año y comunidad'],['Educación Artística','Plástica, música y expresión corporal'],['Educación Física','Juegos motores y psicomotricidad']],
  Primaria:[['Lengua','Lectura, escritura y comprensión de textos'],['Matemática','Operaciones, fracciones, geometría y problemas'],['Ciencias Naturales','Materia, seres vivos, ambiente y cuerpo humano'],['Ciencias Sociales','Historia argentina, geografía de Mendoza y ciudadanía'],['Inglés','Vocabulario, oralidad y gramática básica'],['Educación Física','Atletismo, deportes y vida saludable'],['Educación Artística','Plástica y música'],['Educación Tecnológica','Materiales, procesos y proyectos'],['Formación Ética y Ciudadana','Convivencia, derechos y valores']],
  Secundaria:[['Lengua y Literatura','Géneros literarios, análisis y producción de textos'],['Matemática','Álgebra, funciones y geometría analítica'],['Biología','Célula, genética y ecología'],['Físico-Química','Materia, energía y reacciones químicas'],['Historia','Argentina y mundo contemporáneo'],['Geografía','Espacio mendocino, argentino y mundial'],['Inglés','Comprensión y producción escrita y oral'],['Educación Física','Deportes, atletismo y salud'],['Formación Ética y Ciudadana','Estado, democracia y derechos humanos'],['Educación Tecnológica','Sistemas, programación y proyectos']]
};
function buildMaterias(nivel){return (MAT_TEMPLATES[nivel]||[]).map(m=>({nombre:m[0],temas:m[1]}));}

/* ---- Cursos (con cupo, cuota mensual en ARS y temario) ---- */
const SEED_COURSES=[
  {id:'c1',nombre:'Sala de 4',nivel:'Inicial',capacidad:20,cuota:78000,turno:'Mañana'},
  {id:'c2',nombre:'Sala de 5',nivel:'Inicial',capacidad:20,cuota:80000,turno:'Mañana'},
  {id:'c3',nombre:'1° Grado',nivel:'Primaria',capacidad:6,cuota:92000,turno:'Mañana'},
  {id:'c4',nombre:'2° Grado',nivel:'Primaria',capacidad:25,cuota:92000,turno:'Mañana'},
  {id:'c5',nombre:'3° Grado',nivel:'Primaria',capacidad:25,cuota:95000,turno:'Mañana'},
  {id:'c6',nombre:'4° Grado',nivel:'Primaria',capacidad:25,cuota:95000,turno:'Tarde'},
  {id:'c7',nombre:'5° Grado',nivel:'Primaria',capacidad:26,cuota:98000,turno:'Tarde'},
  {id:'c8',nombre:'6° Grado',nivel:'Primaria',capacidad:26,cuota:98000,turno:'Tarde'},
  {id:'c9',nombre:'7° Grado',nivel:'Primaria',capacidad:26,cuota:100000,turno:'Tarde'},
  {id:'c10',nombre:'1° Año',nivel:'Secundaria',capacidad:5,cuota:118000,turno:'Mañana'},
  {id:'c11',nombre:'2° Año',nivel:'Secundaria',capacidad:30,cuota:118000,turno:'Mañana'},
].map(c=>({...c,materias:buildMaterias(c.nivel)}));
const CURSOS=SEED_COURSES.map(c=>c.nombre);
const COMEDOR_CUOTA=45000;

/* ---- Actividades extraescolares (edición ampliada) ---- */
const SEED_ACTIVITIES=[
  {id:'act1',nombre:'Robótica',categoria:'Tecnología',dia:'Lunes',horaInicio:'17:00',horaFin:'18:30',aula:'Lab. de Informática',profesor:'Ing. Elina Campos',cupo:4,cuota:32000,periodo:'Anual',estado:'Activa',dirigidoA:'Primaria y Secundaria',material:'Notebook propia (opcional)',color:'#3B5BE0',descripcion:'Programación e iniciación a la robótica con kits educativos.'},
  {id:'act2',nombre:'Inglés Extra',categoria:'Idioma',dia:'Martes',horaInicio:'17:00',horaFin:'18:00',aula:'Aula 4',profesor:'Prof. Tomás Wright',cupo:18,cuota:26000,periodo:'Anual',estado:'Activa',dirigidoA:'Primaria',material:'Cuadernillo del curso',color:'#0E7C66',descripcion:'Refuerzo de inglés oral en grupos reducidos.'},
  {id:'act3',nombre:'Fútbol',categoria:'Deporte',dia:'Miércoles',horaInicio:'17:30',horaFin:'19:00',aula:'Cancha',profesor:'Prof. Marcos Soler',cupo:20,cuota:22000,periodo:'Anual',estado:'Activa',dirigidoA:'Todos los niveles',material:'Botines y short',color:'#E0743B',descripcion:'Entrenamiento y liga interna escolar.'},
  {id:'act4',nombre:'Música',categoria:'Música',dia:'Jueves',horaInicio:'17:00',horaFin:'18:30',aula:'Sala de Música',profesor:'Prof. Julieta Roca',cupo:12,cuota:28000,periodo:'Anual',estado:'Activa',dirigidoA:'Primaria y Secundaria',material:'Instrumento propio (opcional)',color:'#9B3BE0',descripcion:'Lenguaje musical e instrumento.'},
  {id:'act5',nombre:'Natación',categoria:'Deporte',dia:'Viernes',horaInicio:'17:30',horaFin:'19:00',aula:'Natatorio',profesor:'Prof. Sara Lin',cupo:16,cuota:38000,periodo:'1° Cuatrimestre',estado:'Activa',dirigidoA:'Todos los niveles',material:'Malla, gorra y ojotas',color:'#0EA5B7',descripcion:'Perfeccionamiento en pileta.'},
  {id:'act6',nombre:'Teatro',categoria:'Arte',dia:'Lunes',horaInicio:'17:30',horaFin:'19:00',aula:'SUM',profesor:'Prof. Pablo Mas',cupo:14,cuota:20000,periodo:'Anual',estado:'Inactiva',dirigidoA:'Primaria y Secundaria',material:'Ropa cómoda',color:'#E03B7A',descripcion:'Expresión corporal y obra de fin de año.'},
];
const SEED_TEMPLATES=[
  {id:'t1',nombre:'Recordatorio de cuota',categoria:'Morosidad',asunto:'Recordatorio de cuota pendiente — {centro}',cuerpo:'Estimada familia ({tutor}):\n\nLe recordamos que figura como pendiente la cuota de {mes} de {nombre_alumno} ({curso}), por un importe de {importe}.\n\nLe agradecemos regularizar el pago a la brevedad o subir el comprobante desde el portal de familias.\n\nSaludos cordiales,\nAdministración de {centro}'},
  {id:'t2',nombre:'Segundo aviso de mora',categoria:'Morosidad',asunto:'2.º aviso — cuota pendiente de {nombre_alumno}',cuerpo:'Estimada familia ({tutor}):\n\nA pesar de nuestro recordatorio anterior, la cuota de {mes} de {nombre_alumno} continúa impaga ({importe}).\n\nLe pedimos comunicarse con administración antes del {fecha} para evitar inconvenientes con los servicios.\n\nAtentamente,\n{centro}'},
  {id:'t3',nombre:'Confirmación de pago',categoria:'Pagos',asunto:'Recibimos tu pago — {centro}',cuerpo:'Estimada familia ({tutor}):\n\nConfirmamos la recepción del pago de la cuota de {mes} de {nombre_alumno} ({importe}). ¡Muchas gracias!\n\nSaludos,\n{centro}'},
  {id:'t4',nombre:'Cupo en lista de espera',categoria:'Inscripciones',asunto:'Inscripción en lista de espera — {nombre_alumno}',cuerpo:'Estimada familia ({tutor}):\n\nLa inscripción de {nombre_alumno} al curso {curso} quedó en LISTA DE ESPERA, ya que el cupo está completo. Le avisaremos apenas se libere una vacante.\n\nGracias por su paciencia,\n{centro}'},
  {id:'t5',nombre:'Vacante confirmada',categoria:'Inscripciones',asunto:'¡Vacante confirmada! — {nombre_alumno}',cuerpo:'Estimada familia ({tutor}):\n\nSe liberó una vacante y confirmamos la inscripción de {nombre_alumno} en {curso} para el ciclo lectivo. Le esperamos.\n\nSaludos,\n{centro}'},
  {id:'t6',nombre:'Solicitud de certificado médico',categoria:'Documentación',asunto:'Documentación pendiente de {nombre_alumno}',cuerpo:'Estimada familia ({tutor}):\n\nPara completar el legajo de {nombre_alumno} necesitamos el certificado médico (apto físico) actualizado. Puede entregarlo en secretaría o subirlo al portal.\n\nGracias por su colaboración,\n{centro}'},
];
const ALERGIAS=['Ninguna','Lactosa','Frutos secos','Gluten','Huevo','Marisco'];
const NOMBRES=[['Valentina','Gómez'],['Benjamín','Fernández'],['Martina','Rodríguez'],['Thiago','López'],['Emilia','Díaz'],['Joaquín','Sosa'],['Catalina','Romero'],['Bautista','Pérez'],['Isabella','Funes'],['Lautaro','Quiroga'],['Mía','Ávila'],['Santino','Lucero'],['Renata','Páez'],['Tomás','Ortiz'],['Olivia','Moyano'],['Felipe','Guevara'],['Julieta','Brizuela'],['Ignacio','Vega']];
const CIUDADES=['Ciudad de Mendoza','Godoy Cruz','Guaymallén','Las Heras','Maipú','Luján de Cuyo'];

function makeStudents(){
  const cursoDe=i=>{ if(i<8)return '1° Grado'; if(i<14)return '1° Año'; return CURSOS[(i*3)%CURSOS.length]; };
  const list=NOMBRES.map((n,i)=>{
    const curso=cursoDe(i);const c=SEED_COURSES.find(x=>x.nombre===curso);
    const actIds=[];const na=i%3===0?2:(i%2===0?1:0);
    for(let k=0;k<na;k++)actIds.push(SEED_ACTIVITIES[(i+k)%SEED_ACTIVITIES.length].id);
    const comedor=i%3!==0;
    const docs=[];
    if(i%2===0)docs.push({id:'d'+i+'a',tipo:'Certificado médico',nombre:'Apto_fisico.pdf',fecha:'2026-03-05',vencimiento:i%4===0?'2026-05-20':'2027-03-05'});
    if(i%3===0)docs.push({id:'d'+i+'b',tipo:'Autorización salidas',nombre:'Autorizacion_salidas.pdf',fecha:'2026-03-04',vencimiento:''});
    if(i%5===0)docs.push({id:'d'+i+'c',tipo:'Certificado médico',nombre:'Informe_alergias.pdf',fecha:'2026-03-10',vencimiento:'2027-03-10'});
    return {id:'a'+i,nombre:n[0],apellidos:n[1],curso,grupo:['A','B'][i%2],color:AV_COLORS[i%AV_COLORS.length],
      foto:null,autorizacionImagen:{permitida:i%3!==1,fecha:i%3!==1?'2026-03-01':''},
      dni:(40000000+i*531217).toString().slice(0,8),nacimiento:'201'+(i%9)+'-0'+((i%9)+1)+'-15',
      direccion:'Calle '+['San Martín','Las Heras','Belgrano','Mitre','Sarmiento'][i%5]+' '+(i*37+120),cp:'55'+String(10+i).slice(0,2),ciudad:CIUDADES[i%6],
      matricula:'2026-03-0'+((i%9)+1),estadoMatricula:'Activa',
      tutor:{nombre:['Ana','Sergio','Laura','Diego','Marina'][i%5]+' '+n[1],relacion:i%2?'Madre':'Padre',email:n[0].toLowerCase()+'.'+n[1].toLowerCase()+'@gmail.com',tel:'261'+(4000000+i*8371).toString().slice(0,7)},
      tutor2:i%2===0?{nombre:['Pedro','Gabriela','Oscar','Clara'][i%4]+' '+n[1],relacion:i%2?'Padre':'Madre',email:'',tel:'261'+(5000000+i*331).toString().slice(0,7)}:null,
      emergencia:[{nombre:['Abuela Rosa','Tío Juan','Vecina Pilar'][i%3],relacion:['Abuela','Tío','Vecina'][i%3],tel:'261'+(6000000+i*517).toString().slice(0,7)}],
      comedor:{inscrito:comedor,plan:comedor?(i%2?'Fijo 5 días':'Vianda 3 días'):'—',alergias:ALERGIAS[i%ALERGIAS.length],medicacion:i%6===0?'Inhalador (asma)':'',observaciones:''},
      _actIds:actIds,actividades:[],inscripciones:[],
      pagos:[],documentos:docs,
      observaciones:i%4===0?[{id:'o'+i,fecha:'2026-05-12 10:20',autor:'Noelia Sosa',texto:'La familia solicita cambio de plan de comedor a vianda desde junio.'}]:[],
      beca:i%7===0,notas:(function(){const o={};(c&&c.materias||[]).forEach((m,mi)=>{o[m.nombre]={t1:6+((i+mi)%5),t2:6+((i+mi+1)%5),t3:i%3===0?null:6+((i+mi+2)%5)};});return o;})(),
      salud:{obraSocial:['OSDE','Swiss Medical','Galeno','OSEP','Particular','OSEP'][i%6],afiliado:'AF'+(100000+i*733),grupoSanguineo:['0+','A+','B+','AB+','0-','A-'][i%6],vacunas:i%4===0?'Calendario incompleto':'Calendario completo',medico:'Dr/a. '+['Pereyra','Gómez','Luna','Sosa'][i%4],telMedico:'261'+(4200000+i*131).toString().slice(0,7)},
      autorizados:[{nombre:['Ana','Sergio','Laura','Diego','Marina'][i%5]+' '+n[1],dni:(40000000+i*531217).toString().slice(0,8),relacion:'Tutor/a'}].concat(i%2===0?[{nombre:['Abuela Rosa','Tío Juan','Vecina Pilar'][i%3],dni:(30000000+i*111).toString().slice(0,8),relacion:['Abuela','Tío','Vecina'][i%3]}]:[]),
      retiros:i%3===0?[{fecha:'2026-06-05 12:10',quien:['Ana','Sergio','Laura','Diego','Marina'][i%5]+' '+n[1],registradoPor:'Portería'}]:[],
      incidencias:i%5===0?[{id:'inc'+i,fecha:'2026-05-'+(10+(i%18)),tipo:'Conducta',gravedad:'Leve',descripcion:'Llegada tarde reiterada; se notifica a la familia.',autor:'Preceptoría',estado:'Abierta'}]:[],
      asistencia:{faltas:i%5,retrasos:i%3,justificadas:Math.max(0,(i%5)-1)}};
  });
  // Inscripción anual por curso: confirma hasta el cupo, el resto a lista de espera
  CURSOS.forEach(cn=>{const cap=SEED_COURSES.find(c=>c.nombre===cn).capacidad;let conf=0;
    list.filter(s=>s.curso===cn).forEach((s,idx)=>{const estado=conf<cap?'confirmada':'pendiente';if(estado==='confirmada')conf++;s.inscripciones=[{ciclo:'2026',curso:cn,estado,fecha:'2026-0'+((idx%6)+1)+'-12'}];});
  });
  // Inscripción a actividades: confirma hasta el cupo, el resto a lista de espera
  SEED_ACTIVITIES.forEach(a=>{let conf=0;list.filter(s=>s._actIds.includes(a.id)).forEach((s,idx)=>{const estado=conf<a.cupo?'confirmada':'pendiente';if(estado==='confirmada')conf++;s.actividades.push({id:a.id,estado,fecha:'2026-03-1'+(idx%9)});});});
  // Cuotas (cuota del curso + comedor + actividades confirmadas)
  list.forEach((s)=>{const i=parseInt(s.id.slice(1));const c=SEED_COURSES.find(x=>x.nombre===s.curso);const actConf=s.actividades.filter(e=>e.estado==='confirmada').reduce((sum,e)=>sum+(SEED_ACTIVITIES.find(a=>a.id===e.id)?.cuota||0),0);
    for(let m=0;m<4;m++){const venc=new Date(2026,2+m,10);let estado='pagado';if(m===3)estado=(i%4===0)?'vencido':((i%4===1)?'pendiente':'pagado');else if(m===2&&i%5===0)estado='vencido';
      const base=c.cuota+(s.comedor.inscrito?COMEDOR_CUOTA:0)+actConf;
      s.pagos.push({id:'p'+i+'_'+m,mes:MONTHS[2+m]+' 2026',concepto:'Cuota'+(s.comedor.inscrito?' + comedor':'')+(actConf?' + extra':''),importe:base,estado,fechaVenc:venc.toISOString().slice(0,10),fechaPago:estado==='pagado'?new Date(2026,2+m,Math.min(6+(i%3),10)).toISOString().slice(0,10):null,metodo:estado==='pagado'?(i%2?'Transferencia':'Débito automático'):null,comprobante:estado==='pagado'?(i%2?'transferencia':'recibo'):null});}
    delete s._actIds;});
  return list;
}

let DB={};
const COUNTRY_CALENDARS={
  AR:[
    {fecha:'2026-03-09',titulo:'Inicio del ciclo lectivo',tipo:'Institucional',desc:'Comienzo de clases ciclo 2026.'},
    {fecha:'2026-03-24',titulo:'Día de la Memoria',tipo:'Feriado',desc:'Feriado nacional.'},
    {fecha:'2026-04-02',titulo:'Día del Veterano (Malvinas)',tipo:'Feriado',desc:'Feriado nacional.'},
    {fecha:'2026-05-01',titulo:'Día del Trabajador',tipo:'Feriado',desc:'Feriado nacional.'},
    {fecha:'2026-05-25',titulo:'Revolución de Mayo',tipo:'Feriado',desc:'Feriado nacional.'},
    {fecha:'2026-06-20',titulo:'Día de la Bandera',tipo:'Feriado',desc:'Feriado nacional.'},
    {fecha:'2026-07-09',titulo:'Día de la Independencia',tipo:'Feriado',desc:'Feriado nacional.'},
    {fecha:'2026-07-20',titulo:'Receso invernal',tipo:'Feriado',desc:'Vacaciones de invierno.'},
    {fecha:'2026-12-18',titulo:'Fin del ciclo lectivo',tipo:'Institucional',desc:'Cierre 2026.'},
  ],
  ES:[
    {fecha:'2026-09-10',titulo:'Inicio del curso escolar',tipo:'Institucional',desc:'Comienzo de clases curso 2026/27.'},
    {fecha:'2026-10-12',titulo:'Fiesta Nacional de España',tipo:'Festivo',desc:'Festivo nacional.'},
    {fecha:'2026-11-01',titulo:'Todos los Santos',tipo:'Festivo',desc:'Festivo nacional.'},
    {fecha:'2026-12-06',titulo:'Día de la Constitución',tipo:'Festivo',desc:'Festivo nacional.'},
    {fecha:'2026-12-08',titulo:'Inmaculada Concepción',tipo:'Festivo',desc:'Festivo nacional.'},
    {fecha:'2026-12-23',titulo:'Vacaciones de Navidad',tipo:'Festivo',desc:'Receso navideño.'},
    {fecha:'2027-04-01',titulo:'Vacaciones de Semana Santa',tipo:'Festivo',desc:'Receso de primavera.'},
    {fecha:'2027-05-01',titulo:'Día del Trabajador',tipo:'Festivo',desc:'Festivo nacional.'},
    {fecha:'2027-06-22',titulo:'Fin del curso escolar',tipo:'Institucional',desc:'Cierre curso 2026/27.'},
  ],
};
const PAIS_DEFAULTS={AR:{locale:'es-AR',moneda:'$'},ES:{locale:'es-ES',moneda:'€'}};
function calendarFor(p){return (COUNTRY_CALENDARS[p]||COUNTRY_CALENDARS.AR).map((e,i)=>({id:'cal_'+p+'_'+i,preset:true,...e}));}
function freshDB(){return {v:DB_VERSION,
  config:{nombre:'Aulora',sub:'Gestión Escolar',pais:'AR',locale:'es-AR',centroNombre:'Instituto San Martín de Mendoza',direccion:'Av. San Martín 1450, Ciudad de Mendoza',provincia:'Mendoza',ciclo:'2026',moneda:'$',objetivoCobro:90,diaVenc:10,moraPctDia:0.5,descHermanos:10,descBeca:50,descAnual:5,prioridadEspera:'fecha'},
  users:JSON.parse(JSON.stringify(SEED_USERS)),students:makeStudents(),courses:JSON.parse(JSON.stringify(SEED_COURSES)),activities:JSON.parse(JSON.stringify(SEED_ACTIVITIES)),templates:JSON.parse(JSON.stringify(SEED_TEMPLATES)),
  attendance:{},
  eventos:calendarFor('AR'),
  mensajes:[],
  savedViews:[],
  afa:{cuota:8000,socios:[],movimientos:[
    {id:'am1',fecha:'2026-04-10',tipo:'ingreso',cat:'Cuota AFA',detalle:'Cuotas socios abril',monto:120000},
    {id:'am2',fecha:'2026-04-22',tipo:'egreso',cat:'Materiales',detalle:'Material taller de robótica',monto:45000},
  ]},
  contab:{movimientos:[
    {id:'cm1',fecha:'2026-05-05',tipo:'egreso',cat:'Sueldos',detalle:'Honorarios docentes mayo',monto:1850000},
    {id:'cm2',fecha:'2026-05-08',tipo:'egreso',cat:'Servicios',detalle:'Luz, agua, internet',monto:230000},
    {id:'cm3',fecha:'2026-05-12',tipo:'ingreso',cat:'Subvención',detalle:'Aporte estatal mayo',monto:600000},
  ]},
  audit:[
    {id:'lg1',fecha:'2026-06-05 09:14',usuario:'Marta Ferreyra',rol:'super_admin',accion:'login',entidad:'Sistema',detalle:'Inicio de sesión',tipo:'info'},
    {id:'lg2',fecha:'2026-06-05 09:31',usuario:'Noelia Sosa',rol:'admin',accion:'editar',entidad:'Cuota · Thiago López',detalle:'Estado cambiado a pagado',tipo:'edit'},
    {id:'lg3',fecha:'2026-06-05 12:02',usuario:'Marta Ferreyra',rol:'super_admin',accion:'inscribir',entidad:'Matrícula · 1° Grado',detalle:'Alumno en lista de espera (cupo completo)','tipo':'info'},
  ]};}
function loadLocal(){try{const s=localStorage.getItem('aulora_db');if(s){const d=JSON.parse(s);if(d.v===DB_VERSION)return d;}}catch(e){}return null;}
function loadDB(){DB=loadLocal()||freshDB();}
function _sanStr(v){return typeof v==='string'?v.replace(/[<>]/g,''):v;}
function _deepSan(o){if(Array.isArray(o))return o.map(_deepSan);if(o&&typeof o==='object'){const r={};for(const k in o)r[k]=_deepSan(o[k]);return r;}return _sanStr(o);}
function saveDB(){const clean=_deepSan(DB);if(window.AuloraBackend&&window.AuloraBackend.enabled){window.AuloraBackend.save(clean);}else{try{localStorage.setItem('aulora_db',JSON.stringify(clean));}catch(e){}}}
loadDB();

let CURRENT=null,famStudent=null,view='dashboard',openStudentId=null,detailTab='info';
let filters={curso:'',grupo:'',estado:'',comedor:'',imagen:'',docs:'',matricula:'',q:'',sort:'nombre',adv:false};
let auditFilter={tipo:'',q:''},pagoTab='todos',inscCiclo='2026',actFilter='';

const $=s=>document.querySelector(s);
const cfg=()=>DB.config;
const fmt=n=>cfg().moneda+' '+Math.round(n).toLocaleString(cfg().locale||'es-AR');
const initials=n=>n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const esc=s=>(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function realEstado(p){if(p.estado==='pagado')return'pagado';if(new Date(p.fechaVenc)<today)return'vencido';return'pendiente';}
function perm(p){return CURRENT&&CURRENT.perms&&CURRENT.perms[p];}
function getAct(id){return DB.activities.find(a=>a.id===id);}
function courseByName(n){return DB.courses.find(c=>c.nombre===n);}
function studentName(s){return s.nombre+' '+s.apellidos;}
/* Inscripción anual */
function getIns(s,ciclo){ciclo=ciclo||cfg().ciclo;return (s.inscripciones||[]).find(x=>x.ciclo===ciclo);}
function cursoConfirmados(nombre,ciclo){ciclo=ciclo||inscCiclo;return DB.students.filter(s=>{const i=getIns(s,ciclo);return i&&i.curso===nombre&&i.estado==='confirmada';});}
function tieneHermanoEn(s,curso,ciclo){return DB.students.some(o=>o.id!==s.id&&o.tutor&&s.tutor&&o.tutor.email&&o.tutor.email===s.tutor.email&&(()=>{const i=getIns(o,ciclo);return i&&i.curso===curso&&i.estado==='confirmada';})());}
function cursoEspera(nombre,ciclo){ciclo=ciclo||inscCiclo;const pri=(cfg().prioridadEspera)||'fecha';
  let arr=DB.students.filter(s=>{const i=getIns(s,ciclo);return i&&i.curso===nombre&&i.estado==='pendiente';});
  arr.sort((a,b)=>{const fa=getIns(a,ciclo).fecha,fb=getIns(b,ciclo).fecha;
    if(pri==='hermanos'){const ha=tieneHermanoEn(a,nombre,ciclo)?0:1,hb=tieneHermanoEn(b,nombre,ciclo)?0:1;if(ha!==hb)return ha-hb;}
    if(pri==='beca'){const ba=a.beca?0:1,bb=b.beca?0:1;if(ba!==bb)return ba-bb;}
    return fa>fb?1:-1;});
  return arr;}
/* Actividades */
function studentActs(s){return (s.actividades||[]).map(e=>{const a=getAct(e.id);return a?{...a,_estado:e.estado}:null;}).filter(Boolean);}
function actConfirmados(id){return DB.students.filter(s=>(s.actividades||[]).some(e=>e.id===id&&e.estado==='confirmada'));}
function actEspera(id){return DB.students.filter(s=>(s.actividades||[]).some(e=>e.id===id&&e.estado==='pendiente'));}
function docEstado(d){if(!d.vencimiento)return'vigente';const v=new Date(d.vencimiento);if(v<today)return'caducado';return((v-today)/86400000)<=45?'porcaducar':'vigente';}
function avatarHTML(s,size){size=size||36;if(s.foto&&s.autorizacionImagen.permitida)return `<img class="avatar" style="width:${size}px;height:${size}px" src="${s.foto}">`;
  const fs=size>50?Math.round(size/3):13;return `<div class="avatar" style="width:${size}px;height:${size}px;background:${s.color};font-size:${fs}px">${initials(studentName(s))}</div>`;}
function logAudit(accion,entidad,detalle,tipo){tipo=tipo||'info';DB.audit.unshift({id:'lg'+Date.now()+Math.random().toString(16).slice(2,5),fecha:new Date().toISOString().slice(0,16).replace('T',' '),usuario:CURRENT?CURRENT.nombre:'—',rol:CURRENT?CURRENT.rol:'—',accion,entidad,detalle,tipo});saveDB();}
function resizeImage(file,max,cb){const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height;const sc=Math.min(1,max/Math.max(w,h));const cw=Math.round(w*sc),ch=Math.round(h*sc);const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;cv.getContext('2d').drawImage(img,0,0,cw,ch);cb(cv.toDataURL('image/jpeg',0.82));};img.src=e.target.result;};r.readAsDataURL(file);}
function toast(msg,type){type=type||'success';const icons={success:'<path d="M20 6L9 17l-5-5"/>',danger:'<path d="M18 6L6 18M6 6l12 12"/>',warn:'<path d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',info:'<path d="M12 16v-4M12 8h.01"/><circle cx="12" cy="12" r="9"/>'};const t=document.createElement('div');t.className='toast '+type;t.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type]||icons.success}</svg>${msg}`;$('#toasts').appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(40px)';setTimeout(()=>t.remove(),250);},3600);}

function applyBrand(){$('#brandName').textContent=cfg().nombre;$('#brandSub').textContent=cfg().sub;$('#loginBrand').textContent=cfg().nombre;const b=document.querySelector('.top-bell');if(b)b.onclick=showNotifs;}
applyBrand();
const isPortalRole=r=>r==='familia'||r==='alumno';
function quickLogin(d){if(window.AuloraBackend&&window.AuloraBackend.enabled){toast('Accesos demo deshabilitados: iniciá sesión con tu cuenta.','warn');return;}if(d==='fam'){loginAs({nombre:'Familia '+studentName(DB.students[0]),rol:'familia',perms:{}});return;}loginAs(DB.users.find(x=>x.demo===d));}
function loginGoogle(){if(window.AuloraBackend&&window.AuloraBackend.enabled&&window.AuloraBackend.signInGoogle){window.AuloraBackend.signInGoogle().catch(err=>toast('No se pudo iniciar con Google: '+(err&&(err.message||err.code)||'error'),'danger'));}else{toast('Configurá Supabase (config.js) y el proveedor Google para usar este acceso.','warn');}}
function doLogin(){const e=$('#loginEmail').value.trim().toLowerCase();
  if(window.AuloraBackend&&window.AuloraBackend.enabled){const p=$('#loginPass').value;window.AuloraBackend.signIn(e,p).catch(err=>toast('No se pudo iniciar sesión: '+(err&&(err.code||err.message)||'error'),'danger'));return;}
  const u=DB.users.find(x=>x.email.toLowerCase()===e&&x.activo);if(u)loginAs(u);else toast('Usuario no encontrado o inactivo.','danger');}
function loginAs(u){CURRENT=u;famStudent=DB.students[0];inscCiclo=cfg().ciclo;$('#login').style.display='none';$('#app').style.display='block';$('#suName').textContent=u.nombre;$('#suRole').textContent=ROLE_LABEL[u.rol]||u.rol;$('#suAv').textContent=initials(u.nombre);if(!isPortalRole(u.rol))logAudit('login','Sistema','Inicio de sesión','info');buildNav();go(isPortalRole(u.rol)?'portal':'dashboard');}
function logout(){if(window.AuloraBackend&&window.AuloraBackend.enabled){window.AuloraBackend.signOut();return;}CURRENT=null;$('#app').style.display='none';$('#login').style.display='flex';}
/* Puente con backend Firebase (src/backend.js, módulo). Si no hay backend, modo local. */
document.addEventListener('visibilitychange',function(){if(document.hidden&&window.AuloraBackend&&window.AuloraBackend.flush)window.AuloraBackend.flush();});
window.addEventListener('pagehide',function(){if(window.AuloraBackend&&window.AuloraBackend.flush)window.AuloraBackend.flush();});
window.auloraBackendReady=function(){
  if(!(window.AuloraBackend&&window.AuloraBackend.enabled))return;
  const dr=document.querySelector('.demo-roles');if(dr)dr.style.display='none';
  const pf=document.getElementById('loginPass');if(pf)pf.value='';
  let _authed=false;
  window.AuloraBackend.onAuth(async fu=>{
    if(fu){
      if(_authed)return; // ya cargado: ignorar refresh/refoco de pestaña (no pisar ediciones)
      _authed=true;
      let d=null;try{d=await window.AuloraBackend.load();}catch(e){}
      if(d&&d.v===DB_VERSION)DB=d;else{DB=freshDB();window.AuloraBackend.save(DB);}
      applyBrand();
      const em=(fu.email||'').toLowerCase();
      let prof=null;try{prof=await window.AuloraBackend.myProfile();}catch(e){}
      let u=DB.users.find(x=>x.email&&x.email.toLowerCase()===em&&x.activo);
      if(!u){const rol=(prof&&prof.rol)||'admin';u={id:'u'+Date.now(),nombre:(prof&&prof.nombre)||em.split('@')[0]||'Usuario',email:fu.email,rol,activo:true,perms:rolePreset(rol)};DB.users.unshift(u);window.AuloraBackend.save(DB);}
      if(prof&&prof.rol&&prof.rol!==u.rol){u.rol=prof.rol;u.perms=rolePreset(prof.rol);} // sincronizar rol del servidor SOLO si cambió
      loginAs(u);
    }else{_authed=false;CURRENT=null;const a=document.getElementById('app');const l=document.getElementById('login');if(a)a.style.display='none';if(l)l.style.display='flex';}
  });
};

const NAV=[
  {g:'Principal'},
  {id:'dashboard',label:'Dashboard',perm:'ver_dashboard',icon:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'},
  {id:'estadisticas',label:'Estadísticas',perm:'ver_estadisticas',icon:'<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>'},
  {id:'alumnos',label:'Alumnos',perm:'ver_alumnos',icon:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'},
  {id:'pagos',label:'Cuotas',perm:'ver_pagos',icon:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',badge:true},
  {g:'Académico'},
  {id:'inscripciones',label:'Inscripciones',perm:'ver_inscripciones',icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>'},
  {id:'asistencia',label:'Asistencia',perm:'ver_alumnos',icon:'<path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h9"/>'},
  {id:'calificaciones',label:'Calificaciones',perm:'ver_alumnos',icon:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'},
  {id:'rendimiento',label:'Rendimiento',perm:'ver_estadisticas',icon:'<path d="M3 3v18h18"/><path d="M7 13l3-3 3 2 4-5"/><circle cx="7" cy="13" r="1"/><circle cx="20" cy="7" r="1"/>'},
  {id:'calendario',label:'Calendario',perm:'ver_alumnos',icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'},
  {id:'actividades',label:'Actividades',perm:'ver_actividades',icon:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'},
  {id:'comedor',label:'Comedor',perm:'ver_comedor',icon:'<path d="M3 2v7c0 1.1.9 2 2 2a2 2 0 002-2V2M5 2v20M17 2a3 3 0 00-3 3v8h6V5a3 3 0 00-3-3zM17 13v9"/>'},
  {g:'Colegio'},
  {id:'reportes',label:'Reportes',perm:'ver_estadisticas',icon:'<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>'},
  {id:'contabilidad',label:'Contabilidad',perm:'ver_contabilidad',icon:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16"/>'},
  {id:'afa',label:'AFA / AMPA',perm:'ver_afa',icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'},
  {id:'comunicaciones',label:'Comunicaciones',perm:'ver_comunicaciones',icon:'<path d="M4 4h16v12H5.2L4 17.2z"/>'},
  {id:'auditoria',label:'Auditoría',perm:'ver_auditoria',icon:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>'},
  {id:'usuarios',label:'Usuarios y permisos',perm:'gestionar_usuarios',icon:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'},
  {id:'configuracion',label:'Configuración',perm:'editar_config',icon:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 00-1.7 1l-2.3-1-2 3.4L4 11a7 7 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.3 1 2-3.4-2-1.5a7 7 0 00.1-1z"/>'},
];
function buildNav(){
  if(isPortalRole(CURRENT.rol)){$('#sideNav').innerHTML=`<button class="nav-item active" onclick="go('portal')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>Portal del alumno</button>`;return;}
  const overdue=DB.students.reduce((s,st)=>s+st.pagos.filter(p=>realEstado(p)==='vencido').length,0);
  let h='';NAV.forEach(n=>{if(n.g){h+=`<div class="nav-group">${n.g}</div>`;return;}if(!perm(n.perm))return;const badge=n.badge&&overdue?`<span class="nav-badge">${overdue}</span>`:'';h+=`<button class="nav-item" data-v="${n.id}" onclick="go('${n.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${n.icon}</svg>${n.label}${badge}</button>`;});$('#sideNav').innerHTML=h;}
function go(v){view=v;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
  const t={dashboard:['Dashboard','Resumen general del colegio'],estadisticas:['Estadísticas','Análisis y métricas detalladas'],alumnos:['Alumnos','Legajos, búsqueda y filtros'],'alumno-detalle':['Legajo del alumno',''],pagos:['Cuotas','Recibos, comprobantes y morosidad'],inscripciones:['Inscripciones','Matrícula por ciclo lectivo, cupos y lista de espera'],asistencia:['Asistencia','Toma diaria por curso y porcentajes'],calificaciones:['Calificaciones','Notas por materia, trimestre y boletín'],rendimiento:['Rendimiento académico','Estadística por clase y materia: qué destaca y qué reforzar'],calendario:['Calendario escolar','Actos, feriados, reuniones y exámenes'],reportes:['Reportes financieros','Ingresos, deudores y proyección'],comedor:['Comedor','Inscriptos, alergias y dietas'],actividades:['Actividades','Extraescolares, cupos e inscripciones'],comunicaciones:['Comunicaciones','Plantillas y envíos a familias'],auditoria:['Auditoría','Registro de cambios del sistema'],usuarios:['Usuarios y permisos','Control de acceso granular'],configuracion:['Configuración','Datos y ajustes del colegio'],contabilidad:['Contabilidad','Movimientos, ingresos, egresos y balance'],afa:['AFA / AMPA','Asociación de familias: socios, cuota y caja'],portal:['Portal del alumno','Tu información escolar']}[v]||['',''];
  $('#pageTitle').textContent=t[0];$('#pageSub').textContent=t[1];$('#topSearch').style.display=(v==='alumnos'||v==='pagos')?'block':'none';render();}

function render(){const c=$('#content');const R={dashboard:viewDashboard,estadisticas:viewEstadisticas,alumnos:viewAlumnos,'alumno-detalle':viewAlumnoDetalle,pagos:viewPagos,inscripciones:viewInscripciones,asistencia:viewAsistencia,calificaciones:viewCalificaciones,calendario:viewCalendario,rendimiento:viewRendimiento,reportes:viewReportes,comedor:viewComedor,actividades:viewActividades,comunicaciones:viewComunicaciones,auditoria:viewAuditoria,usuarios:viewUsuarios,configuracion:viewConfig,contabilidad:viewContabilidad,afa:viewAFA,portal:viewPortal};c.innerHTML=(R[view]||(()=>''))();c.querySelectorAll('.view').forEach(v=>v.classList.add('active'));drawCharts();}

function metrics(){let cobrado=0,pendiente=0,vencido=0,nVenc=0;const morosos=[];
  DB.students.forEach(s=>{s.pagos.forEach(p=>{const e=realEstado(p);if(e==='pagado')cobrado+=p.importe;else if(e==='pendiente')pendiente+=p.importe;else{vencido+=p.importe;nVenc++;}});const v=s.pagos.filter(p=>realEstado(p)==='vencido');if(v.length)morosos.push({s,pagos:v,total:v.reduce((a,b)=>a+b.importe,0)});});
  const docsCad=[];DB.students.forEach(s=>s.documentos.forEach(d=>{const e=docEstado(d);if(e!=='vigente')docsCad.push({s,d,e});}));
  let espera=0;CURSOS.forEach(cn=>espera+=cursoEspera(cn,cfg().ciclo).length);
  return {cobrado,pendiente,vencido,nVenc,morosos,docsCad,comedor:DB.students.filter(s=>s.comedor.inscrito).length,activos:DB.students.length,sinImagen:DB.students.filter(s=>!s.autorizacionImagen.permitida).length,espera};}
function kpi(label,bg,fg,val,trend,dir,ico){return `<div class="kpi"><div class="ic" style="background:var(${bg});color:var(${fg})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ico}</svg></div><div class="label">${label}</div><div class="val tnum">${val}</div>${trend?`<div class="trend ${dir}">${dir==='up'?'▲':dir==='down'?'▼':'•'} ${trend}</div>`:''}</div>`;}
function icoXls(){return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13l6 6M15 13l-6 6"/></svg>';}
function icoUp(){return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>';}
function noPerm(){return `<div class="view"><div class="no-perm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg><h3 style="font-size:18px">Acceso restringido</h3><p>No tenés permiso para ver esta sección. Contactá al Super Admin.</p></div></div>`;}

/* ====================== UTILIDADES UI ====================== */
let charts={};
function openModal(html,wide){$('#modal').className='modal'+(wide?' wide':'');$('#modal').innerHTML=html;$('#modalBg').classList.add('show');}
function closeModal(){$('#modalBg').classList.remove('show');}
$('#modalBg').addEventListener('click',e=>{if(e.target.id==='modalBg')closeModal();});
function confirmHTML(title,msg,onok,okLabel){return `<div class="modal-head"><h3>${title}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><p>${msg}</p></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-danger" onclick="${onok}">${okLabel||'Confirmar'}</button></div>`;}
function onGlobalSearch(v){filters.q=v;render();}
function insVar(elId,v){const el=document.getElementById(elId);const s=el.selectionStart||el.value.length;el.value=el.value.slice(0,s)+v+el.value.slice(s);el.focus();}
function inscBadge(e){if(e==='confirmada')return '<span class="badge b-success nodot">Confirmada</span>';if(e==='pendiente')return '<span class="badge b-warn nodot">Lista de espera</span>';return '<span class="badge b-grey nodot">Sin inscripción</span>';}
function viewReceipt(t){openModal(`<div class="modal-head"><h3>${t==='doc'?'Documento':'Comprobante'}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body" style="text-align:center"><div style="background:var(--surface-2);border:1px dashed var(--line);border-radius:var(--r);padding:40px;color:var(--muted)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:10px"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg><div style="font-weight:600;color:var(--ink)">Vista previa del archivo adjunto</div><small>(demostración)</small></div></div>`);}
function refreshBell(){const n=DB.students?DB.students.reduce((s,st)=>s+st.pagos.filter(p=>realEstado(p)==='vencido').length,0):0;const d=$('#bellDot');if(d)d.style.display=n?'block':'none';}
setInterval(refreshBell,1500);

/* ====================== INSCRIPCIÓN ANUAL (cupo + lista de espera) ====================== */
function inscribirAlumnoCurso(sid,cursoNombre,ciclo){ciclo=ciclo||inscCiclo;const s=DB.students.find(x=>x.id===sid);const c=courseByName(cursoNombre);if(!s||!c)return;
  const conf=cursoConfirmados(cursoNombre,ciclo).length;const estado=conf<c.capacidad?'confirmada':'pendiente';
  s.inscripciones=(s.inscripciones||[]).filter(x=>x.ciclo!==ciclo);
  s.inscripciones.push({ciclo,curso:cursoNombre,estado,fecha:new Date().toISOString().slice(0,10)});
  if(estado==='confirmada')s.curso=cursoNombre;
  logAudit('inscribir','Matrícula · '+studentName(s),`${cursoNombre} — ciclo ${ciclo} — ${estado}`,'info');saveDB();
  toast(estado==='confirmada'?`Inscripción confirmada en ${cursoNombre}.`:`Cupo completo. ${studentName(s)} quedó en LISTA DE ESPERA (pendiente de confirmar).`,estado==='confirmada'?'success':'warn');}
function confirmarVacante(sid,ciclo){ciclo=ciclo||inscCiclo;const s=DB.students.find(x=>x.id===sid);const i=getIns(s,ciclo);if(!i)return;const c=courseByName(i.curso);
  if(cursoConfirmados(i.curso,ciclo).length>=c.capacidad){toast('Todavía no hay vacante libre en '+i.curso+'.','warn');return;}
  i.estado='confirmada';s.curso=i.curso;logAudit('inscribir','Matrícula · '+studentName(s),`Vacante confirmada en ${i.curso}`,'info');saveDB();render();toast('Vacante confirmada para '+studentName(s)+'.','success');}
function bajaCurso(sid,ciclo){ciclo=ciclo||inscCiclo;const s=DB.students.find(x=>x.id===sid);const i=getIns(s,ciclo);if(!i)return;const curso=i.curso;const eraConf=i.estado==='confirmada';
  s.inscripciones=s.inscripciones.filter(x=>x.ciclo!==ciclo);logAudit('eliminar','Matrícula · '+studentName(s),`Baja de ${curso} (ciclo ${ciclo})`,'delete');
  if(eraConf){const next=cursoEspera(curso,ciclo)[0];if(next){const ni=getIns(next,ciclo);ni.estado='confirmada';next.curso=curso;logAudit('inscribir','Matrícula · '+studentName(next),`Confirmado automáticamente (se liberó vacante en ${curso})`,'info');toast('Se liberó una vacante: '+studentName(next)+' confirmado/a automáticamente.','success');}else toast('Baja registrada. Vacante liberada en '+curso+'.','success');}
  else toast('Baja de lista de espera registrada.','success');
  saveDB();render();}

/* ====================== ACTIVIDADES (cupo + lista de espera) ====================== */
function toggleAct(sid,aid){const s=DB.students.find(x=>x.id===sid);const a=getAct(aid);const e=(s.actividades||[]).find(x=>x.id===aid);
  if(e){const era=e.estado;s.actividades=s.actividades.filter(x=>x.id!==aid);logAudit('editar','Actividad · '+studentName(s),'Baja de '+a.nombre,'edit');
    if(era==='confirmada'){const next=actEspera(aid)[0];if(next){next.actividades.find(x=>x.id===aid).estado='confirmada';logAudit('editar','Actividad · '+studentName(next),'Confirmado automáticamente en '+a.nombre,'edit');toast('Vacante liberada: '+studentName(next)+' confirmado/a en '+a.nombre+'.','success');}else toast('Baja registrada.','success');}
    else toast('Quitado de la lista de espera.','success');}
  else{const conf=actConfirmados(aid).length;const estado=conf<a.cupo?'confirmada':'pendiente';s.actividades=s.actividades||[];s.actividades.push({id:aid,estado,fecha:new Date().toISOString().slice(0,10)});
    logAudit('editar','Actividad · '+studentName(s),(estado==='confirmada'?'Alta en ':'Lista de espera en ')+a.nombre,'edit');
    toast(estado==='confirmada'?'Inscripción confirmada en '+a.nombre+'.':'Cupo completo. En LISTA DE ESPERA (pendiente de confirmar).',estado==='confirmada'?'success':'warn');}
  saveDB();render();}
function confirmarActVacante(sid,aid){const s=DB.students.find(x=>x.id===sid);const a=getAct(aid);if(actConfirmados(aid).length>=a.cupo){toast('Sin vacante libre todavía en '+a.nombre+'.','warn');return;}const e=s.actividades.find(x=>x.id===aid);e.estado='confirmada';logAudit('editar','Actividad · '+studentName(s),'Vacante confirmada en '+a.nombre,'edit');saveDB();render();toast('Vacante confirmada.','success');}

/* ====================== EXPORTACIÓN ====================== */
function exportExcel(type){let rows=[],name='aulora';
  if(type==='alumnos'){name='alumnos';rows=DB.students.map(s=>{const ins=getIns(s,cfg().ciclo);const pend=s.pagos.filter(p=>realEstado(p)!=='pagado').reduce((a,b)=>a+b.importe,0);return {Apellido:s.apellidos,Nombre:s.nombre,Curso:s.curso,Division:s.grupo,DNI:s.dni,Inscripcion:ins?ins.estado:'—',Tutor:s.tutor.nombre,Email:s.tutor.email,Telefono:s.tutor.tel,Comedor:s.comedor.inscrito?s.comedor.plan:'No',Alergias:s.comedor.alergias,Imagen:s.autorizacionImagen.permitida?'Si':'No',Actividades:studentActs(s).filter(a=>a._estado==='confirmada').map(a=>a.nombre).join(', '),Pendiente:pend};});}
  else if(type==='pagos'){name='cuotas';DB.students.forEach(s=>s.pagos.forEach(p=>rows.push({Alumno:studentName(s),Curso:s.curso,Mes:p.mes,Concepto:p.concepto,Importe:p.importe,Vence:p.fechaVenc,Pagado:p.fechaPago||'',Estado:realEstado(p),Metodo:p.metodo||''})));}
  else if(type==='inscripciones'){name='inscripciones';DB.students.forEach(s=>(s.inscripciones||[]).forEach(i=>rows.push({Alumno:studentName(s),Ciclo:i.ciclo,Curso:i.curso,Estado:i.estado,Fecha:i.fecha})));}
  else if(type==='auditoria'){name='auditoria';rows=DB.audit.map(l=>({Fecha:l.fecha,Usuario:l.usuario,Rol:ROLE_LABEL[l.rol]||l.rol,Accion:l.accion,Entidad:l.entidad,Detalle:l.detalle}));}
  const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,name);XLSX.writeFile(wb,'aulora_'+name+'_'+today.toISOString().slice(0,10)+'.xlsx');logAudit('info','Exportación',`Exportado ${name} (${rows.length} filas)`,'info');saveDB();toast('Excel descargado.','success');}

/* ====================== DASHBOARD ====================== */
function viewDashboard(){const m=metrics();const tasa=Math.round(m.cobrado/(m.cobrado+m.pendiente+m.vencido)*100)||0;
  const rolePanel=dashRolePanel(m);
  return `<div class="view">${rolePanel}
   ${perm('editar_pagos')||perm('ver_comunicaciones')||perm('importar_pagos')?`<div class="toolbar"><span style="font-weight:700;color:var(--ink-soft)">Acciones rápidas:</span>
     ${perm('editar_pagos')?`<button class="btn btn-primary btn-sm" onclick="modalGenerarCuota()">＋ Generar cuota del mes</button>`:''}
     ${perm('ver_comunicaciones')?`<button class="btn btn-ghost btn-sm" onclick="modalRecordarMorosos()">✉ Recordar a morosos (${m.morosos.length})</button>`:''}
     ${perm('ver_inscripciones')?`<button class="btn btn-ghost btn-sm" onclick="go('inscripciones')">🎓 Lista de espera (${m.espera})</button>`:''}</div>`:''}
   <div class="kpis">
     ${kpi('Cobrado (ciclo)','--brand-soft','--brand',fmt(m.cobrado),'al día','up','<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>')}
     ${kpi('Pendiente','--warn-soft','--warn',fmt(m.pendiente),m.nVenc+' cuotas vencidas','down','<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')}
     ${kpi('Alumnos activos','--blue-soft','--blue',m.activos,m.comedor+' en comedor','up','<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>')}
     ${kpi('En lista de espera',m.espera?'--warn-soft':'--success-soft',m.espera?'--warn':'--success',m.espera,'inscripciones pendientes','flat','<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>')}
   </div>
   <div class="grid2">
     <div class="panel"><div class="panel-head"><h3>Cobranzas por mes</h3><span class="sub">Cobrado vs pendiente</span><div class="right"><button class="btn btn-ghost btn-sm" onclick="go('estadisticas')">Estadísticas →</button></div></div><div class="panel-body"><div class="chart-box"><canvas id="chIngresos"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Estado de cuotas</h3></div><div class="panel-body"><div class="chart-box"><canvas id="chEstado"></canvas></div></div></div>
   </div>
   <div class="grid2e">
     <div class="panel"><div class="panel-head"><h3>Alertas de morosidad</h3><span class="nav-badge" style="margin-left:6px">${m.morosos.length}</span><div class="right"><button class="btn btn-ghost btn-sm" onclick="go('pagos')">Ver todo</button></div></div>
       <div class="panel-body" style="max-height:300px;overflow:auto">${m.morosos.length?m.morosos.slice(0,7).map(mo=>`<div class="alert-item">${avatarHTML(mo.s)}<div class="info"><b>${studentName(mo.s)}</b><small>${mo.s.curso} · ${mo.pagos.length} cuota(s) · Tutor: ${mo.s.tutor.nombre}</small></div><span class="badge b-danger">${fmt(mo.total)}</span>${perm('ver_comunicaciones')?`<button class="btn btn-ghost btn-sm" onclick="modalSend(null,'${mo.s.id}')">Avisar</button>`:''}</div>`).join(''):'<div class="empty">Sin morosidad. ¡Todo al día! 🎉</div>'}</div></div>
     <div class="panel"><div class="panel-head"><h3>Documentos por revisar</h3><span class="nav-badge" style="margin-left:6px;background:var(--warn)">${m.docsCad.length}</span></div>
       <div class="panel-body" style="max-height:300px;overflow:auto">${m.docsCad.length?m.docsCad.slice(0,7).map(x=>`<div class="alert-item"><div class="doc-ic" style="${x.e==='caducado'?'background:var(--danger-soft);color:var(--danger)':'background:var(--warn-soft);color:var(--warn)'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg></div><div class="info"><b>${studentName(x.s)}</b><small>${x.d.tipo} · vence ${x.d.vencimiento}</small></div><span class="badge ${x.e==='caducado'?'b-danger':'b-warn'}">${x.e==='caducado'?'Vencido':'Por vencer'}</span><button class="btn btn-ghost btn-sm" onclick="openStudent('${x.s.id}','documentos')">Ver</button></div>`).join(''):'<div class="empty">Documentación al día.</div>'}</div></div>
   </div></div>`;}

/* ====================== ESTADÍSTICAS ====================== */
function viewEstadisticas(){if(!perm('ver_estadisticas'))return noPerm();const m=metrics();
  const cupoTot=DB.courses.reduce((a,c)=>a+c.capacidad,0);const confTot=CURSOS.reduce((a,cn)=>a+cursoConfirmados(cn,cfg().ciclo).length,0);
  return `<div class="view"><div class="toolbar"><div class="grow"></div>${perm('importar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="exportExcel('alumnos')">${icoXls()} Exportar datos</button>`:''}</div>
   <div class="kpis">
     ${kpi('Facturación total','--brand-soft','--brand',fmt(m.cobrado+m.pendiente+m.vencido),'ciclo '+cfg().ciclo,'flat','<path d="M3 3v18h18M7 14l4-4 3 3 5-6"/>')}
     ${kpi('Morosidad','--danger-soft','--danger',fmt(m.vencido),(Math.round(m.vencido/(m.cobrado+m.pendiente+m.vencido)*100)||0)+'% del total','down','<path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>')}
     ${kpi('Ocupación de cupos','--blue-soft','--blue',Math.round(confTot/cupoTot*100)+'%',confTot+'/'+cupoTot+' vacantes','flat','<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>')}
     ${kpi('Sin autoriz. imagen','--warn-soft','--warn',m.sinImagen,'de '+m.activos+' alumnos','flat','<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>')}
   </div>
   <div class="grid2e">
     <div class="panel"><div class="panel-head"><h3>Evolución de cobranzas</h3></div><div class="panel-body"><div class="chart-box"><canvas id="chEvo"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Tasa de cobro mensual</h3></div><div class="panel-body"><div class="chart-box"><canvas id="chTasa"></canvas></div></div></div>
   </div>
   <div class="grid2e">
     <div class="panel"><div class="panel-head"><h3>Alumnos por curso</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="chCurso"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Morosidad por curso</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="chMoro"></canvas></div></div></div>
   </div>
   <div class="grid3">
     <div class="panel"><div class="panel-head"><h3>Comedor</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="chComedor"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Cupos de actividades</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="chOcup"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Alergias / dietas</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="chAlerg"></canvas></div></div></div>
   </div></div>`;}

function drawCharts(){Object.values(charts).forEach(c=>{try{c.destroy();}catch(e){}});charts={};if(typeof Chart==='undefined')return;Chart.defaults.font.family='Hanken Grotesk';Chart.defaults.color='#8C8C9E';
  const meses=['Mar','Abr','May','Jun'];const mk=(id,c2)=>{const el=document.getElementById(id);if(el)charts[id]=new Chart(el,c2);};
  if(view==='dashboard'){const cob=meses.map(()=>0),pen=meses.map(()=>0);
    DB.students.forEach(s=>s.pagos.forEach(p=>{const mi=meses.indexOf(p.mes.split(' ')[0]);if(mi<0)return;if(realEstado(p)==='pagado')cob[mi]+=p.importe;else pen[mi]+=p.importe;}));
    mk('chIngresos',{type:'bar',data:{labels:meses,datasets:[{label:'Cobrado',data:cob,backgroundColor:'#0E7C66',borderRadius:6,maxBarThickness:38},{label:'Pendiente',data:pen,backgroundColor:'#E0743B',borderRadius:6,maxBarThickness:38}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:16}}},scales:{x:{grid:{display:false}},y:{grid:{color:'#EEECE5'},ticks:{callback:v=>(v/1000)+'k'}}}}});
    const m=metrics();mk('chEstado',{type:'doughnut',data:{labels:['Cobrado','Pendiente','Vencido'],datasets:[{data:[m.cobrado,m.pendiente,m.vencido],backgroundColor:['#1F9D55','#D89A0A','#D6453F'],borderWidth:3,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'66%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:14}}}}});}
  if(view==='estadisticas'){const cob=meses.map(()=>0),tot=meses.map(()=>0);
    DB.students.forEach(s=>s.pagos.forEach(p=>{const mi=meses.indexOf(p.mes.split(' ')[0]);if(mi<0)return;tot[mi]+=p.importe;if(realEstado(p)==='pagado')cob[mi]+=p.importe;}));
    mk('chEvo',{type:'line',data:{labels:meses,datasets:[{label:'Cobrado',data:cob,borderColor:'#0E7C66',backgroundColor:'rgba(14,124,102,.12)',fill:true,tension:.35,borderWidth:2.5,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#EEECE5'},ticks:{callback:v=>(v/1000)+'k'}}}}});
    mk('chTasa',{type:'line',data:{labels:meses,datasets:[{data:meses.map((x,i)=>tot[i]?Math.round(cob[i]/tot[i]*100):0),borderColor:'#3B5BE0',backgroundColor:'rgba(59,91,224,.1)',fill:true,tension:.35,borderWidth:2.5,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{min:0,max:100,grid:{color:'#EEECE5'},ticks:{callback:v=>v+'%'}}}}});
    const pc={};DB.students.forEach(s=>pc[s.curso]=(pc[s.curso]||0)+1);
    mk('chCurso',{type:'bar',data:{labels:Object.keys(pc),datasets:[{data:Object.values(pc),backgroundColor:'#3B5BE0',borderRadius:5,maxBarThickness:22}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#EEECE5'},ticks:{stepSize:1}}}}});
    const mo={};DB.students.forEach(s=>{const v=s.pagos.filter(p=>realEstado(p)==='vencido').reduce((a,b)=>a+b.importe,0);if(v)mo[s.curso]=(mo[s.curso]||0)+v;});
    mk('chMoro',{type:'bar',data:{labels:Object.keys(mo),datasets:[{data:Object.values(mo),backgroundColor:'#D6453F',borderRadius:5,maxBarThickness:20}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#EEECE5'}},y:{grid:{display:false}}}}});
    const cin=DB.students.filter(s=>s.comedor.inscrito).length;
    mk('chComedor',{type:'doughnut',data:{labels:['Inscriptos','No'],datasets:[{data:[cin,DB.students.length-cin],backgroundColor:['#0E7C66','#E7E4DA'],borderWidth:3,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:12}}}}});
    mk('chOcup',{type:'bar',data:{labels:DB.activities.map(a=>a.nombre),datasets:[{label:'Inscriptos',data:DB.activities.map(a=>actConfirmados(a.id).length),backgroundColor:'#0E7C66',borderRadius:5,maxBarThickness:18},{label:'Cupo',data:DB.activities.map(a=>a.cupo),backgroundColor:'#E7E4DA',borderRadius:5,maxBarThickness:18}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:12}}},scales:{x:{grid:{color:'#EEECE5'}},y:{grid:{display:false}}}}});
    const al={};DB.students.forEach(s=>{if(s.comedor.inscrito&&s.comedor.alergias!=='Ninguna')al[s.comedor.alergias]=(al[s.comedor.alergias]||0)+1;});
    mk('chAlerg',{type:'doughnut',data:{labels:Object.keys(al),datasets:[{data:Object.values(al),backgroundColor:['#E0743B','#D89A0A','#3B5BE0','#9B3BE0','#0EA5B7','#D6453F'],borderWidth:3,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:10,font:{size:10}}}}}});}
  if(view==='reportes')drawReportes();
  if(view==='rendimiento')drawRendimiento();
}

/* ====================== ALUMNOS ====================== */
function filteredStudents(){let list=DB.students.filter(s=>{
    if(filters.curso&&s.curso!==filters.curso)return false;
    if(filters.grupo&&s.grupo!==filters.grupo)return false;
    if(filters.comedor==='si'&&!s.comedor.inscrito)return false;
    if(filters.comedor==='no'&&s.comedor.inscrito)return false;
    if(filters.imagen==='no'&&s.autorizacionImagen.permitida)return false;
    if(filters.imagen==='si'&&!s.autorizacionImagen.permitida)return false;
    if(filters.matricula==='espera'){const i=getIns(s,cfg().ciclo);if(!i||i.estado!=='pendiente')return false;}
    if(filters.docs==='vencidos'&&!s.documentos.some(d=>docEstado(d)==='caducado'))return false;
    if(filters.docs==='sin'&&s.documentos.length)return false;
    if(filters.q){const q=filters.q.toLowerCase();if(!((studentName(s)+' '+s.tutor.nombre+' '+s.dni).toLowerCase().includes(q)))return false;}
    if(filters.estado){const st=s.pagos.map(realEstado);if(filters.estado==='vencido'&&!st.includes('vencido'))return false;if(filters.estado==='pendiente'&&!(st.includes('pendiente')&&!st.includes('vencido')))return false;if(filters.estado==='pagado'&&st.some(x=>x!=='pagado'))return false;}
    return true;});
  const pend=s=>s.pagos.filter(p=>realEstado(p)!=='pagado').reduce((a,b)=>a+b.importe,0);
  if(filters.sort==='nombre')list.sort((a,b)=>(a.apellidos+a.nombre).localeCompare(b.apellidos+b.nombre));
  else if(filters.sort==='curso')list.sort((a,b)=>CURSOS.indexOf(a.curso)-CURSOS.indexOf(b.curso));
  else if(filters.sort==='pendiente')list.sort((a,b)=>pend(b)-pend(a));
  return list;}
function viewAlumnos(){const list=filteredStudents();
  const cursoOpts=['<option value="">Todos los cursos</option>'].concat([...new Set(DB.students.map(s=>s.curso))].map(c=>`<option ${filters.curso===c?'selected':''}>${c}</option>`)).join('');
  return `<div class="view"><div class="toolbar">
     <select onchange="filters.curso=this.value;render()">${cursoOpts}</select>
     <select onchange="filters.estado=this.value;render()"><option value="">Estado de cuotas</option><option value="pagado" ${filters.estado==='pagado'?'selected':''}>Al día</option><option value="pendiente" ${filters.estado==='pendiente'?'selected':''}>Pendiente</option><option value="vencido" ${filters.estado==='vencido'?'selected':''}>Con mora</option></select>
     <button class="btn btn-ghost btn-sm" onclick="filters.adv=!filters.adv;render()">⚙ Más filtros ${filters.adv?'▲':'▼'}</button>
     <select onchange="applySavedView(this.value)" title="Vistas guardadas"><option value="">★ Vistas guardadas</option>${(DB.savedViews||[]).map((v,i)=>`<option value="${i}">${esc(v.nombre)}</option>`).join('')}</select>
     <button class="btn btn-ghost btn-sm" onclick="saveCurrentView()" title="Guardar filtros actuales">💾 Guardar vista</button>
     <div class="grow"></div>
     <select onchange="filters.sort=this.value;render()"><option value="nombre" ${filters.sort==='nombre'?'selected':''}>Orden: apellido</option><option value="curso" ${filters.sort==='curso'?'selected':''}>Orden: curso</option><option value="pendiente" ${filters.sort==='pendiente'?'selected':''}>Orden: + deuda</option></select>
     <span style="color:var(--muted);font-size:13px">${list.length} alumno(s)</span>
     ${perm('importar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="exportExcel('alumnos')">${icoXls()} Exportar</button>`:''}
     ${perm('editar_alumnos')?`<button class="btn btn-ghost btn-sm" onclick="modalImport('alumnos')">${icoUp()} Importar</button>`:''}
     ${perm('editar_alumnos')?`<button class="btn btn-primary btn-sm" onclick="modalStudent()">+ Nuevo alumno</button>`:''}
   </div>
   ${filters.adv?`<div class="filter-adv">
     <div class="field"><label>División</label><select onchange="filters.grupo=this.value;render()"><option value="">Todas</option><option ${filters.grupo==='A'?'selected':''}>A</option><option ${filters.grupo==='B'?'selected':''}>B</option></select></div>
     <div class="field"><label>Comedor</label><select onchange="filters.comedor=this.value;render()"><option value="">Indiferente</option><option value="si" ${filters.comedor==='si'?'selected':''}>Inscriptos</option><option value="no" ${filters.comedor==='no'?'selected':''}>No</option></select></div>
     <div class="field"><label>Autorización de imagen</label><select onchange="filters.imagen=this.value;render()"><option value="">Indiferente</option><option value="si" ${filters.imagen==='si'?'selected':''}>Con</option><option value="no" ${filters.imagen==='no'?'selected':''}>Sin</option></select></div>
     <div class="field"><label>Matrícula</label><select onchange="filters.matricula=this.value;render()"><option value="">Indiferente</option><option value="espera" ${filters.matricula==='espera'?'selected':''}>En lista de espera</option></select></div>
   </div>`:''}
   <div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Curso</th><th>Matrícula ${cfg().ciclo}</th><th>Tutor / contacto</th><th>Comedor</th><th>Cuotas</th><th></th></tr></thead><tbody>
   ${list.length?list.map(s=>{const st=s.pagos.map(realEstado);const bd=st.includes('vencido')?'b-danger':(st.includes('pendiente')?'b-warn':'b-success');const lbl=st.includes('vencido')?'Con mora':(st.includes('pendiente')?'Pendiente':'Al día');const ins=getIns(s,cfg().ciclo);
     return `<tr><td><div class="cell-name">${avatarHTML(s)}<div><b>${studentName(s)}</b><small>DNI ${s.dni}</small></div></div></td>
       <td><span class="badge b-info">${s.curso} · ${s.grupo}</span></td>
       <td>${ins?inscBadge(ins.estado):inscBadge('')}</td>
       <td><b style="font-size:13px">${s.tutor.nombre}</b><br><small style="color:var(--muted)">${s.tutor.tel}</small></td>
       <td>${s.comedor.inscrito?`<span class="badge b-grey nodot">${s.comedor.plan}</span>`:'<span style="color:var(--muted)">—</span>'}</td>
       <td><span class="badge ${bd}">${lbl}</span></td>
       <td><div class="row-actions"><button class="icon-btn" title="Legajo" onclick="openStudent('${s.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>${perm('editar_alumnos')?`<button class="icon-btn" title="Editar" onclick="modalStudent('${s.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg></button>`:''}</div></td></tr>`;}).join(''):`<tr><td colspan="7"><div class="empty">Sin resultados.</div></td></tr>`}
   </tbody></table></div></div>`;}

function openStudent(id,tab){openStudentId=id;detailTab=tab||'info';go('alumno-detalle');}
function viewAlumnoDetalle(){const s=DB.students.find(x=>x.id===openStudentId);if(!s)return'';const ins=getIns(s,cfg().ciclo);
  const totalPend=s.pagos.filter(p=>realEstado(p)!=='pagado').reduce((a,b)=>a+b.importe,0);
  const tabs=[['info','Datos'],['academico','Académico'],['salud','Salud y retiro'],['convivencia','Convivencia'],['pagos','Cuotas'],['documentos','Documentos'],['observaciones','Observaciones']];
  return `<div class="view"><button class="btn btn-ghost btn-sm" style="margin-bottom:14px" onclick="go('alumnos')">← Volver a alumnos</button>
   <div class="detail-head">${avatarHTML(s,72)}<div style="flex:1"><h2>${studentName(s)}</h2><div class="meta"><span class="badge b-info">${s.curso} · ${s.grupo}</span><span>DNI ${s.dni}</span>${ins?inscBadge(ins.estado):''}${!s.autorizacionImagen.permitida?'<span class="badge b-warn">Sin autoriz. imagen</span>':''}</div></div>
     ${totalPend?`<span class="badge b-danger" style="font-size:13px">Adeuda: ${fmt(totalPend)}</span>`:'<span class="badge b-success" style="font-size:13px">Al día</span>'}<button class="btn btn-ghost btn-sm" onclick="constanciaPDF('${s.id}')">📄 Constancia</button><button class="btn btn-ghost btn-sm" onclick="modalCarnet('${s.id}')">🪪 Carnet</button>${perm('editar_alumnos')?`<button class="btn btn-ghost btn-sm" onclick="modalStudent('${s.id}')">Editar legajo</button>`:''}</div>
   <div class="tabs">${tabs.map(t=>`<button class="tab ${detailTab===t[0]?'active':''}" onclick="detailTab='${t[0]}';render()">${t[1]}</button>`).join('')}</div>
   ${detailTab==='info'?tabInfo(s):detailTab==='academico'?tabAcademico(s):detailTab==='salud'?tabSalud(s):detailTab==='convivencia'?tabConvivencia(s):detailTab==='pagos'?tabPagos(s):detailTab==='documentos'?tabDocumentos(s):tabObservaciones(s)}</div>`;}
function tabInfo(s){return `<div class="detail-grid">
   <div class="panel"><div class="panel-head"><h3>Datos personales</h3></div><div class="panel-body" style="display:flex;gap:18px;align-items:flex-start">
     <div style="text-align:center">${s.foto&&s.autorizacionImagen.permitida?`<img class="photo-lg" src="${s.foto}">`:`<div class="photo-ph" style="background:${s.color}">${initials(studentName(s))}</div>`}${perm('editar_documentos')?`<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="modalFoto('${s.id}')">📷 Foto</button>`:''}</div>
     <div style="flex:1"><div class="info-row"><span class="k">DNI</span><span class="v">${s.dni}</span></div><div class="info-row"><span class="k">Nacimiento</span><span class="v">${s.nacimiento}</span></div><div class="info-row"><span class="k">Domicilio</span><span class="v">${s.direccion}</span></div><div class="info-row"><span class="k">Localidad</span><span class="v">${s.cp} ${s.ciudad}, ${cfg().provincia}</span></div><div class="info-row"><span class="k">Autoriz. imagen</span><span class="v">${s.autorizacionImagen.permitida?'✅ Sí ('+s.autorizacionImagen.fecha+')':'⚠️ No otorgada'}</span></div></div></div></div>
   <div class="panel"><div class="panel-head"><h3>Tutores y emergencia</h3></div><div class="panel-body">
     <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Tutor/a principal</div>
     <div class="info-row"><span class="k">${s.tutor.relacion}</span><span class="v">${s.tutor.nombre}</span></div><div class="info-row"><span class="k">Email</span><span class="v">${s.tutor.email}</span></div><div class="info-row"><span class="k">Teléfono</span><span class="v">${s.tutor.tel}</span></div>
     ${s.tutor2?`<div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;margin:12px 0 4px">2.º tutor/a</div><div class="info-row"><span class="k">${s.tutor2.relacion}</span><span class="v">${s.tutor2.nombre}</span></div><div class="info-row"><span class="k">Teléfono</span><span class="v">${s.tutor2.tel}</span></div>`:''}
     <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;margin:12px 0 4px">Emergencia</div>${s.emergencia.map(e=>`<div class="info-row"><span class="k">${e.relacion} · ${e.nombre}</span><span class="v">${e.tel}</span></div>`).join('')}</div></div>
   <div class="panel"><div class="panel-head"><h3>Salud</h3></div><div class="panel-body"><div class="info-row"><span class="k">Alergias / dieta</span><span class="v">${s.comedor.alergias}</span></div><div class="info-row"><span class="k">Medicación</span><span class="v">${s.comedor.medicacion||'—'}</span></div></div></div>
   <div class="panel"><div class="panel-head"><h3>Asistencia (ciclo)</h3></div><div class="panel-body"><div class="info-row"><span class="k">Faltas</span><span class="v">${s.asistencia.faltas} (${s.asistencia.justificadas} just.)</span></div><div class="info-row"><span class="k">Llegadas tarde</span><span class="v">${s.asistencia.retrasos}</span></div></div></div></div>`;}
function tabAcademico(s){const ins=getIns(s,cfg().ciclo);const c=ins?courseByName(ins.curso):courseByName(s.curso);
  return `<div class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>Inscripción anual · ciclo ${cfg().ciclo}</h3>${perm('ver_inscripciones')?`<div class="right"><button class="btn btn-ghost btn-sm" onclick="modalInscribir('${s.id}')">Inscribir / cambiar curso</button></div>`:''}</div><div class="panel-body">
     <div class="info-row"><span class="k">Curso</span><span class="v">${ins?ins.curso:'—'}</span></div><div class="info-row"><span class="k">Estado</span><span class="v">${inscBadge(ins?ins.estado:'')}</span></div><div class="info-row"><span class="k">Fecha de inscripción</span><span class="v">${ins?ins.fecha:'—'}</span></div>${ins&&ins.estado==='pendiente'?`<p style="color:#9a6f06;font-size:12.5px;margin-top:8px">⏳ En lista de espera: el cupo del curso está completo. Se confirmará automáticamente al liberarse una vacante.</p>`:''}
   </div></div>
   ${c?`<div class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>Materias y temario · ${c.nombre}</h3><span class="sub">${c.materias.length} materias</span></div><div class="panel-body">${c.materias.map(m=>`<div class="doc-item"><div class="doc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2 2 0 012-2h14v14"/></svg></div><div class="info"><b>${m.nombre}</b><small>${esc(m.temas)}</small></div></div>`).join('')}</div></div>`:''}
   <div class="detail-grid">
     <div class="panel"><div class="panel-head"><h3>Comedor</h3>${perm('editar_alumnos')?`<div class="right"><button class="btn btn-ghost btn-sm" onclick="modalStudent('${s.id}')">Editar</button></div>`:''}</div><div class="panel-body"><div class="info-row"><span class="k">Inscripto</span><span class="v">${s.comedor.inscrito?'Sí':'No'}</span></div><div class="info-row"><span class="k">Plan</span><span class="v">${s.comedor.plan}</span></div><div class="info-row"><span class="k">Alergias</span><span class="v">${s.comedor.alergias}</span></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Actividades extraescolares</h3></div><div class="panel-body">${perm('ver_actividades')?`<p style="color:var(--muted);font-size:12.5px;margin-bottom:10px">Tocá para inscribir / dar de baja (si está completa, queda en lista de espera):</p><div class="chips">${DB.activities.filter(a=>a.estado==='Activa').map(a=>{const e=(s.actividades||[]).find(x=>x.id===a.id);const cls=e?(e.estado==='confirmada'?'on':''):'';const sty=e&&e.estado==='pendiente'?'border-color:var(--warn);color:#9a6f06;background:var(--warn-soft)':'';return `<span class="chip tog ${cls}" style="${sty}" onclick="toggleAct('${s.id}','${a.id}')">${a.nombre} · ${fmt(a.cuota)}${e&&e.estado==='pendiente'?' ⏳':''}</span>`;}).join('')}</div>`:`<div class="chips">${studentActs(s).map(a=>`<span class="chip">${a.nombre} · ${a.dia} ${a.horaInicio}${a._estado==='pendiente'?' ⏳ espera':''}</span>`).join('')||'<span style="color:var(--muted)">Sin actividades</span>'}</div>`}<div class="info-row" style="margin-top:14px"><span class="k">Costo actividades confirmadas / mes</span><span class="v">${fmt(studentActs(s).filter(a=>a._estado==='confirmada').reduce((x,a)=>x+a.cuota,0))}</span></div></div></div></div>`;}
function tabPagos(s){return `<div class="panel"><div class="panel-head"><h3>Cuotas</h3><div class="right">${perm('editar_pagos')?`<button class="btn btn-primary btn-sm" onclick="modalPago('${s.id}')">+ Registrar pago</button>`:''}</div></div>
   <table><thead><tr><th>Mes</th><th>Concepto</th><th>Importe</th><th>Vence</th><th>Pagado</th><th>Estado</th><th>Método</th><th></th></tr></thead><tbody>${s.pagos.slice().reverse().map(p=>pagoRow(s,p)).join('')}</tbody></table></div>`;}
function pagoRow(s,p){const e=realEstado(p);const bd={pagado:'b-success',pendiente:'b-warn',vencido:'b-danger'}[e];const lbl={pagado:'Pagado',pendiente:'Pendiente',vencido:'Vencido'}[e];
  return `<tr><td><b style="font-size:13px">${p.mes}</b></td><td><small>${p.concepto}</small></td><td class="tnum"><b>${fmt(p.importe)}</b>${e==='vencido'&&moraDe(p)>0?`<br><small style="color:var(--danger)">+ mora ${fmt(moraDe(p))}</small>`:''}</td><td><small>${p.fechaVenc}</small></td><td><small>${p.fechaPago||'—'}</small></td><td><span class="badge ${bd}">${lbl}</span></td><td>${p.metodo?`<span class="badge b-grey nodot">${p.metodo}</span>`:'<span style="color:var(--muted)">—</span>'}</td><td><div class="row-actions">${e==='pagado'?`<button class="icon-btn" title="Recibo PDF" onclick="reciboPDF('${s.id}','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg></button>`:(perm('ver_comunicaciones')?`<button class="icon-btn" title="Link de pago" onclick="modalMP('${s.id}','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></button>`:'')}${perm('editar_pagos')?`<button class="icon-btn" onclick="modalPago('${s.id}','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg></button>`:''}${perm('eliminar_pagos')?`<button class="icon-btn danger" onclick="deletePago('${s.id}','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>`:''}</div></td></tr>`;}
function tabDocumentos(s){return `<div class="panel"><div class="panel-head"><h3>Documentos y certificados</h3><div class="right">${perm('editar_documentos')?`<button class="btn btn-primary btn-sm" onclick="modalDoc('${s.id}')">+ Agregar documento</button>`:''}</div></div><div class="panel-body">
   ${s.documentos.length?s.documentos.map(d=>{const e=docEstado(d);const bd={vigente:'b-success',porcaducar:'b-warn',caducado:'b-danger'}[e];const lbl={vigente:'Vigente',porcaducar:'Por vencer',caducado:'Vencido'}[e];
     return `<div class="doc-item"><div class="doc-ic" style="${d.tipo.includes('médico')?'background:var(--danger-soft);color:var(--danger)':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg></div><div class="info"><b>${d.tipo}</b><small>${d.nombre} · emitido ${d.fecha}${d.vencimiento?' · vence '+d.vencimiento:''}</small></div><span class="badge ${bd}">${lbl}</span><button class="icon-btn" onclick="viewReceipt('doc')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>${perm('editar_documentos')?`<button class="icon-btn danger" onclick="deleteDoc('${s.id}','${d.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>`:''}</div>`;}).join(''):'<div class="empty">Sin documentos. Agregá el apto físico u otras autorizaciones.</div>'}</div></div>`;}
function tabObservaciones(s){return `<div class="panel"><div class="panel-head"><h3>Observaciones</h3></div><div class="panel-body">${perm('editar_alumnos')?`<div class="field"><textarea id="obsTxt" placeholder="Nueva observación (incidencia, comunicación con la familia, etc.)"></textarea></div><button class="btn btn-primary btn-sm" onclick="addObs('${s.id}')">Agregar</button><div style="height:14px"></div>`:''}${s.observaciones.length?s.observaciones.slice().reverse().map(o=>`<div class="timeline-item"><div class="dot"></div><div class="body">${esc(o.texto)}<div class="who">${o.autor} · ${o.fecha}</div></div></div>`).join(''):'<div class="empty">Sin observaciones.</div>'}</div></div>`;}
function addObs(id){const s=DB.students.find(x=>x.id===id);const t=$('#obsTxt').value.trim();if(!t){toast('Escribí una observación.','warn');return;}s.observaciones.push({id:'o'+Date.now(),fecha:new Date().toISOString().slice(0,16).replace('T',' '),autor:CURRENT.nombre,texto:t});logAudit('crear','Observación · '+studentName(s),'Nueva observación','create');saveDB();render();toast('Observación agregada.','success');}

/* ====================== CUOTAS / PAGOS ====================== */
function allPagos(){const r=[];DB.students.forEach(s=>s.pagos.forEach(p=>r.push({s,p,e:realEstado(p)})));return r;}
function viewPagos(){if(!perm('ver_pagos'))return noPerm();let rows=allPagos();if(pagoTab!=='todos')rows=rows.filter(r=>r.e===pagoTab);if(filters.q){const q=filters.q.toLowerCase();rows=rows.filter(r=>studentName(r.s).toLowerCase().includes(q));}
  const c={todos:allPagos().length,vencido:allPagos().filter(r=>r.e==='vencido').length,pendiente:allPagos().filter(r=>r.e==='pendiente').length,pagado:allPagos().filter(r=>r.e==='pagado').length};
  return `<div class="view"><div class="toolbar"><div class="seg">${['todos','vencido','pendiente','pagado'].map(t=>`<button class="${pagoTab===t?'active':''}" onclick="pagoTab='${t}';render()">${({todos:'Todas',vencido:'Vencidas',pendiente:'Pendientes',pagado:'Pagadas'})[t]} (${c[t]})</button>`).join('')}</div><div class="grow"></div>
     ${perm('editar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="modalGenerarCuota()">＋ Generar cuota del mes</button>`:''}
     ${perm('importar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="modalImport()">${icoUp()} Importar</button>`:''}
     ${perm('importar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="exportExcel('pagos')">${icoXls()} Excel</button>`:''}
     ${perm('editar_pagos')?`<button class="btn btn-primary btn-sm" onclick="modalPago()">+ Registrar pago</button>`:''}</div>
   <div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Mes</th><th>Concepto</th><th>Importe</th><th>Vence</th><th>Estado</th><th>Método</th><th></th></tr></thead><tbody>
   ${rows.length?rows.map(r=>`<tr><td><div class="cell-name">${avatarHTML(r.s,32)}<div><b>${studentName(r.s)}</b><small>${r.s.curso}</small></div></div></td><td><b style="font-size:13px">${r.p.mes}</b></td><td><small>${r.p.concepto}</small></td><td class="tnum"><b>${fmt(r.p.importe)}</b></td><td><small>${r.p.fechaVenc}</small></td><td><span class="badge ${({pagado:'b-success',pendiente:'b-warn',vencido:'b-danger'})[r.e]}">${({pagado:'Pagada',pendiente:'Pendiente',vencido:'Vencida'})[r.e]}</span></td><td>${r.p.metodo?`<span class="badge b-grey nodot">${r.p.metodo}</span>`:'<span style="color:var(--muted)">—</span>'}</td><td><div class="row-actions">${r.e!=='pagado'&&perm('ver_comunicaciones')?`<button class="icon-btn" title="Avisar tutor" onclick="modalSend(null,'${r.s.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H5.2L4 17.2z"/></svg></button>`:''}${perm('editar_pagos')?`<button class="icon-btn" onclick="modalPago('${r.s.id}','${r.p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg></button>`:''}${perm('eliminar_pagos')?`<button class="icon-btn danger" onclick="deletePago('${r.s.id}','${r.p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>`:''}</div></td></tr>`).join(''):`<tr><td colspan="8"><div class="empty">Sin cuotas en esta vista.</div></td></tr>`}
   </tbody></table></div></div>`;}

/* ====================== INSCRIPCIONES (matrícula anual por ciclo) ====================== */
function viewInscripciones(){if(!perm('ver_inscripciones'))return noPerm();
  const ciclo=inscCiclo;const futuro=ciclo!==cfg().ciclo;
  const niveles=['Inicial','Primaria','Secundaria'];
  const cupoTot=DB.courses.reduce((a,c)=>a+c.capacidad,0);
  let confTot=0,espTot=0,completos=0;
  DB.courses.forEach(c=>{const cf=cursoConfirmados(c.nombre,ciclo).length;confTot+=cf;espTot+=cursoEspera(c.nombre,ciclo).length;if(cf>=c.capacidad)completos++;});
  const cicloOpts=['2026','2027'].map(y=>`<option ${ciclo===y?'selected':''}>${y}</option>`).join('');
  return `<div class="view">
   <div class="toolbar">
     <span style="font-weight:700;color:var(--ink-soft)">Ciclo lectivo:</span>
     <select onchange="inscCiclo=this.value;render()" style="font-weight:700">${cicloOpts}</select>
     ${futuro?`<span class="badge b-blue nodot">Pre-inscripción ${ciclo}</span>`:`<span class="badge b-success nodot">Ciclo en curso</span>`}
     <div class="grow"></div>
     ${perm('importar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="exportExcel('inscripciones')">${icoXls()} Exportar</button>`:''}
     ${perm('ver_inscripciones')&&futuro?`<button class="btn btn-primary btn-sm" onclick="modalReinscribir()">↻ Reinscribir ${(parseInt(ciclo)-1)} → ${ciclo}</button>`:''}
   </div>
   ${futuro?`<div class="panel" style="margin-bottom:16px;border-color:var(--blue)"><div class="panel-body" style="display:flex;align-items:center;gap:12px"><div class="doc-ic" style="background:var(--blue-soft);color:var(--blue)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg></div><div><b>Inscripción para el ciclo ${ciclo}</b><br><small style="color:var(--muted)">Los cupos arrancan vacíos cada año. Inscribí a los alumnos para el próximo ciclo; al completarse el cupo, las nuevas inscripciones quedan en lista de espera.</small></div></div></div>`:''}
   <div class="kpis">
     ${kpi('Cupos totales','--blue-soft','--blue',cupoTot,'en '+DB.courses.length+' cursos','flat','<path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M3 7l9-4 9 4-9 4-9-4z"/>')}
     ${kpi('Confirmados','--success-soft','--success',confTot,Math.round(confTot/cupoTot*100)+'% ocupación','up','<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>')}
     ${kpi('En lista de espera',espTot?'--warn-soft':'--success-soft',espTot?'--warn':'--success',espTot,'pendientes de confirmar','flat','<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>')}
     ${kpi('Cursos completos',completos?'--danger-soft':'--success-soft',completos?'--danger':'--success',completos,'de '+DB.courses.length+' cursos','flat','<path d="M18 6L6 18M6 6l12 12"/>')}
   </div>
   ${niveles.map(niv=>{const cursos=DB.courses.filter(c=>c.nivel===niv);if(!cursos.length)return'';
     return `<div class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>${niv}</h3><span class="sub">${cursos.length} curso(s)</span></div><div class="panel-body"><div class="grid3" style="margin:0">
       ${cursos.map(c=>{const conf=cursoConfirmados(c.nombre,ciclo).length;const esp=cursoEspera(c.nombre,ciclo).length;const pct=Math.round(conf/c.capacidad*100);const full=conf>=c.capacidad;
         return `<div style="border:1px solid var(--line);border-radius:var(--r);padding:16px;background:var(--surface)">
           <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><b style="font-size:15px;flex:1">${c.nombre}</b><span class="badge b-grey nodot">${c.turno}</span></div>
           <div class="info-row" style="padding:5px 0"><span class="k">Cuota mensual</span><span class="v">${fmt(c.cuota)}</span></div>
           <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-top:8px"><span style="color:var(--muted)">Ocupación</span><b>${conf}/${c.capacidad}${full?' · COMPLETO':''}</b></div>
           <div class="progress"><span style="width:${Math.min(100,pct)}%;background:${full?'var(--danger)':'var(--brand)'}"></span></div>
           ${esp?`<div style="margin-top:8px"><span class="badge b-warn">${esp} en lista de espera</span></div>`:''}
           <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">
             ${perm('ver_inscripciones')?`<button class="btn btn-primary btn-sm" style="flex:1" onclick="modalGestionCurso('${c.nombre}')">Matrícula</button>`:''}
             <button class="btn btn-ghost btn-sm" onclick="modalCurso('${c.id}')">Curso y materias</button>
           </div></div>`;}).join('')}
     </div></div></div>`;}).join('')}
  </div>`;}

/* ====================== COMEDOR ====================== */
function viewComedor(){if(!perm('ver_comedor'))return noPerm();const ins=DB.students.filter(s=>s.comedor.inscrito);const conAlg=ins.filter(s=>s.comedor.alergias!=='Ninguna');
  return `<div class="view"><div class="grid3">
     ${kpi('Inscriptos en comedor','--brand-soft','--brand',ins.length,'de '+DB.students.length+' alumnos','flat','<path d="M3 2v7M7 2v7M5 9v13M17 2a3 3 0 00-3 3v8h6V5a3 3 0 00-3-3z"/>')}
     ${kpi('Plan fijo 5 días','--success-soft','--success',ins.filter(s=>s.comedor.plan.includes('Fijo')).length,'cuota '+fmt(COMEDOR_CUOTA),'flat','<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')}
     ${kpi('Con alergias / dieta','--warn-soft','--warn',conAlg.length,'requieren atención','flat','<path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>')}
   </div>
   <div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Curso</th><th>Plan</th><th>Alergias / dieta</th><th>Medicación</th><th></th></tr></thead><tbody>
   ${ins.length?ins.map(s=>`<tr><td><div class="cell-name">${avatarHTML(s,32)}<b>${studentName(s)}</b></div></td><td><span class="badge b-info">${s.curso}</span></td><td>${s.comedor.plan}</td><td>${s.comedor.alergias==='Ninguna'?'<span style="color:var(--muted)">—</span>':`<span class="badge b-warn nodot">${s.comedor.alergias}</span>`}</td><td>${s.comedor.medicacion?`<span class="badge b-danger nodot">${s.comedor.medicacion}</span>`:'<span style="color:var(--muted)">—</span>'}</td><td><div class="row-actions"><button class="icon-btn" onclick="openStudent('${s.id}','academico')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div></td></tr>`).join(''):`<tr><td colspan="6"><div class="empty">Sin inscriptos en comedor.</div></td></tr>`}
   </tbody></table></div></div>`;}

/* ====================== ACTIVIDADES (edición ampliada) ====================== */
function viewActividades(){if(!perm('ver_actividades'))return noPerm();
  return `<div class="view"><div class="toolbar"><div class="grow"></div><button class="btn btn-primary btn-sm" onclick="modalActividad()">+ Nueva actividad</button></div>
   <div class="grid3">${DB.activities.map(a=>{const conf=actConfirmados(a.id).length;const esp=actEspera(a.id).length;const pct=Math.round(conf/a.cupo*100);const inact=a.estado!=='Activa';
     return `<div class="act-card" style="${inact?'opacity:.62':''}"><div class="top"><div class="act-ic" style="background:${a.color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><div style="flex:1"><h3 style="font-size:16px">${a.nombre} ${inact?'<span class="badge b-grey nodot" style="font-size:10px">Inactiva</span>':''}</h3><small style="color:var(--muted)">${a.categoria} · ${a.dia} ${a.horaInicio}–${a.horaFin}</small></div><button class="icon-btn" onclick="modalActividad('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg></button></div>
       <div class="panel-body" style="padding-top:0"><p style="color:var(--ink-soft);font-size:13px;margin-bottom:10px">${a.descripcion}</p>
         <div class="info-row" style="padding:5px 0"><span class="k">Profesor/a</span><span class="v">${a.profesor}</span></div>
         <div class="info-row" style="padding:5px 0"><span class="k">Lugar</span><span class="v">${a.aula}</span></div>
         <div class="info-row" style="padding:5px 0"><span class="k">Dirigido a</span><span class="v">${a.dirigidoA}</span></div>
         <div class="info-row" style="padding:5px 0"><span class="k">Período</span><span class="v">${a.periodo}</span></div>
         <div class="info-row" style="padding:5px 0"><span class="k">Cuota mensual</span><span class="v">${fmt(a.cuota)}</span></div>
         <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-top:10px"><span style="color:var(--muted)">Cupo</span><b>${conf}/${a.cupo}${esp?' · '+esp+' en espera':''}</b></div>
         <div class="progress"><span style="width:${Math.min(100,pct)}%;background:${conf>=a.cupo?'var(--danger)':a.color}"></span></div>
         <button class="btn btn-ghost btn-sm btn-block" style="margin-top:14px" onclick="modalActInscriptos('${a.id}')">Gestionar inscriptos</button></div></div>`;}).join('')}
   </div></div>`;}

/* ====================== COMUNICACIONES ====================== */
function viewComunicaciones(){if(!perm('ver_comunicaciones'))return noPerm();
  return `<div class="view"><div class="toolbar"><div class="grow"></div><button class="btn btn-ghost btn-sm" onclick="modalSend()">✉ Envío rápido</button><button class="btn btn-primary btn-sm" onclick="modalTemplate()">+ Nueva plantilla</button></div>
   <div class="grid3">${DB.templates.map(t=>`<div class="tpl-card"><div class="cat">${t.categoria}</div><h3>${t.nombre}</h3><div class="prev">${esc(t.cuerpo).replace(/\n/g,'<br>')}</div><div class="acts"><button class="btn btn-primary btn-sm" style="flex:1" onclick="modalSend('${t.id}')">Usar</button><button class="btn btn-ghost btn-sm" onclick="modalTemplate('${t.id}')">Editar</button><button class="icon-btn danger" onclick="deleteTemplate('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button></div></div>`).join('')}</div>
   <div class="panel" style="margin-top:6px"><div class="panel-head"><h3>Variables disponibles</h3></div><div class="panel-body"><p style="color:var(--ink-soft);font-size:13px">Usá estas etiquetas en tus plantillas y se reemplazan automáticamente al enviar:</p><div class="chips" style="margin-top:10px">${['{centro}','{tutor}','{nombre_alumno}','{curso}','{importe}','{mes}','{fecha}'].map(v=>`<span class="chip">${v}</span>`).join('')}</div></div></div>
   <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Mensajes enviados</h3><span class="sub">Acuse de lectura de las familias</span><div class="right"><span class="badge b-success nodot">${(DB.mensajes||[]).filter(m=>m.leido).length} leídos</span> <span class="badge b-warn nodot">${(DB.mensajes||[]).filter(m=>!m.leido).length} sin leer</span></div></div>
     <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Familia</th><th>Asunto</th><th>Plantilla</th><th>Acuse</th></tr></thead><tbody>
     ${(DB.mensajes||[]).slice().reverse().slice(0,40).map(m=>{const s=DB.students.find(x=>x.id===m.studentId);return `<tr><td><small>${m.fecha}</small></td><td><b style="font-size:13px">${s?s.tutor.nombre:'—'}</b><br><small style="color:var(--muted)">${s?studentName(s):''}</small></td><td><small>${esc(m.asunto)}</small></td><td><span class="badge b-grey nodot">${m.plantilla}</span></td><td><span class="badge ${m.leido?'b-success':'b-warn'}">${m.leido?'Leído':'No leído'}</span></td></tr>`;}).join('')||`<tr><td colspan="5"><div class="empty">Todavía no enviaste comunicaciones.</div></td></tr>`}
     </tbody></table></div></div></div>`;}

/* ====================== AUDITORÍA ====================== */
function viewAuditoria(){if(!perm('ver_auditoria'))return noPerm();let logs=DB.audit.slice();if(auditFilter.tipo)logs=logs.filter(l=>l.tipo===auditFilter.tipo);if(auditFilter.q){const q=auditFilter.q.toLowerCase();logs=logs.filter(l=>(l.usuario+l.entidad+l.detalle+l.accion).toLowerCase().includes(q));}
  return `<div class="view"><div class="toolbar"><input style="min-width:220px" placeholder="Buscar en el registro..." oninput="auditFilter.q=this.value;render()" value="${esc(auditFilter.q)}"><select onchange="auditFilter.tipo=this.value;render()"><option value="">Todas las acciones</option><option value="create" ${auditFilter.tipo==='create'?'selected':''}>Altas</option><option value="edit" ${auditFilter.tipo==='edit'?'selected':''}>Modificaciones</option><option value="delete" ${auditFilter.tipo==='delete'?'selected':''}>Bajas</option><option value="info" ${auditFilter.tipo==='info'?'selected':''}>Accesos / envíos / matrícula</option></select><div class="grow"></div><span style="color:var(--muted);font-size:13px">${logs.length} registro(s)</span>${perm('importar_pagos')?`<button class="btn btn-ghost btn-sm" onclick="exportExcel('auditoria')">${icoXls()} Exportar</button>`:''}</div>
   <div class="table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Detalle</th></tr></thead><tbody>
   ${logs.map(l=>{const bd={create:'b-success',edit:'b-blue',delete:'b-danger',info:'b-grey'}[l.tipo]||'b-grey';const al={create:'Alta',edit:'Modificación',delete:'Baja',info:'Registro'}[l.tipo]||l.accion;return `<tr><td class="tnum"><small>${l.fecha}</small></td><td><div class="cell-name"><div class="avatar" style="background:${AV_COLORS[l.usuario.length%8]};width:30px;height:30px;font-size:11px">${initials(l.usuario)}</div><div><b style="font-size:13px">${l.usuario}</b><small>${ROLE_LABEL[l.rol]||l.rol}</small></div></div></td><td><span class="badge ${bd}">${al}</span></td><td><b style="font-size:13px">${l.entidad}</b></td><td><small>${l.detalle}</small></td></tr>`;}).join('')}
   </tbody></table></div></div>`;}

/* ====================== USUARIOS ====================== */
function viewUsuarios(){if(!perm('gestionar_usuarios'))return noPerm();
  return `<div class="view"><div class="toolbar"><div class="grow"></div><button class="btn btn-primary btn-sm" onclick="modalUser()">+ Nuevo usuario</button></div>
   <div class="table-wrap" style="margin-bottom:22px"><table><thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>
   ${DB.users.map(u=>`<tr><td><div class="cell-name"><div class="avatar" style="background:${AV_COLORS[u.nombre.length%8]};width:32px;height:32px;font-size:12px">${initials(u.nombre)}</div><b>${u.nombre}</b></div></td><td><small>${u.email}</small></td><td><span class="badge ${u.rol==='super_admin'?'b-blue':(u.rol==='supervisor'?'b-warn':'b-grey')}">${ROLE_LABEL[u.rol]}</span></td><td><span class="badge ${u.activo?'b-success':'b-grey'}">${u.activo?'Activo':'Inactivo'}</span></td><td><div class="row-actions"><button class="btn btn-ghost btn-sm" onclick="modalUser('${u.id}')">Permisos</button></div></td></tr>`).join('')}
   </tbody></table></div>
   <div class="panel"><div class="panel-head"><h3>Matriz de permisos por rol</h3><span class="sub">Accesos predefinidos</span></div><div class="panel-body">
     <div class="perm-grid"><div class="ph first">Permiso</div><div class="ph">Super Admin</div><div class="ph">Supervisor</div><div class="ph">Administración</div><div class="ph">Familia</div>
       ${PERMS.map(p=>`<div class="pl">${p[1]}</div>${['super_admin','supervisor','admin'].map(r=>`<div class="pc">${rolePreset(r)[p[0]]?'<span style="color:var(--success);font-weight:700">✓</span>':'<span style="color:var(--line)">—</span>'}</div>`).join('')}<div class="pc"><span style="color:var(--line)">—</span></div>`).join('')}
     </div><p style="color:var(--muted);font-size:12.5px;margin-top:12px">Las familias solo acceden al portal del alumno. Cada permiso es editable por usuario desde «Permisos».</p></div></div></div>`;}

/* ====================== CONFIGURACIÓN ====================== */
function viewConfig(){if(!perm('editar_config'))return noPerm();const c=cfg();
  return `<div class="view"><div class="detail-grid">
   <div class="panel"><div class="panel-head"><h3>Datos del colegio</h3></div><div class="panel-body">
     <div class="field"><label>Nombre del colegio</label><input id="cf_centro" value="${esc(c.centroNombre)}"></div>
     <div class="field"><label>Nombre de la plataforma (marca)</label><input id="cf_nombre" value="${esc(c.nombre)}"><div class="hint">Aparece en el menú lateral y el ingreso.</div></div>
     <div class="field"><label>Subtítulo / lema</label><input id="cf_sub" value="${esc(c.sub)}"></div>
     <div class="form-grid"><div class="field"><label>Domicilio</label><input id="cf_dir" value="${esc(c.direccion)}"></div><div class="field"><label>Provincia / Comunidad</label><input id="cf_prov" value="${esc(c.provincia)}"></div></div>
     <div class="form-grid"><div class="field"><label>País</label><select id="cf_pais" onchange="setPais(this.value)"><option value="AR" ${(c.pais||'AR')==='AR'?'selected':''}>Argentina</option><option value="ES" ${c.pais==='ES'?'selected':''}>España</option></select></div><div class="field"><label>Calendario escolar</label><select id="cf_cal"><option value="AR" ${(c.pais||'AR')==='AR'?'selected':''}>Argentina (feriados y ciclo)</option><option value="ES" ${c.pais==='ES'?'selected':''}>España (festivos y curso)</option></select><div class="hint"><a href="#" onclick="aplicarCalendarioPais();return false;">Aplicar calendario del país</a> (mantiene tus eventos propios)</div></div></div>
     <div class="form-grid"><div class="field"><label>Ciclo lectivo</label><input id="cf_curso" value="${c.ciclo}"></div><div class="field"><label>Moneda</label><input id="cf_mon" value="${c.moneda}"></div></div>
     <button class="btn btn-primary" onclick="saveConfig()">Guardar cambios</button></div></div>
   <div class="panel"><div class="panel-head"><h3>Parámetros de cobranza</h3></div><div class="panel-body">
     <div class="form-grid"><div class="field"><label>Objetivo de cobro (%)</label><input id="cf_obj" type="number" value="${c.objetivoCobro}"></div><div class="field"><label>Día de vencimiento</label><input id="cf_dv" type="number" value="${c.diaVenc}"></div></div>
     <div class="form-grid"><div class="field"><label>Recargo por mora (% por día)</label><input id="cf_mora" type="number" step="0.1" value="${c.moraPctDia||0}"></div><div class="field"><label>Prioridad en lista de espera</label><select id="cf_pri"><option value="fecha" ${c.prioridadEspera==='fecha'?'selected':''}>Orden de inscripción</option><option value="hermanos" ${c.prioridadEspera==='hermanos'?'selected':''}>Hermanos primero</option><option value="beca" ${c.prioridadEspera==='beca'?'selected':''}>Becados primero</option></select></div></div>
     <div class="form-grid"><div class="field"><label>Descuento hermanos (%)</label><input id="cf_dh" type="number" value="${c.descHermanos||0}"></div><div class="field"><label>Descuento beca (%)</label><input id="cf_db" type="number" value="${c.descBeca||0}"></div></div>
     <button class="btn btn-ghost" onclick="saveConfig()">Guardar parámetros</button>
     <div class="form-section">Respaldo y migración</div>
     <p style="color:var(--muted);font-size:13px;margin-bottom:12px">Exportá toda la base (alumnos, cuotas, cursos, asistencia, etc.) a un archivo JSON para respaldo o para pasarla a otro dispositivo. La importación reemplaza la base actual.</p>
     <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button class="btn btn-ghost" onclick="exportDB()">⬇ Exportar copia (JSON)</button><button class="btn btn-ghost" onclick="$('#dbFile').click()">⬆ Importar copia</button><input type="file" id="dbFile" accept=".json" style="display:none" onchange="importDB(this.files[0])"></div>
     <div class="form-section">Datos del prototipo</div>
     <p style="color:var(--muted);font-size:13px;margin-bottom:12px">Restablece todos los datos de demostración (alumnos, cuotas, cursos, plantillas, auditoría).</p>
     <button class="btn btn-danger" onclick="resetDemo()">↺ Restablecer datos demo</button></div></div>
  </div></div>`;}
function saveConfig(){const c=cfg();c.centroNombre=$('#cf_centro').value;c.nombre=$('#cf_nombre').value;c.sub=$('#cf_sub').value;c.direccion=$('#cf_dir').value;if($('#cf_prov'))c.provincia=$('#cf_prov').value;c.ciclo=$('#cf_curso').value;c.moneda=$('#cf_mon').value;if($('#cf_pais'))c.pais=$('#cf_pais').value;if($('#cf_obj'))c.objetivoCobro=+$('#cf_obj').value;if($('#cf_dv'))c.diaVenc=+$('#cf_dv').value;if($('#cf_mora'))c.moraPctDia=+$('#cf_mora').value;if($('#cf_pri'))c.prioridadEspera=$('#cf_pri').value;if($('#cf_dh'))c.descHermanos=+$('#cf_dh').value;if($('#cf_db'))c.descBeca=+$('#cf_db').value;applyBrand();logAudit('editar','Configuración del colegio','Datos / parámetros actualizados','edit');saveDB();render();toast('Configuración guardada.','success');}
function resetDemo(){openModal(confirmHTML('Restablecer datos demo','¿Seguro que querés borrar todos los datos y volver a la demo inicial? Esta acción no se puede deshacer.','resetDemoOk()','Restablecer'));}
function resetDemoOk(){DB=freshDB();saveDB();closeModal();applyBrand();buildNav();go('dashboard');toast('Datos restablecidos.','success');}

/* ====================== PORTAL FAMILIA ====================== */
let famFileData=null,tmpFoto=null,tmpMaterias=[],tmpCourseId=null;
function famUpload(){const f=$('#famFile').files[0];if(!f)return;famFileData=f.name;$('#famPreview').innerHTML=`<div class="chip">📎 ${f.name} <button onclick="famFileData=null;$('#famPreview').innerHTML='';$('#famFile').value=''" style="color:var(--danger);font-weight:700;margin-left:4px">×</button></div>`;}
function famSubmit(){if(!famFileData){toast('Seleccioná un archivo primero.','warn');return;}const p=famStudent.pagos.find(x=>x.id===$('#famPagoSel').value);if(p){p.comprobante='comprobante';p.metodo='Comprobante familia';}toast('Comprobante enviado. Pendiente de validación.','success');famFileData=null;saveDB();render();}

/* ====================== MODALES: CUOTAS ====================== */
function modalPago(sid,pid){const studentOpts=DB.students.map(s=>`<option value="${s.id}" ${s.id===sid?'selected':''}>${studentName(s)} · ${s.curso}</option>`).join('');
  const defCurso=sid?courseByName(DB.students.find(x=>x.id===sid).curso):DB.courses[0];
  let p={mes:MONTHS[today.getMonth()]+' '+today.getFullYear(),concepto:'Cuota',importe:defCurso?defCurso.cuota:90000,estado:'pendiente',fechaVenc:today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(cfg().diaVenc).padStart(2,'0'),metodo:'',comprobante:null};
  if(sid&&pid){const s=DB.students.find(x=>x.id===sid);const ex=s.pagos.find(x=>x.id===pid);if(ex)p=ex;}
  openModal(`<div class="modal-head"><h3>${pid?'Editar':'Registrar'} cuota</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid">
     <div class="field full"><label>Alumno</label><select id="mp_s" ${pid?'disabled':''}>${studentOpts}</select></div>
     <div class="field"><label>Mes / período</label><input id="mp_mes" value="${p.mes}"></div>
     <div class="field"><label>Importe (${cfg().moneda})</label><input id="mp_imp" type="number" value="${p.importe}"></div>
     <div class="field full"><label>Concepto</label><input id="mp_con" value="${esc(p.concepto)}"></div>
     <div class="field"><label>Vencimiento</label><input id="mp_venc" type="date" value="${p.fechaVenc}"></div>
     <div class="field"><label>Estado</label><select id="mp_est"><option value="pendiente" ${p.estado==='pendiente'?'selected':''}>Pendiente</option><option value="pagado" ${p.estado==='pagado'?'selected':''}>Pagada</option><option value="vencido" ${p.estado==='vencido'?'selected':''}>Vencida</option></select></div>
     <div class="field full"><label>Medio de pago</label><select id="mp_met"><option value="">—</option>${['Transferencia','Débito automático','Efectivo','Mercado Pago','Tarjeta','Comprobante familia'].map(x=>`<option ${p.metodo===x?'selected':''}>${x}</option>`).join('')}</select></div>
   </div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="savePago('${sid||''}','${pid||''}')">Guardar</button></div>`);}
function savePago(sid,pid){const s=DB.students.find(x=>x.id===document.getElementById('mp_s').value);
  const data={mes:$('#mp_mes').value,concepto:$('#mp_con').value,importe:+$('#mp_imp').value,fechaVenc:$('#mp_venc').value,estado:$('#mp_est').value,metodo:$('#mp_met').value};
  if(pid){const p=s.pagos.find(x=>x.id===pid);const prev=p.estado;Object.assign(p,data);if(data.estado==='pagado'&&!p.fechaPago)p.fechaPago=today.toISOString().slice(0,10);logAudit('editar','Cuota · '+studentName(s),`Editada (${prev}→${data.estado}) · ${fmt(data.importe)}`,'edit');toast('Cuota actualizada.','success');}
  else{s.pagos.push({id:'p'+Date.now(),...data,fechaPago:data.estado==='pagado'?today.toISOString().slice(0,10):null,comprobante:null});logAudit('crear','Cuota · '+studentName(s),`Nueva cuota ${data.mes} · ${fmt(data.importe)}`,'create');toast('Cuota registrada.','success');}
  saveDB();closeModal();buildNav();render();}
function deletePago(sid,pid){const s=DB.students.find(x=>x.id===sid);const p=s.pagos.find(x=>x.id===pid);openModal(confirmHTML('Eliminar cuota',`¿Eliminar la cuota <b>${p.mes}</b> de <b>${studentName(s)}</b> (${fmt(p.importe)})? Queda registrado en auditoría.`,`confirmDeletePago('${sid}','${pid}')`,'Eliminar'));}
function confirmDeletePago(sid,pid){const s=DB.students.find(x=>x.id===sid);const i=s.pagos.findIndex(x=>x.id===pid);const p=s.pagos[i];logAudit('eliminar','Cuota · '+studentName(s),`Eliminada cuota ${p.mes} · ${fmt(p.importe)}`,'delete');s.pagos.splice(i,1);saveDB();closeModal();buildNav();render();toast('Cuota eliminada.','danger');}

function modalGenerarCuota(){openModal(`<div class="modal-head"><h3>Generar cuota del mes</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><p style="color:var(--ink-soft);margin-bottom:14px">Crea una cuota para <b>todos los alumnos activos</b>. El importe se calcula automáticamente: <b>cuota del curso + comedor + actividades confirmadas</b>.</p><div class="form-grid"><div class="field"><label>Mes / período</label><input id="gm_mes" value="${MONTHS[today.getMonth()]+' '+today.getFullYear()}"></div><div class="field"><label>Día de vencimiento</label><input id="gm_dia" type="number" value="${cfg().diaVenc}"></div></div><div class="field"><label>Suplemento comedor (${cfg().moneda})</label><input id="gm_com" type="number" value="${COMEDOR_CUOTA}"></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doGenerar()">Generar para ${DB.students.length} alumnos</button></div>`);}
function doGenerar(){const mes=$('#gm_mes').value,com=+$('#gm_com').value,dia=$('#gm_dia').value;const venc=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(dia).padStart(2,'0');let n=0;
  DB.students.forEach(s=>{if(s.estadoMatricula!=='Activa')return;if(s.pagos.some(p=>p.mes===mes&&p.concepto.includes('Cuota')))return;const c=courseByName(s.curso);if(!c)return;const actConf=studentActs(s).filter(a=>a._estado==='confirmada').reduce((x,a)=>x+a.cuota,0);let imp=c.cuota+(s.comedor.inscrito?com:0)+actConf;let desc=0,notas=[];
    if(s.beca&&cfg().descBeca){desc+=cfg().descBeca;notas.push('beca '+cfg().descBeca+'%');}
    const hermano=DB.students.some(o=>o.id!==s.id&&o.tutor&&s.tutor&&o.tutor.email&&o.tutor.email===s.tutor.email&&o.estadoMatricula==='Activa');
    if(hermano&&cfg().descHermanos){desc+=cfg().descHermanos;notas.push('hermano '+cfg().descHermanos+'%');}
    if(desc>100)desc=100;const impFinal=Math.round(imp*(1-desc/100));
    s.pagos.push({id:'p'+Date.now()+n,mes,concepto:'Cuota'+(s.comedor.inscrito?' + comedor':'')+(actConf?' + extra':'')+(desc?' ('+notas.join(', ')+')':''),importe:impFinal,estado:'pendiente',fechaVenc:venc,fechaPago:null,metodo:null,comprobante:null});n++;});
  logAudit('crear','Cobranza · '+mes,`${n} cuotas generadas en lote`,'create');saveDB();closeModal();buildNav();render();toast(n+' cuotas generadas.','success');}

function downloadTemplate(type){let head,sample,name;
  if(type==='alumnos'){head=['nombre','apellido','curso','division','dni','nacimiento','tutor','relacion','email','telefono','comedor','alergias'];sample=['Juan','Pérez','1° Grado','A','45123678','2018-04-12','María Pérez','Madre','maria.perez@gmail.com','2614000000','Fijo 5 días','Ninguna'];name='plantilla_alumnos';}
  else{head=['alumno','mes','concepto','importe','estado'];sample=['Juan Pérez','Jun 2026','Cuota','92000','pendiente'];name='plantilla_cuotas';}
  const csv=head.join(',')+'\n'+sample.join(',')+'\n';const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();URL.revokeObjectURL(url);toast('Plantilla descargada.','success');}
function modalImport(type){type=type||'cuotas';const cols=type==='alumnos'?'nombre, apellido, curso, division, dni, nacimiento, tutor, relacion, email, telefono, comedor, alergias':'alumno, mes, concepto, importe, estado';
  openModal(`<div class="modal-head"><h3>Importar ${type==='alumnos'?'alumnos':'cuotas'}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body">
     <div class="seg" style="margin-bottom:14px"><button class="${type==='alumnos'?'active':''}" onclick="modalImport('alumnos')">Alumnos</button><button class="${type==='cuotas'?'active':''}" onclick="modalImport('cuotas')">Cuotas</button></div>
     <p style="color:var(--ink-soft);margin-bottom:10px">Subí un CSV (separado por comas o «;») con estas columnas:<br><code style="font-size:12px">${cols}</code></p>
     <button class="btn btn-ghost btn-sm" style="margin-bottom:14px" onclick="downloadTemplate('${type}')">${icoXls()} Descargar plantilla CSV</button>
     <div class="dropzone" onclick="$('#imp_file').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><div><b>Subir CSV</b></div><small id="imp_name">Ningún archivo seleccionado</small></div>
     <input type="file" id="imp_file" accept=".csv" style="display:none" onchange="document.getElementById('imp_name').textContent=this.files[0]?.name||''">
     <p style="color:var(--muted);font-size:12px;margin-top:12px">${type==='alumnos'?'Crea alumnos nuevos y los inscribe al curso indicado (respetando cupo y lista de espera).':'Vincula cada fila con un alumno existente por nombre.'} Todo queda en auditoría.</p>
   </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doImport('${type}')">Importar</button></div>`);}
function doImport(type){type=type||'cuotas';const f=$('#imp_file').files[0];if(!f){toast('Seleccioná un CSV.','warn');return;}const r=new FileReader();
  r.onload=e=>{const lines=e.target.result.replace(/^\ufeff/,'').split(/\r?\n/).filter(x=>x.trim());let n=0;
    if(type==='alumnos'){lines.slice(1).forEach((line,k)=>{const c=line.split(/[,;]/).map(x=>x.trim());if(c.length<3||!c[0])return;
        const curso=CURSOS.includes(c[2])?c[2]:CURSOS[0];const com=(c[10]||'').toLowerCase();
        const st={id:'a'+Date.now()+k,nombre:c[0],apellidos:c[1]||'',curso,grupo:(c[3]||'A').toUpperCase().startsWith('B')?'B':'A',color:AV_COLORS[(DB.students.length+k)%8],foto:null,autorizacionImagen:{permitida:false,fecha:''},dni:c[4]||'',nacimiento:c[5]||'',direccion:'',cp:'',ciudad:'',matricula:today.toISOString().slice(0,10),estadoMatricula:'Activa',tutor:{nombre:c[6]||'',relacion:c[7]||'Madre',email:c[8]||'',tel:c[9]||''},tutor2:null,emergencia:[],comedor:{inscrito:!!(com&&com!=='no'),plan:(com&&com!=='no')?c[10]:'—',alergias:c[11]||'Ninguna',medicacion:'',observaciones:''},actividades:[],inscripciones:[],pagos:[],documentos:[],observaciones:[],beca:false,notas:{},salud:{obraSocial:'',afiliado:'',grupoSanguineo:'',vacunas:'',medico:'',telMedico:''},autorizados:[{nombre:c[6]||'',dni:c[4]||'',relacion:c[7]||'Tutor/a'}],retiros:[],incidencias:[],asistencia:{faltas:0,retrasos:0,justificadas:0}};
        DB.students.push(st);const cap=courseByName(curso).capacidad;const conf=cursoConfirmados(curso,cfg().ciclo).length;st.inscripciones=[{ciclo:cfg().ciclo,curso,estado:conf<cap?'confirmada':'pendiente',fecha:today.toISOString().slice(0,10)}];n++;});
      logAudit('crear','Importación de alumnos',`${n} alumno(s) importados e inscriptos`,'create');toast(n+' alumno(s) importados.','success');}
    else{lines.slice(1).forEach((line,k)=>{const c=line.split(/[,;]/).map(x=>x.trim());if(c.length<4)return;const s=DB.students.find(st=>studentName(st).toLowerCase().includes(c[0].toLowerCase())||c[0].toLowerCase().includes(st.nombre.toLowerCase()));if(!s)return;s.pagos.push({id:'p'+Date.now()+k,mes:c[1]||'—',concepto:c[2]||'Importado',importe:+c[3]||0,estado:(c[4]||'pendiente').toLowerCase(),fechaVenc:today.toISOString().slice(0,10),fechaPago:null,metodo:null,comprobante:null});n++;});
      logAudit('crear','Importación de cuotas',`${n} cuota(s) importadas`,'create');toast(n+' cuota(s) importadas.','success');}
    saveDB();closeModal();buildNav();render();};
  r.readAsText(f);}

/* ====================== MODALES: ALUMNO ====================== */
function modalStudent(id){let s={nombre:'',apellidos:'',curso:CURSOS[0],grupo:'A',dni:'',nacimiento:'',direccion:'',cp:'',ciudad:'',autorizacionImagen:{permitida:false,fecha:''},tutor:{nombre:'',relacion:'Madre',email:'',tel:''},tutor2:null,emergencia:[{nombre:'',relacion:'',tel:''}],comedor:{inscrito:false,plan:'—',alergias:'Ninguna',medicacion:'',observaciones:''}};
  if(id)s=DB.students.find(x=>x.id===id);const e0=s.emergencia[0]||{nombre:'',relacion:'',tel:''};
  openModal(`<div class="modal-head"><h3>${id?'Editar':'Nuevo'} alumno</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid">
     <div class="form-section">Datos del alumno</div>
     <div class="field"><label>Nombre</label><input id="ms_n" value="${esc(s.nombre)}"></div>
     <div class="field"><label>Apellido</label><input id="ms_a" value="${esc(s.apellidos)}"></div>
     <div class="field"><label>Curso</label><select id="ms_c">${CURSOS.map(c=>`<option ${s.curso===c?'selected':''}>${c}</option>`).join('')}</select></div>
     <div class="field"><label>División</label><select id="ms_g"><option ${s.grupo==='A'?'selected':''}>A</option><option ${s.grupo==='B'?'selected':''}>B</option></select></div>
     <div class="field"><label>DNI</label><input id="ms_dni" value="${esc(s.dni)}"></div>
     <div class="field"><label>Nacimiento</label><input id="ms_nac" type="date" value="${s.nacimiento}"></div>
     <div class="field"><label>Domicilio</label><input id="ms_dir" value="${esc(s.direccion)}"></div>
     <div class="field"><label>CP / Localidad</label><input id="ms_ciu" value="${esc((s.cp?s.cp+' ':'')+s.ciudad)}"></div>
     <div class="full check"><div class="switch ${s.autorizacionImagen.permitida?'on':''}" id="ms_img" onclick="this.classList.toggle('on')"></div><span><b>Autorización de imagen</b> — permite usar fotos del alumno</span></div>
     <div class="full check"><div class="switch ${s.beca?'on':''}" id="ms_beca" onclick="this.classList.toggle('on')"></div><span><b>Beca</b> — aplica descuento automático en la cuota</span></div>
     <div class="form-section">Tutor/a principal</div>
     <div class="field"><label>Nombre</label><input id="ms_tn" value="${esc(s.tutor.nombre)}"></div>
     <div class="field"><label>Relación</label><select id="ms_tr"><option ${s.tutor.relacion==='Madre'?'selected':''}>Madre</option><option ${s.tutor.relacion==='Padre'?'selected':''}>Padre</option><option ${s.tutor.relacion==='Tutor/a legal'?'selected':''}>Tutor/a legal</option></select></div>
     <div class="field"><label>Email</label><input id="ms_te" value="${esc(s.tutor.email)}"></div>
     <div class="field"><label>Teléfono</label><input id="ms_tt" value="${esc(s.tutor.tel)}"></div>
     <div class="form-section">Contacto de emergencia</div>
     <div class="field"><label>Nombre</label><input id="ms_en" value="${esc(e0.nombre)}"></div>
     <div class="field"><label>Relación</label><input id="ms_er" value="${esc(e0.relacion)}"></div>
     <div class="field full"><label>Teléfono</label><input id="ms_et" value="${esc(e0.tel)}"></div>
     <div class="form-section">Comedor y salud</div>
     <div class="field"><label>Comedor</label><select id="ms_com"><option value="no" ${!s.comedor.inscrito?'selected':''}>No inscripto</option><option value="Fijo 5 días" ${s.comedor.plan==='Fijo 5 días'?'selected':''}>Fijo 5 días</option><option value="Vianda 3 días" ${s.comedor.plan==='Vianda 3 días'?'selected':''}>Vianda 3 días</option></select></div>
     <div class="field"><label>Alergias / dieta</label><select id="ms_al">${ALERGIAS.map(a=>`<option ${s.comedor.alergias===a?'selected':''}>${a}</option>`).join('')}</select></div>
     <div class="field full"><label>Medicación / notas de salud</label><input id="ms_med" value="${esc(s.comedor.medicacion)}"></div>
   </div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveStudent('${id||''}')">Guardar</button></div>`,true);}
function saveStudent(id){const com=$('#ms_com').value;const parts=$('#ms_ciu').value.trim().split(' ');const cp=/^\d/.test(parts[0])?parts.shift():'';const ciudad=parts.join(' ');const imgOn=document.getElementById('ms_img').classList.contains('on');const curso=$('#ms_c').value;
  const data={nombre:$('#ms_n').value,apellidos:$('#ms_a').value,curso,grupo:$('#ms_g').value,dni:$('#ms_dni').value,nacimiento:$('#ms_nac').value,direccion:$('#ms_dir').value,cp,ciudad,beca:document.getElementById('ms_beca').classList.contains('on'),autorizacionImagen:{permitida:imgOn,fecha:imgOn?today.toISOString().slice(0,10):''},tutor:{nombre:$('#ms_tn').value,relacion:$('#ms_tr').value,email:$('#ms_te').value,tel:$('#ms_tt').value},emergencia:[{nombre:$('#ms_en').value,relacion:$('#ms_er').value,tel:$('#ms_et').value}],comedor:{inscrito:com!=='no',plan:com==='no'?'—':com,alergias:$('#ms_al').value,medicacion:$('#ms_med').value,observaciones:''}};
  if(!data.nombre||!data.apellidos){toast('Indicá nombre y apellido.','warn');return;}
  if(id){const s=DB.students.find(x=>x.id===id);Object.assign(s,data);logAudit('editar','Alumno · '+studentName(data),'Legajo actualizado','edit');toast('Legajo actualizado.','success');saveDB();closeModal();render();}
  else{const nid='a'+Date.now();DB.students.push({id:nid,...data,color:AV_COLORS[DB.students.length%8],foto:null,tutor2:null,beca:false,notas:{},salud:{obraSocial:'',afiliado:'',grupoSanguineo:'',vacunas:'',medico:'',telMedico:''},autorizados:[{nombre:data.tutor.nombre,dni:data.dni,relacion:data.tutor.relacion}],retiros:[],incidencias:[],actividades:[],inscripciones:[],pagos:[],documentos:[],observaciones:[],matricula:today.toISOString().slice(0,10),estadoMatricula:'Activa',asistencia:{faltas:0,retrasos:0,justificadas:0}});logAudit('crear','Alumno · '+studentName(data),'Alta de alumno','create');inscribirAlumnoCurso(nid,curso,cfg().ciclo);closeModal();render();}}

let tmpFotoStudent=null;
function modalFoto(id){const s=DB.students.find(x=>x.id===id);tmpFoto=null;openModal(`<div class="modal-head"><h3>Foto del alumno</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body" style="text-align:center"><div id="fotoPrev" style="margin-bottom:16px">${s.foto?`<img class="photo-lg" src="${s.foto}">`:`<div class="photo-ph" style="background:${s.color};margin:0 auto">${initials(studentName(s))}</div>`}</div><input type="file" id="fotoFile" accept="image/*" style="display:none" onchange="fotoPreview('${id}')"><button class="btn btn-ghost" onclick="$('#fotoFile').click()">📷 Seleccionar imagen</button><div class="check" style="justify-content:center;margin-top:14px"><div class="switch ${s.autorizacionImagen.permitida?'on':''}" id="foto_auth" onclick="this.classList.toggle('on')"></div><span>Autorización de imagen firmada por la familia</span></div><p style="color:var(--muted);font-size:12px;margin-top:8px">Sin autorización, la foto no se muestra (derechos de imagen).</p></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFoto('${id}')">Guardar</button></div>`);}
function fotoPreview(id){const f=$('#fotoFile').files[0];if(!f)return;resizeImage(f,260,d=>{tmpFoto=d;$('#fotoPrev').innerHTML=`<img class="photo-lg" src="${d}">`;});}
function saveFoto(id){const s=DB.students.find(x=>x.id===id);if(tmpFoto)s.foto=tmpFoto;const auth=document.getElementById('foto_auth').classList.contains('on');s.autorizacionImagen={permitida:auth,fecha:auth?today.toISOString().slice(0,10):''};tmpFoto=null;logAudit('editar','Foto · '+studentName(s),'Foto / autorización actualizada','edit');saveDB();closeModal();render();toast('Foto guardada.','success');}

function modalDoc(id){openModal(`<div class="modal-head"><h3>Agregar documento</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field full"><label>Tipo de documento</label><select id="md_tipo"><option>Certificado médico</option><option>Apto físico</option><option>Autorización salidas</option><option>Autorización imagen</option><option>Libreta sanitaria</option><option>Otro</option></select></div><div class="field"><label>Fecha de emisión</label><input id="md_fecha" type="date" value="${today.toISOString().slice(0,10)}"></div><div class="field"><label>Vencimiento (opcional)</label><input id="md_venc" type="date"></div><div class="field full"><label>Archivo</label><div class="dropzone" onclick="$('#md_file').click()" id="md_drop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" style="width:26px;height:26px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><div>Subir archivo (PDF/imagen)</div></div><input type="file" id="md_file" style="display:none" onchange="document.getElementById('md_drop').querySelector('div').textContent=this.files[0]?.name||''"></div></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveDoc('${id}')">Agregar</button></div>`);}
function saveDoc(id){const s=DB.students.find(x=>x.id===id);const f=document.getElementById('md_file').files[0];const tipo=$('#md_tipo').value;s.documentos.push({id:'d'+Date.now(),tipo,nombre:f?f.name:tipo.replace(/ /g,'_')+'.pdf',fecha:$('#md_fecha').value,vencimiento:$('#md_venc').value});logAudit('crear','Documento · '+studentName(s),tipo+' agregado','create');saveDB();closeModal();render();toast('Documento agregado.','success');}
function deleteDoc(sid,did){openModal(confirmHTML('Eliminar documento','¿Eliminar este documento del legajo? Queda registrado en auditoría.',`confirmDeleteDoc('${sid}','${did}')`,'Eliminar'));}
function confirmDeleteDoc(sid,did){const s=DB.students.find(x=>x.id===sid);const i=s.documentos.findIndex(d=>d.id===did);const d=s.documentos[i];logAudit('eliminar','Documento · '+studentName(s),d.tipo+' eliminado','delete');s.documentos.splice(i,1);saveDB();closeModal();render();toast('Documento eliminado.','danger');}

/* ====================== MODALES: COMUNICACIONES ====================== */
function fillTemplate(txt,s){const pend=s?s.pagos.filter(p=>realEstado(p)!=='pagado'):[];const imp=pend.reduce((a,b)=>a+b.importe,0);const mes=pend.length?pend[pend.length-1].mes:MONTHS[today.getMonth()]+' '+today.getFullYear();const ins=s?getIns(s,cfg().ciclo):null;
  return txt.replace(/{centro}/g,cfg().centroNombre).replace(/{tutor}/g,s?s.tutor.nombre:'familia').replace(/{nombre_alumno}/g,s?studentName(s):'').replace(/{curso}/g,s?(ins?ins.curso:s.curso):'').replace(/{importe}/g,fmt(imp)).replace(/{mes}/g,mes).replace(/{fecha}/g,today.toISOString().slice(0,10));}
function modalSend(tid,sid){const tplOpts=DB.templates.map(t=>`<option value="${t.id}" ${t.id===tid?'selected':''}>${t.nombre} (${t.categoria})</option>`).join('');
  const destOpts=`<option value="">— Seleccioná alumno/tutor —</option><option value="__morosos__">📛 Todos los morosos (${metrics().morosos.length})</option>`+DB.students.map(s=>`<option value="${s.id}" ${s.id===sid?'selected':''}>${studentName(s)} → ${s.tutor.nombre}</option>`).join('');
  openModal(`<div class="modal-head"><h3>Enviar comunicación</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Plantilla</label><select id="sd_tpl" onchange="sendPreview()">${tplOpts}</select></div><div class="field"><label>Destinatario</label><select id="sd_dest" onchange="sendPreview()">${destOpts}</select></div></div><div class="field"><label>Asunto</label><input id="sd_asunto"></div><div class="field"><label>Mensaje (editable)</label><textarea id="sd_body" style="min-height:180px"></textarea></div><p style="color:var(--muted);font-size:12px">Las variables se reemplazan según el destinatario. Para «todos los morosos» se personaliza cada envío.</p></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doSend()">Enviar</button></div>`,true);sendPreview();}
function sendPreview(){const t=DB.templates.find(x=>x.id===$('#sd_tpl').value);if(!t)return;const dest=$('#sd_dest').value;const s=(dest&&dest!=='__morosos__')?DB.students.find(x=>x.id===dest):null;$('#sd_asunto').value=fillTemplate(t.asunto,s);$('#sd_body').value=fillTemplate(t.cuerpo,s);}
function doSend(){const dest=$('#sd_dest').value;const t=DB.templates.find(x=>x.id===$('#sd_tpl').value);if(!dest){toast('Seleccioná un destinatario.','warn');return;}
  const asunto=$('#sd_asunto').value,cuerpo=$('#sd_body').value;DB.mensajes=DB.mensajes||[];const fecha=new Date().toISOString().slice(0,16).replace('T',' ');
  if(dest==='__morosos__'){const ms=metrics().morosos;ms.forEach(mo=>DB.mensajes.push({id:'m'+Date.now()+mo.s.id,fecha,studentId:mo.s.id,plantilla:t.nombre,asunto:fillTemplate(asunto,mo.s),cuerpo:fillTemplate(cuerpo,mo.s),leido:false}));logAudit('enviar','Comunicación · '+ms.length+' familias',`Plantilla «${t.nombre}» enviada a morosos`,'info');toast(`Enviado a ${ms.length} familia(s).`,'success');}
  else{const s=DB.students.find(x=>x.id===dest);DB.mensajes.push({id:'m'+Date.now(),fecha,studentId:s.id,plantilla:t.nombre,asunto,cuerpo,leido:false});logAudit('enviar','Comunicación · '+studentName(s),`«${t.nombre}» → ${s.tutor.email}`,'info');toast(`Enviado a ${s.tutor.nombre}.`,'success');}
  saveDB();closeModal();render();}
function modalRecordarMorosos(){modalSend('t1','__morosos__');}
function modalTemplate(id){let t={nombre:'',categoria:'Comunicado',asunto:'',cuerpo:''};if(id)t=DB.templates.find(x=>x.id===id);
  openModal(`<div class="modal-head"><h3>${id?'Editar':'Nueva'} plantilla</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Nombre</label><input id="mt_n" value="${esc(t.nombre)}"></div><div class="field"><label>Categoría</label><select id="mt_c">${['Morosidad','Pagos','Comedor','Documentación','Inscripciones','Comunicado','Bienvenida'].map(x=>`<option ${t.categoria===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field full"><label>Asunto</label><input id="mt_a" value="${esc(t.asunto)}"></div><div class="field full"><label>Cuerpo del mensaje</label><textarea id="mt_b" style="min-height:160px">${esc(t.cuerpo)}</textarea><div class="var-pills">${['{centro}','{tutor}','{nombre_alumno}','{curso}','{importe}','{mes}','{fecha}'].map(v=>`<button onclick="insVar('mt_b','${v}')">${v}</button>`).join('')}</div></div></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveTemplate('${id||''}')">Guardar plantilla</button></div>`,true);}
function saveTemplate(id){const data={nombre:$('#mt_n').value,categoria:$('#mt_c').value,asunto:$('#mt_a').value,cuerpo:$('#mt_b').value};if(!data.nombre){toast('Indicá el nombre.','warn');return;}
  if(id){Object.assign(DB.templates.find(x=>x.id===id),data);logAudit('editar','Plantilla · '+data.nombre,'Plantilla actualizada','edit');toast('Plantilla guardada.','success');}
  else{DB.templates.push({id:'t'+Date.now(),...data});logAudit('crear','Plantilla · '+data.nombre,'Nueva plantilla','create');toast('Plantilla creada.','success');}
  saveDB();closeModal();render();}
function deleteTemplate(id){const t=DB.templates.find(x=>x.id===id);openModal(confirmHTML('Eliminar plantilla',`¿Eliminar la plantilla <b>${t.nombre}</b>?`,`confirmDeleteTemplate('${id}')`,'Eliminar'));}
function confirmDeleteTemplate(id){const t=DB.templates.find(x=>x.id===id);DB.templates=DB.templates.filter(x=>x.id!==id);logAudit('eliminar','Plantilla · '+t.nombre,'Plantilla eliminada','delete');saveDB();closeModal();render();toast('Plantilla eliminada.','danger');}

/* ====================== MODALES: INSCRIPCIÓN / MATRÍCULA ====================== */
function modalInscribir(sid){const s=DB.students.find(x=>x.id===sid);const ins=getIns(s,inscCiclo);
  const cicloOpts=['2026','2027'].map(y=>`<option ${inscCiclo===y?'selected':''}>${y}</option>`).join('');
  const opts=DB.courses.map(c=>{const conf=cursoConfirmados(c.nombre,inscCiclo).length;const full=conf>=c.capacidad;return `<option value="${c.nombre}" ${ins&&ins.curso===c.nombre?'selected':''}>${c.nombre} (${c.nivel}) — ${conf}/${c.capacidad}${full?' · COMPLETO → lista de espera':''}</option>`;}).join('');
  openModal(`<div class="modal-head"><h3>Inscribir / cambiar curso</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body">
     <p style="color:var(--ink-soft);margin-bottom:14px">Inscripción anual de <b>${studentName(s)}</b>. Si el cupo del curso está completo, la inscripción queda <b>en lista de espera (pendiente de confirmar)</b> y se confirma sola al liberarse una vacante.</p>
     <div class="form-grid"><div class="field"><label>Ciclo lectivo</label><select id="mi_ciclo" onchange="inscCiclo=this.value;modalInscribir('${sid}')">${cicloOpts}</select></div>
     <div class="field"><label>Estado actual</label><div style="padding-top:6px">${inscBadge(ins?ins.estado:'')}</div></div></div>
     <div class="field"><label>Curso</label><select id="mi_curso">${opts}</select></div>
   </div><div class="modal-foot">${ins?`<button class="btn btn-danger" style="margin-right:auto" onclick="bajaCurso('${sid}',inscCiclo);closeModal()">Dar de baja</button>`:''}<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doInscribir('${sid}')">Inscribir</button></div>`);}
function doInscribir(sid){inscribirAlumnoCurso(sid,$('#mi_curso').value,inscCiclo);saveDB();closeModal();render();}

function modalGestionCurso(cn){const c=courseByName(cn);if(!c)return;const conf=cursoConfirmados(cn,inscCiclo);const esp=cursoEspera(cn,inscCiclo);const full=conf.length>=c.capacidad;
  const yaIns=new Set([...conf,...esp].map(s=>s.id));
  const libres=DB.students.filter(s=>!yaIns.has(s.id)).map(s=>`<option value="${s.id}">${studentName(s)} · ${s.curso}</option>`).join('');
  openModal(`<div class="modal-head"><h3>Matrícula · ${cn} <span style="font-weight:400;color:var(--muted);font-size:14px">ciclo ${inscCiclo}</span></h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body">
     <div style="display:flex;gap:10px;margin-bottom:14px"><span class="badge ${full?'b-danger':'b-success'}">${conf.length}/${c.capacidad} confirmados${full?' · COMPLETO':''}</span>${esp.length?`<span class="badge b-warn">${esp.length} en lista de espera</span>`:''}<span class="badge b-grey nodot">${c.turno}</span></div>
     <div class="field"><label>Inscribir alumno a ${cn}</label><div style="display:flex;gap:8px"><select id="gc_sel" style="flex:1">${libres||'<option>Todos los alumnos ya están en este curso</option>'}</select><button class="btn btn-primary" onclick="gcInscribir('${cn}')">Inscribir</button></div><div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:4px">Si no hay cupo, queda en lista de espera automáticamente.</div></div>
     <div class="form-section">Confirmados (${conf.length})</div>
     ${conf.length?conf.map(s=>`<div class="alert-item">${avatarHTML(s,32)}<div class="info"><b>${studentName(s)}</b><small>Inscripto ${getIns(s,inscCiclo).fecha}</small></div><span class="badge b-success nodot">Confirmado</span><button class="btn btn-ghost btn-sm" onclick="gcBaja('${s.id}','${cn}')">Baja</button></div>`).join(''):'<p style="color:var(--muted);font-size:13px">Sin confirmados.</p>'}
     <div class="form-section">Lista de espera (${esp.length})</div>
     ${esp.length?esp.map((s,idx)=>`<div class="alert-item"><span class="badge b-grey nodot">#${idx+1}</span><div class="info"><b>${studentName(s)}</b><small>En espera desde ${getIns(s,inscCiclo).fecha}</small></div><button class="btn btn-primary btn-sm" onclick="gcConfirmar('${s.id}','${cn}')" ${full?'disabled title=Sin-vacante':''}>Confirmar vacante</button><button class="btn btn-ghost btn-sm" onclick="gcBaja('${s.id}','${cn}')">Quitar</button></div>`).join(''):'<p style="color:var(--muted);font-size:13px">Nadie en lista de espera.</p>'}
   </div><div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Listo</button></div>`,true);}
function gcInscribir(cn){const sid=$('#gc_sel').value;if(!sid){toast('Seleccioná un alumno.','warn');return;}inscribirAlumnoCurso(sid,cn,inscCiclo);render();modalGestionCurso(cn);}
function gcBaja(sid,cn){bajaCurso(sid,inscCiclo);modalGestionCurso(cn);}
function gcConfirmar(sid,cn){confirmarVacante(sid,inscCiclo);modalGestionCurso(cn);}

/* ====================== MODALES: CURSO + MATERIAS / TEMARIO ====================== */
let _keepMat=false;
function modalCurso(id){const c=DB.courses.find(x=>x.id===id);if(!c)return;
  if(!_keepMat){tmpCourseId=id;tmpMaterias=JSON.parse(JSON.stringify(c.materias||[]));}_keepMat=false;
  const edit=perm('ver_inscripciones');
  const matRows=tmpMaterias.map((m,i)=>`<div style="border:1px solid var(--line);border-radius:var(--r-sm);padding:10px;margin-bottom:8px">
     <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><input id="cm_mn_${i}" value="${esc(m.nombre)}" placeholder="Materia" style="flex:1;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px;font-weight:600" ${edit?'':'disabled'}>${edit?`<button class="icon-btn danger" onclick="removeMateria(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>`:''}</div>
     <textarea id="cm_mt_${i}" placeholder="Temario / unidades..." style="width:100%;min-height:54px;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px;font-size:13px;line-height:1.5" ${edit?'':'disabled'}>${esc(m.temas)}</textarea></div>`).join('');
  openModal(`<div class="modal-head"><h3>Curso y materias</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid">
     <div class="field"><label>Nombre del curso</label><input id="cc_n" value="${esc(c.nombre)}" ${edit?'':'disabled'}></div>
     <div class="field"><label>Nivel</label><select id="cc_niv" ${edit?'':'disabled'}>${['Inicial','Primaria','Secundaria'].map(x=>`<option ${c.nivel===x?'selected':''}>${x}</option>`).join('')}</select></div>
     <div class="field"><label>Turno</label><select id="cc_t" ${edit?'':'disabled'}><option ${c.turno==='Mañana'?'selected':''}>Mañana</option><option ${c.turno==='Tarde'?'selected':''}>Tarde</option></select></div>
     <div class="field"><label>Cupo / capacidad</label><input id="cc_cap" type="number" value="${c.capacidad}" ${edit?'':'disabled'}></div>
     <div class="field full"><label>Cuota mensual (${cfg().moneda})</label><input id="cc_cuota" type="number" value="${c.cuota}" ${edit?'':'disabled'}></div>
   </div>
   <div class="form-section" style="display:flex;align-items:center"><span style="flex:1">Materias y temario (${tmpMaterias.length})</span>${edit?`<button class="btn btn-ghost btn-sm" onclick="loadMatTemplate()" style="text-transform:none;letter-spacing:0">Cargar temario del nivel</button>`:''}</div>
   ${matRows||'<p style="color:var(--muted);font-size:13px">Sin materias cargadas.</p>'}
   ${edit?`<button class="btn btn-ghost btn-sm btn-block" style="margin-top:6px" onclick="addMateria()">+ Agregar materia</button>`:''}
   </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>${edit?`<button class="btn btn-primary" onclick="saveCurso()">Guardar curso</button>`:''}</div>`,true);}
function syncMat(){tmpMaterias.forEach((m,i)=>{const n=document.getElementById('cm_mn_'+i),t=document.getElementById('cm_mt_'+i);if(n)m.nombre=n.value;if(t)m.temas=t.value;});}
function addMateria(){syncMat();tmpMaterias.push({nombre:'',temas:''});_keepMat=true;modalCurso(tmpCourseId);}
function removeMateria(i){syncMat();tmpMaterias.splice(i,1);_keepMat=true;modalCurso(tmpCourseId);}
function loadMatTemplate(){const niv=$('#cc_niv').value;tmpMaterias=buildMaterias(niv);_keepMat=true;modalCurso(tmpCourseId);toast('Temario sugerido de '+niv+' cargado.','info');}
function saveCurso(){syncMat();const c=DB.courses.find(x=>x.id===tmpCourseId);if(!c)return;const prev=c.nombre;
  c.nombre=$('#cc_n').value.trim()||prev;c.nivel=$('#cc_niv').value;c.turno=$('#cc_t').value;c.capacidad=+$('#cc_cap').value;c.cuota=+$('#cc_cuota').value;c.materias=tmpMaterias.filter(m=>m.nombre.trim()).map(m=>({nombre:m.nombre.trim(),temas:m.temas}));
  if(prev!==c.nombre){DB.students.forEach(s=>{if(s.curso===prev)s.curso=c.nombre;(s.inscripciones||[]).forEach(i=>{if(i.curso===prev)i.curso=c.nombre;});});const idx=CURSOS.indexOf(prev);if(idx>=0)CURSOS[idx]=c.nombre;}
  logAudit('editar','Curso · '+c.nombre,`Datos y temario (${c.materias.length} materias)`,'edit');saveDB();closeModal();render();toast('Curso actualizado.','success');}

/* ====================== MODALES: ACTIVIDADES (edición ampliada) ====================== */
function modalActividad(id){let a={nombre:'',categoria:'Deporte',dia:'Lunes',horaInicio:'17:00',horaFin:'18:30',aula:'',profesor:'',cupo:15,cuota:25000,periodo:'Anual',estado:'Activa',dirigidoA:'Todos los niveles',material:'',descripcion:'',color:AV_COLORS[DB.activities.length%8]};if(id)a=DB.activities.find(x=>x.id===id);
  const colorOpts=AV_COLORS.map(col=>`<option value="${col}" ${a.color===col?'selected':''} style="background:${col}">${col}</option>`).join('');
  openModal(`<div class="modal-head"><h3>${id?'Editar':'Nueva'} actividad</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid">
     <div class="form-section">Datos generales</div>
     <div class="field"><label>Nombre</label><input id="ma_n" value="${esc(a.nombre)}"></div>
     <div class="field"><label>Categoría</label><select id="ma_cat">${['Deporte','Idioma','Arte','Música','Tecnología','Apoyo escolar'].map(x=>`<option ${a.categoria===x?'selected':''}>${x}</option>`).join('')}</select></div>
     <div class="field"><label>Profesor/a</label><input id="ma_prof" value="${esc(a.profesor)}"></div>
     <div class="field"><label>Lugar / aula</label><input id="ma_aula" value="${esc(a.aula)}"></div>
     <div class="form-section">Horario y período</div>
     <div class="field"><label>Día</label><select id="ma_d">${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(x=>`<option ${a.dia===x?'selected':''}>${x}</option>`).join('')}</select></div>
     <div class="field"><label>Período</label><select id="ma_per">${['Anual','1° Cuatrimestre','2° Cuatrimestre'].map(x=>`<option ${a.periodo===x?'selected':''}>${x}</option>`).join('')}</select></div>
     <div class="field"><label>Hora inicio</label><input id="ma_hi" value="${a.horaInicio}"></div>
     <div class="field"><label>Hora fin</label><input id="ma_hf" value="${a.horaFin}"></div>
     <div class="form-section">Cupo, cuota y estado</div>
     <div class="field"><label>Cupo</label><input id="ma_cupo" type="number" value="${a.cupo}"></div>
     <div class="field"><label>Cuota mensual (${cfg().moneda})</label><input id="ma_cuota" type="number" value="${a.cuota}"></div>
     <div class="field"><label>Estado</label><select id="ma_est"><option ${a.estado==='Activa'?'selected':''}>Activa</option><option ${a.estado==='Inactiva'?'selected':''}>Inactiva</option></select></div>
     <div class="field"><label>Color</label><select id="ma_color">${colorOpts}</select></div>
     <div class="field full"><label>Dirigido a</label><input id="ma_dir" value="${esc(a.dirigidoA)}"></div>
     <div class="field full"><label>Materiales necesarios</label><input id="ma_mat" value="${esc(a.material)}"></div>
     <div class="field full"><label>Descripción</label><textarea id="ma_desc">${esc(a.descripcion)}</textarea></div>
   </div></div><div class="modal-foot">${id?`<button class="btn btn-danger" style="margin-right:auto" onclick="deleteActividad('${id}')">Eliminar</button>`:''}<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveActividad('${id||''}')">Guardar</button></div>`,true);}
function saveActividad(id){const data={nombre:$('#ma_n').value,categoria:$('#ma_cat').value,dia:$('#ma_d').value,horaInicio:$('#ma_hi').value,horaFin:$('#ma_hf').value,aula:$('#ma_aula').value,profesor:$('#ma_prof').value,cupo:+$('#ma_cupo').value,cuota:+$('#ma_cuota').value,periodo:$('#ma_per').value,estado:$('#ma_est').value,dirigidoA:$('#ma_dir').value,material:$('#ma_mat').value,descripcion:$('#ma_desc').value,color:$('#ma_color').value};
  if(!data.nombre){toast('Indicá el nombre.','warn');return;}
  if(id){Object.assign(DB.activities.find(x=>x.id===id),data);logAudit('editar','Actividad · '+data.nombre,'Datos actualizados','edit');toast('Actividad actualizada.','success');}
  else{DB.activities.push({id:'act'+Date.now(),...data});logAudit('crear','Actividad · '+data.nombre,'Nueva actividad','create');toast('Actividad creada.','success');}
  saveDB();closeModal();render();}
function deleteActividad(id){const a=getAct(id);openModal(confirmHTML('Eliminar actividad',`¿Eliminar <b>${a.nombre}</b>? Se da de baja a ${actConfirmados(id).length+actEspera(id).length} alumno(s).`,`confirmDeleteActividad('${id}')`,'Eliminar'));}
function confirmDeleteActividad(id){const a=getAct(id);DB.students.forEach(s=>{s.actividades=(s.actividades||[]).filter(e=>e.id!==id);});DB.activities=DB.activities.filter(x=>x.id!==id);logAudit('eliminar','Actividad · '+a.nombre,'Actividad eliminada','delete');saveDB();closeModal();render();toast('Actividad eliminada.','danger');}
function modalActInscriptos(aid){const a=getAct(aid);const conf=actConfirmados(aid);const esp=actEspera(aid);const full=conf.length>=a.cupo;
  const yaIns=new Set([...conf,...esp].map(s=>s.id));const libres=DB.students.filter(s=>!yaIns.has(s.id)).map(s=>`<option value="${s.id}">${studentName(s)} · ${s.curso}</option>`).join('');
  openModal(`<div class="modal-head"><h3>Inscriptos · ${a.nombre}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body">
     <div style="display:flex;gap:10px;margin-bottom:14px"><span class="badge ${full?'b-danger':'b-success'}">${conf.length}/${a.cupo}${full?' · COMPLETO':''}</span>${esp.length?`<span class="badge b-warn">${esp.length} en lista de espera</span>`:''}<span class="badge b-grey nodot">${a.dia} ${a.horaInicio}–${a.horaFin}</span></div>
     <div class="field"><label>Inscribir alumno</label><div style="display:flex;gap:8px"><select id="ai_sel" style="flex:1">${libres||'<option>Todos ya inscriptos</option>'}</select><button class="btn btn-primary" onclick="aiInscribir('${aid}')">Inscribir</button></div><div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:4px">Si el cupo está completo, queda en lista de espera.</div></div>
     <div class="form-section">Confirmados (${conf.length})</div>
     ${conf.length?conf.map(s=>`<div class="alert-item">${avatarHTML(s,32)}<div class="info"><b>${studentName(s)}</b><small>${s.curso}</small></div><span class="badge b-success nodot">Confirmado</span><button class="btn btn-ghost btn-sm" onclick="aiBaja('${s.id}','${aid}')">Baja</button></div>`).join(''):'<p style="color:var(--muted);font-size:13px">Sin confirmados.</p>'}
     <div class="form-section">Lista de espera (${esp.length})</div>
     ${esp.length?esp.map((s,idx)=>`<div class="alert-item"><span class="badge b-grey nodot">#${idx+1}</span><div class="info"><b>${studentName(s)}</b><small>${s.curso}</small></div><button class="btn btn-primary btn-sm" onclick="aiConfirmar('${s.id}','${aid}')" ${full?'disabled':''}>Confirmar</button><button class="btn btn-ghost btn-sm" onclick="aiBaja('${s.id}','${aid}')">Quitar</button></div>`).join(''):'<p style="color:var(--muted);font-size:13px">Nadie en espera.</p>'}
   </div><div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Listo</button></div>`,true);}
function aiInscribir(aid){const sid=$('#ai_sel').value;if(!sid){toast('Seleccioná un alumno.','warn');return;}toggleAct(sid,aid);modalActInscriptos(aid);}
function aiBaja(sid,aid){toggleAct(sid,aid);modalActInscriptos(aid);}
function aiConfirmar(sid,aid){confirmarActVacante(sid,aid);modalActInscriptos(aid);}

/* ====================== MODALES: USUARIOS ====================== */
function modalUser(id){let u={nombre:'',email:'',rol:'admin',activo:true,perms:rolePreset('admin')};if(id)u=DB.users.find(x=>x.id===id);
  openModal(`<div class="modal-head"><h3>${id?'Editar usuario':'Nuevo usuario'}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid" style="margin-bottom:8px"><div class="field"><label>Nombre</label><input id="mu_n" value="${esc(u.nombre)}"></div><div class="field"><label>Email</label><input id="mu_e" value="${esc(u.email)}"></div><div class="field"><label>Rol base</label><select id="mu_r" onchange="applyRolePreset(this.value)">${['super_admin','supervisor','admin','auditor','contador','profesor','comedor','proveedor_actividades','afa'].map(r=>`<option value="${r}" ${u.rol===r?'selected':''}>${ROLE_LABEL[r]}</option>`).join('')}</select></div><div class="field"><label>Estado</label><select id="mu_a"><option value="1" ${u.activo?'selected':''}>Activo</option><option value="0" ${!u.activo?'selected':''}>Inactivo</option></select></div></div><label style="font-size:12.5px;font-weight:700;color:var(--ink-soft);display:block;margin:6px 0 10px">PERMISOS GRANULARES</label><div id="mu_perms">${PERMS.map(p=>`<div style="display:flex;align-items:center;padding:9px 0;border-bottom:1px dashed var(--line)"><span style="flex:1;font-size:13.5px">${p[1]}</span><div class="switch ${u.perms[p[0]]?'on':''}" data-p="${p[0]}" onclick="this.classList.toggle('on')"></div></div>`).join('')}</div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveUser('${id||''}')">Guardar usuario</button></div>`,true);}
function applyRolePreset(r){const preset=rolePreset(r);document.querySelectorAll('#mu_perms .switch').forEach(sw=>sw.classList.toggle('on',!!preset[sw.dataset.p]));}
function saveUser(id){const perms={};document.querySelectorAll('#mu_perms .switch').forEach(sw=>perms[sw.dataset.p]=sw.classList.contains('on'));const data={nombre:$('#mu_n').value,email:$('#mu_e').value,rol:$('#mu_r').value,activo:$('#mu_a').value==='1',perms};if(!data.nombre||!data.email){toast('Nombre y email obligatorios.','warn');return;}
  if(id){Object.assign(DB.users.find(x=>x.id===id),data);logAudit('editar','Usuario · '+data.nombre,'Permisos / datos actualizados','edit');toast('Usuario actualizado.','success');}
  else{DB.users.push({id:'u'+Date.now(),...data});logAudit('crear','Usuario · '+data.nombre,'Nuevo usuario · '+ROLE_LABEL[data.rol],'create');toast('Usuario creado.','success');}
  saveDB();closeModal();render();}

/* ====================== ASISTENCIA DIARIA (#1) ====================== */
let asistCurso=null,asistFecha=null;
function asistKey(curso,fecha){return curso+'|'+fecha;}
function asistResumen(s){let f=0,t=0,j=0,p=0,tot=0;Object.keys(DB.attendance||{}).forEach(k=>{const cur=k.split('|')[0];if(cur!==s.curso)return;const m=DB.attendance[k][s.id];if(!m)return;tot++;if(m==='A')f++;else if(m==='T')t++;else if(m==='J'){j++;f++;}else p++;});if(tot===0)return{faltas:s.asistencia.faltas,retrasos:s.asistencia.retrasos,justificadas:s.asistencia.justificadas,dias:0,pct:100};return{faltas:f,retrasos:t,justificadas:j,dias:tot,pct:Math.round((p+t)/tot*100)};}
function setAsist(sid,val){if(!asistCurso)return;const k=asistKey(asistCurso,asistFecha);DB.attendance[k]=DB.attendance[k]||{};DB.attendance[k][sid]=val;saveDB();render();}
function viewAsistencia(){if(!perm('ver_alumnos'))return noPerm();
  asistFecha=asistFecha||today.toISOString().slice(0,10);
  const cursos=[...new Set(DB.students.map(s=>s.curso))].sort((a,b)=>CURSOS.indexOf(a)-CURSOS.indexOf(b));
  if(!asistCurso||!cursos.includes(asistCurso))asistCurso=cursos[0];
  const alumnos=DB.students.filter(s=>s.curso===asistCurso).sort((a,b)=>(a.apellidos+a.nombre).localeCompare(b.apellidos+b.nombre));
  const k=asistKey(asistCurso,asistFecha);const reg=DB.attendance[k]||{};
  const marcados=alumnos.filter(s=>reg[s.id]).length;const pres=alumnos.filter(s=>reg[s.id]==='P').length;const aus=alumnos.filter(s=>reg[s.id]==='A').length;const tar=alumnos.filter(s=>reg[s.id]==='T').length;
  const BTN=(sid,val,lbl,col,cur)=>`<button onclick="setAsist('${sid}','${val}')" style="padding:6px 11px;border-radius:8px;border:1.5px solid ${cur===val?col:'var(--line)'};background:${cur===val?col:'#fff'};color:${cur===val?'#fff':'var(--ink-soft)'};font-weight:700;font-size:12.5px;cursor:pointer">${lbl}</button>`;
  return `<div class="view"><div class="toolbar">
     <span style="font-weight:700;color:var(--ink-soft)">Curso:</span><select onchange="asistCurso=this.value;render()" style="font-weight:700">${cursos.map(c=>`<option ${c===asistCurso?'selected':''}>${c}</option>`).join('')}</select>
     <span style="font-weight:700;color:var(--ink-soft)">Fecha:</span><input type="date" value="${asistFecha}" onchange="asistFecha=this.value;render()">
     <div class="grow"></div><span style="color:var(--muted);font-size:13px">${marcados}/${alumnos.length} marcados</span>
     <button class="btn btn-ghost btn-sm" onclick="marcarTodos('P')">Todos presentes</button>
   </div>
   <div class="kpis">
     ${kpi('Presentes','--success-soft','--success',pres,'de '+alumnos.length,'flat','<path d="M20 6L9 17l-5-5"/>')}
     ${kpi('Ausentes','--danger-soft','--danger',aus,'sin justificar incl.','flat','<path d="M18 6L6 18M6 6l12 12"/>')}
     ${kpi('Tarde','--warn-soft','--warn',tar,'llegadas tarde','flat','<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>')}
     ${kpi('% Asistencia del día','--blue-soft','--blue',(alumnos.length?Math.round((pres+tar)/alumnos.length*100):0)+'%','presentes + tarde','flat','<path d="M3 3v18h18M7 14l4-4 3 3 5-6"/>')}
   </div>
   <div class="panel"><div class="panel-head"><h3>${asistCurso} · ${asistFecha}</h3><span class="sub">P = presente · A = ausente · T = tarde · J = justificada</span></div>
     <div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Marcar</th><th>% asistencia (ciclo)</th></tr></thead><tbody>
     ${alumnos.map(s=>{const cur=reg[s.id]||'';const r=asistResumen(s);return `<tr><td><div class="cell-name">${avatarHTML(s,32)}<b>${studentName(s)}</b></div></td><td><div style="display:flex;gap:6px">${BTN(s.id,'P','Presente','var(--success)',cur)}${BTN(s.id,'A','Ausente','var(--danger)',cur)}${BTN(s.id,'T','Tarde','var(--warn)',cur)}${BTN(s.id,'J','Justif.','var(--blue)',cur)}</div></td><td><span class="badge ${r.pct>=85?'b-success':(r.pct>=75?'b-warn':'b-danger')}">${r.pct}%</span>${r.dias?` <small style="color:var(--muted)">${r.dias} día(s)</small>`:' <small style="color:var(--muted)">(sin registros)</small>'}</td></tr>`;}).join('')}
     </tbody></table></div></div></div>`;}
function marcarTodos(val){if(!asistCurso)return;const alumnos=DB.students.filter(s=>s.curso===asistCurso);const k=asistKey(asistCurso,asistFecha);DB.attendance[k]=DB.attendance[k]||{};alumnos.forEach(s=>DB.attendance[k][s.id]=val);logAudit('editar','Asistencia · '+asistCurso,`${asistFecha}: ${alumnos.length} marcados ${val}`,'edit');saveDB();render();toast('Asistencia registrada.','success');}

/* ====================== SALUD Y RETIRO (#14, #11) ====================== */
function tabSalud(s){const sa=s.salud||{};
  return `<div class="detail-grid">
   <div class="panel"><div class="panel-head"><h3>Ficha de salud</h3>${perm('editar_alumnos')?`<div class="right"><button class="btn btn-ghost btn-sm" onclick="modalSalud('${s.id}')">Editar</button></div>`:''}</div><div class="panel-body">
     <div class="info-row"><span class="k">Obra social / prepaga</span><span class="v">${sa.obraSocial||'—'}</span></div>
     <div class="info-row"><span class="k">N.º de afiliado</span><span class="v">${sa.afiliado||'—'}</span></div>
     <div class="info-row"><span class="k">Grupo sanguíneo</span><span class="v">${sa.grupoSanguineo||'—'}</span></div>
     <div class="info-row"><span class="k">Vacunación</span><span class="v">${sa.vacunas?`<span class="badge ${sa.vacunas.includes('completo')?'b-success':'b-warn'} nodot">${sa.vacunas}</span>`:'—'}</span></div>
     <div class="info-row"><span class="k">Médico de cabecera</span><span class="v">${sa.medico||'—'}</span></div>
     <div class="info-row"><span class="k">Tel. médico</span><span class="v">${sa.telMedico||'—'}</span></div>
     <div class="info-row"><span class="k">Alergias / dieta</span><span class="v">${s.comedor.alergias}</span></div>
     <div class="info-row"><span class="k">Medicación</span><span class="v">${s.comedor.medicacion||'—'}</span></div>
   </div></div>
   <div class="panel"><div class="panel-head"><h3>Autorizados a retirar</h3>${perm('editar_alumnos')?`<div class="right"><button class="btn btn-ghost btn-sm" onclick="modalAutorizado('${s.id}')">+ Agregar</button></div>`:''}</div><div class="panel-body">
     ${(s.autorizados||[]).length?s.autorizados.map((a,idx)=>`<div class="alert-item"><div class="avatar" style="background:${AV_COLORS[a.nombre.length%8]};width:32px;height:32px;font-size:12px">${initials(a.nombre)}</div><div class="info"><b>${a.nombre}</b><small>${a.relacion} · DNI ${a.dni||'—'}</small></div>${perm('editar_alumnos')?`<button class="icon-btn danger" onclick="delAutorizado('${s.id}',${idx})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button>`:''}</div>`).join(''):'<div class="empty">Sin personas autorizadas.</div>'}
     ${perm('editar_alumnos')?`<button class="btn btn-primary btn-sm btn-block" style="margin-top:10px" onclick="registrarRetiro('${s.id}')">Registrar retiro de hoy</button>`:''}
     <div class="form-section">Últimos retiros</div>
     ${(s.retiros||[]).length?s.retiros.slice().reverse().slice(0,6).map(r=>`<div class="info-row"><span class="k">${r.fecha}</span><span class="v">${r.quien} <small style="color:var(--muted)">· ${r.registradoPor}</small></span></div>`).join(''):'<p style="color:var(--muted);font-size:13px">Sin retiros registrados.</p>'}
   </div></div></div>`;}
function modalSalud(id){const s=DB.students.find(x=>x.id===id);const sa=s.salud||{};
  openModal(`<div class="modal-head"><h3>Ficha de salud</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid">
     <div class="field"><label>Obra social / prepaga</label><input id="sl_os" value="${esc(sa.obraSocial||'')}"></div>
     <div class="field"><label>N.º de afiliado</label><input id="sl_af" value="${esc(sa.afiliado||'')}"></div>
     <div class="field"><label>Grupo sanguíneo</label><select id="sl_gs">${['','0+','0-','A+','A-','B+','B-','AB+','AB-'].map(g=>`<option ${sa.grupoSanguineo===g?'selected':''}>${g}</option>`).join('')}</select></div>
     <div class="field"><label>Vacunación</label><select id="sl_v"><option ${sa.vacunas==='Calendario completo'?'selected':''}>Calendario completo</option><option ${sa.vacunas==='Calendario incompleto'?'selected':''}>Calendario incompleto</option></select></div>
     <div class="field"><label>Médico de cabecera</label><input id="sl_med" value="${esc(sa.medico||'')}"></div>
     <div class="field"><label>Tel. médico</label><input id="sl_tm" value="${esc(sa.telMedico||'')}"></div>
   </div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveSalud('${id}')">Guardar</button></div>`);}
function saveSalud(id){const s=DB.students.find(x=>x.id===id);s.salud={obraSocial:$('#sl_os').value,afiliado:$('#sl_af').value,grupoSanguineo:$('#sl_gs').value,vacunas:$('#sl_v').value,medico:$('#sl_med').value,telMedico:$('#sl_tm').value};logAudit('editar','Salud · '+studentName(s),'Ficha de salud actualizada','edit');saveDB();closeModal();render();toast('Ficha de salud guardada.','success');}
function modalAutorizado(id){openModal(`<div class="modal-head"><h3>Autorizar persona para retirar</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Nombre y apellido</label><input id="au_n"></div><div class="field"><label>DNI</label><input id="au_d"></div><div class="field full"><label>Relación</label><input id="au_r" placeholder="Madre, abuelo, tía..."></div></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveAutorizado('${id}')">Agregar</button></div>`);}
function saveAutorizado(id){const s=DB.students.find(x=>x.id===id);const nombre=$('#au_n').value.trim();if(!nombre){toast('Indicá el nombre.','warn');return;}const dni=$('#au_d').value.trim();if(dni&&!/^\d{7,8}$/.test(dni)){toast('DNI inválido (7 u 8 dígitos).','warn');return;}s.autorizados=s.autorizados||[];s.autorizados.push({nombre,dni,relacion:$('#au_r').value||'—'});logAudit('crear','Autorizado · '+studentName(s),nombre+' habilitado para retirar','create');saveDB();closeModal();render();toast('Persona autorizada.','success');}
function delAutorizado(id,idx){const s=DB.students.find(x=>x.id===id);const a=s.autorizados[idx];s.autorizados.splice(idx,1);logAudit('eliminar','Autorizado · '+studentName(s),a.nombre+' dado de baja','delete');saveDB();render();toast('Autorizado eliminado.','danger');}
function registrarRetiro(id){const s=DB.students.find(x=>x.id===id);const opts=(s.autorizados||[]).map(a=>`<option>${a.nombre} (${a.relacion})</option>`).join('');if(!opts){toast('Primero agregá una persona autorizada.','warn');return;}
  openModal(`<div class="modal-head"><h3>Registrar retiro</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="field"><label>Retira</label><select id="rt_q">${opts}</select></div><div class="field"><label>Fecha y hora</label><input id="rt_f" value="${new Date().toISOString().slice(0,16).replace('T',' ')}"></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doRetiro('${id}')">Registrar</button></div>`);}
function doRetiro(id){const s=DB.students.find(x=>x.id===id);s.retiros=s.retiros||[];s.retiros.push({fecha:$('#rt_f').value,quien:$('#rt_q').value,registradoPor:CURRENT.nombre});logAudit('crear','Retiro · '+studentName(s),'Retirado por '+$('#rt_q').value,'info');saveDB();closeModal();render();toast('Retiro registrado.','success');}

/* ====================== CONVIVENCIA / INCIDENCIAS (#15) ====================== */
function tabConvivencia(s){const inc=s.incidencias||[];
  return `<div class="panel"><div class="panel-head"><h3>Libro de incidencias</h3><span class="sub">${inc.filter(x=>x.estado==='Abierta').length} abierta(s)</span><div class="right">${perm('editar_alumnos')?`<button class="btn btn-primary btn-sm" onclick="modalIncidencia('${s.id}')">+ Registrar incidencia</button>`:''}</div></div><div class="panel-body">
     ${inc.length?inc.slice().reverse().map(x=>`<div class="alert-item"><div class="doc-ic" style="background:${x.gravedad==='Grave'?'var(--danger-soft)':(x.gravedad==='Moderada'?'var(--warn-soft)':'var(--blue-soft)')};color:${x.gravedad==='Grave'?'var(--danger)':(x.gravedad==='Moderada'?'var(--warn)':'var(--blue)')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg></div><div class="info"><b>${x.tipo} · ${x.gravedad}</b><small>${esc(x.descripcion)}<br>${x.fecha} · ${x.autor}</small></div><span class="badge ${x.estado==='Abierta'?'b-warn':'b-success'}">${x.estado}</span>${perm('editar_alumnos')?`<button class="btn btn-ghost btn-sm" onclick="toggleIncidencia('${s.id}','${x.id}')">${x.estado==='Abierta'?'Cerrar':'Reabrir'}</button>`:''}</div>`).join(''):'<div class="empty">Sin incidencias registradas. 👍</div>'}
   </div></div>`;}
function modalIncidencia(id){openModal(`<div class="modal-head"><h3>Registrar incidencia</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Tipo</label><select id="in_t">${['Conducta','Académica','Asistencia','Salud','Convivencia','Otro'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Gravedad</label><select id="in_g"><option>Leve</option><option>Moderada</option><option>Grave</option></select></div><div class="field full"><label>Descripción</label><textarea id="in_d" placeholder="Qué pasó, cuándo, medidas tomadas..."></textarea></div></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveIncidencia('${id}')">Registrar</button></div>`);}
function saveIncidencia(id){const s=DB.students.find(x=>x.id===id);const d=$('#in_d').value.trim();if(!d){toast('Describí la incidencia.','warn');return;}s.incidencias=s.incidencias||[];s.incidencias.push({id:'inc'+Date.now(),fecha:new Date().toISOString().slice(0,16).replace('T',' '),tipo:$('#in_t').value,gravedad:$('#in_g').value,descripcion:d,autor:CURRENT.nombre,estado:'Abierta'});logAudit('crear','Incidencia · '+studentName(s),$('#in_t').value+' ('+$('#in_g').value+')','create');saveDB();closeModal();render();toast('Incidencia registrada.','success');}
function toggleIncidencia(id,iid){const s=DB.students.find(x=>x.id===id);const x=s.incidencias.find(z=>z.id===iid);x.estado=x.estado==='Abierta'?'Cerrada':'Abierta';logAudit('editar','Incidencia · '+studentName(s),'Estado: '+x.estado,'edit');saveDB();render();}

/* ====================== REINSCRIPCIÓN MASIVA (#17) ====================== */
function nextCourse(nombre){const idx=DB.courses.findIndex(c=>c.nombre===nombre);if(idx<0||idx>=DB.courses.length-1)return null;return DB.courses[idx+1].nombre;}
function modalReinscribir(){const origen=String(parseInt(inscCiclo)-1);const conf=DB.students.filter(s=>{const i=getIns(s,origen);return i&&i.estado==='confirmada';});
  const egresan=conf.filter(s=>!nextCourse(s.curso)).length;
  openModal(`<div class="modal-head"><h3>Reinscripción ${origen} → ${inscCiclo}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><p style="color:var(--ink-soft);margin-bottom:12px">Promueve a <b>${conf.length} alumno(s) confirmados</b> del ciclo ${origen} al curso siguiente en el ciclo ${inscCiclo}, respetando el cupo (si se llena, van a lista de espera).</p>${egresan?`<div class="badge b-warn" style="margin-bottom:12px">${egresan} alumno(s) del último curso quedan como egresados (no hay curso siguiente).</div>`:''}<p style="color:var(--muted);font-size:12.5px">Los que ya tengan inscripción ${inscCiclo} no se duplican.</p></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doReinscribir('${origen}')">Reinscribir ${conf.length} alumno(s)</button></div>`);}
function doReinscribir(origen){let n=0,eg=0;DB.students.forEach(s=>{const i=getIns(s,origen);if(!i||i.estado!=='confirmada')return;if(getIns(s,inscCiclo))return;const sig=nextCourse(i.curso);if(!sig){eg++;return;}const c=courseByName(sig);const cupo=cursoConfirmados(sig,inscCiclo).length;const estado=cupo<c.capacidad?'confirmada':'pendiente';s.inscripciones.push({ciclo:inscCiclo,curso:sig,estado,fecha:today.toISOString().slice(0,10)});n++;});
  logAudit('inscribir','Reinscripción '+origen+'→'+inscCiclo,`${n} alumno(s) promovidos, ${eg} egresados`,'info');saveDB();closeModal();render();toast(`${n} alumno(s) reinscriptos al ciclo ${inscCiclo}.`,'success');}

/* ====================== RESPALDO TOTAL (#20) ====================== */
function exportDB(){const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='aulora_backup_'+today.toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);logAudit('info','Respaldo','Base exportada a JSON','info');saveDB();toast('Copia exportada.','success');}
function importDB(file){if(!file)return;const r=new FileReader();r.onload=e=>{try{const data=JSON.parse(e.target.result);if(!data.students||!data.config){toast('Archivo no válido.','danger');return;}openModal(confirmHTML('Importar copia','Esto <b>reemplaza toda la base actual</b> por la del archivo. ¿Continuar?','doImportDB()','Reemplazar'));window._pendingDB=data;}catch(err){toast('No se pudo leer el JSON.','danger');}};r.readAsText(file);}
function doImportDB(){if(!window._pendingDB)return;DB=window._pendingDB;window._pendingDB=null;if(!DB.attendance)DB.attendance={};saveDB();closeModal();applyBrand();buildNav();go('dashboard');toast('Base importada correctamente.','success');}

/* ====================== RECARGO POR MORA (#5) ====================== */
function moraDe(p){if(p.estado==='pagado')return 0;const pct=cfg().moraPctDia||0;if(!pct)return 0;const d=Math.floor((today-new Date(p.fechaVenc))/86400000);if(d<=0)return 0;return Math.round(p.importe*(pct/100)*d);}

/* ====================== NOTIFICACIONES (#8) ====================== */
function notifList(){const out=[];const m=metrics();
  const soon=[];DB.students.forEach(s=>s.pagos.forEach(p=>{if(p.estado!=='pagado'){const d=Math.ceil((new Date(p.fechaVenc)-today)/86400000);if(d>=0&&d<=3)soon.push(1);}}));
  if(m.nVenc)out.push({c:'danger',t:`${m.nVenc} cuota(s) vencida(s) · ${m.morosos.length} familia(s)`,go:'pagos'});
  if(soon.length)out.push({c:'warn',t:`${soon.length} cuota(s) vencen en los próximos 3 días`,go:'pagos'});
  if(m.docsCad.length)out.push({c:'warn',t:`${m.docsCad.length} documento(s) por vencer o vencidos`,go:'alumnos'});
  let vac=0;DB.courses.forEach(c=>{if(cursoConfirmados(c.nombre,cfg().ciclo).length<c.capacidad&&cursoEspera(c.nombre,cfg().ciclo).length>0)vac++;});
  if(vac)out.push({c:'blue',t:`${vac} curso(s) con vacante libre y alumnos en lista de espera`,go:'inscripciones'});
  const inc=DB.students.reduce((a,s)=>a+(s.incidencias||[]).filter(x=>x.estado==='Abierta').length,0);
  if(inc)out.push({c:'warn',t:`${inc} incidencia(s) de convivencia abierta(s)`,go:'alumnos'});
  const sinLeer=(DB.mensajes||[]).filter(x=>!x.leido).length;if(sinLeer)out.push({c:'grey',t:`${sinLeer} comunicación(es) sin leer por las familias`,go:'comunicaciones'});
  return out;}
function showNotifs(){const list=notifList();openModal(`<div class="modal-head"><h3>Notificaciones</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body">${list.length?list.map(n=>`<div class="alert-item"><span class="badge b-${n.c} nodot">●</span><div class="info"><b style="font-weight:600">${n.t}</b></div><button class="btn btn-ghost btn-sm" onclick="closeModal();go('${n.go}')">Ver</button></div>`).join(''):'<div class="empty">Todo en orden, sin alertas. 🎉</div>'}</div><div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Cerrar</button></div>`);}
function marcarLeido(id){const m=(DB.mensajes||[]).find(x=>x.id===id);if(m){m.leido=true;saveDB();render();toast('Marcado como leído.','success');}}

/* ====================== CALIFICACIONES + BOLETÍN (#2, #12) ====================== */
let califCurso=null,califMateria=null;
function notaProm(n){const v=[n.t1,n.t2,n.t3].filter(x=>typeof x==='number');return v.length?(v.reduce((a,b)=>a+b,0)/v.length):null;}
function saveNota(sid,materia,tri,val){const s=DB.students.find(x=>x.id===sid);s.notas=s.notas||{};s.notas[materia]=s.notas[materia]||{t1:null,t2:null,t3:null};s.notas[materia][tri]=val===''?null:Math.max(1,Math.min(10,+val));saveDB();}
function viewCalificaciones(){if(!perm('ver_alumnos'))return noPerm();
  const cursos=DB.courses.map(c=>c.nombre);if(!califCurso||!cursos.includes(califCurso))califCurso=cursos[0];
  const curso=courseByName(califCurso);const materias=(curso&&curso.materias||[]).map(m=>m.nombre);if(!califMateria||!materias.includes(califMateria))califMateria=materias[0]||null;
  const alumnos=DB.students.filter(s=>s.curso===califCurso).sort((a,b)=>(a.apellidos+a.nombre).localeCompare(b.apellidos+b.nombre));
  return `<div class="view"><div class="toolbar">
     <span style="font-weight:700;color:var(--ink-soft)">Curso:</span><select onchange="califCurso=this.value;califMateria=null;render()" style="font-weight:700">${cursos.map(c=>`<option ${c===califCurso?'selected':''}>${c}</option>`).join('')}</select>
     <span style="font-weight:700;color:var(--ink-soft)">Materia:</span><select onchange="califMateria=this.value;render()">${materias.map(mm=>`<option ${mm===califMateria?'selected':''}>${mm}</option>`).join('')}</select>
     <div class="grow"></div><span style="color:var(--muted);font-size:13px">${alumnos.length} alumno(s) · escala 1–10</span>
   </div>
   <div class="panel"><div class="panel-head"><h3>${califCurso} · ${califMateria||'—'}</h3><span class="sub">Cargá las notas por trimestre; el boletín toma todas las materias</span></div>
     <div class="table-wrap"><table><thead><tr><th>Alumno</th><th>1.º Trim.</th><th>2.º Trim.</th><th>3.º Trim.</th><th>Promedio</th><th>Boletín</th></tr></thead><tbody>
     ${alumnos.map(s=>{const n=(s.notas&&s.notas[califMateria])||{t1:null,t2:null,t3:null};const pr=notaProm(n);const inp=(tri)=>`<input type="number" min="1" max="10" value="${n[tri]==null?'':n[tri]}" onchange="saveNota('${s.id}','${esc(califMateria)}','${tri}',this.value)" style="width:64px;padding:7px 9px;border:1.5px solid var(--line);border-radius:8px;text-align:center;font-weight:700">`;return `<tr><td><div class="cell-name">${avatarHTML(s,32)}<b>${studentName(s)}</b></div></td><td>${inp('t1')}</td><td>${inp('t2')}</td><td>${inp('t3')}</td><td>${pr==null?'<span style="color:var(--muted)">—</span>':`<span class="badge ${pr>=6?'b-success':'b-danger'}">${pr.toFixed(1)}</span>`}</td><td><button class="btn btn-ghost btn-sm" onclick="boletinPDF('${s.id}')">📄 PDF</button></td></tr>`;}).join('')}
     </tbody></table></div></div></div>`;}
function boletinPDF(sid){const s=DB.students.find(x=>x.id===sid);if(!window.jspdf){toast('No se pudo cargar el generador de PDF.','danger');return;}const {jsPDF}=window.jspdf;const doc=new jsPDF();const c=courseByName(s.curso);
  doc.setFontSize(16);doc.setFont(undefined,'bold');doc.text(cfg().centroNombre,14,18);doc.setFontSize(10);doc.setFont(undefined,'normal');doc.text(cfg().direccion+' · '+cfg().provincia,14,24);
  doc.setDrawColor(200);doc.line(14,28,196,28);
  doc.setFontSize(13);doc.setFont(undefined,'bold');doc.text('Boletín de calificaciones — Ciclo '+cfg().ciclo,14,38);
  doc.setFontSize(11);doc.setFont(undefined,'normal');doc.text('Alumno/a: '+studentName(s),14,47);doc.text('Curso: '+s.curso+' · División '+s.grupo+' · DNI '+s.dni,14,53);
  let y=66;doc.setFont(undefined,'bold');doc.setFontSize(10);doc.text('Materia',14,y);doc.text('1.º',120,y);doc.text('2.º',140,y);doc.text('3.º',160,y);doc.text('Prom.',178,y);doc.line(14,y+2,196,y+2);y+=9;doc.setFont(undefined,'normal');
  (c&&c.materias||[]).forEach(m=>{const n=(s.notas&&s.notas[m.nombre])||{};const pr=notaProm(n);doc.text(String(m.nombre).slice(0,52),14,y);doc.text(n.t1==null?'-':String(n.t1),121,y);doc.text(n.t2==null?'-':String(n.t2),141,y);doc.text(n.t3==null?'-':String(n.t3),161,y);doc.text(pr==null?'-':pr.toFixed(1),179,y);y+=8;if(y>275){doc.addPage();y=20;}});
  doc.line(14,y+2,196,y+2);y+=14;doc.setFontSize(9);doc.setTextColor(120);doc.text('Documento generado por Aulora · '+today.toISOString().slice(0,10),14,y);
  doc.save('boletin_'+s.apellidos+'_'+s.nombre+'.pdf');logAudit('info','Boletín · '+studentName(s),'PDF generado','info');saveDB();toast('Boletín descargado.','success');}

/* ====================== CALENDARIO ESCOLAR (#7) ====================== */
function viewCalendario(){if(!perm('ver_alumnos'))return noPerm();const evs=(DB.eventos||[]).slice().sort((a,b)=>a.fecha<b.fecha?-1:1);
  const tipoCol={Feriado:'b-danger',Reunión:'b-blue',Académico:'b-warn',Institucional:'b-success',Examen:'b-warn',Otro:'b-grey'};
  const meses={};evs.forEach(e=>{const k=e.fecha.slice(0,7);(meses[k]=meses[k]||[]).push(e);});
  return `<div class="view"><div class="toolbar"><div class="grow"></div>${perm('editar_config')||perm('ver_alumnos')?`<button class="btn btn-primary btn-sm" onclick="modalEvento()">+ Nuevo evento</button>`:''}</div>
   ${Object.keys(meses).length?Object.keys(meses).sort().map(k=>{const [y,mo]=k.split('-');const nm=['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][+mo];
     return `<div class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>${nm} ${y}</h3></div><div class="panel-body">${meses[k].map(e=>`<div class="alert-item"><div style="text-align:center;min-width:44px"><div style="font-size:20px;font-weight:800;color:var(--brand);line-height:1">${e.fecha.slice(8,10)}</div><small style="color:var(--muted)">${nm.slice(0,3)}</small></div><div class="info"><b>${esc(e.titulo)}</b><small>${esc(e.desc||'')}</small></div><span class="badge ${tipoCol[e.tipo]||'b-grey'} nodot">${e.tipo}</span><button class="icon-btn" onclick="modalEvento('${e.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg></button><button class="icon-btn danger" onclick="delEvento('${e.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button></div>`).join('')}</div></div>`;}).join(''):'<div class="empty">Sin eventos cargados.</div>'}
  </div>`;}
function modalEvento(id){let e={fecha:today.toISOString().slice(0,10),titulo:'',tipo:'Institucional',desc:''};if(id)e=(DB.eventos||[]).find(x=>x.id===id);
  openModal(`<div class="modal-head"><h3>${id?'Editar':'Nuevo'} evento</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Fecha</label><input id="ev_f" type="date" value="${e.fecha}"></div><div class="field"><label>Tipo</label><select id="ev_t">${['Institucional','Feriado','Reunión','Académico','Examen','Otro'].map(x=>`<option ${e.tipo===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field full"><label>Título</label><input id="ev_ti" value="${esc(e.titulo)}"></div><div class="field full"><label>Descripción</label><textarea id="ev_d">${esc(e.desc||'')}</textarea></div></div></div><div class="modal-foot">${id?`<button class="btn btn-danger" style="margin-right:auto" onclick="delEvento('${id}')">Eliminar</button>`:''}<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEvento('${id||''}')">Guardar</button></div>`);}
function saveEvento(id){const data={fecha:$('#ev_f').value,titulo:$('#ev_ti').value,tipo:$('#ev_t').value,desc:$('#ev_d').value};if(!data.titulo){toast('Indicá el título.','warn');return;}DB.eventos=DB.eventos||[];if(id){Object.assign(DB.eventos.find(x=>x.id===id),data);logAudit('editar','Calendario · '+data.titulo,'Evento actualizado','edit');}else{DB.eventos.push({id:'ev'+Date.now(),...data});logAudit('crear','Calendario · '+data.titulo,'Nuevo evento','create');}saveDB();closeModal();render();toast('Evento guardado.','success');}
function delEvento(id){DB.eventos=DB.eventos.filter(x=>x.id!==id);logAudit('eliminar','Calendario','Evento eliminado','delete');saveDB();closeModal();render();toast('Evento eliminado.','danger');}

/* ====================== REPORTES FINANCIEROS (#13) ====================== */
function viewReportes(){if(!perm('ver_estadisticas'))return noPerm();const m=metrics();const porCobrar=m.pendiente+m.vencido;const IC='<path d="M3 3v18h18"/>';
  const deudores=DB.students.map(s=>({s,d:s.pagos.filter(p=>realEstado(p)!=='pagado').reduce((a,b)=>a+b.importe+moraDe(b),0)})).filter(x=>x.d>0).sort((a,b)=>b.d-a.d).slice(0,10);
  return `<div class="view">
   <div class="kpis">
     ${kpi('Facturado','--brand-soft','--brand',fmt(m.cobrado+porCobrar),'ciclo '+cfg().ciclo,'flat',IC)}
     ${kpi('Cobrado','--success-soft','--success',fmt(m.cobrado),(Math.round(m.cobrado/((m.cobrado+porCobrar)||1)*100))+'% del total','up',IC)}
     ${kpi('Por cobrar','--warn-soft','--warn',fmt(porCobrar),m.nVenc+' cuotas vencidas','down',IC)}
     ${kpi('Morosidad','--danger-soft','--danger',fmt(m.vencido),m.morosos.length+' familias','flat',IC)}
   </div>
   <div class="grid2e">
     <div class="panel"><div class="panel-head"><h3>Cobrado vs por cobrar (mensual)</h3></div><div class="panel-body"><div class="chart-box"><canvas id="repMes"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Recaudación por curso</h3></div><div class="panel-body"><div class="chart-box"><canvas id="repCurso"></canvas></div></div></div>
   </div>
   <div class="panel"><div class="panel-head"><h3>Top 10 deudores</h3><div class="right"><button class="btn btn-ghost btn-sm" onclick="exportExcel('pagos')">${icoXls()} Excel</button></div></div>
     <table><thead><tr><th>Alumno</th><th>Curso</th><th>Tutor</th><th>Deuda (con mora)</th><th></th></tr></thead><tbody>
     ${deudores.length?deudores.map(x=>`<tr><td><div class="cell-name">${avatarHTML(x.s,32)}<b>${studentName(x.s)}</b></div></td><td><span class="badge b-info">${x.s.curso}</span></td><td><small>${x.s.tutor.nombre}</small></td><td class="tnum"><b style="color:var(--danger)">${fmt(x.d)}</b></td><td>${perm('ver_comunicaciones')?`<button class="btn btn-ghost btn-sm" onclick="modalSend(null,'${x.s.id}')">Avisar</button>`:''}</td></tr>`).join(''):'<tr><td colspan="5"><div class="empty">Sin deudores. 🎉</div></td></tr>'}
     </tbody></table></div></div>`;}
function drawReportes(){const meses=['Mar','Abr','May','Jun'];const mk=(id,cf)=>{const el=document.getElementById(id);if(el)charts[id]=new Chart(el,cf);};
  const cob=meses.map(()=>0),pen=meses.map(()=>0);
  DB.students.forEach(s=>s.pagos.forEach(p=>{const mi=meses.indexOf(p.mes.split(' ')[0]);if(mi<0)return;if(realEstado(p)==='pagado')cob[mi]+=p.importe;else pen[mi]+=p.importe;}));
  mk('repMes',{type:'bar',data:{labels:meses,datasets:[{label:'Cobrado',data:cob,backgroundColor:'#0E7C66',borderRadius:6,maxBarThickness:36},{label:'Por cobrar',data:pen,backgroundColor:'#E0743B',borderRadius:6,maxBarThickness:36}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:14}}},scales:{x:{grid:{display:false}},y:{grid:{color:'#EEECE5'},ticks:{callback:v=>(v/1000)+'k'}}}}});
  const pc={};DB.students.forEach(s=>{const c=s.pagos.filter(p=>realEstado(p)==='pagado').reduce((a,b)=>a+b.importe,0);if(c)pc[s.curso]=(pc[s.curso]||0)+c;});
  mk('repCurso',{type:'bar',data:{labels:Object.keys(pc),datasets:[{data:Object.values(pc),backgroundColor:'#3B5BE0',borderRadius:5,maxBarThickness:20}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#EEECE5'},ticks:{callback:v=>(v/1000)+'k'}},y:{grid:{display:false}}}}});}

/* ====================== RECIBOS / CONSTANCIA PDF (#3) ====================== */
function reciboPDF(sid,pid){const s=DB.students.find(x=>x.id===sid);const p=s.pagos.find(x=>x.id===pid);if(!window.jspdf){toast('No se pudo cargar el PDF.','danger');return;}const {jsPDF}=window.jspdf;const doc=new jsPDF();
  doc.setFontSize(16);doc.setFont(undefined,'bold');doc.text(cfg().centroNombre,14,18);doc.setFontSize(10);doc.setFont(undefined,'normal');doc.text(cfg().direccion+' · '+cfg().provincia,14,24);
  doc.line(14,28,196,28);doc.setFontSize(14);doc.setFont(undefined,'bold');doc.text('RECIBO DE PAGO',14,40);
  doc.setFontSize(11);doc.setFont(undefined,'normal');
  doc.text('Recibí de la familia de: '+studentName(s),14,52);doc.text('Curso: '+s.curso+' · DNI '+s.dni,14,59);
  doc.text('Concepto: '+p.concepto,14,69);doc.text('Período: '+p.mes,14,76);
  doc.text('Medio de pago: '+(p.metodo||'—'),14,83);doc.text('Fecha de pago: '+(p.fechaPago||today.toISOString().slice(0,10)),14,90);
  doc.setFontSize(15);doc.setFont(undefined,'bold');doc.text('Importe: '+fmt(p.importe),14,104);
  doc.setFontSize(9);doc.setFont(undefined,'normal');doc.setTextColor(120);doc.text('Comprobante N.º '+p.id+' · generado por Aulora el '+today.toISOString().slice(0,10),14,118);
  doc.save('recibo_'+s.apellidos+'_'+p.mes.replace(/ /g,'_')+'.pdf');logAudit('info','Recibo · '+studentName(s),p.mes+' · '+fmt(p.importe),'info');saveDB();toast('Recibo descargado.','success');}
function constanciaPDF(sid){const s=DB.students.find(x=>x.id===sid);if(!window.jspdf){toast('No se pudo cargar el PDF.','danger');return;}const {jsPDF}=window.jspdf;const doc=new jsPDF();const ins=getIns(s,cfg().ciclo);
  doc.setFontSize(16);doc.setFont(undefined,'bold');doc.text(cfg().centroNombre,14,20);doc.setFontSize(10);doc.setFont(undefined,'normal');doc.text(cfg().direccion+' · '+cfg().provincia,14,26);doc.line(14,30,196,30);
  doc.setFontSize(15);doc.setFont(undefined,'bold');doc.text('CONSTANCIA DE ALUMNO REGULAR',14,46);
  doc.setFontSize(12);doc.setFont(undefined,'normal');const txt='Por la presente se deja constancia de que '+studentName(s)+', DNI '+s.dni+', es alumno/a regular de esta institución, cursando '+s.curso+' (división '+s.grupo+') durante el ciclo lectivo '+cfg().ciclo+(ins?', con inscripción '+ins.estado+'.':'.');
  doc.text(doc.splitTextToSize(txt,180),14,60);
  doc.text('Se extiende la presente a pedido del interesado a los '+today.getDate()+' días del mes de '+['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][today.getMonth()]+' de '+today.getFullYear()+'.',14,92,{maxWidth:180});
  doc.line(120,140,190,140);doc.setFontSize(10);doc.text('Firma y sello',140,146);
  doc.save('constancia_'+s.apellidos+'_'+s.nombre+'.pdf');logAudit('info','Constancia · '+studentName(s),'Alumno regular '+cfg().ciclo,'info');saveDB();toast('Constancia descargada.','success');}

/* ====================== CARNET QR (#10) ====================== */
function modalCarnet(sid){const s=DB.students.find(x=>x.id===sid);
  openModal(`<div class="modal-head"><h3>Carnet digital</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body" style="text-align:center">
     <div style="max-width:300px;margin:0 auto;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.08)">
       <div style="background:var(--brand);color:#fff;padding:14px 16px;text-align:left"><b style="font-size:15px">${cfg().centroNombre}</b><br><small style="opacity:.85">Carnet de alumno · Ciclo ${cfg().ciclo}</small></div>
       <div style="padding:18px;display:flex;gap:14px;align-items:center;text-align:left">${s.foto&&s.autorizacionImagen.permitida?`<img src="${s.foto}" style="width:64px;height:64px;border-radius:12px;object-fit:cover">`:`<div class="photo-ph" style="width:64px;height:64px;background:${s.color};margin:0">${initials(studentName(s))}</div>`}<div><b style="font-size:15px">${studentName(s)}</b><br><small style="color:var(--muted)">${s.curso} · Div. ${s.grupo}<br>DNI ${s.dni}</small></div></div>
       <div id="qrBox" style="display:flex;justify-content:center;padding:0 0 18px"></div>
     </div>
     <p style="color:var(--muted);font-size:12px;margin-top:12px">Mostrá el QR en portería para verificar identidad y retiro.</p>
   </div><div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Cerrar</button></div>`);
  const box=document.getElementById('qrBox');if(box&&window.QRCode){new QRCode(box,{text:'AULORA|'+s.id+'|'+s.dni+'|'+studentName(s),width:120,height:120,correctLevel:QRCode.CorrectLevel.M});}else if(box){box.innerHTML='<small style="color:var(--muted)">QR no disponible sin conexión</small>';}}

/* ====================== COBRO ONLINE MERCADO PAGO (demo) (#4) ====================== */
function modalMP(sid,pid){const s=DB.students.find(x=>x.id===sid);const p=s.pagos.find(x=>x.id===pid);const total=p.importe+moraDe(p);const link='https://mpago.la/aulora/'+p.id;
  openModal(`<div class="modal-head"><h3>Link de pago</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body" style="text-align:center">
     <p style="color:var(--ink-soft);margin-bottom:6px">Cobro de <b>${studentName(s)}</b> — ${p.mes}</p>
     <div style="font-size:24px;font-weight:800;color:var(--brand);margin-bottom:4px">${fmt(total)}</div>${moraDe(p)>0?`<small style="color:var(--danger)">incluye mora ${fmt(moraDe(p))}</small>`:''}
     <div id="qrBox" style="display:flex;justify-content:center;margin:16px 0"></div>
     <div class="field"><label>Link de pago (demo)</label><input value="${link}" readonly onclick="this.select()"></div>
     <p style="color:var(--muted);font-size:12px">En producción este link lo genera la API de Mercado Pago y el webhook marca la cuota como pagada automáticamente. Acá lo simulás con el botón.</p>
   </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>${perm('editar_pagos')?`<button class="btn btn-primary" onclick="marcarPagado('${sid}','${pid}')">Simular pago acreditado</button>`:''}</div>`);
  const box=document.getElementById('qrBox');if(box&&window.QRCode){new QRCode(box,{text:link,width:140,height:140,correctLevel:QRCode.CorrectLevel.M});}else if(box){box.innerHTML='<small style="color:var(--muted)">QR no disponible sin conexión</small>';}}
function marcarPagado(sid,pid){const s=DB.students.find(x=>x.id===sid);const p=s.pagos.find(x=>x.id===pid);p.estado='pagado';p.fechaPago=today.toISOString().slice(0,10);p.metodo='Mercado Pago';p.comprobante='mp';logAudit('editar','Cuota · '+studentName(s),'Pago acreditado por Mercado Pago (demo)','edit');saveDB();closeModal();buildNav();render();toast('Pago acreditado.','success');}

/* ====================== VISTAS / FILTROS GUARDADOS (#18) ====================== */
function saveCurrentView(){const nombre=prompt('Nombre para esta vista (ej: "Morosos secundaria tarde"):');if(!nombre)return;DB.savedViews=DB.savedViews||[];DB.savedViews.push({nombre,filters:JSON.parse(JSON.stringify(filters))});logAudit('crear','Vista guardada · '+nombre,'Filtros guardados','create');saveDB();render();toast('Vista guardada.','success');}
function applySavedView(i){if(i===''||i==null)return;const v=(DB.savedViews||[])[+i];if(!v)return;Object.assign(filters,JSON.parse(JSON.stringify(v.filters)));render();toast('Vista «'+v.nombre+'» aplicada.','info');}

/* ====================== TABLERO POR ROL (#19) ====================== */
function dashRolePanel(m){const rol=CURRENT.rol;
  const hoy=today.toISOString().slice(0,10);let presentes=0,marcados=0;Object.keys(DB.attendance||{}).forEach(k=>{if(k.split('|')[1]===hoy){const r=DB.attendance[k];Object.values(r).forEach(v=>{marcados++;if(v==='P'||v==='T')presentes++;});}});
  const pctHoy=marcados?Math.round(presentes/marcados*100):null;
  const incAbiertas=DB.students.reduce((a,s)=>a+(s.incidencias||[]).filter(x=>x.estado==='Abierta').length,0);
  const evProx=(DB.eventos||[]).filter(e=>e.fecha>=hoy).sort((a,b)=>a.fecha<b.fecha?-1:1)[0];
  let title,chips;
  if(rol==='supervisor'){title='Panel académico (Supervisión)';chips=[['Asistencia hoy',pctHoy==null?'sin tomar':pctHoy+'%','asistencia'],['En lista de espera',m.espera,'inscripciones'],['Incidencias abiertas',incAbiertas,'alumnos'],['Próximo evento',evProx?evProx.titulo:'—','calendario']];}
  else if(rol==='admin'){title='Panel de Administración';chips=[['Por cobrar',fmt(m.pendiente+m.vencido),'pagos'],['Cuotas vencidas',m.nVenc,'pagos'],['Sin autoriz. imagen',m.sinImagen,'alumnos'],['Docs por revisar',m.docsCad.length,'alumnos']];}
  else{title='Panel de Dirección';chips=[['Cobrado',fmt(m.cobrado),'reportes'],['Morosidad',fmt(m.vencido),'reportes'],['Alumnos activos',m.activos,'alumnos'],['Asistencia hoy',pctHoy==null?'sin tomar':pctHoy+'%','asistencia']];}
  return `<div class="panel" style="margin-bottom:16px;background:linear-gradient(180deg,var(--brand-soft),var(--surface))"><div class="panel-head"><h3>${title}</h3><span class="sub">Hola, ${CURRENT.nombre.split(' ')[0]} · ${ROLE_LABEL[rol]}</span></div><div class="panel-body"><div class="grid2" style="margin:0;grid-template-columns:repeat(4,1fr);gap:10px">${chips.map(c=>`<div onclick="go('${c[2]}')" style="cursor:pointer;border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:#fff"><div style="font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:700">${c[0]}</div><div style="font-size:19px;font-weight:800;margin-top:3px">${c[1]}</div></div>`).join('')}</div></div></div>`;}

/* ====================== HELPERS VISUALES (portal) ====================== */
function studentAvg(s){if(!s.notas)return null;const p=Object.values(s.notas).map(notaProm).filter(x=>x!=null);return p.length?p.reduce((a,b)=>a+b,0)/p.length:null;}
function ringSVG(pct,color,big,sub){const circ=339;const off=Math.max(0,circ*(1-Math.min(100,Math.max(0,pct))/100));return `<div class="ring"><svg width="128" height="128"><circle cx="64" cy="64" r="54" fill="none" stroke="var(--surface-2)" stroke-width="12"/><circle cx="64" cy="64" r="54" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circ}" style="--circ:${circ};--off:${off};stroke-dashoffset:${off};animation:ringfill 1.2s cubic-bezier(.2,.7,.3,1) both"/></svg><div class="val"><b>${big}</b><small>${sub}</small></div></div>`;}
function playVideo(url,title){openModal(`<div class="modal-head"><h3>${esc(title)}</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body" style="padding:0;background:#000;line-height:0"><video src="${url}" controls autoplay playsinline style="width:100%;display:block"></video></div>`,true);}
function lightImg(url){openModal(`<div class="modal-head"><h3>Galería</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body" style="text-align:center"><img class="lightimg" src="${url}"></div>`,true);}

/* ====================== PORTAL FAMILIA INMERSIVO ====================== */
function viewPortal(){const s=famStudent;const ins=getIns(s,cfg().ciclo);const c=ins?courseByName(ins.curso):courseByName(s.curso);const pend=s.pagos.filter(p=>realEstado(p)!=='pagado');const totalPend=pend.reduce((a,b)=>a+b.importe,0);const acts=studentActs(s).filter(a=>a._estado==='confirmada');
  const ar=asistResumen(s);const prom=studentAvg(s);const materias=(c&&c.materias||[]);
  const aprob=materias.filter(m=>{const n=s.notas&&s.notas[m.nombre];return n&&notaProm(n)>=6;}).length;
  const gal=['aula','laboratorio','arte','deporte','musica'].map((t,i)=>`https://picsum.photos/seed/aulora-${t}-${i}/1280/720`);
  const vids=[{u:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',t:'Acto del 25 de Mayo',p:'https://picsum.photos/seed/aulora-acto/640/400'},{u:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',t:'Feria de ciencias',p:'https://picsum.photos/seed/aulora-ciencia/640/400'},{u:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',t:'Torneo deportivo',p:'https://picsum.photos/seed/aulora-deporte2/640/400'},{u:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',t:'Muestra de arte',p:'https://picsum.photos/seed/aulora-arte2/640/400'}];
  const logros=[];if(ar.pct>=95)logros.push(['🎯','Asistencia destacada',ar.pct+'%','#0E7C66']);if(prom&&prom>=9)logros.push(['🌟','Promedio de excelencia',prom.toFixed(1),'#9B3BE0']);else if(prom&&prom>=8)logros.push(['📚','Muy buen promedio',prom.toFixed(1),'#3B5BE0']);if(ins&&ins.estado==='confirmada')logros.push(['✅','Matrícula confirmada',cfg().ciclo,'#0EA5B7']);if(acts.length)logros.push(['🤸','Vida escolar activa',acts.length+' act.','#E0743B']);if(!logros.length)logros.push(['🌱','¡A construir logros!','este ciclo','#0E7C66']);
  return `<div class="view">
   <div class="imm-hero fx"><div class="bg"></div><div class="veil"></div>
     <div class="orb" style="width:200px;height:200px;background:#fff;top:-60px;right:8%"></div><div class="orb" style="width:150px;height:150px;background:#E0743B;bottom:-50px;right:28%;animation-delay:2.5s"></div>
     ${s.foto&&s.autorizacionImagen.permitida?`<img class="imm-av" src="${s.foto}">`:`<div class="imm-av ph">${initials(studentName(s))}</div>`}
     <div style="flex:1;min-width:0">
       <h2>¡Hola, familia de ${s.nombre}! 👋</h2>
       <div style="opacity:.93;font-weight:600">${s.curso} · División ${s.grupo} · ${cfg().centroNombre}</div>
       <div class="imm-chips"><span class="imm-chip">📊 Promedio ${prom?prom.toFixed(1):'—'}</span><span class="imm-chip">📅 Asistencia ${ar.pct}%</span><span class="imm-chip">🎒 ${acts.length} actividad(es)</span><span class="imm-chip">${ins?(ins.estado==='confirmada'?'✅ Matrícula confirmada':'⏳ Lista de espera'):'— Sin inscripción'}</span></div>
     </div>
   </div>
   <div class="grid2e" style="margin-top:16px">
     <div class="panel fx2"><div class="panel-head"><h3>📸 Galería de la semana</h3><span class="sub">Tocá una imagen</span></div><div class="panel-body"><div class="gallery">${gal.map((u,i)=>`<div class="slide" style="background-image:url('${u}');animation-delay:${i*4}s,${i*4}s" onclick="lightImg('${u}')"></div>`).join('')}<div class="cap">Imágenes de muestra · el colegio sube las propias 🎞️</div></div></div></div>
     <div class="panel fx2"><div class="panel-head"><h3>🎬 Momentos en video</h3><span class="sub">Tocá para reproducir</span></div><div class="panel-body"><div class="vid-grid">${vids.map(v=>`<div class="vid-card" onclick="playVideo('${v.u}','${v.t}')"><img src="${v.p}" loading="lazy"><div class="play"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C66"><path d="M8 5v14l11-7z"/></svg></span></div><div class="vlabel">${v.t}</div></div>`).join('')}</div></div></div>
   </div>
   <div class="panel fx3" style="margin-top:16px"><div class="panel-head"><h3>🚀 Mi rendimiento</h3><span class="sub">Ciclo ${cfg().ciclo}</span></div><div class="panel-body">
     <div class="ring-wrap" style="margin-bottom:20px">${ringSVG(prom?prom*10:0,'#0E7C66',prom?prom.toFixed(1):'—','Promedio /10')}${ringSVG(ar.pct,'#3B5BE0',ar.pct+'%','Asistencia')}${ringSVG(materias.length?Math.round(aprob/materias.length*100):0,'#E0743B',aprob+'/'+materias.length,'Aprobadas')}</div>
     ${materias.length?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 26px">${materias.map(m=>{const n=s.notas&&s.notas[m.nombre];const pr=n?notaProm(n):null;const col=pr==null?'var(--line)':(pr>=8?'#0E7C66':(pr>=6?'#3B5BE0':'#E0743B'));return `<div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600"><span>${m.nombre}</span><b>${pr==null?'—':pr.toFixed(1)}</b></div><div class="sbar"><i style="width:${pr?pr*10:0}%;background:${col}"></i></div></div>`;}).join('')}</div>`:'<p style="color:var(--muted)">Todavía no hay notas cargadas.</p>'}
   </div></div>
   <div class="panel fx3" style="margin-top:16px"><div class="panel-head"><h3>🏅 Logros</h3></div><div class="panel-body"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">${logros.map(l=>`<div class="badge3d" style="background:linear-gradient(135deg,${l[3]},${l[3]}bb)"><span class="ic">${l[0]}</span>${l[1]}<div style="opacity:.92;font-weight:600;font-size:12px;margin-top:2px">${l[2]}</div></div>`).join('')}</div></div></div>
   ${totalPend?`<div class="panel fx4" style="border-color:var(--danger);margin-top:16px"><div class="panel-body" style="display:flex;align-items:center;gap:14px"><div class="doc-ic" style="background:var(--danger-soft);color:var(--danger)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg></div><div style="flex:1"><b>Tenés ${pend.length} cuota(s) pendiente(s)</b><br><small style="color:var(--muted)">Total: ${fmt(totalPend)}. Subí el comprobante para regularizar.</small></div></div></div>`:`<div class="panel fx4" style="margin-top:16px"><div class="panel-body" style="display:flex;align-items:center;gap:14px"><div class="doc-ic" style="background:var(--success-soft);color:var(--success)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div><div><b>¡Estás al día con las cuotas! 🎉</b></div></div></div>`}
   <div class="detail-grid" style="margin-top:16px">
     <div class="panel"><div class="panel-head"><h3>Subir comprobante</h3></div><div class="panel-body"><div class="field"><label>Cuota a regularizar</label><select id="famPagoSel">${pend.length?pend.map(p=>`<option value="${p.id}">${p.mes} · ${fmt(p.importe)}</option>`).join(''):'<option>No hay cuotas pendientes</option>'}</select></div><div class="dropzone" onclick="$('#famFile').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><div><b>Tocá para subir</b></div><small>JPG, PNG o PDF</small></div><input type="file" id="famFile" accept="image/*,.pdf" style="display:none" onchange="famUpload()"><div id="famPreview" style="margin-top:12px"></div><button class="btn btn-primary btn-block" style="margin-top:14px" onclick="famSubmit()" ${pend.length?'':'disabled'}>Enviar comprobante</button></div></div>
     <div class="panel"><div class="panel-head"><h3>Mensajes del colegio</h3>${(DB.mensajes||[]).filter(m=>m.studentId===s.id&&!m.leido).length?`<span class="badge b-warn nodot">${(DB.mensajes||[]).filter(m=>m.studentId===s.id&&!m.leido).length} sin leer</span>`:''}</div><div class="panel-body" style="max-height:280px;overflow:auto">${(DB.mensajes||[]).filter(m=>m.studentId===s.id).slice().reverse().map(m=>`<div class="alert-item" style="${m.leido?'':'background:var(--warn-soft)'}"><div class="doc-ic" style="background:var(--blue-soft);color:var(--blue)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H5.2L4 17.2z"/></svg></div><div class="info"><b>${esc(m.asunto)}</b><small>${m.fecha}</small></div>${m.leido?'<span class="badge b-success nodot">Leído</span>':`<button class="btn btn-primary btn-sm" onclick="marcarLeido('${m.id}')">Leer</button>`}</div>`).join('')||'<div class="empty">No tenés mensajes.</div>'}</div></div>
   </div>
   <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Información escolar</h3></div><div class="panel-body"><div class="info-row"><span class="k">Comedor</span><span class="v">${s.comedor.inscrito?s.comedor.plan:'No inscripto'}</span></div><div class="info-row"><span class="k">Alergias / dieta</span><span class="v">${s.comedor.alergias}</span></div><div style="margin-top:12px"><div class="k" style="color:var(--muted);font-size:12.5px;margin-bottom:8px">Actividades</div><div class="chips">${acts.length?acts.map(a=>`<span class="chip">${a.nombre} · ${a.dia} ${a.horaInicio}</span>`).join(''):'<span style="color:var(--muted)">Sin actividades</span>'}</div></div></div></div>
   ${materias.length?`<div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Materias y temario · ${c.nombre}</h3><span class="sub">${materias.length} materias</span></div><div class="panel-body">${materias.map(m=>`<div class="doc-item"><div class="doc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2 2 0 012-2h14v14"/></svg></div><div class="info"><b>${m.nombre}</b><small>${esc(m.temas)}</small></div></div>`).join('')}</div></div>`:''}
   <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>🖼️ Galería del aula</h3></div><div class="panel-body"><div class="mural">${[1,2,3,4,5,6,7,8].map(i=>`<div class="ph" style="background-image:url('https://picsum.photos/seed/aulora-mural-${i}/400/400');animation-delay:${(i*.05).toFixed(2)}s" onclick="lightImg('https://picsum.photos/seed/aulora-mural-${i}/1200/1200')"></div>`).join('')}</div></div></div>
   <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Historial de cuotas</h3></div><table><thead><tr><th>Mes</th><th>Concepto</th><th>Importe</th><th>Estado</th></tr></thead><tbody>${s.pagos.slice().reverse().map(p=>{const e=realEstado(p);return `<tr><td><b style="font-size:13px">${p.mes}</b></td><td><small>${p.concepto}</small></td><td class="tnum"><b>${fmt(p.importe)}</b></td><td><span class="badge ${({pagado:'b-success',pendiente:'b-warn',vencido:'b-danger'})[e]}">${({pagado:'Pagada',pendiente:'Pendiente',vencido:'Vencida'})[e]}</span></td></tr>`;}).join('')}</tbody></table></div>
  </div>`;}

/* ====================== RENDIMIENTO ACADÉMICO POR CLASE (#estadística por materia) ====================== */
let rendCurso=null;
function acadStats(curso){const al=DB.students.filter(s=>s.curso===curso);const c=courseByName(curso);const mats=(c&&c.materias||[]).map(m=>m.nombre);
  const materias=mats.map(mn=>{const proms=[],t=[[],[],[]];al.forEach(s=>{const n=s.notas&&s.notas[mn];if(!n)return;const pr=notaProm(n);if(pr!=null)proms.push({s,pr});['t1','t2','t3'].forEach((k,i)=>{if(typeof n[k]==='number')t[i].push(n[k]);});});
    const avg=proms.length?proms.reduce((a,b)=>a+b.pr,0)/proms.length:null;const aprob=proms.length?Math.round(proms.filter(x=>x.pr>=6).length/proms.length*100):0;const mejor=proms.slice().sort((a,b)=>b.pr-a.pr)[0]||null;const tm=i=>t[i].length?t[i].reduce((a,b)=>a+b,0)/t[i].length:null;
    return {nombre:mn,avg,aprob,mejor,t1:tm(0),t2:tm(1),t3:tm(2)};});
  const avgs=al.map(studentAvg).filter(x=>x!=null);const courseAvg=avgs.length?avgs.reduce((a,b)=>a+b,0)/avgs.length:null;
  const aprobPct=avgs.length?Math.round(avgs.filter(x=>x>=6).length/avgs.length*100):0;
  const ranked=al.map(s=>({s,a:studentAvg(s)})).filter(x=>x.a!=null).sort((a,b)=>b.a-a.a);
  const valid=materias.filter(m=>m.avg!=null);const mejorMat=valid.slice().sort((a,b)=>b.avg-a.avg)[0]||null;const reforzar=valid.slice().sort((a,b)=>a.avg-b.avg)[0]||null;
  return {al,materias,courseAvg,aprobPct,ranked,mejorMat,reforzar};}
function viewRendimiento(){if(!perm('ver_estadisticas'))return noPerm();const cursos=DB.courses.map(c=>c.nombre);if(!rendCurso||!cursos.includes(rendCurso))rendCurso=cursos[0];const st=acadStats(rendCurso);const medal=['🥇','🥈','🥉'];const IC='<path d="M3 3v18h18"/>';
  return `<div class="view"><div class="toolbar"><span style="font-weight:700;color:var(--ink-soft)">Clase:</span><select onchange="rendCurso=this.value;render()" style="font-weight:700">${cursos.map(c=>`<option ${c===rendCurso?'selected':''}>${c}</option>`).join('')}</select><div class="grow"></div><span style="color:var(--muted);font-size:13px">${st.al.length} alumno(s) · ${st.materias.length} materias</span></div>
   <div class="kpis">
     ${kpi('Promedio de la clase','--brand-soft','--brand',st.courseAvg?st.courseAvg.toFixed(2):'—','sobre 10','flat',IC)}
     ${kpi('Aprobación','--success-soft','--success',st.aprobPct+'%','alumnos con prom ≥ 6','up',IC)}
     ${kpi('Materia más fuerte','--blue-soft','--blue',st.mejorMat?st.mejorMat.avg.toFixed(1):'—',st.mejorMat?st.mejorMat.nombre:'—','up',IC)}
     ${kpi('Materia a reforzar','--warn-soft','--warn',st.reforzar?st.reforzar.avg.toFixed(1):'—',st.reforzar?st.reforzar.nombre:'—','down',IC)}
   </div>
   <div class="grid3">
     <div class="panel"><div class="panel-head"><h3>Promedio por materia</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="rMateria"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Distribución de promedios</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="rDist"></canvas></div></div></div>
     <div class="panel"><div class="panel-head"><h3>Evolución por trimestre</h3></div><div class="panel-body"><div class="chart-box sm"><canvas id="rTrim"></canvas></div></div></div>
   </div>
   <div class="grid2e">
     <div class="panel"><div class="panel-head"><h3>🏆 Destacados de la clase</h3><span class="sub">Mejores promedios</span></div><div class="panel-body">${st.ranked.slice(0,3).map((x,i)=>`<div class="alert-item"><div style="font-size:24px;width:34px;text-align:center">${medal[i]}</div>${avatarHTML(x.s,34)}<div class="info"><b>${studentName(x.s)}</b><small>Promedio general</small></div><span class="badge b-success">${x.a.toFixed(2)}</span></div>`).join('')||'<div class="empty">Sin notas cargadas.</div>'}
        ${st.ranked.filter(x=>x.a<6).length?`<div class="form-section">Para acompañar</div>${st.ranked.filter(x=>x.a<6).map(x=>`<div class="alert-item">${avatarHTML(x.s,32)}<div class="info"><b>${studentName(x.s)}</b><small>Conviene reforzar</small></div><span class="badge b-warn">${x.a.toFixed(2)}</span><button class="btn btn-ghost btn-sm" onclick="openStudent('${x.s.id}','academico')">Ver</button></div>`).join('')}`:''}
     </div></div>
     <div class="panel"><div class="panel-head"><h3>Detalle por materia</h3><span class="sub">Qué destaca en cada clase</span></div>
       <div class="table-wrap"><table><thead><tr><th>Materia</th><th>Prom.</th><th>Aprob.</th><th>Destacado/a</th><th>Tendencia</th></tr></thead><tbody>
       ${st.materias.map(m=>{const tend=(m.t1!=null&&m.t3!=null)?(m.t3-m.t1):null;const tb=tend==null?'<span style="color:var(--muted)">—</span>':(tend>0.2?`<span class="badge b-success nodot">▲ +${tend.toFixed(1)}</span>`:(tend<-0.2?`<span class="badge b-danger nodot">▼ ${tend.toFixed(1)}</span>`:'<span class="badge b-grey nodot">≈ estable</span>'));return `<tr><td><b style="font-size:13px">${m.nombre}</b></td><td>${m.avg==null?'—':`<span class="badge ${m.avg>=8?'b-success':(m.avg>=6?'b-blue':'b-warn')}">${m.avg.toFixed(1)}</span>`}</td><td>${m.aprob}%</td><td>${m.mejor?`<small>${studentName(m.mejor.s)} · ${m.mejor.pr.toFixed(1)}</small>`:'—'}</td><td>${tb}</td></tr>`;}).join('')}
       </tbody></table></div></div>
   </div></div>`;}
function drawRendimiento(){const mk=(id,cf)=>{const el=document.getElementById(id);if(el)charts[id]=new Chart(el,cf);};const st=acadStats(rendCurso);const mats=st.materias.filter(m=>m.avg!=null);
  mk('rMateria',{type:'bar',data:{labels:mats.map(m=>m.nombre),datasets:[{data:mats.map(m=>+m.avg.toFixed(2)),backgroundColor:mats.map(m=>m.avg>=8?'#0E7C66':(m.avg>=6?'#3B5BE0':'#E0743B')),borderRadius:5,maxBarThickness:20}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:10,grid:{color:'#EEECE5'}},y:{grid:{display:false}}}}});
  const b=[0,0,0,0,0];st.ranked.forEach(x=>{const a=x.a;if(a<6)b[0]++;else if(a<7)b[1]++;else if(a<8)b[2]++;else if(a<9)b[3]++;else b[4]++;});
  mk('rDist',{type:'bar',data:{labels:['<6','6–7','7–8','8–9','9–10'],datasets:[{data:b,backgroundColor:['#D6453F','#E0743B','#D89A0A','#3B5BE0','#0E7C66'],borderRadius:5,maxBarThickness:34}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'#EEECE5'},ticks:{stepSize:1}}}}});
  const tt=[0,0,0],tc=[0,0,0];st.materias.forEach(m=>{['t1','t2','t3'].forEach((k,i)=>{if(m[k]!=null){tt[i]+=m[k];tc[i]++;}});});const tline=tt.map((v,i)=>tc[i]?+(v/tc[i]).toFixed(2):null);
  mk('rTrim',{type:'line',data:{labels:['1.º Trim.','2.º Trim.','3.º Trim.'],datasets:[{data:tline,borderColor:'#0E7C66',backgroundColor:'rgba(14,124,102,.12)',fill:true,tension:.35,borderWidth:2.5,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{min:0,max:10,grid:{color:'#EEECE5'}}}}});}

/* ====================== PAÍS / CALENDARIO ====================== */
function setPais(p){const c=cfg();c.pais=p;const d=PAIS_DEFAULTS[p]||PAIS_DEFAULTS.AR;c.locale=d.locale;c.moneda=d.moneda;logAudit('editar','Configuración del colegio','País: '+(p==='ES'?'España':'Argentina'),'edit');saveDB();render();toast('País: '+(p==='ES'?'España':'Argentina')+'. Aplicá el calendario escolar si corresponde.','success');}
function aplicarCalendarioPais(){const sel=document.getElementById('cf_cal');const p=sel?sel.value:(cfg().pais||'AR');const userEv=(DB.eventos||[]).filter(e=>!e.preset);DB.eventos=calendarFor(p).concat(userEv);logAudit('editar','Calendario escolar','Preset '+(p==='ES'?'España':'Argentina')+' aplicado','edit');saveDB();render();toast('Calendario de '+(p==='ES'?'España':'Argentina')+' aplicado.','success');}

/* ====================== CONTABILIDAD ====================== */
function contabIngresosCuotas(){let t=0;DB.students.forEach(s=>s.pagos.forEach(p=>{if(p.estado==='pagado')t+=p.importe;}));return t;}
function contabResumen(){const mov=(DB.contab&&DB.contab.movimientos)||[];const ingManual=mov.filter(m=>m.tipo==='ingreso').reduce((a,b)=>a+b.monto,0);const egresos=mov.filter(m=>m.tipo==='egreso').reduce((a,b)=>a+b.monto,0);const ingCuotas=contabIngresosCuotas();const ingresos=ingManual+ingCuotas;return {mov,ingManual,ingCuotas,ingresos,egresos,balance:ingresos-egresos};}
function viewContabilidad(){if(!perm('ver_contabilidad'))return noPerm();const r=contabResumen();const m=metrics();const IC='<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16"/>';const puede=perm('editar_contabilidad');
  return `<div class="view">
   <div class="kpis">
     ${kpi('Ingresos','--success-soft','--success',fmt(r.ingresos),'cuotas + manual','up',IC)}
     ${kpi('Egresos','--danger-soft','--danger',fmt(r.egresos),'gastos registrados','down',IC)}
     ${kpi('Balance','--brand-soft','--brand',fmt(r.balance),r.balance>=0?'superávit':'déficit',r.balance>=0?'up':'down',IC)}
     ${kpi('Por cobrar','--warn-soft','--warn',fmt(m.pendiente+m.vencido),'cuotas pendientes','flat',IC)}
   </div>
   <div class="panel"><div class="panel-head"><h3>Cobranza de cuotas (automático)</h3><span class="sub">Integrado con el módulo de Cuotas</span></div><div class="panel-body"><div class="info-row"><span class="k">Cuotas cobradas (acumulado)</span><span class="v"><b>${fmt(r.ingCuotas)}</b></span></div><div class="info-row"><span class="k">Cuotas por cobrar</span><span class="v">${fmt(m.pendiente+m.vencido)}</span></div></div></div>
   <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Libro de movimientos</h3><div class="right">${puede?`<button class="btn btn-primary btn-sm" onclick="modalContabMov()">+ Movimiento</button> `:''}<button class="btn btn-ghost btn-sm" onclick="contabExport()">${icoXls()} Exportar</button></div></div>
     <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Detalle</th><th style="text-align:right">Monto</th>${puede?'<th></th>':''}</tr></thead><tbody>
     ${r.mov.slice().sort((a,b)=>a.fecha<b.fecha?1:-1).map(mv=>`<tr><td class="tnum"><small>${mv.fecha}</small></td><td><span class="badge ${mv.tipo==='ingreso'?'b-success':'b-danger'} nodot">${mv.tipo==='ingreso'?'Ingreso':'Egreso'}</span></td><td><small>${esc(mv.cat)}</small></td><td><small>${esc(mv.detalle||'')}</small></td><td class="tnum" style="text-align:right"><b>${mv.tipo==='egreso'?'-':''}${fmt(mv.monto)}</b></td>${puede?`<td><button class="icon-btn danger" onclick="delContabMov('${mv.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button></td>`:''}</tr>`).join('')||`<tr><td colspan="${puede?6:5}"><div class="empty">Sin movimientos cargados.</div></td></tr>`}
     </tbody></table></div></div></div>`;}
function modalContabMov(){if(!perm('editar_contabilidad'))return;openModal(`<div class="modal-head"><h3>Nuevo movimiento contable</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Fecha</label><input type="date" id="cm_f" value="${today.toISOString().slice(0,10)}"></div><div class="field"><label>Tipo</label><select id="cm_t"><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div></div><div class="field"><label>Categoría</label><input id="cm_cat" placeholder="Sueldos, Servicios, Subvención, Materiales..."></div><div class="field"><label>Detalle</label><input id="cm_det" placeholder="Descripción"></div><div class="field"><label>Monto</label><input type="number" id="cm_m" value="0"></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveContabMov()">Guardar</button></div>`);}
function saveContabMov(){const cat=$('#cm_cat').value.trim();const monto=+$('#cm_m').value;if(!cat||!monto){toast('Completá categoría y monto.','warn');return;}DB.contab=DB.contab||{movimientos:[]};DB.contab.movimientos.push({id:'cm'+Date.now(),fecha:$('#cm_f').value,tipo:$('#cm_t').value,cat,detalle:$('#cm_det').value,monto});logAudit('crear','Contabilidad',cat+' · '+fmt(monto),'create');saveDB();closeModal();render();toast('Movimiento registrado.','success');}
function delContabMov(id){DB.contab.movimientos=DB.contab.movimientos.filter(x=>x.id!==id);logAudit('eliminar','Contabilidad','Movimiento eliminado','delete');saveDB();render();toast('Movimiento eliminado.','danger');}
function contabExport(){const rows=((DB.contab&&DB.contab.movimientos)||[]).map(m=>({Fecha:m.fecha,Tipo:m.tipo,Categoria:m.cat,Detalle:m.detalle,Monto:m.monto}));const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'contabilidad');XLSX.writeFile(wb,'aulora_contabilidad_'+today.toISOString().slice(0,10)+'.xlsx');toast('Excel descargado.','success');}

/* ====================== AFA / AMPA ====================== */
function afaResumen(){const a=DB.afa||{cuota:0,socios:[],movimientos:[]};const socios=a.socios||[];const mov=a.movimientos||[];const ingresos=mov.filter(m=>m.tipo==='ingreso').reduce((s,b)=>s+b.monto,0);const egresos=mov.filter(m=>m.tipo==='egreso').reduce((s,b)=>s+b.monto,0);const recaudPot=socios.length*(a.cuota||0);return {a,socios,mov,ingresos,egresos,balance:ingresos-egresos,recaudPot};}
function viewAFA(){if(!perm('ver_afa'))return noPerm();const r=afaResumen();const puede=perm('editar_afa');const IC='<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>';const sociosSet=new Set(r.socios.map(x=>x.studentId));
  return `<div class="view">
   <div class="kpis">
     ${kpi('Socios','--blue-soft','--blue',r.socios.length,'familias asociadas','flat',IC)}
     ${kpi('Cuota AFA','--brand-soft','--brand',fmt(r.a.cuota||0),'por familia','flat',IC)}
     ${kpi('Caja AFA','--success-soft','--success',fmt(r.balance),r.balance>=0?'saldo positivo':'saldo negativo',r.balance>=0?'up':'down',IC)}
     ${kpi('Recaudación potencial','--warn-soft','--warn',fmt(r.recaudPot),'socios × cuota','up',IC)}
   </div>
   <div class="detail-grid">
     <div class="panel"><div class="panel-head"><h3>Socios (familias)</h3>${puede?`<button class="btn btn-ghost btn-sm" onclick="modalAfaCuota()">Cuota AFA</button>`:''}</div><div class="panel-body" style="max-height:440px;overflow:auto">
       ${DB.students.map(s=>{const es=sociosSet.has(s.id);return `<div class="alert-item">${avatarHTML(s,32)}<div class="info"><b>${s.tutor?esc(s.tutor.nombre):studentName(s)}</b><small>${studentName(s)} · ${s.curso||'—'}</small></div>${es?'<span class="badge b-success nodot">Socio</span>':''}${puede?`<button class="btn ${es?'btn-ghost':'btn-primary'} btn-sm" onclick="afaToggleSocio('${s.id}')">${es?'Baja':'Alta'}</button>`:''}</div>`;}).join('')||'<div class="empty">Sin familias cargadas.</div>'}
     </div></div>
     <div class="panel"><div class="panel-head"><h3>Caja de la AFA</h3><div class="right">${puede?`<button class="btn btn-primary btn-sm" onclick="modalAfaMov()">+ Movimiento</button> `:''}<button class="btn btn-ghost btn-sm" onclick="afaExport()">${icoXls()} Exportar</button></div></div>
       <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Detalle</th><th style="text-align:right">Monto</th>${puede?'<th></th>':''}</tr></thead><tbody>
       ${r.mov.slice().sort((a,b)=>a.fecha<b.fecha?1:-1).map(mv=>`<tr><td class="tnum"><small>${mv.fecha}</small></td><td><span class="badge ${mv.tipo==='ingreso'?'b-success':'b-danger'} nodot">${mv.tipo==='ingreso'?'Ingreso':'Egreso'}</span></td><td><small>${esc(mv.cat)}${mv.detalle?' — '+esc(mv.detalle):''}</small></td><td class="tnum" style="text-align:right"><b>${mv.tipo==='egreso'?'-':''}${fmt(mv.monto)}</b></td>${puede?`<td><button class="icon-btn danger" onclick="delAfaMov('${mv.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg></button></td>`:''}</tr>`).join('')||`<tr><td colspan="${puede?5:4}"><div class="empty">Sin movimientos.</div></td></tr>`}
       </tbody></table></div></div>
   </div></div>`;}
function afaToggleSocio(sid){if(!perm('editar_afa'))return;DB.afa=DB.afa||{cuota:0,socios:[],movimientos:[]};const i=(DB.afa.socios||[]).findIndex(x=>x.studentId===sid);if(i>=0)DB.afa.socios.splice(i,1);else DB.afa.socios.push({studentId:sid,alta:today.toISOString().slice(0,10)});logAudit('editar','AFA / AMPA','Alta/baja de socio','edit');saveDB();render();}
function modalAfaCuota(){if(!perm('editar_afa'))return;openModal(`<div class="modal-head"><h3>Cuota de la AFA</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="field"><label>Importe por familia</label><input type="number" id="afa_c" value="${(DB.afa&&DB.afa.cuota)||0}"></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveAfaCuota()">Guardar</button></div>`);}
function saveAfaCuota(){DB.afa=DB.afa||{cuota:0,socios:[],movimientos:[]};DB.afa.cuota=+$('#afa_c').value||0;logAudit('editar','AFA / AMPA','Cuota actualizada','edit');saveDB();closeModal();render();toast('Cuota AFA actualizada.','success');}
function modalAfaMov(){if(!perm('editar_afa'))return;openModal(`<div class="modal-head"><h3>Movimiento de caja AFA</h3><button class="x" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="form-grid"><div class="field"><label>Fecha</label><input type="date" id="am_f" value="${today.toISOString().slice(0,10)}"></div><div class="field"><label>Tipo</label><select id="am_t"><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div></div><div class="field"><label>Concepto</label><input id="am_cat" placeholder="Cuota AFA, Evento, Materiales..."></div><div class="field"><label>Detalle</label><input id="am_det"></div><div class="field"><label>Monto</label><input type="number" id="am_m" value="0"></div></div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveAfaMov()">Guardar</button></div>`);}
function saveAfaMov(){const cat=$('#am_cat').value.trim();const monto=+$('#am_m').value;if(!cat||!monto){toast('Completá concepto y monto.','warn');return;}DB.afa=DB.afa||{cuota:0,socios:[],movimientos:[]};DB.afa.movimientos.push({id:'am'+Date.now(),fecha:$('#am_f').value,tipo:$('#am_t').value,cat,detalle:$('#am_det').value,monto});logAudit('crear','AFA / AMPA',cat+' · '+fmt(monto),'create');saveDB();closeModal();render();toast('Movimiento registrado.','success');}
function delAfaMov(id){DB.afa.movimientos=DB.afa.movimientos.filter(x=>x.id!==id);logAudit('eliminar','AFA / AMPA','Movimiento eliminado','delete');saveDB();render();toast('Movimiento eliminado.','danger');}
function afaExport(){const rows=((DB.afa&&DB.afa.movimientos)||[]).map(m=>({Fecha:m.fecha,Tipo:m.tipo,Concepto:m.cat,Detalle:m.detalle,Monto:m.monto}));const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'afa');XLSX.writeFile(wb,'aulora_afa_'+today.toISOString().slice(0,10)+'.xlsx');toast('Excel descargado.','success');}
