<?php
// ============================================
// ASCEND AI — Save API Key
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = requireAuth();
$input  = getInput();
$apiKey = trim($input['api_key'] ?? '');

if (!$apiKey) {
    jsonResponse(['success' => false, 'message' => 'API key is required.']);
}

$db   = getDB();
$stmt = $db->prepare('SELECT user_id FROM user_settings WHERE user_id = ?');
$stmt->execute([$userId]);

if ($stmt->fetch()) {
    $db->prepare('UPDATE user_settings SET openai_key = ? WHERE user_id = ?')
       ->execute([$apiKey, $userId]);
} else {
    $db->prepare('INSERT INTO user_settings (user_id, openai_key) VALUES (?, ?)')
       ->execute([$userId, $apiKey]);
}

jsonResponse(['success' => true, 'message' => 'API key saved!']);
