# 腾讯云 CloudBase 部署脚本
# 使用方法：.\deploy-tencent.ps1

Write-Host "🚀 开始部署到腾讯云 CloudBase..." -ForegroundColor Cyan

# 1. 构建项目（使用腾讯云专用配置）
Write-Host "`n📦 构建项目（根路径模式）..." -ForegroundColor Yellow
npm run build:tencent

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}

# 2. 部署到腾讯云
Write-Host "`n☁️  上传到腾讯云..." -ForegroundColor Yellow
cloudbase hosting:deploy .\dist -e dst-9g4km5dgd9c765aa

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 部署成功！" -ForegroundColor Green
    Write-Host "🔗 访问链接: https://dst-9g4km5dgd9c765aa-1314600911.tcloudbaseapp.com" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 部署失败！" -ForegroundColor Red
    exit 1
}
