# Makefile para el backend del LMS
# Usa Java 21 automáticamente en macOS

# Busca Java 21 con java_home de macOS; si no, usa la ruta conocida
JAVA21 := $(shell /usr/libexec/java_home -v 21 2>/dev/null)
ifeq ($(JAVA21),)
  JAVA21 := /Users/usuario/Library/Java/JavaVirtualMachines/ms-21.0.9/Contents/Home
endif

export JAVA_HOME = $(JAVA21)

.PHONY: compile package test clean run

compile:
	mvn clean compile

package:
	mvn clean package -DskipTests

test:
	mvn test

clean:
	mvn clean

# Inicia el backend localmente (requiere PostgreSQL y MinIO corriendo)
run:
	mvn spring-boot:run

