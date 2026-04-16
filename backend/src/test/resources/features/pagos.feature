# language: es
Característica: Pagos y compras de cursos
  Como estudiante
  Quiero comprar cursos de pago
  Para acceder a su contenido

  Antecedentes:
    Dado que el sistema está disponible

  Escenario: No se puede comprar un curso ya adquirido
    Dado que estoy autenticado como estudiante
    Y ya he comprado un curso
    Cuando intento comprar el mismo curso
    Entonces recibo un error indicando que ya poseo el curso

  Escenario: Bypass de pago en modo desarrollo
    Dado que la configuración "dev_payments" está en "true"
    Y estoy autenticado como estudiante
    Y existe un curso publicado con precio 19.99
    Cuando inicio el checkout del curso
    Entonces se crea una compra con estado "COMPLETED"
