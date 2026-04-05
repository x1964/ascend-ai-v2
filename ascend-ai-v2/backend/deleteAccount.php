<?php
// ============================================
// ASCEND AI — Delete Account
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = requireAuth();
$db     = getDB();

// Delete all user data (tasks, settings, then user)
$db->prepare('DELETE FROM tasks         WHERE user_id = ?')->execute([$userId]);
$db->prepare('DELETE FROM user_settings WHERE user_id = ?')->execute([$userId]);
$db->prepare('DELETE FROM users         WHERE id      = ?')->execute([$userId]);

startSession();
$_SESSION = [];
session_destroy();

jsonResponse(['success' => true, 'message' => 'Account deleted.']);
