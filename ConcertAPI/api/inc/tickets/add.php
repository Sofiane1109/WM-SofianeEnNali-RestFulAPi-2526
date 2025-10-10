<?php
// --- "add" een ticket  

check_required_fields(["bezoeker_id","concert_id","aantal","aankoop_prijs","status"]);

if(!$stmt = $conn->prepare("
    INSERT INTO tickets (bezoeker_id, concert_id, aantal, aankoop_prijs, status) 
    VALUES (?, ?, ?, ?, ?)
")){
    die('{"error":"Prepared Statement failed on prepare",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

// bind parameters ( i = integer, i = integer, i = integer, d = double, s = string )
if(!$stmt->bind_param("iiids",
    $postvars['bezoeker_id'],
    $postvars['concert_id'],
    $postvars['aantal'],
    $postvars['aankoop_prijs'],
    $postvars['status']
)){
    die('{"error":"Prepared Statement bind failed on bind",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

$stmt->execute();

if($conn->affected_rows == 0) {
    $stmt->close();
    die('{"error":"Prepared Statement failed on execute : no rows affected",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

$stmt->close();

$TICKET_ID = $conn->insert_id;

die('{"data":"ok","message":"Record added successfully","status":200, "TICKET_ID": ' . $TICKET_ID . '}');
?>
