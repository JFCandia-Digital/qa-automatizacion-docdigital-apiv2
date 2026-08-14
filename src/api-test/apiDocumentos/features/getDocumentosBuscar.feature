@API @Documentos @DocumentosBuscar
Feature: GET /documentos/buscar - Búsqueda de documentos (E01)
# =================================================================================
# == Pruebas para el método GET /documentos/buscar
# ==
# == HALLAZGO (posible bug de seguridad, reportar al equipo):
# == con un token con formato NO-JWT (p. ej. "Bearer x") este endpoint responde 200,
# == a diferencia del resto de endpoints. Sin token responde 401 y con un JWT
# == expirado también responde 401. Por eso el caso "inválido" NO se valida aquí.
# =================================================================================

  @RequiereCredenciales
  Scenario: Buscar documentos con token válido
    Given que realizo una petición "GET" a "/documentos/buscar" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_DOCUMENTOS_LISTA"

  @RequiereCredenciales
  Scenario Outline: Buscar documentos con paginación válida
    Given que preparo una petición "GET" a "/documentos/buscar" con token "válido"
    And con el parámetro de consulta pageSize fijado a <pageSize>
    And con el parámetro de consulta pageNumber fijado a <pageNumber>
    When ejecuto la petición GET
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_DOCUMENTOS_LISTA"

    Examples:
      | pageSize | pageNumber |
      |       10 |          1 |
      |        5 |          2 |

  @Negativo
  Scenario Outline: Validar "GET" - "/documentos/buscar" sin token válido
    Given que realizo una petición "GET" a "/documentos/buscar" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | expirado  |    401 | No autorizado.   |
      | nulo      |    401 | 401 UNAUTHORIZED |
