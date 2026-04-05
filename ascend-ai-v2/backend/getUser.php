<?php
// ============================================
// ASCEND AI — Get User
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

$userId = requireAuth();
$db     = getDB();

$stmt = $db->prepare('
    SELECT u.id, u.name, u.email, u.xp, u.streak,
           (SELECT COUNT(*) FROM tasks WHERE user_id = u.id AND completed = 1) AS tasks_done
    FROM users u
    WHERE u.id = ?
');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'message' => 'User not found.'], 404);
}

unset($user['password_hash']);

jsonResponse(['success' => true, 'user' => $user]);
