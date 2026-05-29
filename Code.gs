// =====================================================
//  Google Apps Script — 구글 드라이브 업로드 백엔드
//  이 파일을 script.google.com 에서 새 프로젝트로 붙여넣고
//  웹 앱으로 배포하세요. (아래 README 참조)
// =====================================================

var FOLDER_ID = '0ABCzjZ6p-FqIUk9PVA'; // 업로드 대상 폴더 ID

function doPost(e) {
  try {
    var data    = JSON.parse(e.postData.contents);
    var bytes   = Utilities.base64Decode(data.fileData);
    var blob    = Utilities.newBlob(bytes, data.mimeType, data.fileName);
    var folder  = DriveApp.getFolderById(FOLDER_ID);
    var file    = folder.createFile(blob);

    return respond({ status: 'success', name: file.getName() });
  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

// OPTIONS 프리플라이트 및 헬스체크용
function doGet() {
  return ContentService
    .createTextOutput('Upload service OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
