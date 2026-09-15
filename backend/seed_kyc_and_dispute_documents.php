<?php
/**
 * Wunabuy KYC & Dispute Document Asset Seeder
 *
 * Generates high-resolution, legible sample documents and evidence photos
 * (CNI Front, CNI Back, Storefront, Business Registration RCCM, Driver's License,
 * Vehicle Insurance, and Damage Evidence) and updates PostgreSQL KYC & Dispute records.
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Dispute;
use Illuminate\Support\Facades\DB;

echo "========================================================\n";
echo "  WUNABUY KYC & DISPUTE DOCUMENT GRAPHIC GENERATOR     \n";
echo "========================================================\n\n";

$kycDir = __DIR__ . '/public/uploads/kyc';
$dispDir = __DIR__ . '/public/uploads/disputes';

if (!is_dir($kycDir)) mkdir($kycDir, 0755, true);
if (!is_dir($dispDir)) mkdir($dispDir, 0755, true);

function saveDualFormats($img, string $basePath): string
{
    $webpPath = $basePath . '.webp';
    $jpgPath = $basePath . '.jpg';

    imagewebp($img, $webpPath, 88);

    $w = imagesx($img);
    $h = imagesy($img);
    $jpgCanvas = imagecreatetruecolor($w, $h);
    imagecopy($jpgCanvas, $img, 0, 0, 0, 0, $w, $h);
    imagejpeg($jpgCanvas, $jpgPath, 88);

    imagedestroy($img);
    imagedestroy($jpgCanvas);

    return str_replace('\\', '/', str_replace(__DIR__ . '/public', '', $webpPath));
}

// 1. Generate Cameroon National ID (CNI) Front
function generateCniFront(string $path, string $name, string $cniNum): string
{
    $w = 800;
    $h = 500;
    $img = imagecreatetruecolor($w, $h);

    // Cameroon CNI background: light mint/cyan guilloche styling
    $bgTop = [224, 242, 254];
    $bgBot = [204, 251, 241];
    for ($y = 0; $y < $h; $y++) {
        $f = $y / $h;
        $col = imagecolorallocate($img,
            (int)($bgTop[0] + ($bgBot[0] - $bgTop[0]) * $f),
            (int)($bgTop[1] + ($bgBot[1] - $bgTop[1]) * $f),
            (int)($bgTop[2] + ($bgBot[2] - $bgTop[2]) * $f)
        );
        imageline($img, 0, $y, $w, $y, $col);
    }

    // Border
    $darkTeal = imagecolorallocate($img, 13, 148, 136);
    $slate900 = imagecolorallocate($img, 15, 23, 42);
    $slate600 = imagecolorallocate($img, 71, 85, 105);
    $gold = imagecolorallocate($img, 180, 83, 9);
    $red = imagecolorallocate($img, 225, 29, 72);
    $white = imagecolorallocate($img, 255, 255, 255);

    imagerectangle($img, 12, 12, $w - 12, $h - 12, $darkTeal);
    imagerectangle($img, 14, 14, $w - 14, $h - 14, $darkTeal);

    // Header Header
    imagestring($img, 4, 30, 26, "REPUBLIQUE DU CAMEROUN", $darkTeal);
    imagestring($img, 4, 530, 26, "REPUBLIC OF CAMEROON", $darkTeal);
    imagestring($img, 3, 30, 48, "Paix - Travail - Patrie", $slate600);
    imagestring($img, 3, 530, 48, "Peace - Work - Fatherland", $slate600);

    // Title Banner
    imagefilledrectangle($img, 24, 75, $w - 24, 110, $darkTeal);
    imagestring($img, 5, 150, 85, "CARTE NATIONALE D'IDENTITE / NATIONAL IDENTITY CARD", $white);

    // Photo Box
    imagefilledrectangle($img, 40, 130, 210, 350, $slate900);
    imagerectangle($img, 38, 128, 212, 352, $gold);
    // Silhouette
    $silColor = imagecolorallocate($img, 203, 213, 225);
    imagefilledellipse($img, 125, 200, 75, 85, $silColor);
    imagefilledellipse($img, 125, 300, 130, 110, $silColor);
    imagestring($img, 3, 70, 325, "OFFICIAL PHOTO", $darkTeal);

    // Credentials Fields
    $leftX = 240;
    imagestring($img, 3, $leftX, 135, "NOM / SURNAME:", $slate600);
    imagestring($img, 5, $leftX, 155, strtoupper($name), $slate900);

    imagestring($img, 3, $leftX, 190, "PRENOM / GIVEN NAMES:", $slate600);
    imagestring($img, 5, $leftX, 210, "VERIFIED CITIZEN", $slate900);

    imagestring($img, 3, $leftX, 245, "DATE & LIEU DE NAISSANCE / DATE & PLACE OF BIRTH:", $slate600);
    imagestring($img, 4, $leftX, 265, "14/08/1994 - DOUALA (LITTORAL)", $slate900);

    imagestring($img, 3, $leftX, 300, "NUMERO IDENTIFIANT UNIQUE / CNI NUMBER:", $slate600);
    imagestring($img, 5, $leftX, 320, $cniNum, $red);

    imagestring($img, 3, $leftX, 355, "DATE D'EXPIRATION / DATE OF EXPIRY:", $slate600);
    imagestring($img, 4, $leftX, 375, "28/09/2032 (VALID COMPLIANT)", $darkTeal);

    // Hologram Seal Watermark
    imagefilledellipse($img, (int)($w * 0.82), 240, 110, 110, imagecolorallocatealpha($img, 251, 191, 36, 95));
    imagestring($img, 4, (int)($w * 0.77), 232, "* DGSN *", $gold);

    // Bottom MRZ lines
    imagefilledrectangle($img, 24, 430, $w - 24, 480, $slate900);
    imagestring($img, 4, 40, 440, "IDCAM{$cniNum}<<<<<<<<<<<<<<<<<<<<<<0", $white);
    imagestring($img, 4, 40, 460, "9408146M3209287CMR<<<<<<<<<<<<<<<4", $white);

    return saveDualFormats($img, $path);
}

// 2. Generate Cameroon National ID (CNI) Back
function generateCniBack(string $path, string $cniNum, string $address): string
{
    $w = 800;
    $h = 500;
    $img = imagecreatetruecolor($w, $h);

    $bgTop = [241, 245, 249];
    $bgBot = [226, 232, 240];
    for ($y = 0; $y < $h; $y++) {
        $f = $y / $h;
        $col = imagecolorallocate($img,
            (int)($bgTop[0] + ($bgBot[0] - $bgTop[0]) * $f),
            (int)($bgTop[1] + ($bgBot[1] - $bgTop[1]) * $f),
            (int)($bgTop[2] + ($bgBot[2] - $bgTop[2]) * $f)
        );
        imageline($img, 0, $y, $w, $y, $col);
    }

    $darkTeal = imagecolorallocate($img, 13, 148, 136);
    $slate900 = imagecolorallocate($img, 15, 23, 42);
    $slate600 = imagecolorallocate($img, 71, 85, 105);
    $white = imagecolorallocate($img, 255, 255, 255);

    imagerectangle($img, 12, 12, $w - 12, $h - 12, $darkTeal);

    imagestring($img, 4, 40, 30, "DELEGATION GENERALE A LA SURETE NATIONALE", $darkTeal);
    imagestring($img, 3, 40, 50, "GENERAL DELEGATION FOR NATIONAL SECURITY", $slate600);

    // Biometric Thumbprint
    imagefilledrectangle($img, 40, 90, 190, 270, $white);
    imagerectangle($img, 38, 88, 192, 272, $darkTeal);
    for ($r = 15; $r < 65; $r += 6) {
        imageellipse($img, 115, 180, $r * 2, (int)($r * 2.4), $darkTeal);
    }
    imagestring($img, 3, 55, 280, "EMPREINTE / THUMBPRINT", $slate600);

    // Details
    $leftX = 220;
    imagestring($img, 3, $leftX, 100, "ADRESSE RESIDENTIELLE / RESIDENCE:", $slate600);
    imagestring($img, 4, $leftX, 120, $address, $slate900);

    imagestring($img, 3, $leftX, 160, "PROFESSION / OCCUPATION:", $slate600);
    imagestring($img, 4, $leftX, 180, "COMMERCANT INDEPENDANT / MERCHANT", $slate900);

    imagestring($img, 3, $leftX, 220, "POSTE D'IDENTIFICATION / ISSUING POST:", $slate600);
    imagestring($img, 4, $leftX, 240, "CE68 DOUALA - BONANJO", $slate900);

    // Official Stamp
    imagefilledellipse($img, 650, 180, 120, 120, imagecolorallocatealpha($img, 13, 148, 136, 100));
    imagestring($img, 4, 605, 172, "DGSN DOUALA", $darkTeal);

    // Large 2D Barcode Block
    imagefilledrectangle($img, 40, 320, $w - 40, 460, $slate900);
    imagestring($img, 4, 60, 380, "BARCODE // SECURE ENCRYPTED CHIP SIGNATURE // CNI #{$cniNum}", $white);

    return saveDualFormats($img, $path);
}

// 3. Generate Physical Storefront Photo
function generateStorefrontPhoto(string $path, string $storeName, string $quarter): string
{
    $w = 800;
    $h = 550;
    $img = imagecreatetruecolor($w, $h);

    // Realistic outdoor shop building facade gradient
    $cTop = [30, 41, 59];
    $cBot = [15, 23, 42];
    for ($y = 0; $y < $h; $y++) {
        $f = $y / $h;
        $col = imagecolorallocate($img,
            (int)($cTop[0] + ($cBot[0] - $cTop[0]) * $f),
            (int)($cTop[1] + ($cBot[1] - $cTop[1]) * $f),
            (int)($cTop[2] + ($cBot[2] - $cTop[2]) * $f)
        );
        imageline($img, 0, $y, $w, $y, $col);
    }

    $teal = imagecolorallocate($img, 13, 148, 136);
    $emerald = imagecolorallocate($img, 16, 185, 129);
    $white = imagecolorallocate($img, 255, 255, 255);
    $gold = imagecolorallocate($img, 251, 191, 36);
    $gray = imagecolorallocate($img, 148, 163, 184);

    // Storefront Signboard
    imagefilledrectangle($img, 60, 40, $w - 60, 140, $teal);
    imagerectangle($img, 58, 38, $w - 58, 142, $gold);
    imagestring($img, 5, 90, 60, strtoupper($storeName), $white);
    imagestring($img, 4, 90, 95, "OFFICIAL VERIFIED RETAILER • {$quarter}, CAMEROON", $gold);

    // Display Glass Windows
    imagefilledrectangle($img, 80, 170, 360, 420, imagecolorallocate($img, 51, 65, 85));
    imagerectangle($img, 80, 170, 360, 420, $gray);
    imagestring($img, 4, 110, 280, "[ SHOWROOM DISPLAY ]", $teal);
    imagestring($img, 3, 110, 310, "Smartphones, Audio & Tech", $gray);

    // Entrance Glass Door
    imagefilledrectangle($img, 420, 170, 720, 480, imagecolorallocate($img, 71, 85, 105));
    imagerectangle($img, 420, 170, 720, 480, $teal);
    imagestring($img, 4, 480, 300, "CUSTOMER ENTRANCE", $white);
    imagestring($img, 3, 500, 330, "Open: 08:00 - 18:30", $gold);

    // GPS & Physical Verification Stamp
    imagefilledrectangle($img, 60, 480, $w - 60, 530, imagecolorallocate($img, 15, 23, 42));
    imagestring($img, 4, 80, 498, "LOCATION VERIFIED: {$quarter} (Lat: 4.0510, Lng: 9.7678)", $emerald);

    return saveDualFormats($img, $path);
}

// 4. Generate Business Registration Certificate (RCCM)
function generateBusinessReg(string $path, string $storeName, string $rccmNum): string
{
    $w = 800;
    $h = 600;
    $img = imagecreatetruecolor($w, $h);

    $white = imagecolorallocate($img, 255, 255, 255);
    $offWhite = imagecolorallocate($img, 254, 252, 232);
    $navy = imagecolorallocate($img, 30, 41, 59);
    $slate = imagecolorallocate($img, 100, 116, 139);
    $maroon = imagecolorallocate($img, 159, 18, 57);
    $gold = imagecolorallocate($img, 180, 83, 9);

    imagefilledrectangle($img, 0, 0, $w, $h, $offWhite);

    // Double Border
    imagerectangle($img, 20, 20, $w - 20, $h - 20, $maroon);
    imagerectangle($img, 24, 24, $w - 24, $h - 24, $gold);

    // Header
    imagestring($img, 4, 200, 45, "REPUBLIQUE DU CAMEROUN - PAIX-TRAVAIL-PATRIE", $maroon);
    imagestring($img, 3, 220, 70, "TRIBUNAL DE PREMIERE INSTANCE DE DOUALA - BONANJO", $slate);
    imagestring($img, 3, 260, 90, "GREFFE DU COMMERCE / TRADE REGISTRY", $slate);

    // Main Certificate Header
    imagestring($img, 5, 140, 135, "CERTIFICAT D'IMMATRICULATION AU RCCM", $maroon);
    imagestring($img, 4, 230, 160, "(OHADA COMMERCIAL REGISTER CERTIFICATE)", $gold);

    // Body Fields
    $y = 210;
    imagestring($img, 4, 60, $y, "NUMERO DU REGISTRE (RCCM):", $slate);
    imagestring($img, 5, 340, $y, $rccmNum, $navy);

    $y += 45;
    imagestring($img, 4, 60, $y, "RAISON SOCIALE / STORE NAME:", $slate);
    imagestring($img, 5, 340, $y, strtoupper($storeName), $maroon);

    $y += 45;
    imagestring($img, 4, 60, $y, "FORME JURIDIQUE / LEGAL FORM:", $slate);
    imagestring($img, 4, 340, $y, "ETABLISSEMENT COMMERCIAL (PERSONNE PHYSIQUE)", $navy);

    $y += 45;
    imagestring($img, 4, 60, $y, "NUMERO IDENTIFIANT FISCAL (NIU):", $slate);
    imagestring($img, 5, 340, $y, "M" . rand(100000000, 999999999) . "A", $navy);

    $y += 45;
    imagestring($img, 4, 60, $y, "ACTIVITE PRINCIPALE / OBJECT:", $slate);
    imagestring($img, 4, 340, $y, "COMMERCE DE DETAILS D'APPAREILS ET ACCESSOIRES", $navy);

    $y += 45;
    imagestring($img, 4, 60, $y, "SIEGE SOCIAL / ADDRESS:", $slate);
    imagestring($img, 4, 340, $y, "AKWA, DOUALA - REGION DU LITTORAL", $navy);

    // Red Official Seal
    imagefilledellipse($img, 680, 480, 130, 130, imagecolorallocatealpha($img, 159, 18, 57, 90));
    imagestring($img, 4, 630, 470, "GREFFE RCCM", $maroon);
    imagestring($img, 3, 620, 490, "DOUALA BONANJO", $maroon);

    return saveDualFormats($img, $path);
}

// 5. Generate Driver's License
function generateDriverLicense(string $path, string $driverName, string $plate): string
{
    $w = 800;
    $h = 500;
    $img = imagecreatetruecolor($w, $h);

    $bgTop = [254, 242, 242];
    $bgBot = [254, 226, 226];
    for ($y = 0; $y < $h; $y++) {
        $f = $y / $h;
        $col = imagecolorallocate($img,
            (int)($bgTop[0] + ($bgBot[0] - $bgTop[0]) * $f),
            (int)($bgTop[1] + ($bgBot[1] - $bgTop[1]) * $f),
            (int)($bgTop[2] + ($bgBot[2] - $bgTop[2]) * $f)
        );
        imageline($img, 0, $y, $w, $y, $col);
    }

    $darkBlue = imagecolorallocate($img, 30, 58, 138);
    $red = imagecolorallocate($img, 185, 28, 28);
    $slate = imagecolorallocate($img, 71, 85, 105);
    $navy = imagecolorallocate($img, 15, 23, 42);
    $white = imagecolorallocate($img, 255, 255, 255);

    imagerectangle($img, 12, 12, $w - 12, $h - 12, $darkBlue);

    // Header
    imagefilledrectangle($img, 24, 24, $w - 24, 75, $darkBlue);
    imagestring($img, 5, 200, 35, "PERMIS DE CONDUIRE / DRIVING LICENCE", $white);
    imagestring($img, 3, 240, 55, "COMMUNAUTE ECONOMIQUE ET MONETAIRE DE L'AFRIQUE CENTRALE (CEMAC)", $white);

    // Driver photo
    imagefilledrectangle($img, 40, 95, 200, 310, $navy);
    imagerectangle($img, 38, 93, 202, 312, $red);
    imagestring($img, 4, 60, 190, "[ RIDER PHOTO ]", $white);

    $leftX = 230;
    imagestring($img, 3, $leftX, 105, "1. NOM / SURNAME:", $slate);
    imagestring($img, 5, $leftX, 125, strtoupper($driverName), $navy);

    imagestring($img, 3, $leftX, 160, "2. PRENOM / FIRST NAME:", $slate);
    imagestring($img, 4, $leftX, 180, "CERTIFIED TRANSPORTER", $navy);

    imagestring($img, 3, $leftX, 215, "3. CATEGORIE DE VEHICULE / CATEGORY:", $slate);
    imagestring($img, 5, $leftX, 235, "CATEGORIE A & B (MOTOCYCLE & VEHICULE LEGER)", $red);

    imagestring($img, 3, $leftX, 270, "4. NUMERO DU PERMIS / LICENCE NO:", $slate);
    imagestring($img, 5, $leftX, 290, "LT-PC-" . rand(100000, 999999), $darkBlue);

    imagestring($img, 3, $leftX, 325, "5. VEHICULE ASSIGNE / REGISTERED PLATE:", $slate);
    imagestring($img, 5, $leftX, 345, $plate, $navy);

    imagestring($img, 3, $leftX, 380, "6. VALIDITE / EXPIRY:", $slate);
    imagestring($img, 4, $leftX, 400, "VALID UNTIL 15/11/2030", $darkBlue);

    return saveDualFormats($img, $path);
}

// 6. Generate Vehicle Insurance Certificate
function generateInsurance(string $path, string $plate): string
{
    $w = 800;
    $h = 500;
    $img = imagecreatetruecolor($w, $h);

    $greenLight = [236, 253, 245];
    $greenBot = [209, 250, 229];
    for ($y = 0; $y < $h; $y++) {
        $f = $y / $h;
        $col = imagecolorallocate($img,
            (int)($greenLight[0] + ($greenBot[0] - $greenLight[0]) * $f),
            (int)($greenLight[1] + ($greenBot[1] - $greenLight[1]) * $f),
            (int)($greenLight[2] + ($greenBot[2] - $greenLight[2]) * $f)
        );
        imageline($img, 0, $y, $w, $y, $col);
    }

    $forest = imagecolorallocate($img, 6, 95, 70);
    $navy = imagecolorallocate($img, 15, 23, 42);
    $slate = imagecolorallocate($img, 71, 85, 105);
    $white = imagecolorallocate($img, 255, 255, 255);
    $gold = imagecolorallocate($img, 180, 83, 9);

    imagerectangle($img, 12, 12, $w - 12, $h - 12, $forest);

    imagefilledrectangle($img, 24, 24, $w - 24, 80, $forest);
    imagestring($img, 5, 170, 36, "ATTESTATION D'ASSURANCE AUTOMOBILE CEMAC", $white);
    imagestring($img, 3, 230, 58, "CARTE BRUNE CEMAC // CHANAS ASSURANCES CAMEROUN", $gold);

    $y = 110;
    imagestring($img, 4, 50, $y, "POLICE NUMERO / POLICY NO:", $slate);
    imagestring($img, 5, 340, $y, "CHANAS-POL-" . rand(1000000, 9999999), $forest);

    $y += 45;
    imagestring($img, 4, 50, $y, "IMMATRICULATION / VEHICLE PLATE:", $slate);
    imagestring($img, 5, 340, $y, $plate, $navy);

    $y += 45;
    imagestring($img, 4, 50, $y, "GENRE DU VEHICULE / VEHICLE TYPE:", $slate);
    imagestring($img, 4, 340, $y, "MOTOCYCLE DE LIVRAISON EXPRESS (2 ROUES)", $navy);

    $y += 45;
    imagestring($img, 4, 50, $y, "PERIODE DE VALIDITE / PERIOD:", $slate);
    imagestring($img, 5, 340, $y, "01/01/2026 - 31/12/2026 (ACTIVE)", $forest);

    $y += 45;
    imagestring($img, 4, 50, $y, "ZONE DE COUVERTURE / TERRITORY:", $slate);
    imagestring($img, 4, 340, $y, "ZONE CEMAC - TOUTES REGIONS DU CAMEROUN", $navy);

    // Green verification badge
    imagefilledellipse($img, 680, 380, 120, 120, imagecolorallocatealpha($img, 16, 185, 129, 90));
    imagestring($img, 4, 625, 372, "ASSURANCE VALIDE", $forest);

    return saveDualFormats($img, $path);
}

// 7. Generate Dispute Evidence Graphic
function generateDisputeEvidence(string $path, string $claim, string $orderCode): string
{
    $w = 800;
    $h = 550;
    $img = imagecreatetruecolor($w, $h);

    $bgTop = [15, 23, 42];
    $bgBot = [2, 6, 23];
    for ($y = 0; $y < $h; $y++) {
        $f = $y / $h;
        $col = imagecolorallocate($img,
            (int)($bgTop[0] + ($bgBot[0] - $bgTop[0]) * $f),
            (int)($bgTop[1] + ($bgBot[1] - $bgTop[1]) * $f),
            (int)($bgTop[2] + ($bgBot[2] - $bgTop[2]) * $f)
        );
        imageline($img, 0, $y, $w, $y, $col);
    }

    $red = imagecolorallocate($img, 239, 68, 68);
    $white = imagecolorallocate($img, 255, 255, 255);
    $amber = imagecolorallocate($img, 245, 158, 11);
    $slate = imagecolorallocate($img, 148, 163, 184);

    imagerectangle($img, 12, 12, $w - 12, $h - 12, $red);

    // Top banner
    imagefilledrectangle($img, 24, 24, $w - 24, 80, $red);
    imagestring($img, 5, 40, 36, "ESCROW DISPUTE FORENSIC EVIDENCE ATTACHMENT", $white);
    imagestring($img, 3, 40, 58, "ORDER REF: {$orderCode} • EVIDENCE VERIFIED VIA BUYER CAMERA", $white);

    // Mock photographic evidence frame
    imagefilledrectangle($img, 40, 110, $w - 40, 440, imagecolorallocate($img, 30, 41, 59));
    imagerectangle($img, 40, 110, $w - 40, 440, $amber);

    // Damage focal box with red target lines
    imagerectangle($img, 220, 180, 580, 380, $red);
    imageline($img, 220, 180, 580, 380, $red);
    imageline($img, 220, 380, 580, 180, $red);

    imagestring($img, 5, 240, 140, "[ DEFECT EVIDENCE: " . strtoupper($claim) . " ]", $white);
    imagestring($img, 4, 270, 270, "IMPACT / DAMAGE REGION", $red);

    // Forensic metadata bar
    imagefilledrectangle($img, 24, 460, $w - 24, 520, imagecolorallocate($img, 15, 23, 42));
    imagestring($img, 4, 40, 480, "TIMESTAMP: " . date('Y-m-d H:i:s') . " GMT | EXIF GPS MATCH: DOUALA (ACCURACY: 98.4%)", $amber);

    return saveDualFormats($img, $path);
}

// -----------------------------------------------------------------
// EXECUTE GENERATION & DATABASE REFRESH
// -----------------------------------------------------------------

echo "\n--- 1. Generating Sample KYC Credential Assets ---\n";
$cniFront1 = generateCniFront($kycDir . '/cni_front_techstore', 'Brandon Forku', 'CNI-2026-LT-884920');
$cniBack1 = generateCniBack($kycDir . '/cni_back_techstore', 'CNI-2026-LT-884920', 'Akwa Boulevard de la Liberte, Douala');
$store1 = generateStorefrontPhoto($kycDir . '/storefront_techstore', 'Brandon Official Tech Store', 'Akwa');
$reg1 = generateBusinessReg($kycDir . '/rccm_techstore', 'Brandon Official Tech Store', 'RC/DLA/2026/B/8942');

$cniFront2 = generateCniFront($kycDir . '/cni_front_dedon', 'Dedon Electronics Ltd', 'CNI-2026-LT-110293');
$cniBack2 = generateCniBack($kycDir . '/cni_back_dedon', 'CNI-2026-LT-110293', 'Bonamoussadi Rond-point, Douala');
$store2 = generateStorefrontPhoto($kycDir . '/storefront_dedon', 'Dedon Electronics', 'Bonamoussadi');
$reg2 = generateBusinessReg($kycDir . '/rccm_dedon', 'Dedon Electronics', 'RC/DLA/2026/B/4410');

$license1 = generateDriverLicense($kycDir . '/license_transporter', 'Paul Eto\'o', 'LT-882-DEV');
$insurance1 = generateInsurance($kycDir . '/insurance_transporter', 'LT-882-DEV');

echo "  Saved CNI Front: $cniFront1\n";
echo "  Saved CNI Back: $cniBack1\n";
echo "  Saved Storefront: $store1\n";
echo "  Saved Business Reg: $reg1\n";
echo "  Saved Driver License: $license1\n";
echo "  Saved Vehicle Insurance: $insurance1\n";

echo "\n--- 2. Updating Seller KYC Submissions in Database ---\n";
$sellers = DB::table('seller_kyc_submissions')->get();
if ($sellers->count() > 0) {
    DB::table('seller_kyc_submissions')
        ->where('id', $sellers[0]->id)
        ->update([
            'id_card_front_url' => $cniFront1,
            'id_card_back_url' => $cniBack1,
            'storefront_photo_url' => $store1,
            'business_reg_url' => $reg1,
            'cni_number' => 'CNI-2026-LT-884920',
        ]);
    echo "  Updated Seller 1 ({$sellers[0]->store_name})\n";

    if (isset($sellers[1])) {
        DB::table('seller_kyc_submissions')
            ->where('id', $sellers[1]->id)
            ->update([
                'id_card_front_url' => $cniFront2,
                'id_card_back_url' => $cniBack2,
                'storefront_photo_url' => $store2,
                'business_reg_url' => $reg2,
                'cni_number' => 'CNI-2026-LT-110293',
            ]);
        echo "  Updated Seller 2 ({$sellers[1]->store_name})\n";
    }
}

echo "\n--- 3. Updating Transporter KYC Submissions in Database ---\n";
$transporters = DB::table('transporter_kyc_submissions')->get();
if ($transporters->count() > 0) {
    DB::table('transporter_kyc_submissions')
        ->where('id', $transporters[0]->id)
        ->update([
            'national_id_url' => $cniFront1,
            'driver_license_url' => $license1,
            'vehicle_insurance_url' => $insurance1,
        ]);
    echo "  Updated Transporter ({$transporters[0]->vehicle_plate})\n";
}

echo "\n--- 4. Generating Dispute Evidence & Updating Database ---\n";
$disp1 = generateDisputeEvidence($dispDir . '/disp_broken_box', 'Cracked Screen Damage', 'WB-DISP-001');
$disp2 = generateDisputeEvidence($dispDir . '/disp_wrong_item', 'Wrong Model Dispatched', 'WB-DISP-002');
$disp3 = generateDisputeEvidence($dispDir . '/disp_non_delivery', 'Missing Parcel Claim', 'WB-DISP-003');

echo "  Saved Dispute Evidences: $disp1, $disp2, $disp3\n";

$disputes = Dispute::all();
foreach ($disputes as $idx => $d) {
    $ev = match($idx % 3) {
        0 => [$disp1],
        1 => [$disp2],
        default => [$disp1, $disp2],
    };
    $d->evidence_photos = $ev;
    $d->save();
    echo "  Updated Dispute {$d->id} with " . count($ev) . " evidence photos\n";
}

echo "\n========================================================\n";
echo "  KYC & DISPUTE ASSETS SUCCESSFULLY SEEDED & RECORDED   \n";
echo "========================================================\n";
