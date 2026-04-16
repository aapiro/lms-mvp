# language: es
Característica: Autenticación de usuarios
  Como visitante del LMS
  Quiero registrarme e iniciar sesión
  Para acceder a los cursos y mi contenido personalizado

  Antecedentes:
    Dado que el sistema está disponible

  Escenario: Registro exitoso de un nuevo estudiante
    Cuando me registro con email "nuevo@test.com", contraseña "SecurePass1" y nombre "Juan Pérez"
    Entonces recibo un token JWT válido
    Y mi rol es "STUDENT"

  Escenario: Registro con email duplicado falla
    Dado que existe un usuario con email "existente@test.com"
    Cuando me registro con email "existente@test.com", contraseña "SecurePass1" y nombre "Otro"
    Entonces recibo un error 400

  Escenario: Login exitoso con credenciales válidas
    Dado que existe un usuario con email "login@test.com" y contraseña "Password123"
    Cuando inicio sesión con email "login@test.com" y contraseña "Password123"
    Entonces recibo un token JWT válido

  Escenario: Login con contraseña incorrecta
    Dado que existe un usuario con email "login2@test.com" y contraseña "Password123"
    Cuando inicio sesión con email "login2@test.com" y contraseña "WrongPass"
    Entonces recibo un error 401

  Escenario: Acceso a ruta protegida sin token
    Cuando accedo a "/api/users/me" sin token de autenticación
    Entonces recibo un error 401
