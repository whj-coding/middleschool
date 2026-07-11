param([string]$OutputPath = "apps/student-web/public/images/content/linear-kb-concept.png")

Add-Type -AssemblyName System.Drawing

$bitmap = [System.Drawing.Bitmap]::new(960, 540)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::White)
$axisPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(38, 52, 73), 3)
$linePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(37, 99, 235), 5)
$pointBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 38, 38))
$textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38, 52, 73))
$font = [System.Drawing.Font]::new("Arial", 20)
$originX = 180
$originY = 430
$scaleX = 110
$scaleY = 70

$graphics.DrawLine($axisPen, 80, $originY, 900, $originY)
$graphics.DrawLine($axisPen, $originX, 490, $originX, 45)
$graphics.DrawString("x", $font, $textBrush, 900, 435)
$graphics.DrawString("y", $font, $textBrush, 145, 35)

function Convert-ToPoint([double]$x, [double]$y) {
  [System.Drawing.PointF]::new($originX + $x * $scaleX, $originY - $y * $scaleY)
}

$start = Convert-ToPoint -2 1
$end = Convert-ToPoint 6 5
$graphics.DrawLine($linePen, $start, $end)
$p1 = Convert-ToPoint 0 2
$p2 = Convert-ToPoint 4 4
$graphics.FillEllipse($pointBrush, $p1.X - 7, $p1.Y - 7, 14, 14)
$graphics.FillEllipse($pointBrush, $p2.X - 7, $p2.Y - 7, 14, 14)
$graphics.DrawString("(0, 2)", $font, $textBrush, $p1.X + 12, $p1.Y - 32)
$graphics.DrawString("(4, 4)", $font, $textBrush, $p2.X + 12, $p2.Y + 8)
$graphics.DrawString("y = 0.5x + 2", $font, $textBrush, 650, 55)

$absolute = [System.IO.Path]::GetFullPath($OutputPath)
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($absolute)) | Out-Null
$bitmap.Save($absolute, [System.Drawing.Imaging.ImageFormat]::Png)

$font.Dispose()
$textBrush.Dispose()
$pointBrush.Dispose()
$linePen.Dispose()
$axisPen.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
