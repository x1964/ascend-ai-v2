<?php
// ============================================
// ASCEND AI — Register
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = getInput();
$name  = trim($input['name']  ?? '');
$email = trim($input['email'] ?? '');
$pass  = $input['password']   ?? '';

// Validate
if (!$name || !$email || !$pass) {
    jsonResponse(['success' => false, 'message' => 'All fields are required.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email address.']);
}
if (strlen($pass) < 6) {
    jsonResponse(['success' => false, 'message' => 'Password must be at least 6 characters.']);
}
if (strlen($name) > 100) {
    jsonResponse(['success' => false, 'message' => 'Name is too long.']);
}

$db = getDB();

// Check if email already exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'message' => 'Email already registered.']);
}

// Create user
$hash = password_hash($pass, PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (name, email, password_hash, xp, streak, last_active) VALUES (?, ?, ?, 0, 0, NOW())');
$stmt->execute([$name, $email, $hash]);
$userId = (int) $db->lastInsertId();

// Start session
startSession();
$_SESSION['user_id'] = $userId;
$_SESSION['name']    = $name;

jsonResponse(['success' => true, 'message' => 'Account created!', 'user_id' => $userId]);
