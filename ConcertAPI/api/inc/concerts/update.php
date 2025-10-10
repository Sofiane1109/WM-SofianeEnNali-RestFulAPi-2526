<?php
// --- "update" een concert  

check_required_fields(["id","artiest","datum","uur","locatie","kostprijs","capaciteit"]);

if(!$stmt = $conn->prepare("
    UPDATE concerten 
    SET artiest = ?, datum = ?, uur = ?, locatie = ?, kostprijs = ?, capaciteit = ?
    WHERE id = ?
")){
    die('{"error":"Prepared Statement failed on prepare",
         "errNo":' . json_encode($conn->errno) . ',
         "mysqlError":' . json_encode($conn->error) . ',
         "status":"fail"}');
}

// bind parameters
if(!$stmt->bind_param("ssssdii",
    htmlentities($postvars['artiest']),
    $postvars['datum'],
    $postvars['uur'],
    htmlentities($postvars['locatie']),
    $postvars['kostprijs'],
    $postvars['capaciteit'],
    $postvars['id']
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

die('{"data":"ok","message":"Record updated successfully","status":200}');
?>
