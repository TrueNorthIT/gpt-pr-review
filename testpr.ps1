[CmdletBinding(SupportsShouldProcess = $true)]
param (
    $prurl
)
$body = @{ 
    resource  = @{ 
        url = $prurl
    }
}

$JsonBody = $body | ConvertTo-Json -Depth 10

Invoke-RestMethod -uri "http://localhost:7071/api/pr" -Method POST -Body $JsonBody -ContentType "application/json" 