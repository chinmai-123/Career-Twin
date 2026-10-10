$loginBody = @{
    email = "student@careertwin.edu"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5173/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token

$headers = @{
    "Authorization" = "Bearer $token"
}

$twin = Invoke-RestMethod -Uri "http://localhost:5173/api/career-twin" -Method Get -Headers $headers
$twin.data | ConvertTo-Json -Depth 3
