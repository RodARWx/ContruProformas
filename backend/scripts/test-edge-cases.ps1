# Pruebas de casos extremos (edge cases) - Construproformas API V2
# Uso: .\scripts\test-edge-cases.ps1
# Requisito: servidor en http://localhost:3000 (npm run start:dev)

$ErrorActionPreference = "Continue"

$base = "http://localhost:3000/api"
$headers = @{ "X-API-KEY" = "construproformas-dev-key" }
$passed = 0
$failed = 0

function Test-EdgeCase {
    param(
        [string]$Code,
        [string]$Name,
        [scriptblock]$Action
    )
    Write-Host ""
    Write-Host "[$Code] $Name" -ForegroundColor Cyan
    try {
        & $Action
        Write-Host "  OK" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "  FALLO: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        $script:failed++
    }
}

function Assert-StatusCode {
    param(
        [scriptblock]$Call,
        [int]$ExpectedStatus
    )
    try {
        & $Call
        throw "Se esperaba HTTP $ExpectedStatus pero la peticion tuvo exito"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -ne $ExpectedStatus) {
            throw "Se esperaba HTTP $ExpectedStatus, obtuvo $status"
        }
    }
}

Write-Host "Construproformas - Edge cases V2" -ForegroundColor White
Write-Host "Base: $base"

$script:edgeId = "CM-EDGE-" + (Get-Date -Format "HHmmss")

Test-EdgeCase "E2" "Crear proforma borrador de prueba" {
    $next = Invoke-RestMethod -Uri "$base/proformas/next-id" -Headers $headers
    $script:edgeId = $next.suggestedId
    $body = @{
        idProforma     = $script:edgeId
        nombreProyecto = "Prueba edge case"
        fecha          = (Get-Date -Format "yyyy-MM-dd")
        profileId      = 1
        customerId     = 1
        detalles       = @(
            @{
                descripcion    = "Rubro prueba"
                unidad         = "u"
                cantidad       = 1
                costoUnitario  = 10
                diasLaborables = 1
                ivaPercentage  = 15
            }
        )
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Uri "$base/proformas" -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
}

Test-EdgeCase "E1/E2" "Segundo POST con mismo ID debe ser 409" {
    $body = @{
        idProforma     = $script:edgeId
        nombreProyecto = "Duplicado"
        fecha          = (Get-Date -Format "yyyy-MM-dd")
        profileId      = 1
        customerId     = 1
        detalles       = @(
            @{
                descripcion    = "Otro rubro"
                unidad         = "u"
                cantidad       = 1
                costoUnitario  = 5
                diasLaborables = 1
                ivaPercentage  = 15
            }
        )
    } | ConvertTo-Json -Depth 5
    Assert-StatusCode {
        Invoke-RestMethod -Uri "$base/proformas" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    } -ExpectedStatus 409
}

Test-EdgeCase "E17" "Soft delete (enviar a papelera)" {
    Invoke-RestMethod -Uri "$base/proformas/$($script:edgeId)" -Method Delete -Headers $headers | Out-Null
}

Test-EdgeCase "E4" "Crear con ID en papelera debe ser 409" {
    $body = @{
        idProforma     = $script:edgeId
        nombreProyecto = "Reintento papelera"
        fecha          = (Get-Date -Format "yyyy-MM-dd")
        profileId      = 1
        customerId     = 1
        detalles       = @(
            @{
                descripcion    = "Rubro"
                unidad         = "u"
                cantidad       = 1
                costoUnitario  = 1
                diasLaborables = 1
                ivaPercentage  = 15
            }
        )
    } | ConvertTo-Json -Depth 5
    Assert-StatusCode {
        Invoke-RestMethod -Uri "$base/proformas" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    } -ExpectedStatus 409
}

Test-EdgeCase "E16" "DELETE trash sobre activa (otro ID) debe ser 404" {
    $next2 = Invoke-RestMethod -Uri "$base/proformas/next-id" -Headers $headers
    $activeId = $next2.suggestedId
    $body = @{
        idProforma     = $activeId
        nombreProyecto = "Activa para E16"
        fecha          = (Get-Date -Format "yyyy-MM-dd")
        profileId      = 1
        customerId     = 1
        detalles       = @(
            @{
                descripcion    = "Rubro"
                unidad         = "u"
                cantidad       = 1
                costoUnitario  = 1
                diasLaborables = 1
                ivaPercentage  = 15
            }
        )
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Uri "$base/proformas" -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
    Assert-StatusCode {
        Invoke-RestMethod -Uri "$base/proformas/trash/$activeId" -Method Delete -Headers $headers
    } -ExpectedStatus 404
    Invoke-RestMethod -Uri "$base/proformas/$activeId" -Method Delete -Headers $headers | Out-Null
}

Test-EdgeCase "E15/E5" "Eliminar permanentemente desde papelera" {
    Invoke-RestMethod -Uri "$base/proformas/trash/$($script:edgeId)" -Method Delete -Headers $headers | Out-Null
    $trash = Invoke-RestMethod -Uri "$base/proformas/trash" -Headers $headers
    if ($trash | Where-Object { $_.idProforma -eq $script:edgeId }) {
        throw "La proforma sigue en papelera"
    }
}

Test-EdgeCase "E5" "Tras hard delete, crear de nuevo con mismo ID" {
    $body = @{
        idProforma     = $script:edgeId
        nombreProyecto = "Reutilizado tras hard delete"
        fecha          = (Get-Date -Format "yyyy-MM-dd")
        profileId      = 1
        customerId     = 1
        detalles       = @(
            @{
                descripcion    = "Rubro"
                unidad         = "u"
                cantidad       = 1
                costoUnitario  = 1
                diasLaborables = 1
                ivaPercentage  = 15
            }
        )
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Uri "$base/proformas" -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Uri "$base/proformas/$($script:edgeId)" -Method Delete -Headers $headers | Out-Null
    Invoke-RestMethod -Uri "$base/proformas/trash/$($script:edgeId)" -Method Delete -Headers $headers | Out-Null
}

Test-EdgeCase "E8" "No eliminar categoria con rubros (409)" {
    $cats = Invoke-RestMethod -Uri "$base/categories" -Headers $headers
    $withRubros = $cats | Where-Object { $_.rubros -and $_.rubros.Count -gt 0 } | Select-Object -First 1
    if (-not $withRubros) {
        Write-Host "  (omitido: no hay categorias con rubros)" -ForegroundColor DarkYellow
        return
    }
    $nombre = [uri]::EscapeDataString($withRubros.nombre)
    Assert-StatusCode {
        Invoke-RestMethod -Uri "$base/categories/$nombre" -Method Delete -Headers $headers
    } -ExpectedStatus 409
}

Test-EdgeCase "E7" "Busqueda de clientes con limite" {
    $searchUri = $base + '/customers/search?q=a&limit=10'
    $r = Invoke-RestMethod -Uri $searchUri -Headers $headers
    if ($r.Count -gt 10) {
        throw "Se devolvieron mas de 10 clientes"
    }
}

Write-Host ""
$summaryColor = "Green"
if ($failed -gt 0) {
    $summaryColor = "Red"
}
Write-Host "Resumen: $passed OK, $failed FALLOS" -ForegroundColor $summaryColor
if ($failed -gt 0) {
    exit 1
}
