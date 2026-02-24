<?php
// Autoriser les requêtes depuis la même origine
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Charger PHPMailer (via Composer ou manuellement)
// Si tu utilises Composer : require 'vendor/autoload.php';
// Si tu as téléchargé PHPMailer manuellement, adapte les chemins :
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Assure-toi d'avoir fait : composer require phpmailer/phpmailer

// Récupérer les données du formulaire
$to      = trim($_POST['mailTo'] ?? '');
$name    = trim($_POST['mailName'] ?? 'Joueur');
$score   = trim($_POST['mailScore'] ?? '0');
$message = trim($_POST['mailMessage'] ?? '');

// Validation simple
if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Adresse email invalide.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // ── Configuration SMTP ──────────────────────────────────────────
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';       // Ton serveur SMTP (Gmail ici)
    $mail->SMTPAuth   = true;
    $mail->Username   = 'ton_email@gmail.com';  // ← Remplace par ton email
    $mail->Password   = 'ton_mot_de_passe_app'; // ← Mot de passe d'application Gmail
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';
    // ────────────────────────────────────────────────────────────────

    // Expéditeur et destinataire
    $mail->setFrom('ton_email@gmail.com', 'Flappy Math Bird');
    $mail->addAddress($to);
    $mail->addReplyTo('ton_email@gmail.com', 'Flappy Math Bird');

    // Contenu du mail
    $mail->isHTML(true);
    $mail->Subject = '🐦 ' . $name . ' t\'a envoyé son score Flappy Math Bird !';
    $mail->Body    = "
        <div style='font-family: sans-serif; max-width: 500px; margin: auto; border: 2px solid #2bee6c; border-radius: 16px; overflow: hidden;'>
            <div style='background: #2bee6c; padding: 24px; text-align: center;'>
                <h1 style='color: #102216; margin: 0; font-size: 28px;'>🐦 Flappy Math Bird</h1>
            </div>
            <div style='padding: 32px;'>
                <p style='font-size: 18px; color: #1f2937;'><strong>{$name}</strong> t'a partagé son score :</p>
                <div style='background: #f0fdf4; border: 2px dashed #2bee6c; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;'>
                    <span style='font-size: 56px; font-weight: 900; color: #102216;'>{$score}</span>
                    <p style='color: #6b7280; margin: 4px 0 0;'>points</p>
                </div>
                <p style='color: #374151;'>" . nl2br(htmlspecialchars($message)) . "</p>
                <p style='color: #9ca3af; font-size: 13px; margin-top: 24px;'>Tu peux essayer de le battre sur Flappy Math Bird !</p>
            </div>
        </div>
    ";
    $mail->AltBody = "{$name} a obtenu un score de {$score} sur Flappy Math Bird ! " . $message;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Mail envoyé avec succès !']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur : ' . $mail->ErrorInfo]);
}
