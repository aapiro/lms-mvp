# language: es
Característica: Gestión de cursos
  Como usuario del LMS
  Quiero explorar y administrar cursos
  Para ofrecer o consumir contenido educativo

  Antecedentes:
    Dado que el sistema está disponible

  Escenario: Visitante anónimo puede ver cursos publicados
    Dado que existen cursos con estados "PUBLISHED" y "DRAFT"
    Cuando consulto el catálogo de cursos sin autenticación
    Entonces solo veo los cursos con estado "PUBLISHED"

  Escenario: Admin crea un curso
    Dado que estoy autenticado como admin
    Cuando creo un curso con título "Nuevo Curso" y precio 29.99
    Entonces el curso se crea exitosamente
    Y el curso aparece en la lista de cursos

  Escenario: Admin cambia el estado de un curso
    Dado que estoy autenticado como admin
    Y existe un curso en estado "DRAFT"
    Cuando cambio el estado del curso a "PUBLISHED"
    Entonces el curso tiene estado "PUBLISHED"

  Escenario: Detalle del curso incluye lecciones
    Dado que existe un curso publicado con lecciones
    Cuando consulto el detalle del curso
    Entonces veo el título, descripción y lecciones del curso
