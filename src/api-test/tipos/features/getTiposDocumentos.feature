@API @Tipos @Smoke
Feature: GET /tipos/documentos/

  Scenario: Consultar tipos de documentos con token válido
    Given la API v2 está configurada
    When consulto "GET" "/tipos/documentos/"
    Then la respuesta HTTP es 200