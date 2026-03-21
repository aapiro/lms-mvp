# 🔴 CRÍTICO - Problema de Compras Duplicadas SOLUCIONADO

## El Problema que Reportaste

**Síntoma:** 
- ✓ Todos los cursos aparecen como "Owned" en la lista
- ✗ En tu perfil no hay cursos asignados
- ✗ No apareces como estudiante en ningún curso

## La Causa Raíz

La migración **V17** que creamos para dar compras gratis tenía una **condición SQL incorrecta**:

```sql
-- ❌ INCORRECTO (V17 original)
WHERE c.price = 0 OR c.price IS NULL
```

**Problema:** Si un curso tiene `price = NULL` (no fue establecido), la condición lo marcaba como "gratis"

**Resultado:** Como TODOS los cursos tienen `price = NULL`, se crearon compras para **TODOS los cursos para TODOS los usuarios**

```sql
-- Esto creaba:
INSERT INTO purchases (user_id, course_id, amount) 
  VALUES (user_id_X, ALL_COURSE_IDS, 0.00)  -- ❌ MALO
```

## Las Soluciones

### 1. ✅ Migración V17 CORREGIDA
```sql
WHERE c.price = 0::DECIMAL AND c.price IS NOT NULL
```

Ahora SOLO crea compras para cursos con `price = 0.00` explícitamente

### 2. ✅ Migración V18 NUEVA
Limpia las compras incorrectas que se generaron antes de la corrección:

```sql
DELETE FROM purchases
WHERE amount = 0.00 
  AND course_id IN (SELECT id FROM courses WHERE price != 0 OR price IS NULL)
```

## Qué Hacer Ahora

### Si YA ejecutaste la BD anterior:

1. **El backend hará automáticamente:**
   - V18 se ejecutará automáticamente en el siguiente deploy
   - Eliminará todas las compras `amount = 0.00` de cursos con `price != 0`
   - Dejarás de ver todos los cursos como "Owned"

2. **Verificar en la BD:**
   ```sql
   -- Ver cuántas compras incorrectas se limpiarán
   SELECT COUNT(*) FROM purchases 
   WHERE amount = 0.00 
   AND course_id IN (SELECT id FROM courses WHERE price != 0);
   ```

### Para Bases de Datos Nuevas:

- V17 (corregida) y V18 se ejecutarán correctamente desde el principio
- Solo los cursos realmente gratis (`price = 0.00`) tendrán compras automáticas

## Archivos Modificados

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `V17__fix_free_course_enrollments.sql` | ✅ CORREGIDA | Condición mejorada para precio = 0 |
| `V18__cleanup_incorrect_enrollments.sql` | ✅ NUEVA | Elimina compras incorrectas |
| `CourseService.java` | ✅ OK | Backend ya no marca gratis automáticamente |

## Resultado Final

Después de estas correcciones:

- ✅ Ves solo cursos que realmente compraste
- ✅ Los cursos gratis tienen compras legítimas (precio 0)
- ✅ Tu perfil muestra los cursos correctos
- ✅ Admin muestra estudiantes correctos por curso

---

**Estado:** 🔧 EN REPARACIÓN  
**Próximo Deploy:** Será necesario ejecutar las migraciones V17 (corregida) y V18  
**Impacto:** Restaurará la vista correcta de cursos "Owned"

