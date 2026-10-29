const translations = [
  // 1
  {
    record_number: 1,
    source_title: "Pack Evento Pequeño",
    es: "Mantén los discursos nítidos y la música fluyendo en fiestas privadas, presentaciones y pequeñas celebraciones. Este pack compacto de sonido reúne dos altavoces HK Audio SONAR, un micrófono Shure SM58/57, una mesa de mezclas Yamaha MG10XU y todo el cableado necesario para conectarlos."
  },
  // 2
  {
    record_number: 2,
    source_title: "Pack DJ",
    es: "Ofrece a tu DJ una configuración estándar de club para fiestas, sesiones de invitados y afterparties corporativos. Dos reproductores Pioneer CDJ-2000NXS, una mesa de mezclas DJM-900 y el cableado de conexión ponen la selección de pistas, la mezcla y los efectos al alcance de la mano."
  },
  // 3
  {
    record_number: 3,
    source_title: "Pack DJ+",
    es: "Monta una cabina de DJ impecable para noches de club, eventos de marca y sets de festival. Dos reproductores CDJ-2000NXS y una mesa DJM-900 se combinan con dos monitores Meyer UPM-2P, una mesa DJ UDG y cables de conexión, brindando al artista un espacio de trabajo dedicado y monitorización local."
  },
  // 4
  {
    record_number: 4,
    source_title: "Cabeza Móvil 230w",
    es: "Crea haces de luz móviles y nítidos que aportan mayor impacto visual a sets de DJ, transiciones de conciertos y entradas al escenario. Los efectos de color y gobos aportan dinamismo, mientras que el humo ayuda a resaltar los haces en toda la sala."
  },
  // 5
  {
    record_number: 5,
    source_title: "LED Wash 17x19",
    es: "Pasa de un amplio baño de color en el escenario a zonas de luz más concentradas con esta versátil cabeza móvil LED wash. Una opción idónea para grupos en vivo, pistas de baile en bodas y eventos corporativos que requieran crear distintas atmósferas durante el evento."
  },
  // 6
  {
    record_number: 6,
    source_title: "PAR LED a Batería",
    es: "Aporta color a paredes, columnas y accesos sin necesidad de tender cables de corriente a cada foco. El funcionamiento a batería convierte a este bañador en una solución muy práctica para bodas, cenas de gala y eventos corporativos donde la estética y el orden son prioritarios."
  },
  // 7
  {
    record_number: 7,
    source_title: "Aputure Amaran T2c",
    es: "Añade color suave o luz blanca regulable a entrevistas, contenidos de backstage y escenarios creativos. Este tubo LED compacto también funciona como elemento visual decorativo, aportando profundidad a photocalls, expositores de producto y espacios escénicos íntimos."
  },
  // 8
  {
    record_number: 8,
    source_title: "Showtec Sunstrip MK ii Active",
    es: "Viste tu escenario con la calidez clásica de la iluminación de conciertos. Sus lámparas de control individual crean persecuciones fluidas, acentos rítmicos y contundentes efectos cegadora para bandas en directo, cabinas de DJ y fondos escénicos."
  },
  // 9
  {
    record_number: 9,
    source_title: "Eurolite LED Strobe ABL",
    es: "Haz destacar las subidas, finales y acentos musicales con intensos destellos estroboscópicos y efectos de fondo llenos de color. Ideal para sesiones de club, música electrónica y escenarios que busquen tanto ambientación como explosiones de dinamismo visual."
  },
  // 10
  {
    record_number: 10,
    source_title: "Consola GrandMA Command Wing",
    es: "Lleva el control de iluminación profesional a conciertos, teatro y eventos corporativos con el flujo de trabajo de grandMA2 onPC. Faders físicos y mandos de programación dedicados permiten a los operadores lanzar memorias, gestionar transiciones y reaccionar al directo desde un puesto de control compacto."
  },
  // 11
  {
    record_number: 11,
    source_title: "Interfaz ENTTEC DMX USB Pro",
    es: "Convierte cualquier ordenador compatible en una estación compacta de control de iluminación. Esta interfaz USB a DMX conecta el software con tus luminarias, resultando idónea para pequeños espectáculos, exposiciones e instalaciones con secuencias de iluminación programadas."
  },
  // 12
  {
    record_number: 12,
    source_title: "Truss 50mm cuadrado 30 (1000mm)",
    es: "Monta una estructura de soporte o pórtico ferial adaptado al espacio disponible. Este tramo de truss cuadrado de un metro añade flexibilidad a sistemas modulares compatibles para fondos de escenario, accesos y soportes de focos."
  },
  // 13
  {
    record_number: 13,
    source_title: "Tótem 2m con base",
    es: "Enmarca una cabina de DJ, entrada o zona de presentación con una elegante columna vertical iluminada. Este tótem de truss de dos metros incluye base y proporciona un punto de montaje elevado para luminarias compatibles en bodas, fiestas y actos corporativos."
  },
  // 14
  {
    record_number: 14,
    source_title: "Tarima 2000x1000 mm",
    es: "Ofrece a ponentes y artistas un espacio definido y con visibilidad destacada. Este módulo de escenario de dos por un metro se acopla a tarimas compatibles para levantar plataformas de presentación, escenarios para bandas o gradas a la medida de tu espacio."
  },
  // 15
  {
    record_number: 15,
    source_title: "Meyer UPM-2p",
    es: "Lleva un sonido claro y definido exactamente a donde se necesita sin saturar el espacio con recintos voluminosos. Este altavoz autoamplificado compacto es ideal para actos corporativos discretos, refuerzos frontales en teatro y monitorización local donde la inteligibilidad y el detalle musical son clave."
  },
  // 16
  {
    record_number: 16,
    source_title: "HK Audio Sonar top",
    es: "Cubre discursos, música ambiente y directos con una caja acústica autoamplificada versátil. Un elemento básico para fiestas, presentaciones y eventos itinerantes, fácilmente combinable con un subwoofer cuando la ocasión requiere mayor presencia de graves."
  },
  // 17
  {
    record_number: 17,
    source_title: "HK Audio Sonar sub",
    es: "Añade pegada y contundencia a bombos y bajos para que la pista de baile gane energía. Este subwoofer activo complementa altavoces de rango completo en bodas, sets de DJ y directos que demandan un refuerzo de graves más profundo."
  },
  // 18
  {
    record_number: 18,
    source_title: "HK Audio Pro 15 activo",
    es: "Aporta un sonido rotundo y con cuerpo a conciertos en vivo, sets de DJ y fiestas privadas. Este altavoz autoamplificado de 15 pulgadas puede utilizarse tanto de sistema principal como de monitor de escenario, adaptándose fácilmente cuando el evento pasa de la palabra a la música."
  },
  // 19
  {
    record_number: 19,
    source_title: "RCF SUB 8008-AS",
    es: "Ofrece a producciones en vivo y música electrónica el impacto de graves profundos que exigen. Este subwoofer activo de doble 18 pulgadas constituye una base sólida para sistemas de sonido de gran envergadura, adecuado para conciertos, clubes y festivales."
  },
  // 20
  {
    record_number: 20,
    source_title: "Yamaha DXR10 MKII",
    es: "Garantiza voces nítidas y música con excelente presencia gracias a un recinto autoamplificado compacto y polivalente. Utilízalo para ponencias, directos acústicos o monitorización cuando el espacio es ajustado y la inteligibilidad es primordial."
  },
  // 21
  {
    record_number: 21,
    source_title: "Consola analógica 4-8 canales",
    es: "Conecta micrófonos y fuentes de reproducción con un control directo, cómodo e intuitivo. Esta mesa analógica compacta es ideal para charlas, talleres y pequeñas actuaciones donde se valora la inmediatez sin configuraciones complejas."
  },
  // 22
  {
    record_number: 22,
    source_title: "Stage box DL 32",
    es: "Centraliza las conexiones sobre el escenario y envía el audio a consolas digitales compatibles mediante AES50. La Midas DL32 ofrece 32 entradas de micrófono y 16 salidas, perfecta para bandas, producciones complejas y un cableado limpio en el escenario."
  },
  // 23
  {
    record_number: 23,
    source_title: "Behringer X32R",
    es: "Reúne mezcla digital, efectos y ruteo flexible en un formato compacto en rack. La X32 Rack es idónea para grupos, eventos corporativos y sistemas de monitores, permitiendo al técnico ajustar la mezcla de forma remota desde la mejor posición de escucha."
  },
  // 24
  {
    record_number: 24,
    source_title: "Midas M32 live",
    es: "Toma el control absoluto de mezclas complejas en directo con faders motorizados, procesamiento digital y memorias de escena. La M32 LIVE es óptima para conciertos, conferencias y producciones multicanal, agilizando las pruebas de sonido, el directo y la grabación multipista."
  },
  // 25
  {
    record_number: 25,
    source_title: "SLXD24E/SM58 G59",
    es: "Brinda a ponentes y cantantes total libertad de movimiento manteniendo su voz como protagonista del evento. Este sistema inalámbrico digital Shure con cápsula SM58 es perfecto para discursos en bodas, congresos, presentaciones y directos vocales."
  },
  // 26
  {
    record_number: 26,
    source_title: "Sennheiser E 906",
    es: "Lleva amplificadores de guitarra a la mezcla con gran pegada, nitidez y definición. El e 906 es un estándar en escenarios y festivales gracias a su perfil plano, pensado para colgarse o colocarse pegado a la pantalla acústica."
  },
  // 27
  {
    record_number: 27,
    source_title: "Shure SM 58/57",
    es: "Cubre los requerimientos esenciales de cualquier escenario con un micrófono dinámico Shure de absoluta referencia. Elige el SM58 para voces y discursos, o el SM57 para instrumentos y amplificadores, según las necesidades de la actuación."
  },
  // 28
  {
    record_number: 28,
    source_title: "EV RE 20",
    es: "Consigue un sonido vocal cálido, rico y con cuerpo broadcast para podcasts en vivo, entrevistas y retransmisiones. El RE20 también ofrece una captación precisa y controlada de bajas frecuencias en diversos instrumentos musicales."
  },
  // 29
  {
    record_number: 29,
    source_title: "CDJ 2000 NXS",
    es: "Ofrece a DJs invitados un reproductor familiar de referencia para clubes, fiestas privadas y cabinas de festivales. El CDJ-2000NXS admite memorias preparadas y conexión de red entre platos, facilitando una búsqueda de pistas y mezcla sumamente ágiles."
  },
  // 30
  {
    record_number: 30,
    source_title: "DJM 900",
    es: "Convierte la mesa de mezclas en el motor creativo de la cabina. Cuatro canales y efectos integrados brindan a los artistas todo lo necesario para fusionar temas, moldear transiciones y elevar la energía en discotecas, bodas y festivales."
  },
  // 31
  {
    record_number: 31,
    source_title: "Technics SL1200 MK3D",
    es: "Lleva el tacto inconfundible del vinilo a sesiones de club, audiciones y cabinas profesionales. La tracción directa y el control analógico del pitch proporcionan a los selectores una plataforma de precisión para pinchar vinilos con máxima fiabilidad."
  },
  // 32
  {
    record_number: 32,
    source_title: "Mesa DJ UDG U91072BL",
    es: "Crea una superficie de trabajo cuidada y profesional para reproductores y mezclador en bodas, fiestas privadas y cabinas efímeras. Esta mesa plegable UDG aporta una altura óptima, gran estabilidad y un acabado negro sobrio."
  },
  // 33
  {
    record_number: 33,
    source_title: "Cuadro de distribución 32A",
    es: "Organiza la acometida eléctrica para equipos de iluminación, sonido y producción a partir de una toma de 32A. Este cuadro facilita una distribución clara y segura en escenarios, cabinas de DJ y eventos con múltiples líneas de carga."
  },
  // 34
  {
    record_number: 34,
    source_title: "Cuadro de distribución 63A",
    es: "Suministra energía a montajes exigentes desde una acometida de 63A. Este cuadro ofrece un punto neurálgico fiable para alimentar circuitos de sonido e iluminación de alta potencia en conciertos, festivales y grandes producciones."
  },
  // 35
  {
    record_number: 35,
    source_title: "Cable 32A (metros)",
    es: "Conecta acometidas trifásicas de 32A con los cuadros de distribución allí donde lo demande la distribución del espacio. Disponible por metros, facilita el tendido eléctrico seguro entre los puntos de toma del recinto y el área técnica."
  },
  // 36
  {
    record_number: 36,
    source_title: "Cable 63A (metros)",
    es: "Salva la distancia entre la toma principal de 63A del recinto y los cuadros de distribución del evento. Esencial en conciertos, festivales y montajes de gran escala donde el área técnica se ubica lejos de la acometida."
  },
  // 37
  {
    record_number: 37,
    source_title: "Cable 16A 3P (metros)",
    es: "Extiende conexiones eléctricas dedicadas hasta el lugar exacto que requiera el montaje. Especialmente útil para líneas de iluminación y subdistribuciones locales, ajustando la longitud al recorrido necesario."
  },
  // 38
  {
    record_number: 38,
    source_title: "Cable Schuko 3-5m 3x2,5",
    es: "Alimenta altavoces autoamplificados, focos y equipos de cabina en su ubicación idónea. Estos alargadores Schuko resuelven tiradas cortas de corriente en escenarios, zonas de exposición y mesas de control de forma limpia y ordenada."
  },
  // 39
  {
    record_number: 39,
    source_title: "HK Audio Pro 12 active",
    es: "Configura un refuerzo sonoro eficaz para presentaciones, directos y eventos privados. Este altavoz autoamplificado de 12 pulgadas puede funcionar como PA principal o monitor de escenario, adaptándose a múltiples roles según la ocasión."
  },
  // 40
  {
    record_number: 40,
    source_title: "LED BAR Generic",
    es: "Convierte cualquier fondo o pared lisa en parte del diseño visual del evento. Esta barra LED RGB compacta baña de color y crea efectos de barrido ideales para cabinas de DJ, pequeños escenarios, stands y espacios corporativos."
  },
  // 41
  {
    record_number: 41,
    source_title: "SHEHDS Wireless Battery LED Uplight Par Light 6x18W",
    es: "Baña los espacios del evento de luz ambiental mediante proyectores a batería y control DMX inalámbrico. Perfecto para salones de bodas, cenas de gala y actos de marca donde se busca iluminar paredes y pilares sin cables por el suelo."
  },
  // 42
  {
    record_number: 42,
    source_title: "Showtec Straight 2000mm",
    es: "Construye puentes de iluminación, pórticos feriales y soportes escénicos con un tramo recto de truss de dos metros. Su formato modular facilita la adaptación de estructuras compatibles a las dimensiones del espacio y las luminarias necesarias."
  },
  // 43
  {
    record_number: 43,
    source_title: "Sunstrip Active MKII",
    es: "Aporta calidez, dinamismo y estilo escénico al telón de fondo de una banda o cabina de DJ. Diez lámparas regulables de forma independiente permiten desde una suave iluminación ámbar hasta secuencias y destellos contundentes sincronizados con el ritmo."
  },
  // 44
  {
    record_number: 44,
    source_title: "SuperStrobe ABL",
    es: "Alterna entre fondos de color envolventes e intensos destellos blancos en los momentos culminantes del show. Este estroboscopio LED añade contraste visual y dinamismo a sesiones electrónicas, discotecas y espectáculos en vivo."
  },
  // 45
  {
    record_number: 45,
    source_title: "WASH 19x15W LED RGBW",
    es: "Define el ambiente del escenario con movimiento, mezclas de color y zoom regulable. Este wash RGBW permite iluminar uniformemente a los artistas o concentrar el haz para lograr acentos impactantes en conciertos, fiestas y eventos corporativos."
  },
  // 46
  {
    record_number: 46,
    source_title: "WASH 36X18W RGBWU",
    es: "Baña el escenario con un potente espectro de color capaz de transformar cada escena o tema musical. Su cabeza móvil con zoom motorizado resulta idónea para directos musicales, montajes teatrales y llamativos fondos escenográficos."
  },
  // 47
  {
    record_number: 47,
    source_title: "BEAM 7R 230W",
    es: "Traza haces concentrados y de largo alcance a través del aire para noches de club, conciertos y aperturas impactantes. Gobos, colores y prismas aportan múltiples recursos visuales, luciendo en todo su esplendor combinados con humo escénico."
  },
  // 48
  {
    record_number: 48,
    source_title: "Shure PGA Drumkit",
    es: "Microfona la batería al completo con cápsulas optimizadas para cada elemento acústico. Este kit Shure PGA es excelente para bandas en vivo, grabaciones de ensayo y bolos, recogiendo la pegada del bombo y la definición de platos y cajas."
  },
  // 49
  {
    record_number: 49,
    source_title: "SM58",
    es: "Mantén la voz en el primer plano con el micrófono de mano más reconocido por artistas, presentadores y ponentes. El Shure SM58 es la opción de máxima confianza para grupos en directo, discursos de boda, conferencias y actuaciones cotidianas."
  },
  // 50
  {
    record_number: 50,
    source_title: "HK Audio Sonar 112 xi",
    es: "Pasa con total fluidez de conferencias y música ambiental a la fiesta más animada. Esta caja autoamplificada SONAR incorpora mezclador interno y conectividad Bluetooth, aportando gran comodidad a celebraciones privadas, presentaciones y montajes móviles."
  },
  // 51
  {
    record_number: 51,
    source_title: "UPM 2P",
    es: "Aporta refuerzo sonoro de alta fidelidad allí donde una caja acústica grande resultaría intrusiva. Este recinto compacto de Meyer Sound es perfecto para front fills, salas de teatro, presentaciones y monitorización local, garantizando máxima inteligibilidad."
  },
  // 52
  {
    record_number: 52,
    source_title: "Cable XLR 3-5-7m",
    es: "Conecta micrófonos, mesas de sonido y cajas acústicas con señal de audio balanceada y libre de interferencias. La disponibilidad en tres, cinco o siete metros permite realizar un cableado limpio en el escenario sin tiradas tensas ni cables sobrantes."
  },
  // 53
  {
    record_number: 53,
    source_title: "Audibax Truss Claw 48-51mm 100kg",
    es: "Fija focos y efectos en estructuras de truss de forma segura gracias a esta garra para tubos de 48 a 51 mm. Un componente esencial para montajes de iluminación en conciertos, ferias y cabinas de DJ."
  },
  // 54
  {
    record_number: 54,
    source_title: "Gravity LS 431 B",
    es: "Coloca focos o cajas de sonido sobre un pie de base cuadrada plana, idóneo para espacios de diseño, presentaciones y salones de boda. Su mástil extensible ajusta la altura sin el estorbo visual ni los tropiezos de un trípode convencional."
  },
  // 55
  {
    record_number: 55,
    source_title: "Showtec Straight 1500mm",
    es: "Ajusta las medidas de la estructura de truss cuando un tramo de dos metros resulta excesivo. Este módulo recto de 1,5 metros facilita la adaptación precisa de puentes de luces, stands y pórticos al espacio del recinto."
  },
  // 56
  {
    record_number: 56,
    source_title: "Schuko 3 socket black",
    es: "Dispone de tres tomas de corriente próximas en cabinas de DJ, mesas de control o zonas de instrumentos. Su acabado en color negro se camufla discretamente sobre el escenario, manteniendo las tomas agrupadas."
  },
  // 57
  {
    record_number: 57,
    source_title: "Schuko 3 socket blue",
    es: "Agrupa tres conexiones Schuko donde lo requieran los equipos técnicos o el backline. Su color azul facilita una rápida localización e identificación durante el montaje, las actuaciones y el desmontaje."
  },
  // 58
  {
    record_number: 58,
    source_title: "Schuko 5 socket",
    es: "Mantén despejados y ordenados los puestos de control o racks de equipos con cinco tomas Schuko agrupadas. Ideal para mesas, reproductores y periféricos que comparten alimentación sin sobrecargar el circuito."
  },
  // 59
  {
    record_number: 59,
    source_title: "Tent Foldable 3x3",
    es: "Monta un espacio cubierto de tres por tres metros para acreditaciones, puesto de control técnico o zona de descanso en backstage. Su estructura plegable la convierte en una solución práctica y rápida para exteriores con poco tiempo de montaje."
  },
  // 60
  {
    record_number: 60,
    source_title: "ALLEN&HEAT XONE 96",
    es: "Brinda a los DJs un control analógico excepcional para sesiones profundas, mezclas extendidas y directos híbridos. Su ecualización de cuatro bandas, filtros Xone duales y dos tarjetas de sonido USB la convierten en un referente para música electrónica."
  },
  // 61
  {
    record_number: 61,
    source_title: "PIONEER DJM",
    es: "Sitúa una mesa Pioneer DJ en el corazón de la cabina para sesiones de club, fiestas privadas y DJs invitados. Selecciona el modelo que mejor responda al estilo del artista, conexiones de reproductores y necesidades de efectos."
  },
  // 62
  {
    record_number: 62,
    source_title: "PIONEER RMX-1000",
    es: "Convierte las transiciones y bajadas en parte activa de la actuación gracias al control táctil de efectos y samplers. El RMX-1000 añade una potente capa creativa a la cabina de DJ, ideal para actuaciones que buscan remezclas en directo."
  },
  // 63
  {
    record_number: 63,
    source_title: "PIONEER XDJ",
    es: "Integra reproductores y mesa en una solución todo en uno cómoda y portátil. La reproducción directa por USB hace de los sistemas XDJ una elección idónea para eventos móviles, celebraciones privadas y cabinas que buscan sencillez sin renunciar a calidad."
  },
  // 64
  {
    record_number: 64,
    source_title: "PIONEER / ALPHA THETA CDJ 3000",
    es: "Ofrece a los DJs una visión completa de sus pistas y acceso instantáneo a los controles de directo. La gran pantalla táctil y los botones hot cue dedicados del CDJ-3000 son el estándar actual en festivales, clubes y escenarios profesionales."
  },
  // 65
  {
    record_number: 65,
    source_title: "Acoustic Control par 182 cob",
    es: "Inunda el escenario o fondo de sala con un baño de luz homogéneo y vibrante. Este foco PAR LED COB es idóneo para directos, stands y fiestas temáticas donde una cobertura uniforme de color realza el entorno visual."
  },
  // 66
  {
    record_number: 66,
    source_title: "BEAM Z Beamz RB90",
    es: "Viste el escenario con una cálida estética retro combinada con atractivos halos de color LED. El RB90 actúa como foco de acento y elemento decorativo escénico para bandas en directo, cabinas de DJ y eventos con personalidad propia."
  },
  // 67
  {
    record_number: 67,
    source_title: "BEAM Z BLAZE FOG 3500",
    es: "Realza aperturas, subidas musicales y momentos cumbre con una potente columna de humo iluminada. La luz de color integrada convierte el chorro en un efecto escénico llamativo para espectáculos de DJ, directos y presentaciones."
  },
  // 68
  {
    record_number: 68,
    source_title: "BEAM Z BUV 463",
    es: "Haz brillar decoraciones, prendas y elementos reactivos bajo luz ultravioleta. Esta barra UV resulta perfecta para fiestas flúor, montajes temáticos e instalaciones creativas diseñadas en torno a materiales fluorescentes."
  },
  // 69
  {
    record_number: 69,
    source_title: "BEAM Z DMX-192S",
    es: "Controla un montaje de iluminación básico mediante faders físicos, memorias guardadas y secuencias automáticas. Este controlador DMX es ideal para DJs móviles, pequeños escenarios y salas que buscan sencillez sin recurrir a un ordenador."
  },
  // 70
  {
    record_number: 70,
    source_title: "BEAM Z F-1600",
    es: "Descubre los haces de luces en el aire y aporta profundidad visual al escenario con una fina bruma ambiental. Esta máquina de niebla ligera (fazer) es ideal para conciertos, sets de DJ y espectáculos que requieren visibilidad constante de los efectos."
  },
  // 71
  {
    record_number: 71,
    source_title: "BEAM Z Foco Fresnel Zoom 200w Led RGB",
    es: "Ilumina a ponentes, artistas y elementos escénicos con una luz de bordes suaves ajustable al espacio. El zoom motorizado y la mezcla de color hacen de este Fresnel LED una luminaria muy útil en teatro, conferencias y eventos dinámicos."
  },
  // 72
  {
    record_number: 72,
    source_title: "BEAM Z MHL 74",
    es: "Añade dinamismo y color a pequeños escenarios o pistas de baile. Esta cabeza móvil LED wash proporciona transiciones ágiles de posición y paletas coordinadas de color para DJs móviles, pequeñas bandas y celebraciones privadas."
  },
  // 73
  {
    record_number: 73,
    source_title: "BEAM Z PANDORA 1600",
    es: "Crea figuras gráficas coloridas y espectaculares efectos aéreos para espectáculos electrónicos y montajes de club. El control por DMX e ILDA permite integrar el Pandora 1600 en diseños de láser operados por personal cualificado."
  },
  // 74
  {
    record_number: 74,
    source_title: "BEAM Z Par Led ip65 con batería DMX",
    es: "Lleva los colores del evento desde salas interiores hasta fachadas y detalles arquitectónicos al aire libre. La batería, el DMX inalámbrico y su protección IP65 lo hacen perfecto para entradas de boda, terrazas y jardines sin cables a la vista."
  },
  // 75
  {
    record_number: 75,
    source_title: "BEAM Z S3500",
    es: "Genera una densa ambientación visual para entradas teatrales, conciertos y enérgicos shows de DJ. Esta máquina de humo de alta potencia crea nubes volumétricas que hacen destacar los focos e intensifican los momentos clave de la actuación."
  },
  // 76
  {
    record_number: 76,
    source_title: "Chauvet Dj Intimidator beam 355 irc",
    es: "Aporta haces concentrados y llamativos efectos de prisma a sesiones de DJ y escenarios en directo. El Intimidator Beam traza trayectorias nítidas en el aire, mientras que la rueda de color y el filtro frost amplían las variantes visuales."
  },
  // 77
  {
    record_number: 77,
    source_title: "DAGE Dragon Eyes - 7x60W Beam Wash",
    es: "Alterna entre haces penetrantes y amplios baños de color según evolucione el show. El control individual de píxeles añade atractivas secuencias gráficas, convirtiendo al Dragon Eyes en una opción muy completa para cabinas de DJ y escenarios."
  },
  // 78
  {
    record_number: 78,
    source_title: "DAGE Optimus Prime Mega Beam 420W",
    es: "Diseña un potente impacto lumínico aéreo para conciertos, festivales y grandes momentos del espectáculo. Su haz ultra concentrado, filtros de color y prismas proyectan líneas de luz rotundas sobre espacios con niebla escénica."
  },
  // 79
  {
    record_number: 79,
    source_title: "AMATE AUDIO NITID ARRAY N208A",
    es: "Configura un sistema de sonido escalable a la medida de la audiencia y del recinto. Este módulo line array activo es idóneo para conciertos, conferencias y festivales, distribuyendo una cobertura uniforme y una gran definición musical en conjunto."
  },
  // 80
  {
    record_number: 80,
    source_title: "AMATE AUDIO NITID ARRAY N208P",
    es: "Amplía un sistema line array compatible para conciertos, convenciones y producciones en gira. Este módulo pasivo se asocia con etapas y procesadores externos adecuados, ofreciendo una pieza modular para coberturas acústicas planificadas."
  },
  // 81
  {
    record_number: 81,
    source_title: "AMATE AUDIO NITID N 12",
    es: "Cubre conferencias, música en vivo o posiciones de monitor con un polivalente altavoz autoamplificado de 12 pulgadas. Su DSP integrado optimiza la respuesta según el uso en eventos corporativos, escenarios o sistemas de refuerzo."
  },
  // 82
  {
    record_number: 82,
    source_title: "AMATE AUDIO NITID N18W",
    es: "Proporciona a sistemas de sonido compatibles el sustento de graves necesario para música de baile y directos. Este subwoofer autoamplificado de 18 pulgadas añade profundidad y pegada a sets de DJ, conciertos y fiestas animadas."
  },
  // 83
  {
    record_number: 83,
    source_title: "AMATE AUDIO NITID S12",
    es: "Mantén una alternativa acústica versátil para múltiples formatos de evento. El recinto activo S12 funciona como refuerzo principal o monitor de escenario, con procesamiento integrado para ponencias, directos y producciones itinerantes."
  },
  // 84
  {
    record_number: 84,
    source_title: "AMATE AUDIO XCELLENCE X102FD",
    es: "Ofrece un sonido nítido y de gran contundencia para música en directo y eventos corporativos exigentes. Este recinto autoamplificado de doble 10 pulgadas es perfecto como sistema principal o de relleno donde se busca dispersión controlada y un formato compacto."
  },
  // 85
  {
    record_number: 85,
    source_title: "AMATE AUDIO XCELLENCE X218WF",
    es: "Dota a producciones de gran formato de unos cimientos de subgraves imponentes. Este subwoofer autoamplificado con doble altavoz de 18 pulgadas está diseñado para conciertos y festivales que buscan graves profundos y con máxima pegada."
  },
  // 86
  {
    record_number: 86,
    source_title: "AMATE AUDIO XCELLENCE X82FD",
    es: "Aporta un sonido detallado y fiel a escenarios corporativos, recitales y puntos de refuerzo acústico de alta calidad. Su configuración activa con doble 8 pulgadas destaca cuando se precisa precisión sin un recinto voluminoso en el campo visual."
  },
  // 87
  {
    record_number: 87,
    source_title: "AMATE AUDIO XCELLENCE XW118",
    es: "Añade peso, cuerpo y definición a la sección rítmica de tu evento. Este subwoofer activo de 18 pulgadas complementa recintos de medios-agudos en actuaciones de DJ, grupos en vivo y directos que precisan una respuesta en graves sólida."
  },
  // 88
  {
    record_number: 88,
    source_title: "DBX DRIVE RAC PA2",
    es: "Reúne filtros de cruce, ecualización y procesamiento de altavoces en una única unidad de rack compacta. El DriveRack PA2 ayuda a optimizar y proteger el sistema de sonido según la sala, siendo muy útil para giras, bandas y montajes recurrentes."
  },
  // 89
  {
    record_number: 89,
    source_title: "LD Systems MAUI 11 G2",
    es: "Mantén una presencia estética elegante y discreta en ceremonias de boda, presentaciones y directos acústicos. Este sistema de columna autoamplificado aúna un perfil esbelto con mezclador integrado y reproducción por Bluetooth para eventos íntimos."
  },
  // 90
  {
    record_number: 90,
    source_title: "LD Systems MAUI 28",
    es: "Llena la estancia de música y voz nítida con un sistema estilizado de columna y base de subgraves integrada. Muy indicado para recepciones, directos acústicos y encuentros de empresa donde el equipamiento debe integrarse con discreción en el espacio."
  },
  // 91
  {
    record_number: 91,
    source_title: "MACKIE THUMP 12",
    es: "Aporta un sonido alegre y potente a fiestas, eventos de DJ itinerantes y pequeñas actuaciones en directo. Este altavoz autoamplificado de 12 pulgadas es un excelente punto de partida para sonorizaciones ágiles, ampliable con subwoofers para mayor pegada."
  },
  // 92
  {
    record_number: 92,
    source_title: "RCF EVOX J9",
    es: "Combina voces perfectamente inteligibles con una reproducción musical equilibrada en un práctico formato de columna. El EVOX J9 se adapta a bodas, cócteles de empresa y directos donde se busca un sistema estético y fácil de transportar."
  },
  // 93
  {
    record_number: 93,
    source_title: "RCF RCF ART 12",
    es: "Consigue discursos claros y música envolvente con un todoterreno autoamplificado de 12 pulgadas. La serie RCF ART es una elección fiable para actos de empresa, fiestas privadas y conciertos de bandas que requieren un equipo versátil y robusto."
  },
  // 94
  {
    record_number: 94,
    source_title: "RCF SUB 15",
    es: "Añade cuerpo y profundidad a sistemas compactos para sesiones de DJ, grupos y música de pista. Este subwoofer autoamplificado de 15 pulgadas refuerza las frecuencias bajas dejando que los altavoces principales se concentren en la voz y los instrumentos."
  },
  // 95
  {
    record_number: 95,
    source_title: "YAMAHA DXR 12",
    es: "Reproduce discursos, voces en directo y música con un altavoz activo de referencia y gran versatilidad. La DXR12 responde con solvencia en conferencias, bandas y actuaciones de DJ, ya sea como sistema frontal o como monitor de escenario."
  },
  // 96
  {
    record_number: 96,
    source_title: "YAMAHA DXS15",
    es: "Añade pegada a los bombos y consistencia a las líneas de bajo en sistemas de sonido compatibles. Este subwoofer activo de 15 pulgadas es ideal para celebraciones de boda, sets de DJ y directos que precisan mayor presencia de frecuencias graves."
  },
  // 97
  {
    record_number: 97,
    source_title: "Base Truss",
    es: "Levanta estructuras verticales de truss de forma segura con una base sólida concebida para tramos compatibles. Indispensable en tótems de iluminación, accesos decorativos y cabinas de DJ donde la estructura arranca desde el suelo."
  },
  // 98
  {
    record_number: 98,
    source_title: "Cubo Truss",
    es: "Crea esquinas y bifurcaciones estructurales en múltiples direcciones desde un único punto de unión. Este cubo de unión compatible permite configurar pórticos para escenarios, marcos feriales y diseños de iluminación a medida."
  },
  // 99
  {
    record_number: 99,
    source_title: "Escalera Tarima",
    es: "Ofrece a ponentes, artistas y personal técnico un acceso cómodo y seguro a la tarima. Las escaleras modulares se acoplan a la altura del escenario, facilitando el paso en entregas de premios, ponencias y espectáculos."
  },
  // 100
  {
    record_number: 100,
    source_title: "Perfil 1m",
    es: "Completa el montaje de tarimas con este perfil de unión y refuerzo de un metro. Un elemento práctico para escenarios y gradas modulares donde la estructura de soporte debe adaptarse a la distribución proyectada."
  },
  // 101
  {
    record_number: 101,
    source_title: "Tapa Truss",
    es: "Remata los tótems de truss con una pletina superior plana para el apoyo de luminarias compatibles. Un acabado limpio y seguro para cabinas de DJ, acentos escénicos y accesos donde el foco debe quedar asentado en lo alto."
  },
  // 102
  {
    record_number: 102,
    source_title: "Tarima 1x1",
    es: "Añade una plataforma compacta o ajusta con precisión el perímetro de un escenario mayor. Este módulo de tarima de un metro por un metro es perfecto para atriles, peanas de exposición o pequeñas gradas donde el espacio es limitado."
  },
  // 103
  {
    record_number: 103,
    source_title: "Tarima 2x1",
    es: "Construye un escenario adaptado a las necesidades de la actuación con este módulo estándar de dos por un metro. Combina piezas compatibles para crear tarimas de conferencias, escenarios para bandas y plataformas de DJ bien delimitadas."
  },
  // 104
  {
    record_number: 104,
    source_title: "Torre K1",
    es: "Eleva estructuras de iluminación por encima de la zona de actuación mediante una torre telescópica de carga. La K1 es un recurso idóneo en escenarios temporales y eventos donde la altura del montaje debe adecuarse a la sala y a la audiencia."
  },
  // 105
  {
    record_number: 105,
    source_title: "Torre K5",
    es: "Soporta montajes de iluminación de gran envergadura con una torre elevadora adaptada a las cargas y dimensiones de la producción. La K5 se integra en escenarios de concierto y festivales que requieren estructuras elevadas seguras."
  },
  // 106
  {
    record_number: 106,
    source_title: "Truss 0,25m",
    es: "Ajusta las medidas de una estructura de truss en incrementos precisos de veinticinco centímetros. Este tramo corto es clave para que marcos feriales, arcos o pórticos encajen con exactitud en las dimensiones del recinto."
  },
  // 107
  {
    record_number: 107,
    source_title: "Truss 1m",
    es: "Modula la estructura de truss con este versátil tramo de un metro. Utilízalo en sistemas compatibles para pórticos escénicos, soportes de iluminación y stands feriales que requieren medidas adaptables y fácil manejo."
  },
  // 108
  {
    record_number: 108,
    source_title: "Truss 2m",
    es: "Monta los tramos principales de puentes de luces, estructuras de feria o decorados con un módulo de dos metros. Su longitud estandarizada lo convierte en una pieza fundamental para armar estructuras en múltiples recintos."
  },
  // 109
  {
    record_number: 109,
    source_title: "Truss 3m",
    es: "Extiende estructuras escénicas o feriales de gran envergadura con este tramo de tres metros. Muy conveniente para vanos largos y tiradas rectas donde se busca reducir el número de uniones a lo largo de la estructura."
  },
  // 110
  {
    record_number: 110,
    source_title: "AKG PW45 PRESENTER SET",
    es: "Permite a los ponentes desplazarse y gesticular con las manos libres gracias a un discreto micrófono de solapa. Este kit inalámbrico lavalier es idóneo para conferencias, cursos y demostraciones donde sostener un micrófono de mano sería incómodo."
  },
  // 111
  {
    record_number: 111,
    source_title: "AKG PW45 VOCAL SET BAND M",
    es: "Otorga libertad de movimiento a presentadores y vocalistas con un sencillo sistema inalámbrico de mano. El PW45 Vocal Set es perfecto para discursos, karaoke, fiestas privadas y pequeños espectáculos donde el cable limitaría la soltura."
  },
  // 112
  {
    record_number: 112,
    source_title: "BEHRINGER XENIX1202SFX",
    es: "Combina micrófonos, audio auxiliar y efectos integrados en un mezclador compacto para eventos pequeños. La Xenyx 1202SFX es idónea para directos acústicos, ponencias y emisiones en streaming que precisan un control sencillo y conexión de audio USB."
  },
  // 113
  {
    record_number: 113,
    source_title: "DBX DBXDI1",
    es: "Conecta bajos, teclados y otros instrumentos a la mesa con una señal balanceada a nivel de micrófono y libre de ruidos. Esta caja de inyección directa es imprescindible en bandas y backlines, especialmente en tiradas largas hacia el control."
  },
  // 114
  {
    record_number: 114,
    source_title: "MARK XS11451",
    es: "Mantén la voz del ponente nítida y constante mientras tiene total libertad en las manos. Este discreto micrófono de diadema es óptimo para conferencias, demostraciones y presentaciones escénicas, conectado a una petaca inalámbrica compatible."
  },
  // 115
  {
    record_number: 115,
    source_title: "MARK XS1301",
    es: "Acompaña a presentadores dinámicos y artistas con un micrófono de diadema que sigue todos sus movimientos. Una solución muy cómoda para talleres, demostraciones y actos teatrales donde una posición fija del micrófono es preferible a uno de mano."
  },
  // 116
  {
    record_number: 116,
    source_title: "MIDAS MR32R",
    es: "Integra mezcla digital profesional en un formato de control extraordinariamente compacto. Memorias recuperables, procesamiento de alta gama y grabación multipista hacen de esta mesa Midas una elección sólida para bandas, convenciones y actos con múltiples participantes."
  },
  // 117
  {
    record_number: 117,
    source_title: "SENNHEISER EM 300-500-G4",
    es: "Configura un canal inalámbrico profesional con este receptor para emisores de la serie G4 de Sennheiser. Ideal para racks de conferencias, actuaciones en directo e instalaciones donde la señal inalámbrica requiere monitorización clara y gestión fiable."
  },
  // 118
  {
    record_number: 118,
    source_title: "SENNHEISER SKM 500 G4",
    es: "Equipa a presentadores y cantantes con un transmisor de mano profesional para sistemas inalámbricos Sennheiser compatibles. La opción de cápsulas intercambiables permite adaptar la respuesta vocal al presentador, la entrevista o las exigencias del directo."
  },
  // 119
  {
    record_number: 119,
    source_title: "SHURE BETA 58 A",
    es: "Haz que la voz principal sobresalga con claridad y presencia en escenarios exigentes. El patrón polar supercardioide del Beta 58A ofrece gran aislamiento acústico para directos, cantantes enérgicos y montajes con amplificadores en el escenario."
  },
  // 120
  {
    record_number: 120,
    source_title: "SHURE PGA52",
    es: "Capta la pegada y profundidad de bombos de batería o amplificadores de bajo. El PGA52 refuerza la base rítmica de la banda, siendo una opción práctica y solvente para conciertos, directos y grabaciones de percusión."
  },
  // 121
  {
    record_number: 121,
    source_title: "SHURE PGA81",
    es: "Captura con detalle instrumentos acústicos y aéreos de batería. Este micrófono de condensador destaca en recitales acústicos, ensambles y grabaciones en directo donde los matices dinámicos y la naturalidad del timbre son primordiales."
  },
  // 122
  {
    record_number: 122,
    source_title: "SHURE SM 57",
    es: "Sitúa cajas de batería, guitarras amplificadas y otros instrumentos con absoluta definición en la mezcla. El SM57 es el micrófono dinámico más versátil de los escenarios y estudios para la captación cercana de fuentes instrumentales."
  },
  // 123
  {
    record_number: 123,
    source_title: "SOUNDCRAFT EFX12+K",
    es: "Mezcla pequeños grupos o eventos con múltiples micrófonos mediante controles analógicos directos y efectos Lexicon de gran calidad. La EFX12 es idónea para directos, ensayos y presentaciones donde se valora una disposición clara e intuitiva de la mesa."
  },
  // 124
  {
    record_number: 124,
    source_title: "SOUNDCRAFT EPM8",
    es: "Equilibra con sencillez varias fuentes de microfonía y música a través de una mesa de sonido analógica muy intuitiva. La EPM8 se adapta a mesas redondas, acústicos y pequeños directos, con envíos auxiliares para monitorización o efectos externos."
  },
  // 125
  {
    record_number: 125,
    source_title: "YAMAHA MG10XU",
    es: "Reúne micrófonos, música ambiente y efectos útiles en una mesa de sonido muy compacta. La MG10XU es perfecta para discursos de boda, dúos acústicos, conferencias y streaming, con interfaz de audio USB para conectar a un ordenador."
  }
];

module.exports = translations;
