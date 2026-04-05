<?php
// ============================================
// ASCEND AI — Delete Task
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$userId = requireAuth();
$input  = getInput();
$taskId = (int) ($input['id'] ?? 0);

if (!$taskId) {
    jsonResponse(['success' => false, 'message' => 'Task ID is required.']);
}

$db = getDB();

// Verify ownership & check if completed (revoke XP if so)
$stmt = $db->prepare('SELECT id, completed, xp_reward FROM tasks WHERE id = ? AND user_id = ?');
$stmt->execute([$taskId, $userId]);
$task = $stmt->fetch();

if (!$task) {
    jsonResponse(['success' => false, 'message' => 'Task not found.'], 404);
}

// Revoke XP if task was completed
if ($task['completed']) {
    $db->prepare('UPDATE users SET xp = GREATEST(0, xp - ?) WHERE id = ?')
       ->execute([$task['xp_reward'], $userId]);
}

$db->prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
   ->execute([$taskId, $userId]);

jsonResponse(['success' => true, 'message' => 'Task deleted.']);
