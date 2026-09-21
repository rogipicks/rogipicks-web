// ─── Contenido de las páginas de compañía y de información legal ─────────────
// Los datos de contacto salen de la configuración para no duplicar valores.

import { APP_CONFIG } from '@/constants/config';
import { LEGAL_UPDATED_AT } from '@/constants/company';
import type { LegalPageContent } from './LegalPage';

export const aboutContent: LegalPageContent = {
  badge: 'Sobre nosotros',
  title: 'Pronósticos con datos, no con humo',
  lead: 'RogiPicks nació con una idea simple: que seguir pronósticos deportivos sea gratis, transparente y sin letra pequeña. Publicamos análisis razonados, registramos cada resultado —se gane o se pierda— y lo mostramos todo.',
  updatedAt: LEGAL_UPDATED_AT,
  highlights: [
    { value: 'Gratis', label: 'Acceso al canal y a los picks' },
    { value: '100%', label: 'Resultados publicados' },
    { value: '+3 años', label: 'Analizando deporte' },
    { value: '+18', label: 'Contenido para adultos' },
  ],
  sections: [
    {
      title: 'Qué hacemos',
      blocks: [
        {
          kind: 'text',
          body: 'Analizamos partidos de fútbol y otros deportes, buscamos valor en las cuotas y publicamos cada pronóstico con su razonamiento: contexto, forma reciente, estadísticas y el motivo por el que la cuota nos parece interesante. Nada de picks sin explicación.',
        },
        {
          kind: 'list',
          title: 'Lo que encontrarás',
          items: [
            'Pronósticos diarios con cuota, stake y nivel de confianza.',
            'Retos de crecimiento de banca, paso a paso y con seguimiento público.',
            'Ranking de rendimiento con ROI, acierto y beneficio en unidades.',
            'Comparativa de casas de apuestas y bonos disponibles.',
          ],
        },
      ],
    },
    {
      title: 'Nuestra forma de trabajar',
      blocks: [
        {
          kind: 'text',
          title: 'Transparencia',
          body: 'Publicamos todos los resultados, también los pronósticos fallidos. El historial completo está disponible en la sección de pronósticos, con los filtros por resultado y deporte.',
        },
        {
          kind: 'text',
          title: 'Gestión de banca',
          body: 'Trabajamos con stake plano y unidades, no con importes fijos: así el registro es comparable para cualquier persona, independientemente del dinero que decida dedicar. Aun así, cada apuesta es una decisión personal y no recomendamos perseguir pérdidas.',
        },
        {
          kind: 'text',
          title: 'Sin promesas',
          body: 'Apostar conlleva riesgo. Ningún pronóstico garantiza ganancias y cualquiera que te prometa dinero fácil está engañándote. Nuestro objetivo es informarte mejor, no hacerte creer que es imposible perder.',
        },
      ],
    },
    {
      title: 'Cómo contactarnos',
      blocks: [
        {
          kind: 'text',
          body: `Si eres una casa de apuestas, un medio o quieres proponernos una colaboración, escríbenos a ${APP_CONFIG.contactEmail} o a través de nuestras redes sociales. Respondemos a todo lo que sea un mensaje real.`,
        },
      ],
    },
  ],
};

export const agreementContent: LegalPageContent = {
  badge: 'Condiciones de uso',
  title: 'Acuerdo de usuario',
  lead: 'Estas son las condiciones que aceptas al usar RogiPicks. Están redactadas para que se entiendan: si algo no te queda claro antes de usar el sitio, escríbenos y lo aclaramos.',
  updatedAt: LEGAL_UPDATED_AT,
  sections: [
    {
      title: '1. Objeto y aceptación',
      blocks: [
        {
          kind: 'text',
          body: 'RogiPicks es un sitio de contenido informativo y de análisis deportivo. No es un operador de juego, no acepta apuestas, no gestiona dinero de usuarios y no intermedia en ningún pago relacionado con apuestas. El acceso al sitio implica la aceptación plena de este acuerdo.',
        },
        {
          kind: 'text',
          body: 'Si no estás de acuerdo con estas condiciones, no uses el sitio. Nos reservamos el derecho a actualizar este documento; la versión vigente es siempre la publicada en esta página.',
        },
      ],
    },
    {
      title: '2. Requisitos de acceso',
      blocks: [
        {
          kind: 'list',
          items: [
            'Debes ser mayor de 18 años. El contenido está dirigido exclusivamente a personas adultas.',
            'Debes usar el sitio de forma personal y no comercial, salvo autorización expresa por escrito.',
            'No puedes acceder desde jurisdicciones donde el contenido sobre apuestas deportivas esté prohibido.',
          ],
        },
      ],
    },
    {
      title: '3. Uso permitido y prohibido',
      blocks: [
        {
          kind: 'list',
          title: 'No está permitido',
          items: [
            'Reproducir, revender o explotar los pronósticos y análisis sin autorización escrita.',
            'Extraer contenido de forma masiva mediante bots, scrapers o herramientas automáticas.',
            'Introducir código malicioso, intentar vulnerar la seguridad o sobrecargar el servicio.',
            'Suplantar la identidad de RogiPicks o de terceros.',
            'Usar el sitio para promocionar operadores de juego sin licencia en España.',
          ],
        },
      ],
    },
    {
      title: '4. Pronósticos: qué son y qué no son',
      blocks: [
        {
          kind: 'text',
          body: 'Nuestros pronósticos son opiniones y análisis editoriales. No son asesoramiento financiero, fiscal ni de inversión, y no garantizan ningún resultado. La decisión de apostar, el importe y el operador elegido son responsabilidad exclusiva del usuario, que asume íntegramente el riesgo de sus apuestas y las consecuencias fiscales derivadas de las ganancias.',
        },
        {
          kind: 'text',
          body: 'No existe ninguna estrategia que elimine el riesgo de pérdida. Si un contenido se interpreta como promesa de beneficio, está fuera de nuestro discurso oficial y no nos vincula.',
        },
      ],
    },
    {
      title: '5. Juego responsable y autoexclusión',
      blocks: [
        {
          kind: 'text',
          body: 'El juego puede crear adicción. Si detectas que apuestas más de lo que quieres, que lo haces para recuperar pérdidas o que afecta a tu vida personal, pide ayuda profesional: teléfono de atención a la conducta adictiva 900 16 16 16. También puedes solicitar tu autoexclusión general en el Registro General de Interdicciones de Acceso al Juego (RGIAJ) de la DGOJ, que te impide jugar en todos los operadores con licencia española.',
        },
      ],
    },
    {
      title: '6. Enlaces de afiliación y terceros',
      blocks: [
        {
          kind: 'text',
          body: 'Algunos enlaces a casas de apuestas son de afiliación: si te registras desde ellos podemos recibir una comisión, sin coste adicional para ti y sin que ello altere nuestro análisis. No somos responsables de las condiciones, bonos, cuotas ni del funcionamiento de los sitios de terceros. Revisa siempre los términos del operador antes de registrarte.',
        },
      ],
    },
    {
      title: '7. Propiedad intelectual',
      blocks: [
        {
          kind: 'text',
          body: 'Los textos, análisis, elementos gráficos y la marca RogiPicks están protegidos por la normativa de propiedad intelectual e industrial. Se permite citar brevemente nuestros contenidos indicando la fuente con un enlace a esta web; cualquier otro uso requiere autorización previa y por escrito.',
        },
      ],
    },
    {
      title: '8. Responsabilidad y garantías',
      blocks: [
        {
          kind: 'text',
          body: 'Prestamos el servicio con la diligencia debida, pero no garantizamos disponibilidad ininterrumpida ni la ausencia total de errores. Hasta donde permite la ley, no respondemos de daños indirectos, lucro cesante ni pérdidas derivadas de decisiones de apuesta basadas en nuestros contenidos.',
        },
      ],
    },
    {
      title: '9. Modificaciones y nulidad parcial',
      blocks: [
        {
          kind: 'text',
          body: 'Podemos modificar este acuerdo para adaptarlo a cambios legales o del servicio. Si alguna cláusula fuese declarada nula, el resto seguirá siendo válido y aplicable.',
        },
      ],
    },
    {
      title: '10. Ley aplicable y jurisdicción',
      blocks: [
        {
          kind: 'text',
          body: 'Este acuerdo se rige por la legislación española. Para cualquier controversia, y salvo los fueros que la normativa de consumo reconoce imperativamente a los usuarios, las partes se someten a los juzgados y tribunales de España.',
        },
      ],
    },
  ],
};

export const privacyContent: LegalPageContent = {
  badge: 'Protección de datos',
  title: 'Política de Privacidad',
  lead: 'Aquí explicamos qué datos tratamos cuando navegas por RogiPicks, por qué los tratamos, cuánto tiempo los guardamos y cómo puedes ejercer tus derechos. Cumplimos el RGPD y la LOPDGDD.',
  updatedAt: LEGAL_UPDATED_AT,
  sections: [
    {
      title: '1. Responsable del tratamiento',
      blocks: [
        {
          kind: 'text',
          body: `El responsable del tratamiento de tus datos es RogiPicks, con domicilio en España. Para cualquier cuestión relacionada con privacidad puedes escribir a ${APP_CONFIG.contactEmail} indicando en el asunto "Protección de datos".`,
        },
        {
          kind: 'text',
          body: 'No hemos designado Delegado de Protección de Datos por no estar obligados a ello, pero las solicitudes de derechos se atienden por ese mismo correo con todas las garantías del RGPD.',
        },
      ],
    },
    {
      title: '2. Finalidades, base jurídica y conservación',
      blocks: [
        {
          kind: 'list',
          title: 'Tratamientos que realizamos',
          items: [
            'Suscripción al canal informativo (Telegram): enviarte pronósticos y avisos; base jurídica, tu consentimiento; conservación mientras sigas en el canal.',
            'Contacto por correo o formulario: atender tu consulta; base jurídica, el interés legítimo en responderte y la preparación de una relación precontractual; conservación de un año desde la última comunicación.',
            'Comentarios y participación en redes sociales: gestionar la comunidad; base jurídica, tu consentimiento al publicar; conservación mientras exista el contenido.',
            'Métricas de navegación y seguridad: medir uso agregado y proteger el sitio; base jurídica, el consentimiento para cookies no necesarias y el interés legítimo en la seguridad; conservación según la política de cookies.',
          ],
        },
        {
          kind: 'text',
          body: 'No usamos tus datos para decisiones automatizadas con efectos jurídicos ni elaboramos perfiles con fines publicitarios propios.',
        },
      ],
    },
    {
      title: '3. Qué datos tratamos',
      blocks: [
        {
          kind: 'list',
          items: [
            'Datos identificativos y de contacto que nos facilitas voluntariamente (nombre, correo electrónico, usuario de redes sociales).',
            'El contenido de tus mensajes y solicitudes.',
            'Datos técnicos de navegación: dirección IP, tipo de dispositivo, navegador, páginas visitadas, fecha y hora.',
            'Datos de uso agregado obtenidos mediante cookies analíticas, si las aceptas.',
          ],
        },
        {
          kind: 'text',
          body: 'No solicitamos ni tratamos datos de categoría especial (salud, ideología, origen étnico, etc.) ni datos de menores de edad. Si detectamos que hemos recibido datos de un menor de 14 años, los eliminaremos.',
        },
      ],
    },
    {
      title: '4. Destinatarios y encargados del tratamiento',
      blocks: [
        {
          kind: 'text',
          body: 'No vendemos ni cedemos tus datos a terceros con fines publicitarios. Sí pueden acceder a ellos, como encargados del tratamiento y con contrato firmado, los proveedores necesarios para prestar el servicio: alojamiento web, plataforma de mensajería (Telegram), servicios de analítica y proveedores de correo electrónico.',
        },
        {
          kind: 'text',
          body: 'También podríamos comunicar datos cuando exista una obligación legal, un requerimiento judicial o administrativo, o cuando sea necesario para la formulación, el ejercicio o la defensa de reclamaciones.',
        },
      ],
    },
    {
      title: '5. Transferencias internacionales',
      blocks: [
        {
          kind: 'text',
          body: 'Algunos de nuestros proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En esos casos exigimos garantías adecuadas conforme al RGPD, como las cláusulas contractuales tipo aprobadas por la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU. cuando el proveedor esté certificado.',
        },
      ],
    },
    {
      title: '6. Tus derechos',
      blocks: [
        {
          kind: 'list',
          title: 'Puedes ejercerlos de forma gratuita',
          items: [
            'Acceso: saber qué datos tuyos tratamos.',
            'Rectificación: corregir datos inexactos o incompletos.',
            'Supresión: pedir que borremos tus datos cuando ya no sean necesarios.',
            'Oposición: oponerte a los tratamientos basados en interés legítimo.',
            'Limitación: pedir que suspendamos el tratamiento mientras se resuelve una reclamación.',
            'Portabilidad: recibir tus datos en un formato estructurado y de uso común.',
            'Retirar tu consentimiento en cualquier momento, sin que ello afecte a la licitud del tratamiento previo.',
          ],
        },
        {
          kind: 'text',
          body: `Para ejercerlos, escribe a ${APP_CONFIG.contactEmail} indicando el derecho que ejercitas y adjuntando un documento que acredite tu identidad. Responderemos en el plazo máximo de un mes, ampliable dos meses más si la solicitud es compleja, informándote en ese caso.`,
        },
        {
          kind: 'text',
          body: 'Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es) o ante la autoridad de control de tu país de residencia.',
        },
      ],
    },
    {
      title: '7. Seguridad de la información',
      blocks: [
        {
          kind: 'text',
          body: 'Aplicamos medidas técnicas y organizativas apropiadas al riesgo: cifrado en tránsito (HTTPS), control de accesos, minimización de datos y copias de seguridad. Ningún sistema es infalible, pero si se produjera una brecha de seguridad con riesgo para tus derechos, te informaríamos a ti y a la autoridad de control en los plazos legales.',
        },
      ],
    },
    {
      title: '8. Menores de edad',
      blocks: [
        {
          kind: 'text',
          body: 'Este sitio está dirigido a mayores de 18 años por su temática de apuestas deportivas y no tratamos conscientemente datos de menores. Si eres madre, padre o tutor y crees que un menor nos ha facilitado datos, escríbenos y los eliminaremos de inmediato.',
        },
      ],
    },
  ],
};

export const cookiesContent: LegalPageContent = {
  badge: 'Cookies y almacenamiento',
  title: 'Política de cookies',
  lead: 'Usamos el mínimo imprescindible de cookies y almacenamiento local. Aquí te contamos cuáles son, para qué sirven y cómo puedes aceptarlas, rechazarlas o eliminarlas en cualquier momento.',
  updatedAt: LEGAL_UPDATED_AT,
  sections: [
    {
      title: '1. Qué son las cookies y el almacenamiento local',
      blocks: [
        {
          kind: 'text',
          body: 'Una cookie es un pequeño archivo que se guarda en tu dispositivo al visitar una web y que permite recordar información entre visitas. El almacenamiento local (localStorage y sessionStorage) cumple una función parecida, pero se gestiona desde el propio navegador y no se envía automáticamente al servidor.',
        },
        {
          kind: 'text',
          body: 'La instalación de cookies no necesarias requiere tu consentimiento previo conforme al artículo 22.2 de la LSSI-CE y a las directrices de la AEPD. Las cookies estrictamente necesarias están exentas porque sin ellas el sitio no puede funcionar.',
        },
      ],
    },
    {
      title: '2. Cookies y almacenamiento que utilizamos',
      blocks: [
        {
          kind: 'list',
          title: 'Categorías',
          items: [
            'Técnicas o necesarias: permiten la navegación, recuerdan tus preferencias de interfaz (como el tema visual) y evitan comportamientos anómalos. No requieren consentimiento.',
            'Preferencias o personalización: guardan ajustes como filtros de la lista de pronósticos o el deporte seleccionado. Se activan al usar esas funciones.',
            'Analíticas: nos ayudan a saber qué secciones se usan y a mejorar el contenido. Sólo se activan si las aceptas y nunca se usan para identificarte personalmente.',
            'Publicidad y redes sociales: actualmente RogiPicks no instala cookies publicitarias propias. Si en el futuro se incorporan, se mostrarán con su propia descripción y no se activarán sin tu consentimiento previo.',
          ],
        },
        {
          kind: 'text',
          body: 'No utilizamos cookies de perfilado con fines publicitarios ni cedemos datos a terceros para publicidad personalizada.',
        },
      ],
    },
    {
      title: '3. Plazos de conservación',
      blocks: [
        {
          kind: 'list',
          items: [
            'Cookies de sesión: se eliminan al cerrar el navegador.',
            'Cookies persistentes y almacenamiento local: como máximo 24 meses desde su instalación, siempre que no las borres antes.',
            'Datos de medición: se conservan de forma agregada y no identificable para elaborar estadísticas de uso.',
          ],
        },
      ],
    },
    {
      title: '4. Cómo gestionar o rechazar cookies',
      blocks: [
        {
          kind: 'list',
          title: 'Desde tu navegador',
          items: [
            'Chrome: Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.',
            'Firefox: Ajustes → Privacidad y seguridad → Cookies y datos del sitio.',
            'Safari: Preferencias → Privacidad → Gestionar datos de sitios web.',
            'Edge: Configuración → Cookies y permisos del sitio → Administrar y eliminar cookies.',
          ],
        },
        {
          kind: 'text',
          body: 'También puedes navegar en modo privado o de incógnito: en ese modo las cookies se eliminan al cerrar la ventana. Ten en cuenta que bloquear las cookies necesarias puede impedir que algunas funciones del sitio se comporten como esperas.',
        },
      ],
    },
    {
      title: '5. Consecuencias de desactivarlas',
      blocks: [
        {
          kind: 'text',
          body: 'Puedes usar RogiPicks con las cookies analíticas desactivadas: verás los pronósticos, los retos y el ranking con normalidad. Lo único que perderemos será la información agregada que nos ayuda a mejorar, y tú no perderás ninguna funcionalidad esencial.',
        },
      ],
    },
    {
      title: '6. Actualizaciones de esta política',
      blocks: [
        {
          kind: 'text',
          body: 'Si incorporamos nuevas cookies o cambia su finalidad, actualizaremos esta página y, cuando sea necesario, te pediremos de nuevo el consentimiento. Te recomendamos revisarla de vez en cuando.',
        },
      ],
    },
  ],
};