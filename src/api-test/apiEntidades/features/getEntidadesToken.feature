@API @Entidades @EntidadesToken
Feature: GET /entidades/token - Entidades asociadas al token (E02)
# =================================================================================
# == Pruebas para el método GET /entidades/token
# =================================================================================

  @RequiereCredenciales
  Scenario: Consultar entidades asociadas al token con token válido
    Given que realizo una petición "GET" a "/entidades/token" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_ENTIDAD_TOKEN"

  @Negativo
  Scenario Outline: Validar "GET" - "/entidades/token" con distintos token
    Given que realizo una petición "GET" a "/entidades/token" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | expirado  |    401 | No autorizado.   |
      | nulo      |    401 | 401 UNAUTHORIZED |
