@API @Tipos @TiposVisaciones
Feature: GET /tipos/visaciones/ - Consulta de tipos de visación (E05)
# =================================================================================
# == Pruebas para el método GET /tipos/visaciones/
# =================================================================================

  @RequiereCredenciales
  Scenario: Consultar tipos de visación con token válido
    Given que realizo una petición "GET" a "/tipos/visaciones/" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_TIPO_VISACION"

  @Negativo
  Scenario Outline: Validar "GET" - "/tipos/visaciones/" con distintos token
    Given que realizo una petición "GET" a "/tipos/visaciones/" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | expirado  |    401 | Sesión expirada. |
      | nulo      |    401 | 401 UNAUTHORIZED |
