<?php
// ============================================
// ASCEND AI — Update Profile
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = requireAuth();
$input  = getInput();
$name   = trim($input['name']     ?? '');
$email  = trim($input['email']    ?? '');
$apiKey = trim($input['api_key']  ?? '');

if (!$name || !$email) {
    jsonResponse(['success' => false, 'message' => 'Name and email are required.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email address.']);
}

$db = getDB();

// Check email not taken by another user
$stmt = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
$stmt->execute([$email, $userId]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'message' => 'Email already in use.']);
}

$db->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
   ->execute([$name, $email, $userId]);

// Save API key if provided
if ($apiKey) {
    // Upsert user_settings
    $stmt = $db->prepare('SELECT user_id FROM user_settings WHERE user_id = ?');
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        $db->prepare('UPDATE user_settings SET openai_key = ? WHERE user_id = ?')
           ->execute([$apiKey, $userId]);
    } else {
        $db->prepare('INSERT INTO user_settings (user_id, openai_key) VALUES (?, ?)')
           ->execute([$userId, $apiKey]);
    }
}

// Update session name
startSession();
$_SESSION['name'] = $name;

jsonResponse(['success' => true, 'message' => 'Profile updated!']);
