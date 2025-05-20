const quiz = [
  {
    "category": "Estado de ánimo 1",
    "question": "Soy capaz de reconocer y experimentar mis emociones libremente"
  },
  {
    "category": "Estado de ánimo 1",
    "question": "Puedo identificar y procesar mis emociones de manera espontánea"
  },
  {
    "category": "Estado de ánimo 1",
    "question": "Reconozco mis emociones y las expreso sin restricciones"
  },
  {
    "category": "Estado de ánimo 1",
    "question": "Me permito sentir y comprender mis emociones con libertad"
  },
  {
    "category": "Estado de ánimo 1",
    "question": "Acepto y experimento mis emociones sin dificultad"
  },
  {
    "category": "Estado de ánimo 2",
    "question": "Hago todo lo posible por no experimentar malestar emocional en mi vida"
  },
  {
    "category": "Estado de ánimo 2",
    "question": "Intento evitar sentir emociones negativas en mi vida diaria"
  },
  {
    "category": "Estado de ánimo 2",
    "question": "Trato de mantenerme alejado(a) del malestar emocional en todo momento"
  },
  {
    "category": "Estado de ánimo 2",
    "question": "Procuro minimizar las emociones que me causan malestar"
  },
  {
    "category": "Estado de ánimo 2",
    "question": "Hago esfuerzos por evitar situaciones que me generen incomodidad emocional"
  },
  {
    "category": "Estado de ánimo 3",
    "question": "Soy capaz de analizar situaciones y tomar decisiones conscientes"
  },
  {
    "category": "Estado de ánimo 3",
    "question": "Puedo evaluar situaciones y elegir conscientemente mis acciones"
  },
  {
    "category": "Estado de ánimo 3",
    "question": "Reflexiono sobre los eventos antes de tomar decisiones deliberadas"
  },
  {
    "category": "Estado de ánimo 3",
    "question": "Analizo mis opciones y elijo de manera consciente lo que es mejor"
  },
  {
    "category": "Estado de ánimo 3",
    "question": "Tomo decisiones bien pensadas después de analizar cada situación"
  },
  {
    "category": "Estado de ánimo 4",
    "question": "Siento satisfacción por lo que soy y lo que tengo"
  },
  {
    "category": "Estado de ánimo 4",
    "question": "Estoy contento(a) con quien soy y lo que he logrado"
  },
  {
    "category": "Estado de ánimo 4",
    "question": "Me siento pleno(a) con mi vida y mis logros personales"
  },
  {
    "category": "Estado de ánimo 4",
    "question": "Estoy satisfecho(a) con mi identidad y las cosas que poseo"
  },
  {
    "category": "Estado de ánimo 4",
    "question": "Me siento realizado(a) tanto por lo que soy como por lo que tengo"
  },
  {
    "category": "Resiliencia 1",
    "question": "Soy capaz de manejar las adversidades de manera efectiva"
  },
  {
    "category": "Resiliencia 1",
    "question": "Enfrento las dificultades con eficacia y determinación"
  },
  {
    "category": "Resiliencia 1",
    "question": "Gestiono los problemas de manera adecuada cuando se presentan"
  },
  {
    "category": "Resiliencia 1",
    "question": "Supero los obstáculos con habilidad y confianza"
  },
  {
    "category": "Resiliencia 1",
    "question": "Manejo las situaciones adversas de forma eficiente y controlada"
  },
  {
    "category": "Resiliencia 2",
    "question": "Puedo mantener la calma y la serenidad ante las dificultades"
  },
  {
    "category": "Resiliencia 2",
    "question": "Logro mantenerme tranquilo(a) cuando enfrento desafíos"
  },
  {
    "category": "Resiliencia 2",
    "question": "Conservo la serenidad incluso en momentos difíciles"
  },
  {
    "category": "Resiliencia 2",
    "question": "Soy capaz de mantener la calma bajo presión"
  },
  {
    "category": "Resiliencia 2",
    "question": "Mantengo una actitud tranquila y serena ante situaciones complicadas"
  },
  {
    "category": "Resiliencia 3",
    "question": "Me recupero después de pasar por momentos difíciles"
  },
  {
    "category": "Resiliencia 3",
    "question": "Soy capaz de reponerme después de enfrentar situaciones adversas"
  },
  {
    "category": "Resiliencia 3",
    "question": "Me recupero rápidamente tras atravesar dificultades"
  },
  {
    "category": "Resiliencia 3",
    "question": "Logro restablecerme después de momentos complicados"
  },
  {
    "category": "Resiliencia 3",
    "question": "Me levanto y sigo adelante después de enfrentar desafíos"
  },
  {
    "category": "Resiliencia 4",
    "question": "Veo los desafíos como oportunidades para crecer"
  },
  {
    "category": "Resiliencia 4",
    "question": "Considero los retos como una ocasión para desarrollarme"
  },
  {
    "category": "Resiliencia 4",
    "question": "Entiendo los desafíos como una oportunidad de aprendizaje"
  },
  {
    "category": "Resiliencia 4",
    "question": "Enfrento los problemas como un medio para superarme"
  },
  {
    "category": "Resiliencia 4",
    "question": "Percibo las dificultades como una oportunidad para mejorar"
  },
  {
    "category": "Relaciones sociales 1",
    "question": "Me siento apoyado(a) por mis amigos y familiares"
  },
  {
    "category": "Relaciones sociales 1",
    "question": "Siento el respaldo de mis amigos y familia cuando lo necesito"
  },
  {
    "category": "Relaciones sociales 1",
    "question": "Mis amigos y familiares me ofrecen su apoyo en momentos difíciles"
  },
  {
    "category": "Relaciones sociales 1",
    "question": "Percibo que cuento con el apoyo de mis seres queridos"
  },
  {
    "category": "Relaciones sociales 1",
    "question": "Siento que mis amigos y familia me apoyan constantemente"
  },
  {
    "category": "Relaciones sociales 2",
    "question": "Tengo relaciones cercanas y significativas"
  },
  {
    "category": "Relaciones sociales 2",
    "question": "Mantengo relaciones profundas y valiosas con las personas cercanas a mí"
  },
  {
    "category": "Relaciones sociales 2",
    "question": "Mis relaciones personales son íntimas y significativas"
  },
  {
    "category": "Relaciones sociales 2",
    "question": "Mis lazos con otras personas son cercanos y tienen un gran valor para mí"
  },
  {
    "category": "Relaciones sociales 2",
    "question": "Las relaciones que tengo con las personas más cercanas son importantes y significativas"
  },
  {
    "category": "Relaciones sociales 3",
    "question": "Me siento cómodo(a) compartiendo mis sentimientos con otros"
  },
  {
    "category": "Relaciones sociales 3",
    "question": "Puedo expresar mis emociones libremente con las personas de confianza"
  },
  {
    "category": "Relaciones sociales 3",
    "question": "Me siento a gusto compartiendo lo que siento con los demás"
  },
  {
    "category": "Relaciones sociales 3",
    "question": "Estoy cómodo(a) comunicando mis sentimientos a otras personas"
  },
  {
    "category": "Relaciones sociales 3",
    "question": "No tengo problemas en hablar sobre mis emociones con quienes me rodean"
  },
  {
    "category": "Relaciones sociales 4",
    "question": "Confío en mis amigos y me siento seguro(a) con ellos"
  },
  {
    "category": "Relaciones sociales 4",
    "question": "Tengo confianza en mis amigos y me siento a salvo con ellos"
  },
  {
    "category": "Relaciones sociales 4",
    "question": "Me siento seguro(a) y confiado(a) en la compañía de mis amigos"
  },
  {
    "category": "Relaciones sociales 4",
    "question": "Confío plenamente en mis amigos y me siento protegido(a) con ellos"
  },
  {
    "category": "Relaciones sociales 4",
    "question": "Mis amigos me generan confianza y seguridad"
  },
  {
    "category": "Autopercepción 1",
    "question": "Me siento seguro(a) de mis habilidades y cualidades"
  },
  {
    "category": "Autopercepción 1",
    "question": "Tengo confianza en mis capacidades y fortalezas"
  },
  {
    "category": "Autopercepción 1",
    "question": "Estoy seguro(a) de lo que puedo lograr con mis habilidades"
  },
  {
    "category": "Autopercepción 1",
    "question": "Confío plenamente en mis cualidades y en lo que puedo hacer"
  },
  {
    "category": "Autopercepción 1",
    "question": "Me siento confiado(a) en mis competencias y talentos"
  },
  {
    "category": "Autopercepción 2",
    "question": "Estoy satisfecho(a) con la persona que soy"
  },
  {
    "category": "Autopercepción 2",
    "question": "Me siento contento(a) con quien soy como persona"
  },
  {
    "category": "Autopercepción 2",
    "question": "Estoy feliz con la forma en que soy como individuo"
  },
  {
    "category": "Autopercepción 2",
    "question": "Siento satisfacción con la persona que he llegado a ser"
  },
  {
    "category": "Autopercepción 2",
    "question": "Me encuentro satisfecho(a) con mi forma de ser"
  },
  {
    "category": "Autopercepción 3",
    "question": "Creo que tengo mucho que ofrecer a los demás"
  },
  {
    "category": "Autopercepción 3",
    "question": "Estoy convencido(a) de que puedo aportar mucho a quienes me rodean"
  },
  {
    "category": "Autopercepción 3",
    "question": "Creo que mis habilidades y conocimientos pueden ser útiles para los demás"
  },
  {
    "category": "Autopercepción 3",
    "question": "Tengo la certeza de que puedo contribuir significativamente a otras personas"
  },
  {
    "category": "Autopercepción 3",
    "question": "Siento que tengo mucho que compartir y ofrecer a los demás"
  },
  {
    "category": "Autopercepción 4",
    "question": "Acepto y me amo a mí mismo(a) tal como soy"
  },
  {
    "category": "Autopercepción 4",
    "question": "Me acepto plenamente y me valoro tal como soy"
  },
  {
    "category": "Autopercepción 4",
    "question": "Me quiero y me acepto sin condiciones por quien soy"
  },
  {
    "category": "Autopercepción 4",
    "question": "Me aprecio y acepto todas mis características y cualidades"
  },
  {
    "category": "Autopercepción 4",
    "question": "Me amo y me valoro exactamente como soy, sin reservas"
  },
  {
    "category": "Propósito en la vida 1",
    "question": "Tengo claros mis objetivos y metas en la vida"
  },
  {
    "category": "Propósito en la vida 1",
    "question": "Mis metas y propósitos en la vida están bien definidos"
  },
  {
    "category": "Propósito en la vida 1",
    "question": "Sé con claridad cuáles son mis objetivos y hacia dónde quiero ir"
  },
  {
    "category": "Propósito en la vida 1",
    "question": "Tengo una visión clara de mis metas y lo que quiero alcanzar"
  },
  {
    "category": "Propósito en la vida 1",
    "question": "Mis objetivos en la vida están claramente establecidos para mí"
  },
  {
    "category": "Propósito en la vida 2",
    "question": "Siento que mi vida tiene un sentido y dirección claros"
  },
  {
    "category": "Propósito en la vida 2",
    "question": "Percibo que mi vida sigue una dirección con sentido"
  },
  {
    "category": "Propósito en la vida 2",
    "question": "Mi vida tiene un propósito claro que me guía"
  },
  {
    "category": "Propósito en la vida 2",
    "question": "Siento que tengo una dirección bien definida en mi vida"
  },
  {
    "category": "Propósito en la vida 2",
    "question": "Percibo que mi vida tiene un propósito claro y significativo"
  },
  {
    "category": "Propósito en la vida 3",
    "question": "Creo que estoy contribuyendo a algo más grande que yo"
  },
  {
    "category": "Propósito en la vida 3",
    "question": "Siento que estoy aportando a algo más allá de mis propios intereses"
  },
  {
    "category": "Propósito en la vida 3",
    "question": "Percibo que mi contribución tiene un impacto que va más allá de mí"
  },
  {
    "category": "Propósito en la vida 3",
    "question": "Creo que mi esfuerzo contribuye a un propósito mayor"
  },
  {
    "category": "Propósito en la vida 3",
    "question": "Siento que estoy participando en algo más importante que mis propios objetivos"
  },
  {
    "category": "Propósito en la vida 4",
    "question": "Me siento motivado(a) y comprometido(a) con mis proyectos personales"
  },
  {
    "category": "Propósito en la vida 4",
    "question": "Estoy plenamente motivado(a) y comprometido(a) con mis metas personales"
  },
  {
    "category": "Propósito en la vida 4",
    "question": "Me siento impulsado(a) y comprometido(a) con los proyectos que emprendo"
  },
  {
    "category": "Propósito en la vida 4",
    "question": "Siento una fuerte motivación y dedicación hacia mis objetivos personales"
  },
  {
    "category": "Propósito en la vida 4",
    "question": "Estoy motivado(a) y totalmente involucrado(a) en mis proyectos personales"
  },
  {
    "category": "Autonomía 1",
    "question": "Me siento seguro al momento de tomar mis decisiones"
  },
  {
    "category": "Autonomía 1",
    "question": "Confío plenamente en mi capacidad para tomar decisiones"
  },
  {
    "category": "Autonomía 1",
    "question": "Me siento confiado(a) cuando tomo decisiones importantes"
  },
  {
    "category": "Autonomía 1",
    "question": "Tengo seguridad en mí mismo(a) al tomar decisiones"
  },
  {
    "category": "Autonomía 1",
    "question": "Siento confianza en mis juicios al tomar decisiones"
  },
  {
    "category": "Autonomía 2",
    "question": "Tomo mis propias decisiones sin influencia indebida de otros"
  },
  {
    "category": "Autonomía 2",
    "question": "Tomo decisiones de manera independiente, sin que otros me influyan"
  },
  {
    "category": "Autonomía 2",
    "question": "Mis decisiones son propias y no están condicionadas por la opinión de otros"
  },
  {
    "category": "Autonomía 2",
    "question": "Actúo de manera autónoma al tomar decisiones, sin interferencias externas"
  },
  {
    "category": "Autonomía 2",
    "question": "Mis decisiones reflejan mi propio criterio, sin ser influenciado(a) por los demás"
  },
  {
    "category": "Autonomía 3",
    "question": "Me siento libre para expresar mis opiniones y creencias"
  },
  {
    "category": "Autonomía 3",
    "question": "Tengo la libertad de expresar mis ideas y convicciones sin reservas"
  },
  {
    "category": "Autonomía 3",
    "question": "Siento que puedo compartir mis opiniones y creencias abiertamente"
  },
  {
    "category": "Autonomía 3",
    "question": "Me siento libre de comunicar mis pensamientos y creencias"
  },
  {
    "category": "Autonomía 3",
    "question": "Puedo expresar mis opiniones y valores sin sentirme limitado(a)"
  },
  {
    "category": "Autonomía 4",
    "question": "Tengo confianza en las decisiones que tomo"
  },
  {
    "category": "Autonomía 4",
    "question": "Confío plenamente en las decisiones que tomo para mi vida"
  },
  {
    "category": "Autonomía 4",
    "question": "Estoy seguro(a) de que las decisiones que tomo son las correctas"
  },
  {
    "category": "Autonomía 4",
    "question": "Tengo plena confianza en mi capacidad para tomar buenas decisiones"
  },
  {
    "category": "Autonomía 4",
    "question": "Siento seguridad en cada una de las decisiones que tomo"
  }
]

export default quiz
