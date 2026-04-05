<?php
// ============================================
// ASCEND AI — Logout
// ============================================

require_once 'db.php';
header('Content-Type: application/json');

startSession();
$_SESSION = [];
session_destroy();

jsonResponse(['success' => true, 'message' => 'Logged out.']);
