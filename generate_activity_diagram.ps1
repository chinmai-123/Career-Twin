Add-Type -AssemblyName System.Drawing

$width = 3600
$height = 2650
$bmp = [System.Drawing.Bitmap]::new($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::White)

# ----------------- Brushes & Pens -----------------
$penBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(30, 41, 59), 2)
$penSwimlane = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(71, 85, 105), 2.2)
$penArrow = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(15, 23, 42), 2.2)
$penDecision = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(15, 23, 42), 2)
$penModuleTag = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(203, 213, 225), 1.2)

$brushBlack = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushWhite = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$brushActivityBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(248, 250, 252))
$brushHeaderBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(241, 245, 249))
$brushModuleTagBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(241, 245, 249))
$brushText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushMutedText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(71, 85, 105))
$brushBranchText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 58, 138))
$brushModuleText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(71, 85, 105))

# ----------------- Fonts -----------------
$fontTitle = [System.Drawing.Font]::new("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = [System.Drawing.Font]::new("Segoe UI", 13.5, [System.Drawing.FontStyle]::Regular)
$fontLane = [System.Drawing.Font]::new("Segoe UI", 17, [System.Drawing.FontStyle]::Bold)
$fontLaneSub = [System.Drawing.Font]::new("Segoe UI", 10.5, [System.Drawing.FontStyle]::Italic)
$fontActivity = [System.Drawing.Font]::new("Segoe UI", 10.5, [System.Drawing.FontStyle]::Regular)
$fontActivityBold = [System.Drawing.Font]::new("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)
$fontBranch = [System.Drawing.Font]::new("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)
$fontModuleTag = [System.Drawing.Font]::new("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)

$sfCenter = [System.Drawing.StringFormat]::new()
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$sfLeft = [System.Drawing.StringFormat]::new()
$sfLeft.Alignment = [System.Drawing.StringAlignment]::Near
$sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center

# ----------------- Helper Functions -----------------
function Draw-RoundedRectangle($graphics, $pen, $brush, $x, $y, $w, $h, $radius) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $r = $radius * 2
    $path.AddArc($x, $y, $r, $r, 180, 90)
    $path.AddArc($x + $w - $r, $y, $r, $r, 270, 90)
    $path.AddArc($x + $w - $r, $y + $h - $r, $r, $r, 0, 90)
    $path.AddArc($x, $y + $h - $r, $r, $r, 90, 90)
    $path.CloseFigure()
    if ($brush -ne $null) { $graphics.FillPath($brush, $path) }
    if ($pen -ne $null) { $graphics.DrawPath($pen, $path) }
    $path.Dispose()
}

function Draw-Activity($graphics, $x, $y, $w, $h, $text) {
    Draw-RoundedRectangle $graphics $penBorder $brushActivityBg $x $y $w $h 12
    $rect = [System.Drawing.RectangleF]::new($x + 6, $y + 4, $w - 12, $h - 8)
    $graphics.DrawString($text, $fontActivity, $brushText, $rect, $sfCenter)
}

function Draw-Decision($graphics, $x, $y, $w, $h, $text) {
    $pts = @(
        [System.Drawing.PointF]::new($x + ($w / 2), $y),
        [System.Drawing.PointF]::new($x + $w, $y + ($h / 2)),
        [System.Drawing.PointF]::new($x + ($w / 2), $y + $h),
        [System.Drawing.PointF]::new($x, $y + ($h / 2))
    )
    $graphics.FillPolygon($brushWhite, $pts)
    $graphics.DrawPolygon($penDecision, $pts)
    $rect = [System.Drawing.RectangleF]::new($x + 2, $y + 2, $w - 4, $h - 4)
    $graphics.DrawString($text, $fontActivityBold, $brushText, $rect, $sfCenter)
}

function Draw-Arrow($graphics, $x1, $y1, $x2, $y2) {
    $graphics.DrawLine($penArrow, $x1, $y1, $x2, $y2)
    
    $angle = [Math]::Atan2($y2 - $y1, $x2 - $x1)
    $arrowLen = 13
    $arrowAngle = [Math]::PI / 6
    
    $p1 = [System.Drawing.PointF]::new($x2 - $arrowLen * [Math]::Cos($angle - $arrowAngle), $y2 - $arrowLen * [Math]::Sin($angle - $arrowAngle))
    $p2 = [System.Drawing.PointF]::new($x2 - $arrowLen * [Math]::Cos($angle + $arrowAngle), $y2 - $arrowLen * [Math]::Sin($angle + $arrowAngle))
    
    $poly = @([System.Drawing.PointF]::new($x2, $y2), $p1, $p2)
    $graphics.FillPolygon($brushBlack, $poly)
}

function Draw-ArrowPath($graphics, $points) {
    for ($i = 0; $i -lt $points.Count - 1; $i++) {
        $pA = $points[$i]
        $pB = $points[$i+1]
        if ($i -eq $points.Count - 2) {
            Draw-Arrow $graphics $pA.X $pA.Y $pB.X $pB.Y
        } else {
            $graphics.DrawLine($penArrow, $pA.X, $pA.Y, $pB.X, $pB.Y)
        }
    }
}

function Draw-ModuleHeader($graphics, $y, $label) {
    Draw-RoundedRectangle $graphics $penModuleTag $brushModuleTagBg 75 $y 170 24 6
    $rect = [System.Drawing.RectangleF]::new(78, $y + 2, 164, 20)
    $graphics.DrawString($label, $fontModuleTag, $brushModuleText, $rect, $sfCenter)
}

# ----------------- 1. Draw Title Header -----------------
$titleRect = [System.Drawing.RectangleF]::new(60, 20, $width - 120, 52)
$g.DrawString("UML ACTIVITY DIAGRAM - COMPLETE SYSTEM WORKFLOW", $fontTitle, $brushText, $titleRect, $sfCenter)
$subRect = [System.Drawing.RectangleF]::new(60, 78, $width - 120, 30)
$g.DrawString("Project Title: AI Career Twin: An AI-Powered Placement Readiness and Career Guidance Platform | B.Tech Academic Project", $fontSubtitle, $brushMutedText, $subRect, $sfCenter)

# ----------------- 2. Define Swimlanes -----------------
$laneStartY = 125
$laneHeaderH = 70
$laneBodyH = 2430
$laneEndY = $laneStartY + $laneHeaderH + $laneBodyH

$lanes = @(
    @{ Name = "Student"; Sub = "(Actor / End User)"; W = 630; X = 60 },
    @{ Name = "React Native Mobile App"; Sub = "(Frontend Presentation Tier)"; W = 710; X = 690 },
    @{ Name = "Spring Boot Backend"; Sub = "(Business Logic & Controllers)"; W = 750; X = 1400 },
    @{ Name = "MySQL Database"; Sub = "(Persistence & Relational Storage)"; W = 670; X = 2150 },
    @{ Name = "Gemini AI Service"; Sub = "(External AI & LLM Engine)"; W = 720; X = 2820 }
)

# Outer boundary box
$g.DrawRectangle($penSwimlane, 60, $laneStartY, $width - 120, $laneHeaderH + $laneBodyH)

foreach ($l in $lanes) {
    $g.FillRectangle($brushHeaderBg, $l.X, $laneStartY, $l.W, $laneHeaderH)
    $g.DrawRectangle($penSwimlane, $l.X, $laneStartY, $l.W, $laneHeaderH)
    
    $tRect = [System.Drawing.RectangleF]::new($l.X, $laneStartY + 9, $l.W, 30)
    $g.DrawString($l.Name, $fontLane, $brushText, $tRect, $sfCenter)
    $sRect = [System.Drawing.RectangleF]::new($l.X, $laneStartY + 41, $l.W, 20)
    $g.DrawString($l.Sub, $fontLaneSub, $brushMutedText, $sRect, $sfCenter)
    
    $g.DrawLine($penSwimlane, $l.X, $laneStartY, $l.X, $laneEndY)
}
$g.DrawLine($penSwimlane, 60 + ($width - 120), $laneStartY, 60 + ($width - 120), $laneEndY)


# ==================== MODULE 1: Student Authentication ====================
Draw-ModuleHeader $g 205 "1. AUTHENTICATION"

# Initial Node (Filled black circle)
$initX = 375; $initY = 230
$g.FillEllipse($brushBlack, $initX - 17, $initY - 17, 34, 34)

# Activity 1.1: Open App
Draw-Activity $g 240 270 270 58 "Open CareerTwin Mobile App"
Draw-Arrow $g $initX ($initY + 17) 375 270

# Activity 1.2: Display Auth Screen
Draw-Activity $g 910 270 270 58 "Display Welcome & Authentication Screen"
Draw-Arrow $g 510 299 910 299

# Decision 1.1: New User?
Draw-Decision $g 305 365 140 55 "New User?"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(1045, 328),
    [System.Drawing.PointF]::new(1045, 392),
    [System.Drawing.PointF]::new(445, 392)
)

# Branch Yes -> Register
$g.DrawString("[Yes / Register]", $fontBranch, $brushBranchText, 385, 425)
Draw-Activity $g 240 455 270 65 "Enter Registration Details`n(Name, College, Branch, Role)"
Draw-Arrow $g 375 420 375 455

Draw-Activity $g 910 455 270 65 "Transmit Registration Request`n(POST /api/auth/register)"
Draw-Arrow $g 510 487 910 487

Draw-Activity $g 1630 455 290 65 "Validate Registration Data &`nHash Password with BCrypt"
Draw-Arrow $g 1180 487 1630 487

Draw-Activity $g 2340 455 280 65 "Store Student Record in`n'users' Table in MySQL"
Draw-Arrow $g 1920 487 2340 487

# Branch No -> Login
$g.DrawString("[No / Login]", $fontBranch, $brushBranchText, 140, 370)
Draw-Activity $g 85 455 145 65 "Enter Login Info`n(Email & Password)"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(305, 392),
    [System.Drawing.PointF]::new(157, 392),
    [System.Drawing.PointF]::new(157, 455)
)

Draw-Activity $g 910 545 270 65 "Submit Login Request`n(POST /api/auth/login)"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(157, 520),
    [System.Drawing.PointF]::new(157, 577),
    [System.Drawing.PointF]::new(910, 577)
)

# Merge from DB insert to login auth flow
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 520),
    [System.Drawing.PointF]::new(2480, 577),
    [System.Drawing.PointF]::new(1920, 577)
)

Draw-Activity $g 1630 545 290 65 "Authenticate Student via`nSpring Security DaoProvider"

# Decision 1.2: Valid Credentials?
Draw-Decision $g 1705 640 140 55 "Valid?"
Draw-Arrow $g 1775 610 1775 640

# Invalid Credentials loop
$g.DrawString("[No / Invalid]", $fontBranch, $brushBranchText, 1530, 645)
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(1705, 667),
    [System.Drawing.PointF]::new(1045, 667),
    [System.Drawing.PointF]::new(1045, 610)
)

# Valid Credentials
$g.DrawString("[Yes / Valid]", $fontBranch, $brushBranchText, 1785, 700)
Draw-Activity $g 1630 730 290 65 "Generate Signed JWT Token &`nAssemble User Principal DTO"
Draw-Arrow $g 1775 695 1775 730

Draw-Activity $g 910 730 270 65 "Store JWT in SecureStorage &`nInitialize Global User State"
Draw-Arrow $g 1630 762 1180 762

Draw-Activity $g 240 730 270 65 "Navigate to Student Dashboard`n& Display Active Career Twin"
Draw-Arrow $g 910 762 510 762


# ==================== MODULE 2: Career Goal Selection ====================
Draw-ModuleHeader $g 808 "2. CAREER GOAL"

Draw-Activity $g 240 835 270 65 "Select Desired Career Goal`n(SDE, AI Eng, Cloud, Data)"
Draw-Arrow $g 375 795 375 835

Draw-Activity $g 910 835 270 65 "Send Career Goal Request`n(POST /api/career-goal)"
Draw-Arrow $g 510 867 910 867

Draw-Activity $g 1630 835 290 65 "Process Career Goal & Map`nCore Role Technical Competencies"
Draw-Arrow $g 1180 867 1630 867

Draw-Activity $g 2340 835 280 65 "Persist Career Goal & Required`nSkills in 'career_goals' Table"
Draw-Arrow $g 1920 867 2340 867


# ==================== MODULE 3: Resume Management & ATS Analysis ====================
Draw-ModuleHeader $g 915 "3. RESUME & ATS"

Draw-Activity $g 240 940 270 65 "Upload Resume Document`nin PDF Format"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 900),
    [System.Drawing.PointF]::new(2480, 920),
    [System.Drawing.PointF]::new(375, 920),
    [System.Drawing.PointF]::new(375, 940)
)

Draw-Decision $g 975 940 140 55 "PDF Valid?"
Draw-Arrow $g 510 972 975 972

# Invalid PDF loop
$g.DrawString("[No / Invalid]", $fontBranch, $brushBranchText, 1005, 1000)
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(1045, 995),
    [System.Drawing.PointF]::new(1045, 1020),
    [System.Drawing.PointF]::new(375, 1020),
    [System.Drawing.PointF]::new(375, 1005)
)

# Valid PDF
$g.DrawString("[Yes / Valid]", $fontBranch, $brushBranchText, 1125, 950)
Draw-Activity $g 1630 940 290 65 "Extract Raw Text from PDF`nvia Apache PDFBox"
Draw-Arrow $g 1115 967 1630 967

Draw-Activity $g 3030 940 290 65 "Analyze Resume via Gemini API:`nSkills, Education, Projects & Exp"
Draw-Arrow $g 1920 972 3030 972

Draw-Activity $g 1630 1040 290 68 "Calculate ATS Score, Keyword Density`n& Identify Missing Industry Skills"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(3175, 1005),
    [System.Drawing.PointF]::new(3175, 1074),
    [System.Drawing.PointF]::new(1920, 1074)
)

Draw-Activity $g 2340 1040 280 68 "Save Resume Versions, ATS Score`n& Extracted Skills to MySQL"
Draw-Arrow $g 1920 1074 2340 1074

Draw-Activity $g 910 1040 270 68 "Render ATS Score Gauge (0-100%)`n& Highlight Improvement Checklist"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 1108),
    [System.Drawing.PointF]::new(2480, 1130),
    [System.Drawing.PointF]::new(1045, 1130),
    [System.Drawing.PointF]::new(1045, 1108)
)


# ==================== MODULE 4: Coding Profile Integration ====================
Draw-ModuleHeader $g 1135 "4. CODING PROFILES"

Draw-Activity $g 240 1160 270 65 "Provide Coding Profile Handles`n(GitHub, LeetCode, CodeChef, GFG)"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(1045, 1108),
    [System.Drawing.PointF]::new(1045, 1145),
    [System.Drawing.PointF]::new(375, 1145),
    [System.Drawing.PointF]::new(375, 1160)
)

Draw-Activity $g 910 1160 270 65 "Transmit Coding Profile Handles`n(POST /api/coding-profile)"
Draw-Arrow $g 510 1192 910 1192

Draw-Activity $g 1630 1160 290 68 "Retrieve Public Platform APIs, Evaluate`nRepo Activity & Problems Solved"
Draw-Arrow $g 1180 1192 1630 1192

Draw-Activity $g 2340 1160 280 68 "Store Solved Counts, Badges &`nDSA Metrics in 'coding_profiles'"
Draw-Arrow $g 1920 1194 2340 1194


# ==================== MODULE 5: Skill Verification ====================
Draw-ModuleHeader $g 1245 "5. SKILL VERIFICATION"

Draw-Activity $g 240 1270 270 65 "Select Skill & Difficulty Tier`n(Adaptive, Easy, Medium, Hard)"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 1228),
    [System.Drawing.PointF]::new(2480, 1250),
    [System.Drawing.PointF]::new(375, 1250),
    [System.Drawing.PointF]::new(375, 1270)
)

Draw-Activity $g 240 1360 270 65 "Attempt Skill Assessment`n(MCQ & Interactive Coding)"
Draw-Arrow $g 375 1335 375 1360

Draw-Activity $g 910 1360 270 65 "Package Answers & Code Solution`n(POST /api/assessments/submit)"
Draw-Arrow $g 510 1392 910 1392

Draw-Activity $g 1630 1360 290 65 "Evaluate Submissions, Run Test`nCases & Compute Proficiency %"
Draw-Arrow $g 1180 1392 1630 1392

Draw-Activity $g 2340 1360 280 65 "Record Assessment Results &`nUpdate Verified Competencies"
Draw-Arrow $g 1920 1392 2340 1392


# ==================== MODULE 6: AI Career Twin Engine ====================
Draw-ModuleHeader $g 1445 "6. CAREER TWIN ENGINE"

Draw-Activity $g 1630 1465 290 68 "Collect Student Profile, Resume ATS,`nCoding Progress & Verified Skills"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 1425),
    [System.Drawing.PointF]::new(2480, 1445),
    [System.Drawing.PointF]::new(1775, 1445),
    [System.Drawing.PointF]::new(1775, 1465)
)

Draw-Activity $g 1630 1560 290 68 "Execute AI Career Twin Engine:`nCompare Skills vs Target Goal Matrix"
Draw-Arrow $g 1775 1533 1775 1560

Draw-Activity $g 1630 1655 290 68 "Synthesize Skill Gap Vectors & Compute`nDeterministic Placement Readiness Score"
Draw-Arrow $g 1775 1628 1775 1655

Draw-Activity $g 2340 1655 280 68 "Save Career Twin Snapshot &`nReadiness Score in 'career_twins'"
Draw-Arrow $g 1920 1689 2340 1689


# ==================== MODULE 7: AI Career Guidance ====================
Draw-ModuleHeader $g 1745 "7. AI GUIDANCE"

Draw-Activity $g 1630 1765 290 65 "Assemble Candidate Context Prompt`nwith Missing Skill Gaps"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 1723),
    [System.Drawing.PointF]::new(2480, 1745),
    [System.Drawing.PointF]::new(1775, 1745),
    [System.Drawing.PointF]::new(1775, 1765)
)

Draw-Activity $g 3030 1765 290 65 "Generate Tailored Career Advice,`nLearning Paths & Curated Resources"
Draw-Arrow $g 1920 1797 3030 1797

Draw-Activity $g 1630 1860 290 65 "Parse Gemini Roadmap Milestones`n& Actionable Next Steps"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(3175, 1830),
    [System.Drawing.PointF]::new(3175, 1892),
    [System.Drawing.PointF]::new(1920, 1892)
)

Draw-Activity $g 2340 1860 280 65 "Persist AI Guidance Recommendations`n& Roadmap Steps in Database"
Draw-Arrow $g 1920 1892 2340 1892


# ==================== MODULE 8: Progress Tracking & Reports ====================
Draw-ModuleHeader $g 1945 "8. PROGRESS & REPORTS"

Draw-Activity $g 910 1965 270 70 "Push Live Readiness Score (0-100%),`nGap Analysis & Recommendations"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(2480, 1925),
    [System.Drawing.PointF]::new(2480, 1945),
    [System.Drawing.PointF]::new(1045, 1945),
    [System.Drawing.PointF]::new(1045, 1965)
)

Draw-Activity $g 240 1965 270 70 "Display Career Readiness Dashboard`n& Recommended Next Milestones"
Draw-Arrow $g 910 2000 510 2000

Draw-Activity $g 240 2065 270 65 "Follow Recommended Learning Activities`n& Practice Coding Challenges"
Draw-Arrow $g 375 2035 375 2065

Draw-Decision $g 295 2155 160 55 "New Progress?"
Draw-Arrow $g 375 2130 375 2155

# Branch Yes -> Loop to Assessment & Twin update
$g.DrawString("[Yes: New Skill / Coding]", $fontBranch, $brushBranchText, 465, 2165)
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(455, 2182),
    [System.Drawing.PointF]::new(550, 2182),
    [System.Drawing.PointF]::new(550, 1392),
    [System.Drawing.PointF]::new(510, 1392)
)

# Branch No -> Request Final Report
$g.DrawString("[No / Final Review]", $fontBranch, $brushBranchText, 385, 2220)
Draw-Activity $g 240 2250 270 65 "Request Formal Placement`nEvaluation Report"
Draw-Arrow $g 375 2210 375 2250

Draw-Activity $g 910 2250 270 65 "Send Report Generation Request`n(GET /api/reports/student)"
Draw-Arrow $g 510 2282 910 2282

Draw-Activity $g 1630 2250 290 65 "Synthesize Comprehensive Placement`nEvaluation Summary (ATS, Coding, Twin)"
Draw-Arrow $g 1180 2282 1630 2282

Draw-Activity $g 240 2365 270 65 "View, Print & Download Placement`nEvaluation Report for Viva / TPO"
Draw-ArrowPath $g @(
    [System.Drawing.PointF]::new(1775, 2315),
    [System.Drawing.PointF]::new(1775, 2397),
    [System.Drawing.PointF]::new(510, 2397)
)

# ==================== MODULE 9: End ====================
Draw-ModuleHeader $g 2450 "9. FINAL NODE"

# Activity Final Node (Bullseye: outer circle + filled inner circle)
$finalX = 375; $finalY = 2500
$g.DrawEllipse($penBorder, $finalX - 18, $finalY - 18, 36, 36)
$g.FillEllipse($brushBlack, $finalX - 11, $finalY - 11, 22, 22)
Draw-Arrow $g 375 2430 375 ($finalY - 18)

# ----------------- Save to Project -----------------
$targetPath = "C:\Users\chinm\.gemini\antigravity\scratch\CareerTwin\activity_diagram.png"
$bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)

$docsPath = "C:\Users\chinm\.gemini\antigravity\scratch\CareerTwin\docs\activity_diagram.png"
$bmp.Save($docsPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully generated polished 4K UML Activity Diagram at $targetPath and $docsPath"
