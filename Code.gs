// =====================================================
//  Google Apps Script — 구글 드라이브 업로드 + 갤러리 백엔드
// =====================================================

var FOLDER_ID = '0ABCzjZ6p-FqIUk9PVA';

function doPost(e) {
  try {
    var data   = JSON.parse(e.postData.contents);
    var bytes  = Utilities.base64Decode(data.fileData);
    var blob   = Utilities.newBlob(bytes, data.mimeType, data.fileName);
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file   = folder.createFile(blob);

    // 갤러리에서 표시할 수 있도록 "링크 있는 사람 누구나 보기" 권한 부여
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return respond({ status: 'success', name: file.getName(), id: file.getId() });
  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'list') return listFiles();
  return ContentService
    .createTextOutput('Upload service OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

function listFiles() {
  try {
    var folder  = DriveApp.getFolderById(FOLDER_ID);
    var files   = folder.getFiles();
    var result  = [];

    while (files.hasNext()) {
      var f    = files.next();
      var mime = f.getMimeType();
      if (mime.startsWith('image/') || mime.startsWith('video/')) {
        result.push({
          id:       f.getId(),
          name:     f.getName(),
          mimeType: mime,
          date:     f.getDateCreated().toISOString()
        });
      }
    }

    // 최신순 정렬
    result.sort(function(a, b) { return b.date.localeCompare(a.date); });

    return respond({ status: 'success', files: result });
  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
