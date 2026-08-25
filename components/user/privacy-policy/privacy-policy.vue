<script setup lang="ts">
const sections = [
  { id: 'responsable', label: 'I. Responsable' },
  { id: 'datos-al-tratamiento', label: 'II. Datos al tratamiento' },
  { id: 'del-usuario', label: 'III. Del usuario' },
  { id: 'del-objetivo', label: 'IV. Del objetivo' },
  { id: 'politica-proteccion', label: 'V. Política de protección de datos' },
  { id: 'modificacion-aviso', label: 'VI. Modificación al aviso' },
  { id: 'derechos-arco', label: 'VII. Derechos ARCO' },
  { id: 'politica-cookies', label: 'VIII. Política de cookies' },
  { id: 'aceptacion-cookies', label: 'IX. Aceptación de cookies' },
  { id: 'aceptacion-consentimiento', label: 'X. Aceptación y consentimiento' },
  { id: 'contacto', label: 'XI. Contacto' },
]

function print() {
  window.print()
}
</script>

<template>
  <div class="privacy">
    <header class="privacy__header">
      <span class="privacy__eyebrow">Legal</span>
      <div class="privacy__header-row">
        <h1 class="privacy__title">Aviso de privacidad</h1>
        <button type="button" class="privacy__print-button" @click="print">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 11 5 5 5-5" />
            <path d="M4 20h16" />
          </svg>
          Imprimir / Guardar PDF
        </button>
      </div>
    </header>

    <div class="privacy__layout">
      <aside class="privacy__nav">
        <span class="privacy__nav-title">Texto completo</span>
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="privacy__nav-link"
        >
          {{ section.label }}
        </a>

        <div class="privacy__nav-contact">
          <span class="privacy__nav-contact-title">¿Dudas?</span>
          <span class="privacy__nav-contact-text">
            Escríbenos a
            <strong>contacto@bienestarkairos.com</strong>
          </span>
        </div>
      </aside>

      <div class="privacy__content">
        <article id="responsable" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">1</span>
            <h2 class="privacy__section-title">I. Responsable</h2>
          </div>
          <p class="privacy__text">
            En el presente aviso de privacidad, se establece los términos y
            condiciones que se le dará a sus datos personales, a fin de dar
            cumplimiento a lo establecido en la Ley Federal de Protección de
            Datos Personales en Posesión de los Particulares y su Reglamento y
            los Lineamientos del Aviso de Privacidad, por parte de la
            colaboración de Joint Venture denominado FARMER CENTER, en cuál
            las personas morales SOLUCIONES INTEGRALES ADMINISTRATIVAS Y
            TÉCNICAS, S.A. DE C.V. (en adelante SIATSA), con domicilio ubicado
            en Avenida Insurgentes Sur 2376-301, Tizapán San Ángel, C.P. 01070
            Álvaro Obregón, CDMX, México, y Euro Fármacos EIR S.A. de C.V. (en
            adelante Euro Fármacos EIR) con domicilio ubicado en Anillo
            Periférico Adolfo López Mateos 4293, Piso 3, Int. 300, Colonia
            Jardines en la Montaña, C.P. 14210 Tlalpan CDMX, México, hace de
            su conocimiento que tratará con la más completa confidencialidad
            los datos personales y datos personales sensibles que recibe de
            conformidad con sus políticas internas y con las disposiciones
            legales aplicables.
          </p>
          <p class="privacy__text">
            Le informamos que la titularidad de la página web
            https://bienestarkairos.com/ es propiedad del proyecto denominado
            FARMER CENTER.
          </p>
          <p class="privacy__text">
            El acceso y/o uso de la página web le atribuye la condición de
            usuario (en adelante “Usuario”), e implica la aceptación, desde
            dicho acceso y/o uso, del presente Aviso de Privacidad.
          </p>
          <p class="privacy__text">
            El presente Aviso de Privacidad regula el acceso y el uso al
            servicio (en adelante, el “Servicio”) que FARMER CENTER pone a
            disposición del Usuario interesado en los servicios y contenidos
            en la página web.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="datos-al-tratamiento" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">2</span>
            <h2 class="privacy__section-title">II. Datos al tratamiento</h2>
          </div>
          <p class="privacy__text">
            Los Datos Personales que serán utilizados para los fines de
            llevar a cabo los servicios contratados son:
          </p>
          <h3 class="privacy__subtitle">A. Datos personales:</h3>
          <ul class="privacy__list">
            <li>Datos de identificación para fines de registro de usuario</li>
            <li>Datos de contacto</li>
            <li>Edad</li>
            <li>Datos laborales</li>
            <li>Datos académicos</li>
            <li>Datos de demográficos</li>
            <li>Datos socioeconómicos</li>
            <li>Estadísticas de usuario</li>
          </ul>
          <h3 class="privacy__subtitle">B. Datos personales sensibles:</h3>
          <p class="privacy__text">
            Datos relacionados con la salud y bienestar personal o de su
            representado, y datos socioeconómicos, en su caso.
          </p>
          <p class="privacy__text">
            Los Datos Personales y Datos Personales Sensibles, recabados o
            que se recaben y/o se generen serán utilizados únicamente para
            cumplir el objeto del servicio contratado relacionado con el
            análisis de bienestar mental de las personas.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="del-usuario" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">3</span>
            <h2 class="privacy__section-title">III. Del usuario</h2>
          </div>
          <p class="privacy__text">
            El Usuario garantiza que los datos personales facilitados son
            veraces y se hace responsable de comunicarse con nosotros,
            cualquier modificación de estos. El Usuario responderá, en
            cualquier caso, de la veracidad de los datos facilitados,
            reservándose Euro Fármacos EIR, el derecho a excluir de los
            Servicios registrados a todo Usuario que haya facilitado datos
            falsos, sin perjuicio de las demás acciones que procedan en
            derecho.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="del-objetivo" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">4</span>
            <h2 class="privacy__section-title">IV. Del objetivo</h2>
          </div>
          <p class="privacy__text">
            El tratamiento que se le dará a sus datos personales tendrá como
            finalidad, en general, hacer posible el desarrollo integral del
            servicio contratado relacionado con el análisis de bienestar
            mental de las personas.
          </p>
          <p class="privacy__text">
            Los referidos Datos Personales y Datos Personales Sensibles, se
            tratarán para todos los fines vinculados con el servicio
            contratado por parte del Usuario. Cualquier tratamiento que
            FARMER CENTER realice de sus Datos Personales deberá encontrar
            justificación razonable en dicha finalidad general.
          </p>
          <p class="privacy__text">
            Además, los Datos Personales podrán ser utilizados para
            contactar al Usuario, realizar análisis y monitoreo, dar
            retroalimentación del estado de bienestar al Usuario,
            administración y para realizar encuestas de calidad de servicio y
            estudios de efectividad de los productos de FARMER CENTER para el
            mejoramiento de los mismos.
          </p>
          <p class="privacy__text">
            FARMER CENTER únicamente recaba datos personales de los usuarios
            de su página web, bajo el propio consentimiento de los mismos.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="politica-proteccion" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">5</span>
            <h2 class="privacy__section-title">
              V. Política de protección de datos personales
            </h2>
          </div>
          <p class="privacy__text">
            De conformidad con lo establecido en la Ley Federal de Protección
            de Datos Personales en Posesión de Particulares, FARMER CENTER se
            compromete a adoptar las medidas necesarias para asegurar la
            privacidad de los datos personales recabados de forma que se
            garantice su seguridad, se evite su alteración, pérdida o
            tratamiento no autorizado.
          </p>
          <p class="privacy__text">
            Además, a afecto de dar cumplimiento a lo establecido en la Ley
            federal de Protección de Datos Personales en Posesión de
            Particulares, todo dato que sea recabo a través de la página web,
            será tratado de conformidad con los principios de licitud,
            calidad, finalidad, lealtad y responsabilidad. Todo tratamiento
            de datos personales quedará sujeto al consentimiento del Usuario.
          </p>
          <p class="privacy__text">
            FARMER CENTER hace de su conocimiento que no venderá ni utilizará
            con fines comerciales los Datos Personales y Datos Sensibles
            recabados que sean identificables.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="modificacion-aviso" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">6</span>
            <h2 class="privacy__section-title">
              VI. Modificación en el aviso de privacidad
            </h2>
          </div>
          <p class="privacy__text">
            FARMER CENTER se reserva el derecho de revisar su Aviso de
            Privacidad en el momento que considere oportuno. El responsable
            estará obligado a poner a disposición de los titulares un nuevo
            aviso de privacidad, de conformidad con lo que establece la Ley,
            su Reglamento y los Lineamientos, cuando el responsable:
          </p>
          <ul class="privacy__list">
            <li>Cambie su identidad</li>
            <li>
              Requiera recabar datos personales sensibles, patrimoniales o
              financieros adicionales a aquéllos informados en el aviso de
              privacidad original, cuando los mismos no se obtengan de manera
              personal o directa del titular y se requiera el consentimiento
            </li>
            <li>
              Cambie las finalidades que dieron origen o son necesarias para
              la relación jurídica entre el responsable y el titular; o
              bien, se incorporen nuevas que requieran del consentimiento del
              titular
            </li>
            <li>
              Modifique las condiciones de las transferencias o se vayan a
              realizar transferencias no previstas inicialmente, y el
              consentimiento del titular sea necesario
            </li>
          </ul>
          <p class="privacy__text">
            Por esta razón, le rogamos que compruebe de forma regular este
            Aviso de Privacidad para leer la versión más reciente de la
            misma.
          </p>
          <p class="privacy__text">
            No obstante, cualquier cambio en este aviso de privacidad, le
            será comunicado por los medios que sean razonables, así como la
            página web, durante su vigencia de operación.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="derechos-arco" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">7</span>
            <h2 class="privacy__section-title">
              VII. Ejercicio de derechos ARCO, revocación del consentimiento
              y limitación del uso y divulgación de datos personales
            </h2>
          </div>
          <p class="privacy__text">
            Le informamos que Usted puede ejercer en todo momento los
            derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
            referente al tratamiento que FARMER CENTER dé a sus Datos.
          </p>
          <p class="privacy__text">
            Para presentar la solicitud Usted deberá presentar la solicitud
            en original, ya sea por correo postal, mensajería o entregarla
            directamente en el domicilio señalado en este Aviso de
            Privacidad; o enviar la solicitud firmado y escaneado por correo
            electrónico a contacto@bienestarkairos.com
          </p>
          <p class="privacy__text">
            El plazo para que se atienda su solicitud empezará a computarse a
            partir del día en que su solicitud haya sido recibida por FARMER
            CENTER, y estará indicada en el acuse (medios físicos), o por
            correo electrónico de confirmación de recibido.
          </p>
          <p class="privacy__text">
            El plazo señalado se interrumpirá en caso de que FARMER CENTER
            requiera información adicional para poder responder su solicitud.
            Esto se le informará dentro de los cinco días siguientes a aquel
            de la recepción de su solicitud, así mismo usted contará con diez
            días para atender el requerimiento, contados a partir del día
            siguiente en que lo haya recibido. De no dar respuesta en dicho
            plazo, se tendrá por no presentada la solicitud correspondiente.
          </p>
          <p class="privacy__text">
            FARMER CENTER comunicará la respuesta al titular de los derechos
            o a su representante si aplica, en un plazo máximo de 20 días
            hábiles contados a partir de la fecha en que FARMER CENTER
            recibió la solicitud, o la contestación del requerimiento de
            información. En caso de que la solicitud resulte procedente,
            FARMER CENTER deberá hacerla efectiva dentro de los quince días
            siguientes a la fecha en que se comunica la respuesta. De ser
            necesario, FARMER CENTER podrá ampliar dichos plazos para dar
            contestación por un periodo igual de tiempo, situación que le
            será informada.
          </p>
          <p class="privacy__text">
            La obligación de Acceso se dará por cumplida cuando FARMER CENTER
            ponga a su disposición los datos personales solicitados, a través
            del medio que haya señalado en el formato antes referido. Para la
            Rectificación de sus datos personales, deberá indicar en la
            solicitud, qué datos personales desea rectificar, así como la
            corrección que desea realizar, además de acompañar la
            documentación que sustente dicho cambio. La Cancelación de sus
            datos personales procederá respecto de la totalidad de los datos
            o sólo parte de ellos, según nos lo indique y podrá oponerse al
            tratamiento de sus datos cuando exista causa legítima y su
            situación específica así lo requiera, lo cual deberá justificar
            en la solicitud, FARMER CENTER no podrá proceder al ejercicio de
            oposición en aquellos casos en los que el tratamiento sea
            necesario para el cumplimiento de una obligación legal con
            usted. Se entenderá que su solicitud de Derechos ARCO fue
            debidamente atendida al momento de emitir la respuesta.
          </p>
          <p class="privacy__text">
            Usted puede revocar el consentimiento que, en su caso, nos haya
            otorgado para el tratamiento de sus datos personales; sin
            embargo, es importante que tenga en cuenta que no en todos los
            casos podremos atender su solicitud o concluir el uso de forma
            inmediata, ya que es posible que por alguna obligación legal
            requiramos seguir tratando sus datos personales. Asimismo, usted
            deberá considerar que para ciertos fines, la revocación de su
            consentimiento implicará que no le podamos seguir prestando el
            servicio relativo al servicio que contrató o la conclusión de su
            relación con nosotros.
          </p>
          <p class="privacy__text">
            La revocación del consentimiento, deberán realizarse por medio de
            escrito libre el cual debe contener: nombre completo, domicilio o
            correo electrónico, para poder notificarle la respuesta,
            anexando los documentos que acrediten su identificación; si se
            realiza mediante un representante legal, deberá acreditar dicha
            representación. Deberá indicar en el escrito la descripción
            clara y precisa de los datos personales respecto de los que
            desea revocar su consentimiento.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="politica-cookies" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">8</span>
            <h2 class="privacy__section-title">VIII. Política de cookies</h2>
          </div>
          <p class="privacy__text">
            Cuando usted utiliza o navega en nuestra página web, podemos
            almacenar cookies en su navegador web. Esta información se
            manejará de manera disociada (es decir, sin que se identifique
            personalmente al Usuario) para realizar investigaciones de
            mercado y análisis propios, así como para nuestros socios de
            negocios, además con objeto de mejorar la calidad, fiabilidad y
            rendimiento de la aplicación, así como para fines comerciales.
          </p>
          <p class="privacy__text">
            Las cookies son archivos o ficheros que se descargan en el
            ordenador/smartphone/tablet del Usuario al acceder a
            determinadas páginas web y aplicaciones que permiten almacenar
            preferencias de la navegación del Usuario, haciendo que la
            interacción entre el Usuario y el sitio web sea más rápida y
            fácil.
          </p>
          <p class="privacy__text">
            Las Cookies sirven para muchos propósitos, pueden ayudar en un
            sitio web a recordar tus preferencias, aprender que áreas del
            sitio web son más útiles y qué áreas necesitan mejoras, además
            de proporcionarte anuncios dirigidos o contenido personalizado. A
            veces, las cookies se habilitan cuando se integran píxeles en un
            sitio web. Los píxeles permiten a los sitios web leer y colocar
            las cookies.
          </p>
          <p class="privacy__text">
            La información recogida por las Cookies es anónima y no contiene
            ninguna información sensible y que no recogen datos que puedan
            identificar personalmente al Usuario. En cualquier caso, el
            Usuario podrá acedar a la configuración de su navegador para
            modificar y/o bloquear la instalación de las Cookies enviadas
            desde el sitio web, sin que ello impida al acceso a los
            contenidos.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="aceptacion-cookies" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">9</span>
            <h2 class="privacy__section-title">IX. Aceptación de cookies</h2>
          </div>
          <p class="privacy__text">
            De acuerdo a la información antes compartida, nuestro navegador
            web permiten elegir si usted acepta o no Cookies y también
            permiten eliminarlas una vez almacenadas. El presente sitio web
            no instala nuestra Cookies en los dispositivos de los Usuarios
            hasta que estos hayan aceptado la instalación de éstas.
          </p>
          <p class="privacy__text">
            Le informamos que en el caso de no aceptar la instalación de
            Cookies o de deshabilitar alguna de estas en la configuración, es
            posible que ciertos servicios no estén disponibles sin la
            utilización de estas o que no pueda acceder a determinados
            servicios ni tampoco aprovechar por completo todo lo que este
            sitio web le ofrece.
          </p>
          <p class="privacy__text">
            Por medio del presente aviso y, en cualquier caso, mediante la
            introducción voluntaria de cualesquiera datos de carácter
            personal en cualquier formulario electrónico u hoja de captación
            facilitada en la Web o en la aplicación móvil, ya sea tanto el
            proceso de registro como durante el Uso de la aplicación en los
            términos expuestos por la presente cláusula, los cuales resultan
            necesarios para la tramitación y gestión de su solicitud de
            servicio o información, el Usuario otorga su consentimiento y
            acepta el tratamiento de sus datos, consecuencia de la consulta,
            solicitud o contratación de cualquier servicio, o de cualquier
            operación realizada, al objeto de acceder a la información y a
            los servicios facilitados por FARMER CENTER, a través de la
            página Web y, en su caso, para el mantenimiento de la relación
            contractual.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="aceptacion-consentimiento" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">10</span>
            <h2 class="privacy__section-title">
              X. Aceptación y consentimiento
            </h2>
          </div>
          <p class="privacy__text">
            El Usuario declara haber sido informado de las condiciones sobre
            protección de datos personales, aceptando y consintiendo el
            tratamiento de estos por parte de FARMER CENTER, en la forma y
            para las finalidades indicadas en la presente Aviso de
            Privacidad.
          </p>
        </article>

        <div class="privacy__divider" />

        <article id="contacto" class="privacy__section">
          <div class="privacy__section-header">
            <span class="privacy__section-badge">11</span>
            <h2 class="privacy__section-title">XI. Contacto</h2>
          </div>
          <p class="privacy__text">
            Para FARMER CENTER el mantener la confidencialidad de sus datos
            es muy importante. Por eso en caso de tener alguna duda en
            relación al contenido, interpretación o alcance de este Aviso de
            Privacidad, así como sobre el tratamiento de sus datos
            personales, o en el caso de que desee formular una queja en
            relación con el sitio (o su Contenido), podrá ponerse en
            contacto con nosotros al correo electrónico:
            contacto@bienestarkairos.com
          </p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.privacy__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.privacy__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
}

.privacy__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.privacy__title {
  margin: 2px 0 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.privacy__print-button {
  flex-shrink: 0;
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid #dde8ea;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0e2a36;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.privacy__print-button:hover {
  border-color: #07979f;
  color: #07979f;
}

.privacy__layout {
  display: grid;
  grid-template-columns: 268px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.privacy__nav {
  position: sticky;
  top: 20px;
  background: #fff;
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.privacy__nav-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
  padding: 0 12px 8px;
}

.privacy__nav-link {
  padding: 10px 12px;
  border-radius: 12px;
  color: #31474f;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  line-height: 1.4;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.privacy__nav-link:hover {
  background: #f4f8f9;
  color: #065c5d;
}

.privacy__nav-contact {
  margin-top: 10px;
  padding: 14px;
  border-radius: 16px;
  background: #f4f8f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.privacy__nav-contact-title {
  font-size: 13px;
  font-weight: 800;
}

.privacy__nav-contact-text {
  font-size: 13px;
  line-height: 1.5;
  color: #4b5f68;
}

.privacy__nav-contact-text strong {
  font-weight: 700;
  color: #065c5d;
}

.privacy__content {
  background: #fff;
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.privacy__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 90px;
}

.privacy__section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.privacy__section-badge {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #f4f8f9;
  color: #5f767e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.privacy__section-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.privacy__subtitle {
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 800;
}

.privacy__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #31474f;
}

.privacy__list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 15px;
  line-height: 1.7;
  color: #31474f;
}

.privacy__divider {
  height: 1px;
  background: #eef4f5;
}

@media (max-width: 1180px) {
  .privacy__layout {
    grid-template-columns: 1fr;
  }

  .privacy__nav {
    position: static;
  }
}

@media (max-width: 720px) {
  .privacy {
    padding: 20px 18px 40px;
  }

  .privacy__content {
    padding: 22px 18px;
  }
}
</style>
