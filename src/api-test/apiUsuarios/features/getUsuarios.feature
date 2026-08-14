@API @Usuarios @GetUsuarios
Feature: GET /usuarios/ - Consulta de usuarios o destinatarios (E03)
# =================================================================================
# == Pruebas para el método GET /usuarios/ (incluye filtros y paginación)
# =================================================================================

  @RequiereCredenciales
  Scenario: Consultar usuarios con token válido
    Given que realizo una petición "GET" a "/usuarios/" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_USUARIOS"

  @RequiereCredenciales
  Scenario Outline: Consultar usuarios con paginación válida
    Given que preparo una petición "GET" a "/usuarios/" con token "válido"
    And con el parámetro de consulta pageSize fijado a <pageSize>
    And con el parámetro de consulta pageNumber fijado a <pageNumber>
    When ejecuto la petición GET
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_USUARIOS"

    Examples:
      | pageSize | pageNumber |
      |       10 |          1 |
      |        5 |          2 |

  @RequiereCredenciales
  Scenario Outline: Validar "GET" - "/usuarios/" con parámetros inválidos
    Given que preparo una petición "GET" a "/usuarios/" con token "válido"
    And con el parámetro de consulta <campo> fijado a <valor>
    When ejecuto la petición GET
    Then el estado de la respuesta debe ser <status>

    Examples:
      | campo      | valor | status |
      | run        | abc   |    400 |
      | pageSize   | 0     |    400 |
      | pageSize   | abc   |    400 |
      | pageNumber | abc   |    400 |

  @Negativo
  Scenario Outline: Validar "GET" - "/usuarios/" con distintos token
    Given que realizo una petición "GET" a "/usuarios/" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | expirado  |    401 | Sesión expirada. |
      | nulo      |    401 | 401 UNAUTHORIZED |

  @Negativo
  Scenario: Preparar y ejecutar "GET" - "/usuarios/" con parámetros pero sin token
    Given que preparo una petición "GET" a "/usuarios/" con token "nulo"
    And con el parámetro de consulta pageSize fijado a 10
    And con el parámetro de consulta pageNumber fijado a 1
    When ejecuto la petición GET
    Then el estado de la respuesta debe ser 401
    And el cuerpo de la respuesta debe ser el texto "401 UNAUTHORIZED"
