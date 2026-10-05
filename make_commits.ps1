$ErrorActionPreference = "Stop"

function Make-Commit {
    param(
        [string]$Message,
        [string]$Date,
        [string[]]$Files
    )
    
    foreach ($file in $Files) {
        if (Test-Path -Path $file -ErrorAction SilentlyContinue) {
            git add $file
        } else {
            git add $file
        }
    }
    
    $status = git status --porcelain
    if ($status) {
        $env:GIT_AUTHOR_DATE = $Date
        $env:GIT_COMMITTER_DATE = $Date
        git commit -m $Message
    }
}

Make-Commit -Message "feat: initialize backend server architecture" -Date "2026-10-05 01:13:00 +0530" -Files @(
    "online-crime-reporting/backend/package.json",
    "online-crime-reporting/backend/package-lock.json",
    "online-crime-reporting/backend/tsconfig.json",
    "online-crime-reporting/backend/src/server.ts",
    "online-crime-reporting/backend/src/app.ts",
    "online-crime-reporting/backend/.gitignore",
    "online-crime-reporting/backend/.env.example"
)

Make-Commit -Message "feat: configure MongoDB and core configurations" -Date "2026-10-05 01:35:00 +0530" -Files @(
    "online-crime-reporting/backend/src/config/",
    "online-crime-reporting/backend/src/constants/",
    "online-crime-reporting/backend/src/types/response.ts"
)

Make-Commit -Message "feat: configure Mongoose user and profile models" -Date "2026-10-05 01:58:00 +0530" -Files @(
    "online-crime-reporting/backend/src/models/User.ts",
    "online-crime-reporting/backend/src/models/PoliceProfile.ts",
    "online-crime-reporting/backend/src/models/index.ts"
)

Make-Commit -Message "feat: configure Mongoose crime report and evidence models" -Date "2026-10-05 02:22:00 +0530" -Files @(
    "online-crime-reporting/backend/src/models/CrimeReport.ts",
    "online-crime-reporting/backend/src/models/Evidence.ts"
)

Make-Commit -Message "feat: configure Mongoose case management models" -Date "2026-10-05 02:40:00 +0530" -Files @(
    "online-crime-reporting/backend/src/models/CaseAssignment.ts",
    "online-crime-reporting/backend/src/models/CaseStatusHistory.ts",
    "online-crime-reporting/backend/src/models/InvestigationNote.ts"
)

Make-Commit -Message "feat: configure Mongoose notification and audit models" -Date "2026-10-05 03:07:00 +0530" -Files @(
    "online-crime-reporting/backend/src/models/Notification.ts",
    "online-crime-reporting/backend/src/models/AuditLog.ts"
)

Make-Commit -Message "feat: implement JWT utilities and auth middleware" -Date "2026-10-05 03:30:00 +0530" -Files @(
    "online-crime-reporting/backend/src/utils/auth.utils.ts",
    "online-crime-reporting/backend/src/middleware/auth.middleware.ts"
)

Make-Commit -Message "feat: add validation and central error handling middleware" -Date "2026-10-05 03:55:00 +0530" -Files @(
    "online-crime-reporting/backend/src/middleware/error.middleware.ts",
    "online-crime-reporting/backend/src/middleware/validation.middleware.ts",
    "online-crime-reporting/backend/src/validators/"
)

Make-Commit -Message "feat: implement user authentication API" -Date "2026-10-05 04:15:00 +0530" -Files @(
    "online-crime-reporting/backend/src/controllers/auth.controller.ts",
    "online-crime-reporting/backend/src/routes/auth.routes.ts"
)

Make-Commit -Message "feat: add citizen crime reporting APIs" -Date "2026-10-05 04:38:00 +0530" -Files @(
    "online-crime-reporting/backend/src/controllers/citizen.controller.ts",
    "online-crime-reporting/backend/src/routes/citizen.routes.ts"
)

Make-Commit -Message "feat: implement police dashboard APIs" -Date "2026-10-05 05:00:00 +0530" -Files @(
    "online-crime-reporting/backend/src/controllers/police.controller.ts",
    "online-crime-reporting/backend/src/routes/police.routes.ts"
)

Make-Commit -Message "feat: add admin management APIs" -Date "2026-10-05 05:25:00 +0530" -Files @(
    "online-crime-reporting/backend/src/controllers/admin.controller.ts",
    "online-crime-reporting/backend/src/routes/admin.routes.ts"
)

Make-Commit -Message "feat: implement investigation and evidence upload APIs" -Date "2026-10-05 05:48:00 +0530" -Files @(
    "online-crime-reporting/backend/src/controllers/evidence.controller.ts",
    "online-crime-reporting/backend/src/routes/evidence.routes.ts",
    "online-crime-reporting/backend/src/middleware/upload.middleware.ts",
    "online-crime-reporting/backend/uploads/"
)

Make-Commit -Message "feat: add database seeding and health check" -Date "2026-10-05 06:12:00 +0530" -Files @(
    "online-crime-reporting/backend/src/database/",
    "online-crime-reporting/backend/src/routes/health.routes.ts",
    "online-crime-reporting/backend/docs/",
    "online-crime-reporting/docs/"
)

Make-Commit -Message "feat: integrate frontend api client and auth context" -Date "2026-10-05 06:35:00 +0530" -Files @(
    "online-crime-reporting/src/api.js",
    "online-crime-reporting/src/context/AuthContext.jsx",
    "online-crime-reporting/src/main.jsx",
    "online-crime-reporting/package.json",
    "online-crime-reporting/package-lock.json"
)

Make-Commit -Message "feat: update frontend authentication screens" -Date "2026-10-05 06:55:00 +0530" -Files @(
    "online-crime-reporting/src/auth/Login.jsx",
    "online-crime-reporting/src/auth/Register.jsx"
)

Make-Commit -Message "fix: complete backend integration and UI adjustments" -Date "2026-10-05 07:14:00 +0530" -Files @(
    "online-crime-reporting/src/citizen/Profile.jsx",
    "online-crime-reporting/src/citizen/ReportCrime.jsx",
    "online-crime-reporting/src/components/PortalHeader.jsx",
    "online-crime-reporting/src/layouts/AdminLayout.jsx",
    "online-crime-reporting/src/layouts/CitizenLayout.jsx",
    "online-crime-reporting/src/layouts/PoliceLayout.jsx"
)

git add .
$status = git status --porcelain
if ($status) {
    $env:GIT_AUTHOR_DATE = "2026-10-05 07:14:00 +0530"
    $env:GIT_COMMITTER_DATE = "2026-10-05 07:14:00 +0530"
    git commit --amend --no-edit
}
