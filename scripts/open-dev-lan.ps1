# Abre los puertos del dev server en el firewall de Windows (perfil Privado).
# Ejecutar como administrador: npm run dev:lan
param(
  [int]$WebPort = $(if ($env:VITE_DEV_PORT) { [int]$env:VITE_DEV_PORT } else { 5173 }),
  [int]$ApiPort = $(if ($env:ADMIN_PORT) { [int]$env:ADMIN_PORT } else { 3080 })
)

$ErrorActionPreference = 'Stop'

function Ensure-FirewallRule {
  param(
    [string]$Name,
    [int]$Port
  )

  $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Regla existente: $Name (puerto $Port)"
    return
  }

  New-NetFirewallRule `
    -DisplayName $Name `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $Port `
    -Profile Private | Out-Null

  Write-Host "Regla creada: $Name (puerto $Port, perfil Privado)"
}

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
  Write-Host 'Este script necesita PowerShell como administrador para abrir el firewall.'
  Write-Host 'Vuelve a ejecutar: npm run dev:lan'
  exit 1
}

Ensure-FirewallRule -Name 'HaiStore Vite Dev' -Port $WebPort
Ensure-FirewallRule -Name 'HaiStore API Dev' -Port $ApiPort

Write-Host ''
Write-Host 'Firewall listo. Arranca la app con: npm run dev:all'
Write-Host 'Usa la URL Network que muestra Vite, por ejemplo:'
Write-Host "  http://192.168.x.x:$WebPort"
