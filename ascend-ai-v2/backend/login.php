<?php
// ============================================
// ASCEND AI — Login
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = getInput();
$email = trim($input['email']    ?? '');
$pass  = $input['password']      ?? '';

if (!$email || !$pass) {
    jsonResponse(['success' => false, 'message' => 'Email and password are required.']);
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, name, password_hash, xp, streak, last_active FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password_hash'])) {
    jsonResponse(['success' => false, 'message' => 'Invalid email or password.']);
}

// Update streak
$lastActive = $user['last_active'] ? new DateTime($user['last_active']) : null;
$today      = new DateTime('today');
$streak     = (int) $user['streak'];

if ($lastActive) {
    $diff = (int) $today->diff($lastActive)->days;
    if ($diff === 1) {
        $streak++; // consecutive day
    } elseif ($diff > 1) {
        $streak = 1; // streak broken
    }
    // $diff === 0 means same day, streak unchanged
} else {
    $streak = 1;
}

$db->prepare('UPDATE users SET streak = ?, last_active = NOW() WHERE id = ?')
   ->execute([$streak, $user['id']]);

// Start session
startSession();
$_SESSION['user_id'] = $user['id'];
$_SESSION['name']    = $user['name'];

jsonResponse(['success' => true, 'message' => 'Logged in!', 'user_id' => $user['id']]);
